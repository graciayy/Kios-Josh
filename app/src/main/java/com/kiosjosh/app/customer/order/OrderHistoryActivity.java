package com.kiosjosh.app.customer.order;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kiosjosh.app.MainActivity;
import com.kiosjosh.app.adapter.CustomerOrderAdapter;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.databinding.ActivityOrderHistoryBinding;
import com.kiosjosh.app.model.Order;
import com.kiosjosh.app.model.User;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OrderHistoryActivity extends AppCompatActivity {
    private ActivityOrderHistoryBinding binding;
    private CustomerOrderAdapter adapter;
    private List<Order> displayedOrdersList = new ArrayList<>();
    private String userProfileName = "";
    private String userProfilePhone = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityOrderHistoryBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Back action button
        binding.btnBackHistory.setOnClickListener(v -> finish());

        // Setup RecyclerView
        binding.rvOrderHistory.setLayoutManager(new LinearLayoutManager(this));
        adapter = new CustomerOrderAdapter(displayedOrdersList, this);
        binding.rvOrderHistory.setAdapter(adapter);

        // Shop Now button in empty state closes history and goes back to home catalog
        binding.btnShopNow.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });

        // Get currently logged-in customer profile
        DbHelper dbHelper = DbHelper.getInstance(this);
        User profile = dbHelper.getProfile();
        if (profile != null) {
            userProfileName = profile.getName() != null ? profile.getName().trim() : "";
            userProfilePhone = profile.getPhone() != null ? profile.getPhone().trim() : "";
        }

        // Fetch user order history
        loadOrderHistory();
    }

    private void loadOrderHistory() {
        final DbHelper dbHelper = DbHelper.getInstance(this);
        
        // 1. Instantly pull and show from SQLite database
        List<Order> localOrders = dbHelper.getAllOrders();
        populateFilteredList(localOrders);

        // 2. Query lives nodes API server asynchronously to sync up
        binding.pbHistoryLoading.setVisibility(View.VISIBLE);
        ApiClient.getApiService().getOrders().enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(@NonNull Call<List<Order>> call, @NonNull Response<List<Order>> response) {
                if (isFinishing() || binding == null) return;
                binding.pbHistoryLoading.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    List<Order> remoteOrders = response.body();
                    // Sync SQLite
                    dbHelper.saveOrders(remoteOrders);
                    // Re-filter and refresh
                    populateFilteredList(dbHelper.getAllOrders());
                } else {
                    Toast.makeText(OrderHistoryActivity.this, "Gagal sinkronisasi riwayat terbaru.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Order>> call, @NonNull Throwable t) {
                if (isFinishing() || binding == null) return;
                binding.pbHistoryLoading.setVisibility(View.GONE);
                // offline support: loaded SQLite successfully already! So just proceed silently
            }
        });
    }

    private void populateFilteredList(List<Order> rawList) {
        displayedOrdersList.clear();

        for (Order order : rawList) {
            boolean isMatch = false;
            
            // Check name matching
            if (!userProfileName.isEmpty() && order.getCustomerName() != null) {
                if (order.getCustomerName().toLowerCase().contains(userProfileName.toLowerCase()) || 
                    userProfileName.toLowerCase().contains(order.getCustomerName().toLowerCase())) {
                    isMatch = true;
                }
            }
            // Check phone matching
            if (!userProfilePhone.isEmpty() && order.getCustomerPhone() != null) {
                if (order.getCustomerPhone().contains(userProfilePhone) || 
                    userProfilePhone.contains(order.getCustomerPhone())) {
                    isMatch = true;
                }
            }

            // Fallback: If both are empty or we can't determine, add all
            if (userProfileName.isEmpty() && userProfilePhone.isEmpty()) {
                isMatch = true;
            }

            if (isMatch) {
                displayedOrdersList.add(order);
            }
        }

        // If filtering strictly left us with nothing, let's fallback to showing orders 
        // to prevent bad visual experience while they play/preview the app.
        if (displayedOrdersList.isEmpty() && !rawList.isEmpty()) {
            displayedOrdersList.addAll(rawList);
        }

        // Reverse to show newest placed orders first
        Collections.reverse(displayedOrdersList);
        adapter.notifyDataSetChanged();

        // Control empty view visibility
        if (displayedOrdersList.isEmpty()) {
            binding.rvOrderHistory.setVisibility(View.GONE);
            binding.layoutEmptyHistory.setVisibility(View.VISIBLE);
        } else {
            binding.rvOrderHistory.setVisibility(View.VISIBLE);
            binding.layoutEmptyHistory.setVisibility(View.GONE);
        }
    }
}
