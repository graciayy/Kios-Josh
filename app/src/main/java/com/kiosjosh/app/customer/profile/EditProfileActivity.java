package com.kiosjosh.app.customer.profile;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.User;
import com.kiosjosh.app.databinding.ActivityEditProfileBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EditProfileActivity extends AppCompatActivity {
    private ActivityEditProfileBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityEditProfileBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        final DbHelper dbHelper = DbHelper.getInstance(this);
        final User user = dbHelper.getProfile();

        // Populate fields with active profile details
        binding.etName.setText(user.getName());
        binding.etEmail.setText(user.getEmail());
        binding.etPhone.setText(user.getPhone());
        binding.etAddress.setText(user.getAddress());

        // Back button
        binding.btnBack.setOnClickListener(v -> finish());

        // Save changes button
        binding.btnSave.setOnClickListener(v -> {
            String name = binding.etName.getText().toString().trim();
            String email = binding.etEmail.getText().toString().trim();
            String phone = binding.etPhone.getText().toString().trim();
            String address = binding.etAddress.getText().toString().trim();

            if (TextUtils.isEmpty(name)) {
                binding.etName.setError("Nama lengkap harus diisi");
                return;
            }
            if (TextUtils.isEmpty(email)) {
                binding.etEmail.setError("Email harus diisi");
                return;
            }
            if (TextUtils.isEmpty(phone)) {
                binding.etPhone.setError("Nomor HP harus diisi");
                return;
            }
            if (TextUtils.isEmpty(address)) {
                binding.etAddress.setError("Alamat pengantaran harus diisi");
                return;
            }

            // Save locally in SQLite
            user.setName(name);
            user.setEmail(email);
            user.setPhone(phone);
            user.setAddress(address);
            dbHelper.saveProfile(user);

            // Sync with backend server
            Toast.makeText(this, "Menyimpan perubahan...", Toast.LENGTH_SHORT).show();
            ApiClient.getApiService().updateProfile(user).enqueue(new Callback<User>() {
                @Override
                public void onResponse(@NonNull Call<User> call, @NonNull Response<User> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        dbHelper.saveProfile(response.body());
                    }
                }

                @Override
                public void onFailure(@NonNull Call<User> call, @NonNull Throwable t) {
                    // Fail gracefully as local changes are recorded safely in SQLite
                }
            });

            Toast.makeText(this, "Profil berhasil disimpan!", Toast.LENGTH_SHORT).show();
            setResult(RESULT_OK);
            finish();
        });
    }
}
