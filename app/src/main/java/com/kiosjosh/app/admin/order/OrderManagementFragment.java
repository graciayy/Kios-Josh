package com.kiosjosh.app.admin.order;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kiosjosh.app.adapter.OrderAdapter;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.Order;
import com.kiosjosh.app.databinding.FragmentOrderManagementBinding;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OrderManagementFragment extends Fragment {
    private FragmentOrderManagementBinding binding;
    private OrderAdapter adapter;
    private List<Order> orderList = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentOrderManagementBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.rvAdminOrders.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new OrderAdapter(orderList, getContext());
        binding.rvAdminOrders.setAdapter(adapter);

        fetchOrders();
    }

    private List<Order> getMockOrders() {
        List<Order> list = new ArrayList<>();
        
        Order o1 = new Order();
        o1.setId("KJ-20260519-01");
        o1.setCustomerName("Gracia Ester Tendean");
        o1.setCustomerPhone("08234666789");
        o1.setTotal(35000);
        o1.setPaymentMethod("qris");
        o1.setStatus("selesai");
        o1.setPickupOrDelivery("delivery");
        o1.setDeliveryAddress("Jl. Raya Politeknik, Buha, Kec. Mapanget, Kota Manado");
        o1.setDeliveryFee(10000);
        o1.setCreatedAt("2026-05-19T14:30:00.000Z");
        list.add(o1);

        Order o2 = new Order();
        o2.setId("KJ-20260519-02");
        o2.setCustomerName("Michael Steve Mamengko");
        o2.setCustomerPhone("08123456780");
        o2.setTotal(50000);
        o2.setPaymentMethod("cash");
        o2.setStatus("processing");
        o2.setPickupOrDelivery("pickup");
        o2.setDeliveryAddress("Ambil di Kios");
        o2.setDeliveryFee(0);
        o2.setCreatedAt("2026-05-19T17:45:00.000Z");
        list.add(o2);

        Order o3 = new Order();
        o3.setId("KJ-20260519-03");
        o3.setCustomerName("Desvita Christi Kilis");
        o3.setCustomerPhone("08964321234");
        o3.setTotal(32000);
        o3.setPaymentMethod("qris");
        o3.setStatus("pending");
        o3.setPickupOrDelivery("delivery");
        o3.setDeliveryAddress("Kosan Hijau Dekat Politeknik Negeri Manado");
        o3.setDeliveryFee(10000);
        o3.setCreatedAt("2026-05-19T19:25:00.000Z");
        list.add(o3);

        return list;
    }

    private void fetchOrders() {
        if (binding == null) return;
        
        // Load instantly from SQLite database
        final DbHelper dbHelper = DbHelper.getInstance(getContext());
        orderList.clear();
        orderList.addAll(dbHelper.getAllOrders());
        adapter.notifyDataSetChanged();
        
        binding.ordersProgressBar.setVisibility(View.VISIBLE);
        ApiClient.getApiService().getOrders().enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(@NonNull Call<List<Order>> call, @NonNull Response<List<Order>> response) {
                if (isAdded() && binding != null) {
                    binding.ordersProgressBar.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null) {
                        // Sync with SQLite db
                        dbHelper.saveOrders(response.body());
                        orderList.clear();
                        orderList.addAll(dbHelper.getAllOrders());
                        adapter.notifyDataSetChanged();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Order>> call, @NonNull Throwable t) {
                if (isAdded() && binding != null) {
                    binding.ordersProgressBar.setVisibility(View.GONE);
                    // Failure is fine as we already loaded local orders from SQLite!
                }
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
