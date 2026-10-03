package com.kiosjosh.app.admin.product;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.Product;
import com.kiosjosh.app.databinding.ActivityAddProductBinding;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddProductActivity extends AppCompatActivity {
    private ActivityAddProductBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityAddProductBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Back button
        binding.btnBackAdd.setOnClickListener(v -> finish());

        // Spinner categories setup
        String[] categories = {"Makanan", "Minuman", "Gorengan & Snack"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, categories);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        binding.spAddProdCategory.setAdapter(adapter);

        // Save action
        binding.btnAddProdSave.setOnClickListener(v -> saveNewProductAndSync());
    }

    private void saveNewProductAndSync() {
        String name = binding.etAddProdName.getText().toString().trim();
        String priceStr = binding.etAddProdPrice.getText().toString().trim();
        String stockStr = binding.etAddProdStock.getText().toString().trim();
        String desc = binding.etAddProdDesc.getText().toString().trim();
        String image = binding.etAddProdImage.getText().toString().trim();
        String category = binding.spAddProdCategory.getSelectedItem().toString();
        boolean isAvailable = binding.swAddProdAvailable.isChecked();

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

        // Generate ID
        String prodId = "prod-" + System.currentTimeMillis();

        // Default image path if empty
        if (image.isEmpty()) {
            image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";
        }

        // Initialize Product Object
        Product p = new Product();
        p.setId(prodId);
        p.setName(name);
        p.setPrice(price);
        p.setStock(stock);
        p.setCategory(category);
        p.setDescription(desc);
        p.setImageUrl(image);
        p.setAvailable(isAvailable);

        // Save to Local SQLite instantly
        DbHelper dbHelper = DbHelper.getInstance(this);
        dbHelper.addProduct(p);

        Toast.makeText(this, "Sukses: " + name + " ditambahkan secara lokal!", Toast.LENGTH_SHORT).show();

        // Sync to cloud server API backend asynchronously
        ApiClient.getApiService().addProduct(p).enqueue(new Callback<Product>() {
            @Override
            public void onResponse(@NonNull Call<Product> call, @NonNull Response<Product> response) {
                // Done synchronising
            }

            @Override
            public void onFailure(@NonNull Call<Product> call, @NonNull Throwable t) {
                // Done (offline supported)
            }
        });

        finish();
    }
}
