package com.kiosjosh.app.model;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class CartManager {
    private static final String PREF_NAME = "KiosJoshCartPref";
    private static final String KEY_ITEMS = "cart_items";
    private static CartManager instance;
    private Context context;
    private List<CartItem> cartItems;
    private Gson gson;

    private CartManager(Context context) {
        this.context = context.getApplicationContext();
        this.gson = new Gson();
        this.cartItems = new ArrayList<>();
        loadCart();
    }

    public static synchronized CartManager getInstance(Context context) {
        if (instance == null) {
            instance = new CartManager(context);
        }
        return instance;
    }

    public List<CartItem> getCartItems() {
        return cartItems;
    }

    public void addCartItem(CartItem newItem) {
        boolean exists = false;
        for (CartItem item : cartItems) {
            if (item.getProduct().getId() != null && item.getProduct().getId().equals(newItem.getProduct().getId())) {
                item.setQuantity(item.getQuantity() + newItem.getQuantity());
                if (newItem.getNotes() != null && !newItem.getNotes().isEmpty()) {
                    String existingNotes = item.getNotes();
                    if (existingNotes == null || existingNotes.isEmpty()) {
                        item.setNotes(newItem.getNotes());
                    } else {
                        item.setNotes(existingNotes + ", " + newItem.getNotes());
                    }
                }
                exists = true;
                break;
            }
        }
        if (!exists) {
            cartItems.add(newItem);
        }
        saveCart();
    }

    public void updateCartItemQuantity(String productId, int quantity) {
        for (CartItem item : cartItems) {
            if (item.getProduct().getId() != null && item.getProduct().getId().equals(productId)) {
                if (quantity <= 0) {
                    cartItems.remove(item);
                } else {
                    item.setQuantity(quantity);
                }
                break;
            }
        }
        saveCart();
    }

    public void removeCartItem(String productId) {
        for (int i = 0; i < cartItems.size(); i++) {
            if (cartItems.get(i).getProduct().getId() != null && cartItems.get(i).getProduct().getId().equals(productId)) {
                cartItems.remove(i);
                break;
            }
        }
        saveCart();
    }

    public double getTotalPrice() {
        double total = 0;
        for (CartItem item : cartItems) {
            total += item.getProduct().getPrice() * item.getQuantity();
        }
        return total;
    }

    public void clearCart() {
        cartItems.clear();
        saveCart();
    }

    public void saveCart() {
        SharedPreferences sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        String json = gson.toJson(cartItems);
        editor.putString(KEY_ITEMS, json);
        editor.apply();
    }

    private void loadCart() {
        SharedPreferences sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        String json = sharedPreferences.getString(KEY_ITEMS, null);
        if (json != null) {
            Type type = new TypeToken<ArrayList<CartItem>>() {}.getType();
            try {
                List<CartItem> items = gson.fromJson(json, type);
                if (items != null) {
                    cartItems = items;
                }
            } catch (Exception e) {
                cartItems = new ArrayList<>();
            }
        } else {
            cartItems = new ArrayList<>();
        }
    }
}
