package com.kiosjosh.app.customer.order;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.*;
import com.kiosjosh.app.databinding.ActivityCheckoutBinding;
import java.text.SimpleDateFormat;
import java.util.*;

public class CheckoutActivity extends AppCompatActivity {
    private ActivityCheckoutBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityCheckoutBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        final DbHelper dbHelper = DbHelper.getInstance(this);
        final User profile = dbHelper.getProfile();
        binding.tvCheckoutAddress.setText(profile.getAddress());

        final CartManager cartManager = CartManager.getInstance(this);
        final double cartSubtotal = cartManager.getTotalPrice();
        final double platformFee = 2000.0;

        // Dynamic pricing calculation
        updateTotalDisplay(cartSubtotal, platformFee);

        binding.rgDeliveryMethod.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == com.kiosjosh.app.R.id.rb_pickup) {
                binding.cvDeliveryAddress.setVisibility(View.GONE);
            } else {
                binding.cvDeliveryAddress.setVisibility(View.VISIBLE);
            }
            updateTotalDisplay(cartSubtotal, platformFee);
        });

        binding.btnPayNow.setOnClickListener(v -> {
            boolean isPickup = binding.rbPickup.isChecked();
            double delFee = isPickup ? 0.0 : 10000.0;
            double grandTotal = cartSubtotal + platformFee + delFee;

            if (cartManager.getCartItems().isEmpty()) {
                Toast.makeText(this, "Keranjang belanja kosong!", Toast.LENGTH_SHORT).show();
                finish();
                return;
            }

            // Create Order record and store in local SQLite database!
            Order order = new Order();
            
            // YYYYMMDD with unique identifier for receipt invoice matching Node/React backend formats cleanly!
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd", Locale.getDefault());
            String datePrefix = sdf.format(new Date());
            int randSuffix = 1000 + new Random().nextInt(9000);
            String customOrderId = "KJ-" + datePrefix + "-" + randSuffix;

            order.setId(customOrderId);
            order.setCustomerName(profile.getName());
            order.setCustomerPhone(profile.getPhone());
            order.setTotal(grandTotal);
            order.setPaymentMethod(binding.rbQris.isChecked() ? "qris" : "cash");
            order.setStatus("pending");
            order.setPickupOrDelivery(isPickup ? "pickup" : "delivery");
            order.setDeliveryAddress(isPickup ? "Ambil di Kios" : profile.getAddress());
            order.setDeliveryFee(delFee);

            // Set ISO ISO8601 creation date
            SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            isoFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
            order.setCreatedAt(isoFormat.format(new Date()));

            // Populate OrderItems
            List<OrderItem> orderItemsList = new ArrayList<>();
            for (CartItem cartItem : cartManager.getCartItems()) {
                OrderItem item = new OrderItem(
                    cartItem.getProduct().getId(),
                    cartItem.getProduct().getName(),
                    cartItem.getProduct().getPrice(),
                    cartItem.getQuantity(),
                    cartItem.getNotes() != null ? cartItem.getNotes() : ""
                );
                orderItemsList.add(item);
            }
            order.setItems(orderItemsList);

            // Store cleanly in SQLite
            dbHelper.createOrder(order);

            // Clear Cart to complete Checkout Flow
            cartManager.clearCart();

            Toast.makeText(this, "Order successfully placed!", Toast.LENGTH_SHORT).show();

            // Direct to Success Page with complete intent extras
            Intent intent = new Intent(CheckoutActivity.this, PaymentSuccessActivity.class);
            intent.putExtra("invoiceId", customOrderId);
            intent.putExtra("total", String.format(Locale.getDefault(), "Rp %,.0f", grandTotal));
            intent.putExtra("delivery", isPickup ? "Ambil Sendiri (Store Pickup)" : "Antar Alamat (Home Delivery)");
            intent.putExtra("payment", binding.rbQris.isChecked() ? "QRIS (E-Wallet)" : "Cash on Delivery (COD)");
            startActivity(intent);
            finish();
        });
    }

    private void updateTotalDisplay(double subtotal, double platformFee) {
        double deliveryCost = binding.rbPickup.isChecked() ? 0.0 : 10000.0;
        double overallTotal = subtotal + platformFee + deliveryCost;
        binding.tvCheckoutTotal.setText("Rp " + String.format(Locale.getDefault(), "%,.0f", overallTotal));
    }
}
