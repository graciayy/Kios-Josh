package com.kiosjosh.app.model;

import java.io.Serializable;

public class CartItem implements Serializable {
    private Product product;
    private int quantity;
    private String notes;

    public CartItem() {}

    public CartItem(Product product, int quantity, String notes) {
        this.product = product;
        this.quantity = quantity;
        this.notes = notes;
    }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
