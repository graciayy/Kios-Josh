package com.kiosjosh.app.customer;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kiosjosh.app.adapter.CartAdapter;
import com.kiosjosh.app.customer.order.CheckoutActivity;
import com.kiosjosh.app.databinding.FragmentCartBinding;
import com.kiosjosh.app.model.CartItem;
import com.kiosjosh.app.model.CartManager;
import java.util.List;

public class CartFragment extends Fragment implements CartAdapter.CartUpdateListener {
    private FragmentCartBinding binding;
    private CartAdapter adapter;
    private List<CartItem> cartItems;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentCartBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        cartItems = CartManager.getInstance(getContext()).getCartItems();

        setupRecyclerView();
        updateUI();

        binding.btnCheckout.setOnClickListener(v -> {
            if (cartItems.isEmpty()) return;
            Intent intent = new Intent(getActivity(), CheckoutActivity.class);
            startActivity(intent);
        });

        binding.btnClearCart.setOnClickListener(v -> {
            CartManager.getInstance(getContext()).clearCart();
            adapter.notifyDataSetChanged();
            updateUI();
        });
    }

    private void setupRecyclerView() {
        adapter = new CartAdapter(cartItems, getContext(), this);
        binding.rvCartItems.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvCartItems.setAdapter(adapter);
    }

    private void updateUI() {
        if (cartItems.isEmpty()) {
            binding.llEmptyState.setVisibility(View.VISIBLE);
            binding.rvCartItems.setVisibility(View.GONE);
            binding.llBottomSummary.setVisibility(View.GONE);
            binding.btnClearCart.setVisibility(View.GONE);
        } else {
            binding.llEmptyState.setVisibility(View.GONE);
            binding.rvCartItems.setVisibility(View.VISIBLE);
            binding.llBottomSummary.setVisibility(View.VISIBLE);
            binding.btnClearCart.setVisibility(View.VISIBLE);

            double total = CartManager.getInstance(getContext()).getTotalPrice();
            binding.tvCartTotal.setText("Rp " + String.format("%,.0f", total));
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Refresh cart items when navigating back
        if (adapter != null) {
            adapter.notifyDataSetChanged();
        }
        updateUI();
    }

    @Override
    public void onCartUpdate() {
        updateUI();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
