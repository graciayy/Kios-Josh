package com.kiosjosh.app.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import com.kiosjosh.app.model.Order;
import com.kiosjosh.app.model.OrderItem;
import com.kiosjosh.app.model.Product;
import com.kiosjosh.app.model.User;
import java.util.ArrayList;
import java.util.List;

public class DbHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "kiosjosh.db";
    private static final int DATABASE_VERSION = 2;

    private static DbHelper instance;

    // --- TABLE PRODUCTS ---
    public static final String TABLE_PRODUCTS = "products";
    public static final String COLUMN_PROD_ID = "id";
    public static final String COLUMN_PROD_NAME = "name";
    public static final String COLUMN_PROD_CATEGORY = "category";
    public static final String COLUMN_PROD_PRICE = "price";
    public static final String COLUMN_PROD_STOCK = "stock";
    public static final String COLUMN_PROD_DESC = "description";
    public static final String COLUMN_PROD_IMAGE = "imageUrl";
    public static final String COLUMN_PROD_AVAILABLE = "isAvailable";

    // --- TABLE ORDERS ---
    public static final String TABLE_ORDERS = "orders";
    public static final String COLUMN_ORDER_ID = "id";
    public static final String COLUMN_ORDER_CUSTOMER_NAME = "customerName";
    public static final String COLUMN_ORDER_CUSTOMER_PHONE = "customerPhone";
    public static final String COLUMN_ORDER_TOTAL = "total";
    public static final String COLUMN_ORDER_PAYMENT_METHOD = "paymentMethod";
    public static final String COLUMN_ORDER_STATUS = "status";
    public static final String COLUMN_ORDER_PICKUP_DELIVERY = "pickupOrDelivery";
    public static final String COLUMN_ORDER_ADDRESS = "deliveryAddress";
    public static final String COLUMN_ORDER_FEE = "deliveryFee";
    public static final String COLUMN_ORDER_CREATED_AT = "createdAt";

    // --- TABLE ORDER ITEMS ---
    public static final String TABLE_ORDER_ITEMS = "order_items";
    public static final String COLUMN_ITEM_ID = "item_id"; // Auto increment local row id
    public static final String COLUMN_ITEM_ORDER_ID = "orderId";
    public static final String COLUMN_ITEM_PRODUCT_ID = "productId";
    public static final String COLUMN_ITEM_NAME = "name";
    public static final String COLUMN_ITEM_PRICE = "price";
    public static final String COLUMN_ITEM_QUANTITY = "quantity";
    public static final String COLUMN_ITEM_NOTES = "notes";

    // --- TABLE USER PROFILE ---
    public static final String TABLE_PROFILE = "user_profile";
    public static final String COLUMN_PROF_ID = "local_id"; // Always 1
    public static final String COLUMN_PROF_NAME = "name";
    public static final String COLUMN_PROF_EMAIL = "email";
    public static final String COLUMN_PROF_PHONE = "phone";
    public static final String COLUMN_PROF_ADDRESS = "address";

    public static synchronized DbHelper getInstance(Context context) {
        if (instance == null) {
            instance = new DbHelper(context.getApplicationContext());
        }
        return instance;
    }

    private DbHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // Create Products Table
        String createProductsTable = "CREATE TABLE " + TABLE_PRODUCTS + " (" +
                COLUMN_PROD_ID + " TEXT PRIMARY KEY, " +
                COLUMN_PROD_NAME + " TEXT, " +
                COLUMN_PROD_CATEGORY + " TEXT, " +
                COLUMN_PROD_PRICE + " REAL, " +
                COLUMN_PROD_STOCK + " INTEGER, " +
                COLUMN_PROD_DESC + " TEXT, " +
                COLUMN_PROD_IMAGE + " TEXT, " +
                COLUMN_PROD_AVAILABLE + " INTEGER)";
        db.execSQL(createProductsTable);

        // Create Orders Table
        String createOrdersTable = "CREATE TABLE " + TABLE_ORDERS + " (" +
                COLUMN_ORDER_ID + " TEXT PRIMARY KEY, " +
                COLUMN_ORDER_CUSTOMER_NAME + " TEXT, " +
                COLUMN_ORDER_CUSTOMER_PHONE + " TEXT, " +
                COLUMN_ORDER_TOTAL + " REAL, " +
                COLUMN_ORDER_PAYMENT_METHOD + " TEXT, " +
                COLUMN_ORDER_STATUS + " TEXT, " +
                COLUMN_ORDER_PICKUP_DELIVERY + " TEXT, " +
                COLUMN_ORDER_ADDRESS + " TEXT, " +
                COLUMN_ORDER_FEE + " REAL, " +
                COLUMN_ORDER_CREATED_AT + " TEXT)";
        db.execSQL(createOrdersTable);

        // Create Order Items Table
        String createOrderItemsTable = "CREATE TABLE " + TABLE_ORDER_ITEMS + " (" +
                COLUMN_ITEM_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COLUMN_ITEM_ORDER_ID + " TEXT, " +
                COLUMN_ITEM_PRODUCT_ID + " TEXT, " +
                COLUMN_ITEM_NAME + " TEXT, " +
                COLUMN_ITEM_PRICE + " REAL, " +
                COLUMN_ITEM_QUANTITY + " INTEGER, " +
                COLUMN_ITEM_NOTES + " TEXT)";
        db.execSQL(createOrderItemsTable);

        // Create User Profile Table
        String createProfileTable = "CREATE TABLE " + TABLE_PROFILE + " (" +
                COLUMN_PROF_ID + " INTEGER PRIMARY KEY, " +
                COLUMN_PROF_NAME + " TEXT, " +
                COLUMN_PROF_EMAIL + " TEXT, " +
                COLUMN_PROF_PHONE + " TEXT, " +
                COLUMN_PROF_ADDRESS + " TEXT)";
        db.execSQL(createProfileTable);

        // Pre-populate Products
        prePopulateProducts(db);

        // Pre-populate default profile
        ContentValues profVals = new ContentValues();
        profVals.put(COLUMN_PROF_ID, 1);
        profVals.put(COLUMN_PROF_NAME, "Gracia Ester Tendean");
        profVals.put(COLUMN_PROF_EMAIL, "gracia@polimando.ac.id");
        profVals.put(COLUMN_PROF_PHONE, "08234146147");
        profVals.put(COLUMN_PROF_ADDRESS, "Jl. Raya Politeknik No. 45, Buha, Mapanget, Manado");
        db.insert(TABLE_PROFILE, null, profVals);
    }

    private void prePopulateProducts(SQLiteDatabase db) {
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
        list.add(new Product("d9", "Jus Buah Naga", "Minuman", 15000, 50, "Jus buah naga merah segar tinggi serat dan antioksidan alami.", "", true));
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

        for (Product p : list) {
            ContentValues values = new ContentValues();
            values.put(COLUMN_PROD_ID, p.getId());
            values.put(COLUMN_PROD_NAME, p.getName());
            values.put(COLUMN_PROD_CATEGORY, p.getCategory());
            values.put(COLUMN_PROD_PRICE, p.getPrice());
            values.put(COLUMN_PROD_STOCK, p.getStock());
            values.put(COLUMN_PROD_DESC, p.getDescription());
            values.put(COLUMN_PROD_IMAGE, p.getImageUrl());
            values.put(COLUMN_PROD_AVAILABLE, p.isAvailable() ? 1 : 0);
            db.insert(TABLE_PRODUCTS, null, values);
        }
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_PRODUCTS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_ORDERS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_ORDER_ITEMS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_PROFILE);
        onCreate(db);
    }

    // --- PRODUCTS OPERATIONS ---

    public void saveProducts(List<Product> products) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.beginTransaction();
        try {
            for (Product p : products) {
                ContentValues values = new ContentValues();
                values.put(COLUMN_PROD_ID, p.getId());
                values.put(COLUMN_PROD_NAME, p.getName());
                values.put(COLUMN_PROD_CATEGORY, p.getCategory());
                values.put(COLUMN_PROD_PRICE, p.getPrice());
                values.put(COLUMN_PROD_STOCK, p.getStock());
                values.put(COLUMN_PROD_DESC, p.getDescription());
                values.put(COLUMN_PROD_IMAGE, p.getImageUrl());
                values.put(COLUMN_PROD_AVAILABLE, p.isAvailable() ? 1 : 0);

                int updated = db.update(TABLE_PRODUCTS, values, COLUMN_PROD_ID + "=?", new String[]{p.getId()});
                if (updated == 0) {
                    db.insert(TABLE_PRODUCTS, null, values);
                }
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
    }

    public List<Product> getAllProducts() {
        List<Product> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_PRODUCTS, null);
        if (cursor.moveToFirst()) {
            do {
                Product p = new Product();
                p.setId(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROD_ID)));
                p.setName(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROD_NAME)));
                p.setCategory(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROD_CATEGORY)));
                p.setPrice(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_PROD_PRICE)));
                p.setStock(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_PROD_STOCK)));
                p.setDescription(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROD_DESC)));
                p.setImageUrl(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROD_IMAGE)));
                p.setAvailable(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_PROD_AVAILABLE)) == 1);
                list.add(p);
            } while (cursor.moveToNext());
        }
        cursor.close();
        return list;
    }

    public void addProduct(Product p) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_PROD_ID, p.getId());
        values.put(COLUMN_PROD_NAME, p.getName());
        values.put(COLUMN_PROD_CATEGORY, p.getCategory());
        values.put(COLUMN_PROD_PRICE, p.getPrice());
        values.put(COLUMN_PROD_STOCK, p.getStock());
        values.put(COLUMN_PROD_DESC, p.getDescription());
        values.put(COLUMN_PROD_IMAGE, p.getImageUrl());
        values.put(COLUMN_PROD_AVAILABLE, p.isAvailable() ? 1 : 0);
        db.insertWithOnConflict(TABLE_PRODUCTS, null, values, SQLiteDatabase.CONFLICT_REPLACE);
    }

    public void updateProduct(Product p) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_PROD_NAME, p.getName());
        values.put(COLUMN_PROD_CATEGORY, p.getCategory());
        values.put(COLUMN_PROD_PRICE, p.getPrice());
        values.put(COLUMN_PROD_STOCK, p.getStock());
        values.put(COLUMN_PROD_DESC, p.getDescription());
        values.put(COLUMN_PROD_IMAGE, p.getImageUrl());
        values.put(COLUMN_PROD_AVAILABLE, p.isAvailable() ? 1 : 0);
        db.update(TABLE_PRODUCTS, values, COLUMN_PROD_ID + "=?", new String[]{p.getId()});
    }

    public void deleteProduct(String id) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_PRODUCTS, COLUMN_PROD_ID + "=?", new String[]{id});
    }

    // --- ORDERS OPERATIONS ---

    public void saveOrders(List<Order> orders) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.beginTransaction();
        try {
            for (Order o : orders) {
                ContentValues values = new ContentValues();
                values.put(COLUMN_ORDER_ID, o.getId());
                values.put(COLUMN_ORDER_CUSTOMER_NAME, o.getCustomerName());
                values.put(COLUMN_ORDER_CUSTOMER_PHONE, o.getCustomerPhone());
                values.put(COLUMN_ORDER_TOTAL, o.getTotal());
                values.put(COLUMN_ORDER_PAYMENT_METHOD, o.getPaymentMethod());
                values.put(COLUMN_ORDER_STATUS, o.getStatus());
                values.put(COLUMN_ORDER_PICKUP_DELIVERY, o.getPickupOrDelivery());
                values.put(COLUMN_ORDER_ADDRESS, o.getDeliveryAddress());
                values.put(COLUMN_ORDER_FEE, o.getDeliveryFee());
                values.put(COLUMN_ORDER_CREATED_AT, o.getCreatedAt());

                int updated = db.update(TABLE_ORDERS, values, COLUMN_ORDER_ID + "=?", new String[]{o.getId()});
                if (updated == 0) {
                    db.insert(TABLE_ORDERS, null, values);
                }

                // Delete old items and re-insert
                db.delete(TABLE_ORDER_ITEMS, COLUMN_ITEM_ORDER_ID + "=?", new String[]{o.getId()});
                if (o.getItems() != null) {
                    for (OrderItem item : o.getItems()) {
                        ContentValues iv = new ContentValues();
                        iv.put(COLUMN_ITEM_ORDER_ID, o.getId());
                        iv.put(COLUMN_ITEM_PRODUCT_ID, item.getProductId());
                        iv.put(COLUMN_ITEM_NAME, item.getName());
                        iv.put(COLUMN_ITEM_PRICE, item.getPrice());
                        iv.put(COLUMN_ITEM_QUANTITY, item.getQuantity());
                        iv.put(COLUMN_ITEM_NOTES, item.getNotes());
                        db.insert(TABLE_ORDER_ITEMS, null, iv);
                    }
                }
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
    }

    public List<Order> getAllOrders() {
        List<Order> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_ORDERS + " ORDER BY " + COLUMN_ORDER_CREATED_AT + " DESC", null);
        if (cursor.moveToFirst()) {
            do {
                Order o = new Order();
                String orderId = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ORDER_ID));
                o.setId(orderId);
                o.setCustomerName(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ORDER_CUSTOMER_NAME)));
                o.setCustomerPhone(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ORDER_CUSTOMER_PHONE)));
                o.setTotal(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_ORDER_TOTAL)));
                o.setPaymentMethod(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ORDER_PAYMENT_METHOD)));
                o.setStatus(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ORDER_STATUS)));
                o.setPickupOrDelivery(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ORDER_PICKUP_DELIVERY)));
                o.setDeliveryAddress(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ORDER_ADDRESS)));
                o.setDeliveryFee(cursor.getDouble(cursor.getColumnIndexOrThrow(COLUMN_ORDER_FEE)));
                o.setCreatedAt(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ORDER_CREATED_AT)));

                // Load OrderItems
                List<OrderItem> items = new ArrayList<>();
                Cursor cItems = db.rawQuery("SELECT * FROM " + TABLE_ORDER_ITEMS + " WHERE " + COLUMN_ITEM_ORDER_ID + "=?", new String[]{orderId});
                if (cItems.moveToFirst()) {
                    do {
                        OrderItem item = new OrderItem();
                        item.setProductId(cItems.getString(cItems.getColumnIndexOrThrow(COLUMN_ITEM_PRODUCT_ID)));
                        item.setName(cItems.getString(cItems.getColumnIndexOrThrow(COLUMN_ITEM_NAME)));
                        item.setPrice(cItems.getDouble(cItems.getColumnIndexOrThrow(COLUMN_ITEM_PRICE)));
                        item.setQuantity(cItems.getInt(cItems.getColumnIndexOrThrow(COLUMN_ITEM_QUANTITY)));
                        item.setNotes(cItems.getString(cItems.getColumnIndexOrThrow(COLUMN_ITEM_NOTES)));
                        items.add(item);
                    } while (cItems.moveToNext());
                }
                cItems.close();
                o.setItems(items);

                list.add(o);
            } while (cursor.moveToNext());
        }
        cursor.close();
        return list;
    }

    public void createOrder(Order o) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.beginTransaction();
        try {
            ContentValues values = new ContentValues();
            values.put(COLUMN_ORDER_ID, o.getId());
            values.put(COLUMN_ORDER_CUSTOMER_NAME, o.getCustomerName());
            values.put(COLUMN_ORDER_CUSTOMER_PHONE, o.getCustomerPhone());
            values.put(COLUMN_ORDER_TOTAL, o.getTotal());
            values.put(COLUMN_ORDER_PAYMENT_METHOD, o.getPaymentMethod());
            values.put(COLUMN_ORDER_STATUS, o.getStatus());
            values.put(COLUMN_ORDER_PICKUP_DELIVERY, o.getPickupOrDelivery());
            values.put(COLUMN_ORDER_ADDRESS, o.getDeliveryAddress());
            values.put(COLUMN_ORDER_FEE, o.getDeliveryFee());
            values.put(COLUMN_ORDER_CREATED_AT, o.getCreatedAt());
            db.insert(TABLE_ORDERS, null, values);

            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    ContentValues iv = new ContentValues();
                    iv.put(COLUMN_ITEM_ORDER_ID, o.getId());
                    iv.put(COLUMN_ITEM_PRODUCT_ID, item.getProductId());
                    iv.put(COLUMN_ITEM_NAME, item.getName());
                    iv.put(COLUMN_ITEM_PRICE, item.getPrice());
                    iv.put(COLUMN_ITEM_QUANTITY, item.getQuantity());
                    iv.put(COLUMN_ITEM_NOTES, item.getNotes());
                    db.insert(TABLE_ORDER_ITEMS, null, iv);

                    // Update local resource product stock
                    String prodId = item.getProductId();
                    db.execSQL("UPDATE " + TABLE_PRODUCTS + " SET " + COLUMN_PROD_STOCK + " = MAX(0, " + COLUMN_PROD_STOCK + " - " + item.getQuantity() + ") WHERE " + COLUMN_PROD_ID + " = ?", new String[]{prodId});
                }
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
        }
    }

    public void updateOrderStatus(String orderId, String status) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_ORDER_STATUS, status);
        db.update(TABLE_ORDERS, values, COLUMN_ORDER_ID + "=?", new String[]{orderId});
    }

    // --- USER PROFILE OPERATIONS ---

    public User getProfile() {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_PROFILE + " WHERE " + COLUMN_PROF_ID + " = 1", null);
        User user = null;
        if (cursor.moveToFirst()) {
            user = new User();
            user.setName(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROF_NAME)));
            user.setEmail(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROF_EMAIL)));
            user.setPhone(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROF_PHONE)));
            user.setAddress(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROF_ADDRESS)));
        }
        cursor.close();
        if (user == null) {
            user = new User("Gracia Ester Tendean", "gracia@polimando.ac.id", "08234146147", "Jl. Raya Politeknik No. 45, Buha, Mapanget, Manado");
        }
        return user;
    }

    public void saveProfile(User user) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_PROF_NAME, user.getName());
        values.put(COLUMN_PROF_EMAIL, user.getEmail());
        values.put(COLUMN_PROF_PHONE, user.getPhone());
        values.put(COLUMN_PROF_ADDRESS, user.getAddress());

        int count = db.update(TABLE_PROFILE, values, COLUMN_PROF_ID + " = 1", null);
        if (count == 0) {
            values.put(COLUMN_PROF_ID, 1);
            db.insert(TABLE_PROFILE, null, values);
        }
    }
}
