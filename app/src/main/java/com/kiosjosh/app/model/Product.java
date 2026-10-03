package com.kiosjosh.app.model;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Product implements Serializable {
    @SerializedName("id")
    private String id;

    @SerializedName("name")
    private String name;

    @SerializedName("category")
    private String category;

    @SerializedName("price")
    private double price;

    @SerializedName("stock")
    private int stock;

    @SerializedName("description")
    private String description;

    @SerializedName("imageUrl")
    private String imageUrl;

    @SerializedName("isAvailable")
    private boolean isAvailable;

    public Product() {}

    public Product(String id, String name, String category, double price, int stock, String description, String imageUrl, boolean isAvailable) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}
