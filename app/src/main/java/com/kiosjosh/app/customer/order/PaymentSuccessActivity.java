package com.kiosjosh.app.customer.order;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.MainActivity;
import com.kiosjosh.app.databinding.ActivityPaymentSuccessBinding;
import java.util.Random;

public class PaymentSuccessActivity extends AppCompatActivity {
    private ActivityPaymentSuccessBinding binding;
    private String generatedInvoiceId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityPaymentSuccessBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Fetch values from Intent extras with beautiful defaults
        Intent incoming = getIntent();
        String invoiceIdFromIntent = incoming.getStringExtra("invoiceId");
        if (invoiceIdFromIntent != null && !invoiceIdFromIntent.isEmpty()) {
            generatedInvoiceId = invoiceIdFromIntent;
        } else {
            // Generate custom simulated random receipt invoice ID
            int randomNum = 100000 + new Random().nextInt(900000);
            generatedInvoiceId = "KJ-" + randomNum;
        }
        binding.tvReceiptNo.setText(generatedInvoiceId);

        String totalAmount = incoming.getStringExtra("total");
        String deliveryMethod = incoming.getStringExtra("delivery");
        String paymentMethod = incoming.getStringExtra("payment");

        if (totalAmount != null && !totalAmount.isEmpty()) {
            binding.tvReceiptTotal.setText(totalAmount);
        } else {
            binding.tvReceiptTotal.setText("Rp 25.000");
        }

        if (deliveryMethod != null && !deliveryMethod.isEmpty()) {
            binding.tvReceiptDelivery.setText(deliveryMethod);
        } else {
            binding.tvReceiptDelivery.setText("Home Delivery (Antar Alamat)");
        }

        if (paymentMethod != null && !paymentMethod.isEmpty()) {
            binding.tvReceiptPayment.setText(paymentMethod);
        } else {
            binding.tvReceiptPayment.setText("QRIS (E-Wallet)");
        }

        // Simpan PDF 💾 click action - Perfect matching React behavior
        binding.btnSaveReceipt.setOnClickListener(v -> {
            String msg = "Nota Pembayaran Ref: " + generatedInvoiceId + " berhasil disimpan ke folder penyimpanan gawai Anda! 💾";
            Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
        });

        binding.btnTrackOrder.setOnClickListener(v -> {
            Toast.makeText(this, "Opening Driver Tracking map...", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(PaymentSuccessActivity.this, OrderTrackingActivity.class);
            startActivity(intent);
            finish();
        });

        binding.btnBackHome.setOnClickListener(v -> {
            Intent intent = new Intent(PaymentSuccessActivity.this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
            finish();
        });
    }
}
