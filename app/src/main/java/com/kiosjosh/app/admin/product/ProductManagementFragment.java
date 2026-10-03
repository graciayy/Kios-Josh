package com.kiosjosh.app.admin.product;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kiosjosh.app.adapter.ProductManagementAdapter;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.Product;
import com.kiosjosh.app.databinding.FragmentProductManagementBinding;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProductManagementFragment extends Fragment {
    private FragmentProductManagementBinding binding;
    private ProductManagementAdapter adapter;
    private List<Product> productList = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentProductManagementBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Setup LayoutManager and Adapter
        binding.rvAdminProducts.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new ProductManagementAdapter(productList, getContext());
        binding.rvAdminProducts.setAdapter(adapter);

        // Floating Action button to add product
        binding.fabAddProduct.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), AddProductActivity.class);
            startActivity(intent);
        });

        fetchProducts();
    }

    private void fetchProducts() {
        if (binding == null) return;

        // Step 1: Immediately read the SQLite offline-ready product lists
        DbHelper dbHelper = DbHelper.getInstance(getContext());
        productList.clear();
        productList.addAll(dbHelper.getAllProducts());
        adapter.notifyDataSetChanged();

        // Step 2: Query API backend to download updates and sync SQLite
        binding.productsProgressBar.setVisibility(View.VISIBLE);
        ApiClient.getApiService().getProducts().enqueue(new Callback<List<Product>>() {
            @Override
            public void onResponse(@NonNull Call<List<Product>> call, @NonNull Response<List<Product>> response) {
                if (isAdded() && binding != null) {
                    binding.productsProgressBar.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null) {
                        dbHelper.saveProducts(response.body());
                        productList.clear();
                        productList.addAll(dbHelper.getAllProducts());
                        adapter.notifyDataSetChanged();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Product>> call, @NonNull Throwable t) {
                if (isAdded() && binding != null) {
                    binding.productsProgressBar.setVisibility(View.GONE);
                    // Network failure is fine; offline cache acts as source of truth
                }
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        // Automatically reload database lists to capture edits/creations!
        fetchProducts();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
