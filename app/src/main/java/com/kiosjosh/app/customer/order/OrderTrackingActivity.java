package com.kiosjosh.app.customer.order;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.databinding.ActivityOrderTrackingBinding;

public class OrderTrackingActivity extends AppCompatActivity {
    private ActivityOrderTrackingBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityOrderTrackingBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnCallDriver.setOnClickListener(v -> {
            Toast.makeText(this, "Calling driver Josh Peterson (+62 812-3456-789)...", Toast.LENGTH_LONG).show();
        });
    }
}
