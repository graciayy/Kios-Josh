package com.kiosjosh.app.admin.product;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.Product;
import com.kiosjosh.app.databinding.ActivityEditProductBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EditProductActivity extends AppCompatActivity {
    private ActivityEditProductBinding binding;
    private String productId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityEditProductBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Back action
        binding.btnBackEdit.setOnClickListener(v -> finish());

        // Spinner categories setup
        String[] categories = {"Makanan", "Minuman", "Gorengan & Snack"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, categories);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        binding.spEditProdCategory.setAdapter(adapter);

        // Prepopulate values
        Bundle extras = getIntent().getExtras();
        if (extras != null) {
            productId = extras.getString("product_id");
            binding.etEditProdName.setText(extras.getString("product_name"));
            binding.etEditProdPrice.setText(String.valueOf((int) extras.getDouble("product_price", 0)));
            binding.etEditProdStock.setText(String.valueOf(extras.getInt("product_stock", 0)));
            binding.etEditProdDesc.setText(extras.getString("product_desc"));
            binding.etEditProdImage.setText(extras.getString("product_image"));
            binding.swEditProdAvailable.setChecked(extras.getBoolean("product_available", true));

            String cat = extras.getString("product_category", "Makanan");
            for (int i = 0; i < categories.length; i++) {
                if (categories[i].equalsIgnoreCase(cat)) {
                    binding.spEditProdCategory.setSelection(i);
                    break;
                }
            }
        }

        // Save action
        binding.btnEditProdSave.setOnClickListener(v -> saveProductEditsAndSync());
    }

    private void saveProductEditsAndSync() {
        if (productId == null || productId.isEmpty()) {
            Toast.makeText(this, "ID produk tidak valid!", Toast.LENGTH_SHORT).show();
            return;
        }

        String name = binding.etEditProdName.getText().toString().trim();
        String priceStr = binding.etEditProdPrice.getText().toString().trim();
        String stockStr = binding.etEditProdStock.getText().toString().trim();
        String desc = binding.etEditProdDesc.getText().toString().trim();
        String image = binding.etEditProdImage.getText().toString().trim();
        String category = binding.spEditProdCategory.getSelectedItem().toString();
        boolean isAvailable = binding.swEditProdAvailable.isChecked();

        // Validate
        if (name.isEmpty() || priceStr.isEmpty() || stockStr.isEmpty()) {
            Toast.makeText(this, "Harap isi semua kolom wajib (*)", Toast.LENGTH_SHORT).show();
            return;
        }

        double price;
        int stock;
        try {
            price = Double.parseDouble(priceStr);
            stock = Integer.parseInt(stockStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Harga atau stok harus berupa angka valid!", Toast.LENGTH_SHORT).show();
            return;
        }

        // Default image template if empty
        if (image.isEmpty()) {
            image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";
        }

        // Setup modified product
        Product p = new Product();
        p.setId(productId);
        p.setName(name);
        p.setPrice(price);
        p.setStock(stock);
        p.setCategory(category);
        p.setDescription(desc);
        p.setImageUrl(image);
        p.setAvailable(isAvailable);

        // Save local SQLite instantly for real-time responsiveness
        DbHelper dbHelper = DbHelper.getInstance(this);
        dbHelper.updateProduct(p);

        Toast.makeText(this, "Sukses: " + name + " diperbarui secara lokal!", Toast.LENGTH_SHORT).show();

        // Send PUT request to Node cloud server API asynchronously
        ApiClient.getApiService().updateProduct(productId, p).enqueue(new Callback<Product>() {
            @Override
            public void onResponse(@NonNull Call<Product> call, @NonNull Response<Product> response) {
                // Done syncing
            }

            @Override
            public void onFailure(@NonNull Call<Product> call, @NonNull Throwable t) {
                // Done (offline supported smoothly)
            }
        });

        finish();
    }
}
