package com.kiosjosh.app.adapter;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kiosjosh.app.customer.order.OrderTrackingActivity;
import com.kiosjosh.app.model.Order;
import com.kiosjosh.app.model.OrderItem;
import com.kiosjosh.app.databinding.ItemCustomerOrderBinding;
import java.util.List;

public class CustomerOrderAdapter extends RecyclerView.Adapter<CustomerOrderAdapter.ViewHolder> {
    private List<Order> orderList;
    private Context context;

    public CustomerOrderAdapter(List<Order> orderList, Context context) {
        this.orderList = orderList;
        this.context = context;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemCustomerOrderBinding binding = ItemCustomerOrderBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Order order = orderList.get(position);

        // ID
        holder.binding.tvCustOrderId.setText(order.getId() != null ? order.getId() : "KJ-00000000-00");

        // Sub Info (Date/Time + Payment + Type)
        String pickupDelivery = order.getPickupOrDelivery() != null ? order.getPickupOrDelivery() : "pickup";
        String payMethod = order.getPaymentMethod() != null ? order.getPaymentMethod() : "cash";
        holder.binding.tvCustOrderSubInfo.setText(pickupDelivery.toUpperCase() + " • " + payMethod.toUpperCase());

        // Address
        if ("pickup".equalsIgnoreCase(pickupDelivery)) {
            holder.binding.tvCustOrderAddress.setText("Metode Ambil: Ambil sendiri di Kios");
        } else {
            holder.binding.tvCustOrderAddress.setText("Alamat Antar: " + (order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "-"));
        }

        // Items Constructor string
        StringBuilder sb = new StringBuilder();
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (int i = 0; i < order.getItems().size(); i++) {
                OrderItem item = order.getItems().get(i);
                sb.append(item.getQuantity()).append("x ").append(item.getName());
                if (item.getNotes() != null && !item.getNotes().trim().isEmpty()) {
                    sb.append(" (").append(item.getNotes()).append(")");
                }
                if (i < order.getItems().size() - 1) {
                    sb.append("\n");
                }
            }
        } else {
            sb.append("1x Tinutuan (Bubur Manado)");
        }
        holder.binding.tvCustOrderItems.setText(sb.toString());

        // Total price
        holder.binding.tvCustOrderTotal.setText("Rp " + String.format("%,.0f", order.getTotal()));

        // Status badge setup
        String status = order.getStatus() != null ? order.getStatus().toLowerCase() : "pending";
        if ("pending".equals(status)) {
            holder.binding.tvCustOrderStatus.setText("DAPUR BARU");
            holder.binding.tvCustOrderStatus.setBackgroundColor(Color.parseColor("#FF8B261D")); // orange-red
            holder.binding.tvClickToTrack.setVisibility(View.VISIBLE);
        } else if ("processing".equals(status)) {
            holder.binding.tvCustOrderStatus.setText("DIMASAK");
            holder.binding.tvCustOrderStatus.setBackgroundColor(Color.parseColor("#FFE9B44C")); // yellow-orange
            holder.binding.tvClickToTrack.setVisibility(View.VISIBLE);
        } else if ("selesai".equals(status) || "completed".equals(status)) {
            holder.binding.tvCustOrderStatus.setText("SELESAI");
            holder.binding.tvCustOrderStatus.setBackgroundColor(Color.parseColor("#FF4CAF50")); // green
            holder.binding.tvClickToTrack.setVisibility(View.GONE);
        } else if ("dibatalkan".equals(status) || "cancelled".equals(status)) {
            holder.binding.tvCustOrderStatus.setText("BATAL");
            holder.binding.tvCustOrderStatus.setBackgroundColor(Color.parseColor("#FF9E2A2B")); // scarlet red
            holder.binding.tvClickToTrack.setVisibility(View.GONE);
        } else {
            holder.binding.tvCustOrderStatus.setText(status.toUpperCase());
            holder.binding.tvCustOrderStatus.setBackgroundColor(Color.parseColor("#FF706C69")); // grey
            holder.binding.tvClickToTrack.setVisibility(View.GONE);
        }

        // Click handler to open tracking if requested or clicked
        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(context, OrderTrackingActivity.class);
            intent.putExtra("order_id", order.getId());
            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return orderList.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ItemCustomerOrderBinding binding;
        public ViewHolder(ItemCustomerOrderBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
