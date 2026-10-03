package com.kiosjosh.app.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.databinding.ActivityRegisterBinding;

public class RegisterActivity extends AppCompatActivity {
    private ActivityRegisterBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityRegisterBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnRegister.setOnClickListener(v -> {
            String name = binding.etName.getText().toString().trim();
            String email = binding.etEmail.getText().toString().trim();
            String phone = binding.etPhone.getText().toString().trim();
            String password = binding.etPassword.getText().toString().trim();

            if (TextUtils.isEmpty(name)) {
                binding.etName.setError("Name is required");
                return;
            }
            if (TextUtils.isEmpty(email)) {
                binding.etEmail.setError("Email is required");
                return;
            }
            if (TextUtils.isEmpty(password)) {
                binding.etPassword.setError("Password is required");
                return;
            }

            // Save registered user details to local SQLite database profile
            com.kiosjosh.app.database.DbHelper dbHelper = com.kiosjosh.app.database.DbHelper.getInstance(RegisterActivity.this);
            com.kiosjosh.app.model.User newUser = new com.kiosjosh.app.model.User(name, email, phone, "Jl. Raya Politeknik No. 45, Buha, Mapanget, Manado");
            dbHelper.saveProfile(newUser);

            Toast.makeText(this, "Pendaftaran berhasil! Silakan login.", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
            startActivity(intent);
            finish();
        });

        binding.tvLogin.setOnClickListener(v -> finish());
    }
}
