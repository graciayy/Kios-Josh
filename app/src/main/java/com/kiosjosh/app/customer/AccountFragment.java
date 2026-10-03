package com.kiosjosh.app.customer;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kiosjosh.app.OnboardingActivity;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.User;
import com.kiosjosh.app.databinding.FragmentAccountBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AccountFragment extends Fragment {
    private FragmentAccountBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAccountBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Fetch user profile from the live API server
        fetchProfile();

        // Bind Edit Profile button click action
        binding.btnEditProfile.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), com.kiosjosh.app.customer.profile.EditProfileActivity.class);
            startActivity(intent);
        });

        // Bind Order History button click action
        binding.btnOrderHistory.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), com.kiosjosh.app.customer.order.OrderHistoryActivity.class);
            startActivity(intent);
        });

        // Bind logout button click action
        binding.btnLogoutAction.setOnClickListener(v -> {
            if (getActivity() != null) {
                Toast.makeText(getContext(), "Anda berhasil logout dari akun Kios Josh.", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(getActivity(), OnboardingActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                getActivity().finish();
            }
        });
    }

    private User getMockUser() {
        return new User(
            "Gracia Tendean",
            "gracia.tendean@kiosjosh.id",
            "081244839211",
            "Kos Polimando Jl. Politeknik, Kairagi Dua, Kota Manado, Sulawesi Utara"
        );
    }

    private void fetchProfile() {
        if (binding == null) return;
        final DbHelper dbHelper = DbHelper.getInstance(getContext());
        User localUser = dbHelper.getProfile();
        binding.tvUserName.setText(localUser.getName());
        binding.tvUserEmail.setText(localUser.getEmail());
        binding.tvUserPhone.setText(localUser.getPhone());
        binding.tvUserAddress.setText(localUser.getAddress());

        ApiClient.getApiService().getProfile().enqueue(new Callback<User>() {
            @Override
            public void onResponse(@NonNull Call<User> call, @NonNull Response<User> response) {
                if (isAdded() && binding != null) {
                    if (response.isSuccessful() && response.body() != null) {
                        User user = response.body();
                        dbHelper.saveProfile(user);
                        binding.tvUserName.setText(user.getName());
                        binding.tvUserEmail.setText(user.getEmail());
                        binding.tvUserPhone.setText(user.getPhone());
                        binding.tvUserAddress.setText(user.getAddress());
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<User> call, @NonNull Throwable t) {
                // Failure is fine as we already loaded local user profile from SQLite!
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        if (binding != null) {
            DbHelper dbHelper = DbHelper.getInstance(getContext());
            User localUser = dbHelper.getProfile();
            binding.tvUserName.setText(localUser.getName());
            binding.tvUserEmail.setText(localUser.getEmail());
            binding.tvUserPhone.setText(localUser.getPhone());
            binding.tvUserAddress.setText(localUser.getAddress());
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
