package com.kiosjosh.app.customer;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import com.kiosjosh.app.R;
import com.kiosjosh.app.api.ApiClient;
import com.kiosjosh.app.database.DbHelper;
import com.kiosjosh.app.adapter.ProductAdapter;
import com.kiosjosh.app.model.Product;
import com.kiosjosh.app.databinding.FragmentHomeBinding;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeFragment extends Fragment {
    private FragmentHomeBinding binding;
    private ProductAdapter adapter;
    private List<Product> allProductsList = new ArrayList<>();
    private List<Product> productList = new ArrayList<>();
    private String selectedCategory = "Semua";
    private String searchQuery = "";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentHomeBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Setup product display RecyclerView (Grid Layout)
        binding.rvFeaturedProducts.setLayoutManager(new GridLayoutManager(getContext(), 2));
        adapter = new ProductAdapter(productList, getContext());
        binding.rvFeaturedProducts.setAdapter(adapter);

        // Setup search input filter and listener
        binding.etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchQuery = s.toString();
                filterProducts();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Setup category filter button clicks
        binding.btnCatSemua.setOnClickListener(v -> selectCategory("Semua"));
        binding.btnCatMakanan.setOnClickListener(v -> selectCategory("Makanan"));
        binding.btnCatMinuman.setOnClickListener(v -> selectCategory("Minuman"));
        binding.btnCatSnack.setOnClickListener(v -> selectCategory("Gorengan & Snack"));

        // Fetch products from API/Mock
        fetchProducts();
    }

    private void selectCategory(String category) {
        selectedCategory = category;
        updateCategoryUI();
        filterProducts();
    }

    private void updateCategoryUI() {
        if (getContext() == null || binding == null) return;

        int activeBg = R.drawable.bg_category_active;
        int inactiveBg = R.drawable.bg_category_inactive;
        int whiteColor = getResources().getColor(R.color.white, null);
        int blackColor = getResources().getColor(R.color.black, null);

        binding.btnCatSemua.setBackgroundResource(selectedCategory.equals("Semua") ? activeBg : inactiveBg);
        binding.btnCatSemua.setTextColor(selectedCategory.equals("Semua") ? whiteColor : blackColor);

        binding.btnCatMakanan.setBackgroundResource(selectedCategory.equals("Makanan") ? activeBg : inactiveBg);
        binding.btnCatMakanan.setTextColor(selectedCategory.equals("Makanan") ? whiteColor : blackColor);

        binding.btnCatMinuman.setBackgroundResource(selectedCategory.equals("Minuman") ? activeBg : inactiveBg);
        binding.btnCatMinuman.setTextColor(selectedCategory.equals("Minuman") ? whiteColor : blackColor);

        binding.btnCatSnack.setBackgroundResource(selectedCategory.equals("Gorengan & Snack") ? activeBg : inactiveBg);
        binding.btnCatSnack.setTextColor(selectedCategory.equals("Gorengan & Snack") ? whiteColor : blackColor);
    }

    private void filterProducts() {
        productList.clear();
        for (Product p : allProductsList) {
            boolean matchesCategory = selectedCategory.equals("Semua") || 
                    (p.getCategory() != null && p.getCategory().equalsIgnoreCase(selectedCategory));
            boolean matchesSearch = searchQuery.trim().isEmpty() || 
                    (p.getName() != null && p.getName().toLowerCase().contains(searchQuery.toLowerCase())) || 
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(searchQuery.toLowerCase()));

            if (matchesCategory && matchesSearch) {
                productList.add(p);
            }
        }
        adapter.notifyDataSetChanged();
    }

    private List<Product> getMockProducts() {
        List<Product> list = new ArrayList<>();
        list.add(new Product("m1", "Tinutuan", "Makanan", 10000, 50, "Bubur Manado otentik gurih hangat cocok dicanangkan dengan dabu-dabu iris atau sambal roa.", "", true));
        list.add(new Product("m2", "Tinutuan Brenebon Ceker", "Makanan", 15000, 50, "Tinutuan lezat dengan tambahan sup kacang merah (brenebon) dan ceker ayam empuk.", "", true));
        list.add(new Product("m3", "Midal (Tinu Campur Mi)", "Makanan", 10000, 50, "Kombinasi bubur Manado Tinutuan dicampur mie kuning lezat khas Sulawesi Utara.", "", true));
        list.add(new Product("m4", "Midal Brenebon Ceker", "Makanan", 15000, 50, "Midal istimewa disajikan dengan kuah sup brenebon kacang merah dan ceker empuk.", "", true));
        list.add(new Product("m5", "Mie Cakalang", "Makanan", 13000, 50, "Mie kuah khas dengan suwiran cakalang asap harum khas Bumi Nyiur Melambai.", "", true));
        list.add(new Product("m6", "Mi Cakalang Brenebon Ceker", "Makanan", 18000, 50, "Mie cakalang spesial dengan topping brenebon kacang merah dan ceker ayam empuk.", "", true));
        list.add(new Product("m7", "Nasi Kuning", "Makanan", 10000, 50, "Nasi kuning wangi khas Manado dibungkus rapi dengan daun woka aromatik.", "", true));
        list.add(new Product("m8", "Nasi Kuning + Telur", "Makanan", 13000, 50, "Nasi kuning Manado daun woka lengkap dengan tambahan telur rebus atau telur dadar.", "", true));
        list.add(new Product("m9", "Nasi Ayam Lalapan", "Makanan", 25000, 50, "Nasi hangat pulen dengan ayam goreng gurih, lalapan segar melimpah, and dabu dabu rica meresap.", "", true));
        list.add(new Product("m10", "Nasi Ayam Geprek", "Makanan", 15000, 50, "Nasi hangat dengan ayam goreng renyah digeprek sambal pedas mematikan.", "", true));
        list.add(new Product("m11", "Nasi Putih", "Makanan", 5000, 50, "Seporsi nasi putih hangat yang pulen.", "", true));
        list.add(new Product("m12", "Brenebon Ceker", "Makanan", 8000, 50, "Kuah sup kacang merah hangat penuh kaldu gurih dengan ceker ayam empuk.", "", true));
        list.add(new Product("m13", "Telur Dadar", "Makanan", 5000, 50, "Telur dadar goreng kering gurih nan renyah cocok untuk lauk tambahan.", "", true));
        list.add(new Product("m14", "Telur Mata Sapi", "Makanan", 5000, 50, "Telur mata sapi lezat digoreng segar.", "", true));
        list.add(new Product("m15", "Telur Rebus", "Makanan", 4000, 50, "Sebutir telur ayam rebus bergizi tinggi.", "", true));

        // --- MINUMAN ---
        list.add(new Product("d1", "Es Campur", "Minuman", 15000, 50, "Es campur segar melimpah dengan aneka isian buah sirup pandan susu manis.", "", true));
        list.add(new Product("d2", "Es Brenebon Susu", "Minuman", 13000, 50, "Es serut kacang merah (brenebon) manis wangi dengan lumuran susu kental manis.", "", true));
        list.add(new Product("d3", "Es Brenebon Alpukat", "Minuman", 15000, 50, "Es kacang merah legendaris dikombinasikan dengan potongan buah alpukat segar.", "", true));
        list.add(new Product("d4", "Es Brenebon Kacang", "Minuman", 15000, 50, "Es serut legendaris kacang merah dengan ekstra serutan kacang renyah.", "", true));
        list.add(new Product("d5", "Es Kacang", "Minuman", 13000, 50, "Es serut kacang merah manis lembut dengan sirup coklat/frambozen khas Sulawesi.", "", true));
        list.add(new Product("d6", "Es Kacang Alpukat", "Minuman", 15000, 50, "Es kacang legendaris disajikan dengan alpukat mentega legit melimpah.", "", true));
        list.add(new Product("d7", "Jus Alpukat", "Minuman", 15000, 50, "Jus alpukat segar murni kental dengan balutan susu kental manis cokelat.", "", true));
        list.add(new Product("d8", "Jus Sirsak", "Minuman", 15000, 50, "Jus buah sirsak murni asam manis segar dingin menyegarkan.", "", true));
        list.add(new Product("d9", "Jus Buah Naga", "Minuman", 15000, 50, "Jus buah naga merah segar tinggi serat and antioksidan alami.", "", true));
        list.add(new Product("d10", "Nutrisari", "Minuman", 5000, 50, "Es jeruk Nutrisari segar penambah energi berlimpah vitamin C.", "", true));
        list.add(new Product("d11", "Es Teh", "Minuman", 5000, 50, "Segelas es teh manis segar dingin pelepas dahaga nomor satu.", "", true));
        list.add(new Product("d12", "Teh Panas", "Minuman", 5000, 50, "Teh manis hangat dengan aroma harum melati.", "", true));
        list.add(new Product("d13", "Kopi Gelas Kecil", "Minuman", 5000, 50, "Kopi hitam robusta pekat diseduh dalam gelas kecil.", "", true));
        list.add(new Product("d14", "Kopi Gelas Besar", "Minuman", 8000, 50, "Kopi hitam robusta pekat diseduh mantap dalam gelas ukuran besar.", "", true));
        list.add(new Product("d15", "Kopi Susu Gelas Kecil", "Minuman", 7000, 50, "Kopi robusta dicampur kental manis dalam gelas porsi kecil.", "", true));
        list.add(new Product("d16", "Kopi Susu Gelas Besar", "Minuman", 10000, 50, "Kopi robusta pekat campur susu legit kental dalam gelas besar.", "", true));
        list.add(new Product("d17", "Aqua Botol", "Minuman", 5000, 50, "Air mineral Aqua kemasan botol segar.", "", true));
        list.add(new Product("d18", "Es Batu", "Minuman", 2000, 50, "Es batu murni tambahan.", "", true));

        // --- GORENGAN & SNACK ---
        list.add(new Product("s1", "Perkedel Ikan Putih", "Gorengan & Snack", 3000, 50, "Perkedel berbahan dasar olahan ikan putih khas Sulawesi yang lembut.", "", true));
        list.add(new Product("s2", "Perkedel Nike", "Gorengan & Snack", 3000, 50, "Gorengan kering perkedel ikan nike musiman asli dari Danau Tondano.", "", true));
        list.add(new Product("s3", "Perkedel Milu", "Gorengan & Snack", 2000, 50, "Perkedel jagung (milu) khas Manado bertekstur super garing krispi.", "", true));
        list.add(new Product("s4", "Tahu Goreng/Rebus", "Gorengan & Snack", 2000, 50, "Tahu goreng renyah atau tahu rebus lembut, disajikan hangat.", "", true));
        list.add(new Product("s5", "Tahu Garing/Porsi", "Gorengan & Snack", 10000, 50, "Seporsi tahu garing renyah dipotong dadu dilengkapi cocolan rica.", "", true));
        list.add(new Product("s6", "Milu Rebus", "Gorengan & Snack", 7000, 50, "Jagung manis (milu) segar direbus empuk, disantap hangat.", "", true));
        list.add(new Product("s7", "Pisang Goreng/Porsi", "Gorengan & Snack", 10000, 50, "Satu porsi isi pisang goreng renyah disajikan berteman sambal roa asli.", "", true));
        list.add(new Product("s8", "Gohu", "Gorengan & Snack", 10000, 50, "Rujak pepaya asam manis khas Sulawesi Utara dengan kuah jahe cuka pedas.", "", true));
        return list;
    }

    private void fetchProducts() {
        if (binding == null) return;
        
        // Load instantly from SQLite database
        final DbHelper dbHelper = DbHelper.getInstance(getContext());
        allProductsList.clear();
        allProductsList.addAll(dbHelper.getAllProducts());
        filterProducts();
        
        binding.progressBar.setVisibility(View.VISIBLE);
        ApiClient.getApiService().getProducts().enqueue(new Callback<List<Product>>() {
            @Override
            public void onResponse(@NonNull Call<List<Product>> call, @NonNull Response<List<Product>> response) {
                if (isAdded() && binding != null) {
                    binding.progressBar.setVisibility(View.GONE);
                    if (response.isSuccessful() && response.body() != null) {
                        // Sync with local SQLite db
                        dbHelper.saveProducts(response.body());
                        allProductsList.clear();
                        allProductsList.addAll(dbHelper.getAllProducts());
                        filterProducts();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Product>> call, @NonNull Throwable t) {
                if (isAdded() && binding != null) {
                    binding.progressBar.setVisibility(View.GONE);
                    // Failure is fine as we already loaded local products from SQLite!
                }
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
