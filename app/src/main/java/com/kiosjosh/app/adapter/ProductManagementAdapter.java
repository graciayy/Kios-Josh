package com.kiosjosh.app.adapter;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.kiosjosh.app.admin.product.EditProductActivity;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.Product;
import com.kiosjosh.app.databinding.ItemProductManagementBinding;
import java.util.List;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProductManagementAdapter extends RecyclerView.Adapter<ProductManagementAdapter.ViewHolder> {
    private List<Product> productList;
    private Context context;

    public ProductManagementAdapter(List<Product> productList, Context context) {
        this.productList = productList;
        this.context = context;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemProductManagementBinding binding = ItemProductManagementBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Product p = productList.get(position);

        // Bind data
        holder.binding.tvAdminProductName.setText(p.getName());
        holder.binding.tvAdminProductPrice.setText("Rp " + String.format("%,.0f", p.getPrice()));
        holder.binding.tvAdminProductStock.setText("stok: " + p.getStock());
        holder.binding.tvAdminProductCategory.setText(p.getCategory() != null ? p.getCategory() : "Makanan");
        holder.binding.tvAdminProductDesc.setText(p.getDescription() != null ? p.getDescription() : "");

        // Load image using Glide
        String imgUrl = p.getImageUrl();
        if (imgUrl != null && !imgUrl.isEmpty()) {
            Glide.with(context)
                    .load(imgUrl)
                    .placeholder(R.drawable.ic_launcher)
                    .error(R.drawable.ic_launcher)
                    .into(holder.binding.ivAdminProductThumb);
        } else {
            holder.binding.ivAdminProductThumb.setImageResource(R.drawable.ic_launcher);
        }

        // Available Badge color
        if (p.isAvailable()) {
            holder.binding.tvAdminProductStatus.setText("Sedia");
            holder.binding.tvAdminProductStatus.setBackgroundColor(Color.parseColor("#FF4CAF50")); // Green
        } else {
            holder.binding.tvAdminProductStatus.setText("Habis");
            holder.binding.tvAdminProductStatus.setBackgroundColor(Color.parseColor("#FF8B261D")); // Orange-red
        }

        // Toggle Sedia / Habis Button Click
        holder.binding.btnToggleAvailability.setOnClickListener(v -> {
            boolean nextState = !p.isAvailable();
            p.setAvailable(nextState);

            // Update local SQLite
            DbHelper dbHelper = DbHelper.getInstance(context);
            dbHelper.updateProduct(p);
            notifyItemChanged(position);

            Toast.makeText(context, p.getName() + " sekarang: " + (nextState ? "SEDIA" : "HABIS"), Toast.LENGTH_SHORT).show();

            // Notify server
            ApiClient.getApiService().updateProduct(p.getId(), p).enqueue(new Callback<Product>() {
                @Override
                public void onResponse(@NonNull Call<Product> call, @NonNull Response<Product> response) {
                    // Sync done
                }

                @Override
                public void onFailure(@NonNull Call<Product> call, @NonNull Throwable t) {
                    // Fail safe updates locally first!
                }
            });
        });

        // Edit Button Click
        holder.binding.btnProductEdit.setOnClickListener(v -> {
            Intent intent = new Intent(context, EditProductActivity.class);
            intent.putExtra("product_id", p.getId());
            intent.putExtra("product_name", p.getName());
            intent.putExtra("product_price", p.getPrice());
            intent.putExtra("product_stock", p.getStock());
            intent.putExtra("product_desc", p.getDescription());
            intent.putExtra("product_image", p.getImageUrl());
            intent.putExtra("product_category", p.getCategory());
            intent.putExtra("product_available", p.isAvailable());
            context.startActivity(intent);
        });

        // Delete Button Click with elegant alert confirmation
        holder.binding.btnProductDelete.setOnClickListener(v -> {
            new AlertDialog.Builder(context)
                    .setTitle("Hapus Kuliner")
                    .setMessage("Yakin ingin selamanya menghapus menu \"" + p.getName() + "\" dari Kios Josh?")
                    .setPositiveButton("Hapus", (dialog, which) -> {
                        // Delete locally
                        DbHelper dbHelper = DbHelper.getInstance(context);
                        dbHelper.deleteProduct(p.getId());

                        productList.remove(position);
                        notifyItemRemoved(position);
                        notifyItemRangeChanged(position, productList.size());

                        Toast.makeText(context, p.getName() + " telah dihapus.", Toast.LENGTH_SHORT).show();

                        // Delete from API backend server
                        ApiClient.getApiService().deleteProduct(p.getId()).enqueue(new Callback<ResponseBody>() {
                            @Override
                            public void onResponse(@NonNull Call<ResponseBody> call, @NonNull Response<ResponseBody> response) {
                                // Sync done
                            }

                            @Override
                            public void onFailure(@NonNull Call<ResponseBody> call, @NonNull Throwable t) {
                                // Handled offline
                            }
                        });
                    })
                    .setNegativeButton("Batal", null)
                    .show();
        });
    }

    @Override
    public int getItemCount() {
        return productList.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ItemProductManagementBinding binding;
        public ViewHolder(ItemProductManagementBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
