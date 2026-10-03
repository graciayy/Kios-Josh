package com.kiosjosh.app.admin.dashboard;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import com.kiosjosh.app.R;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.Order;
import com.kiosjosh.app.databinding.FragmentDashboardBinding;
import java.util.List;
import java.util.Locale;

public class DashboardFragment extends Fragment {
    private FragmentDashboardBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        refreshMetrics();

        // Operasional shop toggle logic
        binding.swShopStatus.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                binding.tvShopStatus.setText("Kios Buka • Melayani Pelanggan");
                binding.tvShopStatus.setTextColor(ContextCompat.getColor(requireContext(), R.color.accent_green));
            } else {
                binding.tvShopStatus.setText("Kios Tutup • Istirahat");
                binding.tvShopStatus.setTextColor(ContextCompat.getColor(requireContext(), R.color.primary_orange));
            }
        });
    }

    private void refreshMetrics() {
        if (binding == null) return;

        DbHelper dbHelper = DbHelper.getInstance(getContext());
        List<Order> orders = dbHelper.getAllOrders();

        double totalRevenue = 0.0;
        int totalOrdersCount = orders.size();

        for (Order order : orders) {
            // Include non-cancelled orders for overall revenue metrics
            if (!"cancelled".equalsIgnoreCase(order.getStatus())) {
                totalRevenue += order.getTotal();
            }
        }

        binding.tvTotalRevenue.setText(String.format(Locale.getDefault(), "Rp %,.0f", totalRevenue));
        binding.tvTotalOrders.setText(String.format(Locale.getDefault(), "%d Pesanan", totalOrdersCount));
    }

    @Override
    public void onResume() {
        super.onResume();
        refreshMetrics();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
