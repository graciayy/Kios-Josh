package com.kiosjosh.app.customer.product;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.bumptech.glide.Glide;
import com.kiosjosh.app.databinding.ActivityProductDetailBinding;
import com.kiosjosh.app.model.CartItem;
import com.kiosjosh.app.model.CartManager;
import com.kiosjosh.app.model.Product;

public class ProductDetailActivity extends AppCompatActivity {
    private ActivityProductDetailBinding binding;
    private Product product;
    private int quantity = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityProductDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        product = (Product) getIntent().getSerializableExtra("product");
        if (product == null) {
            Toast.makeText(this, "Produk tidak ditemukan", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        binding.tvDetailName.setText(product.getName());
        binding.tvDetailPrice.setText("Rp " + String.format("%,.0f", product.getPrice()));
        binding.tvDetailDescription.setText(product.getDescription());

        String imageUrl = product.getImageUrl();
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            Glide.with(this)
                    .load(R.drawable.ic_launcher)
                    .placeholder(R.drawable.ic_launcher)
                    .error(R.drawable.ic_launcher)
                    .into(binding.ivDetailImage);
        } else {
            Glide.with(this)
                    .load(imageUrl)
                    .placeholder(R.drawable.ic_launcher)
                    .error(R.drawable.ic_launcher)
                    .into(binding.ivDetailImage);
        }

        binding.tvQuantity.setText(String.valueOf(quantity));

        binding.btnIncrease.setOnClickListener(v -> {
            quantity++;
            binding.tvQuantity.setText(String.valueOf(quantity));
        });

        binding.btnDecrease.setOnClickListener(v -> {
            if (quantity > 1) {
                quantity--;
                binding.tvQuantity.setText(String.valueOf(quantity));
            }
        });

        binding.btnAddToCart.setOnClickListener(v -> {
            CartItem item = new CartItem(product, quantity, "");
            CartManager.getInstance(ProductDetailActivity.this).addCartItem(item);
            Toast.makeText(ProductDetailActivity.this, product.getName() + " berhasil dimasukkan ke keranjang!", Toast.LENGTH_SHORT).show();
            finish();
        });
    }
}
