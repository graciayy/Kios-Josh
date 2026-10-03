package com.kiosjosh.app;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.kiosjosh.app.customer.HomeFragment;
import com.kiosjosh.app.customer.MenuFragment;
import com.kiosjosh.app.customer.CartFragment;
import com.kiosjosh.app.customer.AccountFragment;
import com.kiosjosh.app.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {
    private ActivityMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Default to Home Fragment
        loadFragment(new HomeFragment());

        // Handle Bottom Navigation item clicks
        binding.bottomNavigation.setOnItemSelectedListener(item -> {
            Fragment fragment = null;
            int itemId = item.getItemId();

            if (itemId == R.id.nav_home) {
                fragment = new HomeFragment();
            } else if (itemId == R.id.nav_menu) {
                fragment = new MenuFragment();
            } else if (itemId == R.id.nav_cart) {
                fragment = new CartFragment();
            } else if (itemId == R.id.nav_account) {
                fragment = new AccountFragment();
            }

            return loadFragment(fragment);
        });
    }

    private boolean loadFragment(Fragment fragment) {
        if (fragment != null) {
            getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragment_container, fragment)
                    .commit();
            return true;
        }
        return false;
    }
}
