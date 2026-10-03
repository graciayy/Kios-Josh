package com.kiosjosh.app.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class OrderItem implements Serializable {
    @SerializedName("productId")
    private String productId;

    @SerializedName("name")
    private String name;

    @SerializedName("price")
    private double price;

    @SerializedName("quantity")
    private int quantity;

    @SerializedName("notes")
    private String notes;

    public OrderItem() {}

    public OrderItem(String productId, String name, double price, int quantity, String notes) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.notes = notes;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
