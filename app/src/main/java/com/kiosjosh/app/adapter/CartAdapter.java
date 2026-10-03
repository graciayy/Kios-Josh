package com.kiosjosh.app.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.kiosjosh.app.databinding.ItemCartBinding;
import com.kiosjosh.app.model.CartItem;
import com.kiosjosh.app.model.CartManager;
import java.util.List;

public class CartAdapter extends RecyclerView.Adapter<CartAdapter.ViewHolder> {
    private List<CartItem> cartItems;
    private Context context;
    private CartUpdateListener listener;

    public interface CartUpdateListener {
        void onCartUpdate();
    }

    public CartAdapter(List<CartItem> cartItems, Context context, CartUpdateListener listener) {
        this.cartItems = cartItems;
        this.context = context;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemCartBinding binding = ItemCartBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        CartItem item = cartItems.get(position);
        if (item.getProduct() == null) return;

        holder.binding.tvCartItemName.setText(item.getProduct().getName());
        holder.binding.tvCartItemPrice.setText("Rp " + String.format("%,.0f", item.getProduct().getPrice()));
        holder.binding.tvCartQuantity.setText(String.valueOf(item.getQuantity()));

        String imageUrl = item.getProduct().getImageUrl();
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            Glide.with(context)
                    .load(R.drawable.ic_launcher)
                    .placeholder(R.drawable.ic_launcher)
                    .error(R.drawable.ic_launcher)
                    .into(holder.binding.ivCartItemImage);
        } else {
            Glide.with(context)
                    .load(imageUrl)
                    .placeholder(R.drawable.ic_launcher)
                    .error(R.drawable.ic_launcher)
                    .into(holder.binding.ivCartItemImage);
        }

        holder.binding.btnCartIncrease.setOnClickListener(v -> {
            int newQty = item.getQuantity() + 1;
            CartManager.getInstance(context).updateCartItemQuantity(item.getProduct().getId(), newQty);
            notifyItemChanged(position);
            if (listener != null) listener.onCartUpdate();
        });

        holder.binding.btnCartDecrease.setOnClickListener(v -> {
            if (item.getQuantity() > 1) {
                int newQty = item.getQuantity() - 1;
                CartManager.getInstance(context).updateCartItemQuantity(item.getProduct().getId(), newQty);
                notifyItemChanged(position);
            } else {
                CartManager.getInstance(context).removeCartItem(item.getProduct().getId());
                notifyDataSetChanged();
            }
            if (listener != null) listener.onCartUpdate();
        });

        holder.binding.btnCartDelete.setOnClickListener(v -> {
            CartManager.getInstance(context).removeCartItem(item.getProduct().getId());
            notifyDataSetChanged();
            if (listener != null) listener.onCartUpdate();
        });
    }

    @Override
    public int getItemCount() {
        return cartItems.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ItemCartBinding binding;
        public ViewHolder(ItemCartBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
