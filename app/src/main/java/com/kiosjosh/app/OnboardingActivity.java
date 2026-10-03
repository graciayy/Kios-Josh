package com.kiosjosh.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.auth.LoginActivity;
import com.kiosjosh.app.admin.AdminLoginActivity;
import com.kiosjosh.app.databinding.ActivityOnboardingBinding;

public class OnboardingActivity extends AppCompatActivity {
    private ActivityOnboardingBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityOnboardingBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Select Customer mode
        binding.btnCustomerMode.setOnClickListener(v -> {
            Intent intent = new Intent(OnboardingActivity.this, LoginActivity.class);
            startActivity(intent);
        });

        // Select Admin mode
        binding.btnAdminMode.setOnClickListener(v -> {
            Intent intent = new Intent(OnboardingActivity.this, AdminLoginActivity.class);
            startActivity(intent);
        });
    }
}
