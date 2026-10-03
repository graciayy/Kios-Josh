package com.kiosjosh.app.api;

import com.kiosjosh.app.model.Order;
import com.kiosjosh.app.model.Product;
import com.kiosjosh.app.model.User;

import java.util.List;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    // --- PRODUCTS ---
    @GET("api/products")
    Call<List<Product>> getProducts();

    @POST("api/products")
    Call<Product> addProduct(@Body Product product);

    @PUT("api/products/{id}")
    Call<Product> updateProduct(@Path("id") String id, @Body Product product);

    @DELETE("api/products/{id}")
    Call<ResponseBody> deleteProduct(@Path("id") String id);

    // --- ORDERS ---
    @GET("api/orders")
    Call<List<Order>> getOrders();

    @POST("api/orders")
    Call<Order> createOrder(@Body Order order);

    @PUT("api/orders/{id}/status")
    Call<Order> updateOrderStatus(@Path("id") String id, @Body Order statusUpdate);

    // --- USER PROFILE ---
    @GET("api/profile")
    Call<User> getProfile();

    @PUT("api/profile")
    Call<User> updateProfile(@Body User profile);
}
