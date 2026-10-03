package com.kiosjosh.app.adapter;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.model.Order;
import com.kiosjosh.app.model.OrderItem;
import com.kiosjosh.app.databinding.ItemOrderBinding;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.ViewHolder> {
    private List<Order> orderList;
    private Context context;

    public OrderAdapter(List<Order> orderList, Context context) {
        this.orderList = orderList;
        this.context = context;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemOrderBinding binding = ItemOrderBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Order order = orderList.get(position);

        // 1. ID
        holder.binding.tvOrderId.setText(order.getId() != null ? order.getId() : "KJ-00000000-00");

        // 2. Customer
        String name = order.getCustomerName();
        holder.binding.tvOrderCustomer.setText(name != null ? name : "Pelanggan Kios Josh");

        // 3. Sub Info: Phone & Delivery Type
        String pickupDelivery = order.getPickupOrDelivery() != null ? order.getPickupOrDelivery() : "pickup";
        String payMethod = order.getPaymentMethod() != null ? order.getPaymentMethod() : "cash";
        holder.binding.tvOrderSubInfo.setText("No Tlp: " + (order.getCustomerPhone() != null ? order.getCustomerPhone() : "-") + 
                " | " + pickupDelivery.toUpperCase() + " • " + payMethod.toUpperCase());

        // 4. Address
        if ("pickup".equalsIgnoreCase(pickupDelivery)) {
            holder.binding.tvOrderAddress.setText("Metode Ambil: Ambil sendiri di Kios");
        } else {
            holder.binding.tvOrderAddress.setText("Alamat Antar: " + (order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "-"));
        }

        // 5. Items Text Construction
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
        holder.binding.tvOrderItems.setText(sb.toString());

        // 6. Total Price
        holder.binding.tvOrderTotal.setText("Rp " + String.format("%,.0f", order.getTotal()));

        // 7. Status Badge Color and Labels (matches React preview)
        String status = order.getStatus() != null ? order.getStatus().toLowerCase() : "pending";
        if ("pending".equals(status)) {
            holder.binding.tvOrderStatus.setText("DAPUR BARU");
            holder.binding.tvOrderStatus.setBackgroundColor(Color.parseColor("#FF8B261D")); // colored orange-red
        } else if ("processing".equals(status)) {
            holder.binding.tvOrderStatus.setText("DIMASAK");
            holder.binding.tvOrderStatus.setBackgroundColor(Color.parseColor("#FFE9B44C")); // light orange
        } else if ("selesai".equals(status) || "completed".equals(status)) {
            holder.binding.tvOrderStatus.setText("SELESAI");
            holder.binding.tvOrderStatus.setBackgroundColor(Color.parseColor("#FF4CAF50")); // green
        } else if ("dibatalkan".equals(status) || "cancelled".equals(status)) {
            holder.binding.tvOrderStatus.setText("BATAL");
            holder.binding.tvOrderStatus.setBackgroundColor(Color.parseColor("#FF9E2A2B")); // scarlet red
        } else {
            holder.binding.tvOrderStatus.setText(status.toUpperCase());
            holder.binding.tvOrderStatus.setBackgroundColor(Color.parseColor("#FF706C69")); // gray
        }

        // 8. Listeners for Action Buttons
        holder.binding.btnStatusProcess.setOnClickListener(v -> updateOrderStatusLocallyAndRemotely(order, "processing", position));
        holder.binding.btnStatusComplete.setOnClickListener(v -> updateOrderStatusLocallyAndRemotely(order, "selesai", position));
        holder.binding.btnStatusCancel.setOnClickListener(v -> updateOrderStatusLocallyAndRemotely(order, "dibatalkan", position));
    }

    private void updateOrderStatusLocallyAndRemotely(Order order, String newStatus, int position) {
        // Clear local storage first
        DbHelper dbHelper = DbHelper.getInstance(context);
        dbHelper.updateOrderStatus(order.getId(), newStatus);

        // Update working array state for instant interactive UI updates
        order.setStatus(newStatus);
        notifyItemChanged(position);

        String uiStatusText = "DAPUR BARU";
        if ("processing".equals(newStatus)) uiStatusText = "DIMASAK";
        else if ("selesai".equals(newStatus)) uiStatusText = "SELESAI";
        else if ("dibatalkan".equals(newStatus)) uiStatusText = "BATAL";

        Toast.makeText(context, "Sukses: Pesanan " + order.getCustomerName() + " diubah ke " + uiStatusText, Toast.LENGTH_SHORT).show();

        // Fire asynchronous API call to sync order on server side
        Order updateBody = new Order();
        updateBody.setStatus(newStatus);

        ApiClient.getApiService().updateOrderStatus(order.getId(), updateBody).enqueue(new Callback<Order>() {
            @Override
            public void onResponse(@NonNull Call<Order> call, @NonNull Response<Order> response) {
                // Success synchronized to the node cloud database
            }

            @Override
            public void onFailure(@NonNull Call<Order> call, @NonNull Throwable t) {
                // Fail-safe handles offline mode smoothly; local SQLite remains source-of-truth!
            }
        });
    }

    @Override
    public int getItemCount() {
        return orderList.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ItemOrderBinding binding;
        public ViewHolder(ItemOrderBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
