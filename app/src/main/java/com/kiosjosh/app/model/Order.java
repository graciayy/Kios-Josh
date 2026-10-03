package com.kiosjosh.app.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.List;

public class Order implements Serializable {
    @SerializedName("id")
    private String id;

    @SerializedName("customerName")
    private String customerName;

    @SerializedName("customerPhone")
    private String customerPhone;

    @SerializedName("items")
    private List<OrderItem> items;

    @SerializedName("total")
    private double total;

    @SerializedName("paymentMethod")
    private String paymentMethod; // 'cash' or 'qris'

    @SerializedName("status")
    private String status; // 'pending' | 'processing' | 'selesai' | 'dibatalkan'

    @SerializedName("pickupOrDelivery")
    private String pickupOrDelivery; // 'pickup' | 'delivery'

    @SerializedName("deliveryAddress")
    private String deliveryAddress;

    @SerializedName("deliveryFee")
    private double deliveryFee;

    @SerializedName("createdAt")
    private String createdAt;

    public Order() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPickupOrDelivery() { return pickupOrDelivery; }
    public void setPickupOrDelivery(String pickupOrDelivery) { this.pickupOrDelivery = pickupOrDelivery; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public double getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(double deliveryFee) { this.deliveryFee = deliveryFee; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
