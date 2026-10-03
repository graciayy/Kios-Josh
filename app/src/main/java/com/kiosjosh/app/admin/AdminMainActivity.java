package com.kiosjosh.app.admin;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.kiosjosh.app.R;
import com.kiosjosh.app.admin.dashboard.DashboardFragment;
import com.kiosjosh.app.admin.order.OrderManagementFragment;
import com.kiosjosh.app.admin.product.ProductManagementFragment;
import com.kiosjosh.app.admin.report.SalesReportFragment;
import com.kiosjosh.app.databinding.ActivityAdminMainBinding;

public class AdminMainActivity extends AppCompatActivity {
    private ActivityAdminMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAdminMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Default to Admin Dashboard
        loadFragment(new DashboardFragment());

        binding.adminBottomNavigation.setOnItemSelectedListener(item -> {
            Fragment fragment = null;
            int itemId = item.getItemId();

            if (itemId == R.id.nav_admin_dashboard) {
                fragment = new DashboardFragment();
            } else if (itemId == R.id.nav_admin_orders) {
                fragment = new OrderManagementFragment();
            } else if (itemId == R.id.nav_admin_products) {
                fragment = new ProductManagementFragment();
            } else if (itemId == R.id.nav_admin_reports) {
                fragment = new SalesReportFragment();
            }

            return loadFragment(fragment);
        });
    }

    private boolean loadFragment(Fragment fragment) {
        if (fragment != null) {
            getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.admin_fragment_container, fragment)
                    .commit();
            return true;
        }
        return false;
    }
}
