package com.kiosjosh.app.adapter;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.kiosjosh.app.model.Product;
import com.kiosjosh.app.databinding.ItemProductGridBinding;
import java.util.List;

public class ProductAdapter extends RecyclerView.Adapter<ProductAdapter.ViewHolder> {
    private List<Product> productList;
    private Context context;

    public ProductAdapter(List<Product> productList, Context context) {
        this.productList = productList;
        this.context = context;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemProductGridBinding binding = ItemProductGridBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Product product = productList.get(position);
        String name = product.getName();
        holder.binding.tvProductName.setText(name != null ? name : "Product");
        holder.binding.tvProductPrice.setText("Rp " + String.format("%,.0f", product.getPrice()));

        String imageUrl = product.getImageUrl();
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            Glide.with(context)
                    .load(R.drawable.ic_launcher)
                    .placeholder(R.drawable.ic_launcher)
                    .error(R.drawable.ic_launcher)
                    .into(holder.binding.ivProductImage);
        } else {
            Glide.with(context)
                    .load(imageUrl)
                    .placeholder(R.drawable.ic_launcher)
                    .error(R.drawable.ic_launcher)
                    .into(holder.binding.ivProductImage);
        }

        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(context, com.kiosjosh.app.customer.product.ProductDetailActivity.class);
            intent.putExtra("product", product);
            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return productList.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ItemProductGridBinding binding;
        public ViewHolder(ItemProductGridBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
