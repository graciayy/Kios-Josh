package com.kiosjosh.app.admin;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.databinding.ActivityAdminLoginBinding;

public class AdminLoginActivity extends AppCompatActivity {
    private ActivityAdminLoginBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAdminLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnAdminLogin.setOnClickListener(v -> {
            String username = binding.etAdminUsername.getText().toString().trim();
            String password = binding.etAdminPassword.getText().toString().trim();

            if (TextUtils.isEmpty(username)) {
                binding.etAdminUsername.setError("Username is required");
                return;
            }
            if (TextUtils.isEmpty(password)) {
                binding.etAdminPassword.setError("Password is required");
                return;
            }

            // Standard Admin simulation login
            Toast.makeText(this, "Welcome back, Admin!", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(AdminLoginActivity.this, AdminMainActivity.class);
            startActivity(intent);
            finish();
        });
    }
}
