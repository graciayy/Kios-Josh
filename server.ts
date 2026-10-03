import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, Order, UserProfile, Ingredient } from "./src/types";

// Setup storage path
const DATA_FILE = path.join(process.cwd(), "data-store.json");

// Define pre-populated products
const INITIAL_PRODUCTS: Product[] = [
  // --- MAKANAN ---
  {
    id: "m1",
    name: "Tinutuan",
    category: "Makanan",
    price: 10000,
    stock: 50,
    description: "Bubur Manado otentik gurih hangat cocok dicanangkan dengan dabu-dabu iris atau sambal roa.",
    imageUrl: "tinutuan.jpg",
    isAvailable: true
  },
  {
    id: "m2",
    name: "Tinutuan Brenebon Ceker",
    category: "Makanan",
    price: 15000,
    stock: 50,
    description: "Tinutuan lezat dengan tambahan sup kacang merah (brenebon) dan ceker ayam empuk.",
    imageUrl: "tinutuan_brenebon_ceker.jpg",
    isAvailable: true
  },
  {
    id: "m3",
    name: "Midal (Tinu Campur Mi)",
    category: "Makanan",
    price: 10000,
    stock: 50,
    description: "Kombinasi bubur Manado Tinutuan dicampur mie kuning lezat khas Sulawesi Utara.",
    imageUrl: "midal.jpg",
    isAvailable: true
  },
  {
    id: "m4",
    name: "Midal Brenebon Ceker",
    category: "Makanan",
    price: 15000,
    stock: 50,
    description: "Midal istimewa disajikan dengan kuah sup brenebon kacang merah dan ceker empuk.",
    imageUrl: "midal_brenebon_ceker.jpg",
    isAvailable: true
  },
  {
    id: "m5",
    name: "Mie Cakalang",
    category: "Makanan",
    price: 13000,
    stock: 50,
    description: "Mie kuah khas dengan suwiran cakalang asap harum khas Bumi Nyiur Melambai.",
    imageUrl: "mie_cakalang.jpg",
    isAvailable: true
  },
  {
    id: "m6",
    name: "Mi Cakalang Brenebon Ceker",
    category: "Makanan",
    price: 18000,
    stock: 50,
    description: "Mie cakalang spesial dengan topping brenebon kacang merah dan ceker ayam empuk.",
    imageUrl: "mie_cakalang_brenebon_ceker.jpg",
    isAvailable: true
  },
  {
    id: "m7",
    name: "Nasi Kuning",
    category: "Makanan",
    price: 10000,
    stock: 50,
    description: "Nasi kuning wangi khas Manado dibungkus rapi dengan daun woka aromatik.",
    imageUrl: "nasi_kuning.jpg",
    isAvailable: true
  },
  {
    id: "m8",
    name: "Nasi Kuning + Telur",
    category: "Makanan",
    price: 13000,
    stock: 50,
    description: "Nasi kuning Manado daun woka lengkap dengan tambahan telur rebus atau telur dadar.",
    imageUrl: "nasi_kuning_telur.jpg",
    isAvailable: true
  },
  {
    id: "m9",
    name: "Nasi Ayam Lalapan",
    category: "Makanan",
    price: 25000,
    stock: 50,
    description: "Nasi hangat pulen dengan ayam goreng gurih, lalapan segar melimpah, dan dabu dabu rica meresap.",
    imageUrl: "nasi_ayam_lalapan.jpg",
    isAvailable: true
  },
  {
    id: "m10",
    name: "Nasi Ayam Geprek",
    category: "Makanan",
    price: 15000,
    stock: 50,
    description: "Nasi hangat dengan ayam goreng renyah digeprek sambal pedas mematikan.",
    imageUrl: "nasi_ayam_geprek.jpg",
    isAvailable: true
  },
  {
    id: "m11",
    name: "Nasi Putih",
    category: "Makanan",
    price: 5000,
    stock: 50,
    description: "Seporsi nasi putih hangat yang pulen.",
    imageUrl: "nasi_putih.jpg",
    isAvailable: true
  },
  {
    id: "m12",
    name: "Brenebon Ceker",
    category: "Makanan",
    price: 8000,
    stock: 50,
    description: "Kuah sup kacang merah hangat penuh kaldu gurih dengan tekstur ceker ayam empuk.",
    imageUrl: "brenebon_ceker.jpg",
    isAvailable: true
  },
  {
    id: "m13",
    name: "Telur Dadar",
    category: "Makanan",
    price: 5000,
    stock: 50,
    description: "Telur dadar goreng kering gurih nan renyah cocok untuk lauk tambahan.",
    imageUrl: "telur_dadar.jpg",
    isAvailable: true
  },
  {
    id: "m14",
    name: "Telur Mata Sapi",
    category: "Makanan",
    price: 5000,
    stock: 50,
    description: "Telur mata sapi lezat digoreng segar.",
    imageUrl: "telur_mata_sapi.jpg",
    isAvailable: true
  },
  {
    id: "m15",
    name: "Telur Rebus",
    category: "Makanan",
    price: 4000,
    stock: 50,
    description: "Sebutir telur ayam rebus bergizi tinggi.",
    imageUrl: "telur_rebus.jpg",
    isAvailable: true
  },

  // --- MINUMAN ---
  {
    id: "d1",
    name: "Es Campur",
    category: "Minuman",
    price: 15000,
    stock: 50,
    description: "Es campur segar melimpah dengan aneka isian buah sirup pandan susu manis.",
    imageUrl: "es_campur.jpg",
    isAvailable: true
  },
  {
    id: "d2",
    name: "Es Brenebon Susu",
    category: "Minuman",
    price: 13000,
    stock: 50,
    description: "Es serut kacang merah (brenebon) manis wangi dengan lumuran susu kental manis.",
    imageUrl: "es_brenebon_susu.jpg",
    isAvailable: true
  },
  {
    id: "d3",
    name: "Es Brenebon Alpukat",
    category: "Minuman",
    price: 15000,
    stock: 50,
    description: "Es kacang merah legendaris dikombinasikan dengan potongan buah alpukat segar.",
    imageUrl: "es_brenebon_alpukat.jpg",
    isAvailable: true
  },
  {
    id: "d4",
    name: "Es Brenebon Kacang",
    category: "Minuman",
    price: 15000,
    stock: 50,
    description: "Es serut legendaris kacang merah dengan ekstra serutan kacang renyah.",
    imageUrl: "es_brenebon_kacang.jpg",
    isAvailable: true
  },
  {
    id: "d5",
    name: "Es Kacang",
    category: "Minuman",
    price: 13000,
    stock: 50,
    description: "Es serut kacang merah manis lembut dengan sirup coklat/frambozen khas Sulawesi.",
    imageUrl: "es_kacang.jpg",
    isAvailable: true
  },
  {
    id: "d6",
    name: "Es Kacang Alpukat",
    category: "Minuman",
    price: 15000,
    stock: 50,
    description: "Es kacang legendaris disajikan dengan alpukat mentega legit melimpah.",
    imageUrl: "es_kacang_alpukat.jpg",
    isAvailable: true
  },
  {
    id: "d7",
    name: "Jus Alpukat",
    category: "Minuman",
    price: 15000,
    stock: 50,
    description: "Jus alpukat segar murni kental dengan balutan susu kental manis cokelat.",
    imageUrl: "jus_alpukat.jpg",
    isAvailable: true
  },
  {
    id: "d8",
    name: "Jus Sirsak",
    category: "Minuman",
    price: 15000,
    stock: 50,
    description: "Jus buah sirsak murni asam manis segar dingin menyegarkan.",
    imageUrl: "jus_sirsak.jpg",
    isAvailable: true
  },
  {
    id: "d9",
    name: "Jus Buah Naga",
    category: "Minuman",
    price: 15000,
    stock: 50,
    description: "Jus buah naga merah segar tinggi serat dan antioksidan alami.",
    imageUrl: "jus_buah_naga.jpg",
    isAvailable: true
  },
  {
    id: "d10",
    name: "Nutrisari",
    category: "Minuman",
    price: 5000,
    stock: 50,
    description: "Es jeruk Nutrisari segar penambah energi berlimpah vitamin C.",
    imageUrl: "nutrisari.jpg",
    isAvailable: true
  },
  {
    id: "d11",
    name: "Es Teh",
    category: "Minuman",
    price: 5000,
    stock: 50,
    description: "Segelas es teh manis segar dingin pelepas dahaga nomor satu.",
    imageUrl: "es_teh.jpg",
    isAvailable: true
  },
  {
    id: "d12",
    name: "Teh Panas",
    category: "Minuman",
    price: 5000,
    stock: 50,
    description: "Teh manis hangat dengan aroma harum melati penenang.",
    imageUrl: "teh_panas.jpg",
    isAvailable: true
  },
  {
    id: "d13",
    name: "Kopi Gelas Kecil",
    category: "Minuman",
    price: 5000,
    stock: 50,
    description: "Kopi hitam robusta pekat diseduh dalam gelas kecil tradisi.",
    imageUrl: "kopi_gelas_kecil.jpg",
    isAvailable: true
  },
  {
    id: "d14",
    name: "Kopi Gelas Besar",
    category: "Minuman",
    price: 8000,
    stock: 50,
    description: "Kopi hitam robusta pekat diseduh mantap dalam gelas ukuran besar.",
    imageUrl: "kopi_gelas_besar.jpg",
    isAvailable: true
  },
  {
    id: "d15",
    name: "Kopi Susu Gelas Kecil",
    category: "Minuman",
    price: 7000,
    stock: 50,
    description: "Kopi robusta dicampur kental manis dalam gelas porsi kecil.",
    imageUrl: "kopi_susu_gelas_kecil.jpg",
    isAvailable: true
  },
  {
    id: "d16",
    name: "Kopi Susu Gelas Besar",
    category: "Minuman",
    price: 10000,
    stock: 50,
    description: "Kopi robusta pekat campur susu legit kental dalam gelas besar mantap.",
    imageUrl: "kopi_susu_gelas_besar.jpg",
    isAvailable: true
  },
  {
    id: "d17",
    name: "Aqua Botol",
    category: "Minuman",
    price: 5000,
    stock: 50,
    description: "Air mineral Aqua kemasan botol segar higienis.",
    imageUrl: "aqua_botol.jpg",
    isAvailable: true
  },
  {
    id: "d18",
    name: "Es Batu",
    category: "Minuman",
    price: 2000,
    stock: 50,
    description: "Es batu murni tambahan untuk kesegaran ekstra.",
    imageUrl: "es_batu.jpg",
    isAvailable: true
  },

  // --- GORENGAN & SNACK ---
  {
    id: "s1",
    name: "Perkedel Ikan Putih",
    category: "Gorengan & Snack",
    price: 3000,
    stock: 50,
    description: "Perkedel berbahan dasar olahan ikan putih khas Sulawesi yang lembut.",
    imageUrl: "perkedel_ikan_putih.jpg",
    isAvailable: true
  },
  {
    id: "s2",
    name: "Perkedel Nike",
    category: "Gorengan & Snack",
    price: 3000,
    stock: 50,
    description: "Gorengan kering perkedel ikan nike musiman asli dari Danau Tondano.",
    imageUrl: "perkedel_nike.jpg",
    isAvailable: true
  },
  {
    id: "s3",
    name: "Perkedel Milu",
    category: "Gorengan & Snack",
    price: 2000,
    stock: 50,
    description: "Perkedel jagung (milu) khas Manado bertekstur super garing krispi.",
    imageUrl: "perkedel_milu.jpg",
    isAvailable: true
  },
  {
    id: "s4",
    name: "Tahu Goreng/Rebus",
    category: "Gorengan & Snack",
    price: 2000,
    stock: 50,
    description: "Tahu goreng renyah atau tahu rebus lembut, disajikan hangat.",
    imageUrl: "tahu_goreng_rebus.jpg",
    isAvailable: true
  },
  {
    id: "s5",
    name: "Tahu Garing/Porsi",
    category: "Gorengan & Snack",
    price: 10000,
    stock: 50,
    description: "Seporsi tahu garing renyah dipotong dadu dilengkapi cocolan rica.",
    imageUrl: "tahu_garing.jpg",
    isAvailable: true
  },
  {
    id: "s6",
    name: "Milu Rebus",
    category: "Gorengan & Snack",
    price: 7000,
    stock: 50,
    description: "Jagung manis (milu) segar direbus empuk, disantap hangat.",
    imageUrl: "milu_rebus.jpg",
    isAvailable: true
  },
  {
    id: "s7",
    name: "Pisang Goreng/Porsi",
    category: "Gorengan & Snack",
    price: 10000,
    stock: 50,
    description: "Satu porsi isi pisang goreng renyah disajikan berteman sambal roa asli.",
    imageUrl: "pisang_goreng.jpg",
    isAvailable: true
  },
  {
    id: "s8",
    name: "Gohu",
    category: "Gorengan & Snack",
    price: 10000,
    stock: 50,
    description: "Rujak pepaya asam manis khas Sulawesi Utara dengan kuah jahe cuka pedas.",
    imageUrl: "gohu.jpg",
    isAvailable: true
  }
];

// Define state interfaces
interface StateStore {
  products: Product[];
  orders: Order[];
  profile: UserProfile;
  ingredients: Ingredient[];
}

let state: StateStore = {
  products: INITIAL_PRODUCTS,
  orders: [
    {
      id: "KJ-20260519-01",
      customerName: "Gracia Ester Tendean",
      customerPhone: "08234666789",
      items: [
        { productId: "m1", name: "Tinutuan (Bubur Manado)", price: 10000, quantity: 2, notes: "Pedas sedang" },
        { productId: "d1", name: "Es Kacang Merah (Brenebon)", price: 15000, quantity: 1 }
      ],
      total: 35000,
      paymentMethod: "qris",
      status: "selesai",
      pickupOrDelivery: "delivery",
      deliveryAddress: "Jl. Raya Politeknik, Buha, Kec. Mapanget, Kota Manado",
      deliveryFee: 10000,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    },
    {
      id: "KJ-20260519-02",
      customerName: "Michael Steve Mamengko",
      customerPhone: "08123456780",
      items: [
        { productId: "m8", name: "Nasi Ayam Lalapan", price: 25000, quantity: 1 },
        { productId: "d7", name: "Jus Alpukat", price: 15000, quantity: 1 }
      ],
      total: 50000,
      paymentMethod: "cash",
      status: "processing",
      pickupOrDelivery: "pickup",
      deliveryAddress: "Ambil di Kios",
      deliveryFee: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      id: "KJ-20260519-03",
      customerName: "Desvita Christi Kilis",
      customerPhone: "08964321234",
      items: [
        { productId: "m6", name: "Nasi Kuning (Bungkus Woka)", price: 10000, quantity: 2 },
        { productId: "s1", name: "Perkedel Milu (Perkedel Jagung)", price: 12000, quantity: 1 }
      ],
      total: 32000,
      paymentMethod: "qris",
      status: "pending",
      pickupOrDelivery: "delivery",
      deliveryAddress: "Kosan Hijau Dekat Politeknik Negeri Manado",
      deliveryFee: 10000,
      createdAt: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    }
  ],
  profile: {
    name: "Joshua M. Pangalila",
    email: "joshua.m@kiosjosh.id",
    phone: "08123456789",
    address: "Jl. Sam Ratulangi No. 45, Wenang, Kota Manado, Sulawesi Utara"
  },
  ingredients: [
    { id: "ing1", name: "Labu Kuning (Tinutuan base)", qty: "12", unit: "kg", status: "Cukup" },
    { id: "ing2", name: "Ubi Manis Merah", qty: "8", unit: "kg", status: "Cukup" },
    { id: "ing3", name: "Daun Woka Bungkus", qty: "45", unit: "Lembar", status: "Hampir Habis" },
    { id: "ing4", name: "Ikan Cakalang Asap (Fufu)", qty: "5", unit: "kg", status: "Cukup" },
    { id: "ing5", name: "Kacang Merah Brenebon", qty: "15", unit: "kg", status: "Cukup" },
    { id: "ing6", name: "Ceker Ayam Bersih", qty: "3", unit: "kg", status: "Kritis" },
    { id: "ing7", name: "Sayur Kangkung Segar", qty: "10", unit: "Ikat", status: "Cukup" }
  ]
};

// Functions to load and save persistence
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.products && parsed.orders && parsed.profile) {
        state = parsed;
        if (!state.ingredients) {
          state.ingredients = [
            { id: "ing1", name: "Labu Kuning (Tinutuan base)", qty: "12", unit: "kg", status: "Cukup" },
            { id: "ing2", name: "Ubi Manis Merah", qty: "8", unit: "kg", status: "Cukup" },
            { id: "ing3", name: "Daun Woka Bungkus", qty: "45", unit: "Lembar", status: "Hampir Habis" },
            { id: "ing4", name: "Ikan Cakalang Asap (Fufu)", qty: "5", unit: "kg", status: "Cukup" },
            { id: "ing5", name: "Kacang Merah Brenebon", qty: "15", unit: "kg", status: "Cukup" },
            { id: "ing6", name: "Ceker Ayam Bersih", qty: "3", unit: "kg", status: "Kritis" },
            { id: "ing7", name: "Sayur Kangkung Segar", qty: "10", unit: "Ikat", status: "Cukup" }
          ];
        }
        console.log("State loaded successfully from persistent storage.");
      }
    } else {
      saveData();
    }
  } catch (err) {
    console.error("Error reading storage file:", err);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing storage file:", err);
  }
}

// Initial load
loadData();

// Clean/delete all product image URLs as requested, to be custom-imported later
if (state && state.products) {
  state.products = state.products.map((p: any) => ({ ...p, imageUrl: "" }));
  saveData();
}

// Start server
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // --- API ROUTES ---

  // Get Products
  app.get("/api/products", (req, res) => {
    res.json(state.products);
  });

  // Create Product
  app.post("/api/products", (req, res) => {
    const { name, category, price, stock, description, imageUrl, isAvailable } = req.body;
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Missing required product fields" });
    }
    const newProduct: Product = {
      id: "prod-" + Date.now(),
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description: description || "",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
      isAvailable: isAvailable !== undefined ? isAvailable : true
    };
    state.products.push(newProduct);
    saveData();
    res.status(201).json(newProduct);
  });

  // Edit Product
  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, category, price, stock, description, imageUrl, isAvailable } = req.body;
    const index = state.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }
    state.products[index] = {
      ...state.products[index],
      name: name !== undefined ? name : state.products[index].name,
      category: category !== undefined ? category : state.products[index].category,
      price: price !== undefined ? Number(price) : state.products[index].price,
      stock: stock !== undefined ? Number(stock) : state.products[index].stock,
      description: description !== undefined ? description : state.products[index].description,
      imageUrl: imageUrl !== undefined ? imageUrl : state.products[index].imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : state.products[index].isAvailable
    };
    saveData();
    res.json(state.products[index]);
  });

  // Delete Product
  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const index = state.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }
    state.products.splice(index, 1);
    saveData();
    res.json({ success: true, message: "Product deleted" });
  });

  // Get Orders
  app.get("/api/orders", (req, res) => {
    res.json(state.orders);
  });

  // Create Order
  app.post("/api/orders", (req, res) => {
    const { customerName, customerPhone, items, total, paymentMethod, pickupOrDelivery, deliveryAddress, deliveryFee } = req.body;
    if (!customerName || !customerPhone || !items || !items.length || !total) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    // Generate accurate order receipt ID
    const today = new Date();
    const dateStr = today.getFullYear() + 
                    String(today.getMonth() + 1).padStart(2, '0') + 
                    String(today.getDate()).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `KJ-${dateStr}-${randomNum}`;

    const newOrder: Order = {
      id: orderId,
      customerName,
      customerPhone,
      items,
      total: Number(total),
      paymentMethod,
      status: "pending",
      pickupOrDelivery: pickupOrDelivery || "pickup",
      deliveryAddress: deliveryAddress || "Ambil di Kios",
      deliveryFee: Number(deliveryFee || 0),
      createdAt: new Date().toISOString()
    };

    // Fast-adjust stock (decrease based on quantities bought)
    items.forEach((item: any) => {
      const prod = state.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    state.orders.push(newOrder);
    saveData();
    res.status(201).json(newOrder);
  });

  // Update Order Status
  app.put("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = state.orders.findIndex(o => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    state.orders[index].status = status;
    saveData();
    res.json(state.orders[index]);
  });

  // Get Profile
  app.get("/api/profile", (req, res) => {
    res.json(state.profile);
  });

  // Save Configured Profile
  app.put("/api/profile", (req, res) => {
    const { name, email, phone, address } = req.body;
    state.profile = { name, email, phone, address };
    saveData();
    res.json(state.profile);
  });

  // Get Ingredients
  app.get("/api/ingredients", (req, res) => {
    res.json(state.ingredients || []);
  });

  // Save/Update Ingredients
  app.put("/api/ingredients", (req, res) => {
    const { ingredients } = req.body;
    if (ingredients && Array.isArray(ingredients)) {
      state.ingredients = ingredients;
      saveData();
      res.json(state.ingredients);
    } else {
      res.status(400).json({ error: "Invalid ingredients list" });
    }
  });

  // Get Reports & Analitika Pendapatan
  app.get("/api/reports", (req, res) => {
    const completedOrders = state.orders.filter(o => o.status === "selesai");
    
    // Total Revenue (Total Pendapatan Bersih & kotor)
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    // Group sales by day
    const revenueMap: { [key: string]: { amount: number; count: number } } = {};
    completedOrders.forEach(order => {
      const date = order.createdAt.split("T")[0]; // YYYY-MM-DD
      if (!revenueMap[date]) {
        revenueMap[date] = { amount: 0, count: 0 };
      }
      revenueMap[date].amount += order.total;
      revenueMap[date].count += 1;
    });

    const dailyRevenue = Object.keys(revenueMap).map(date => ({
      date,
      amount: revenueMap[date].amount,
      count: revenueMap[date].count
    })).sort((a, b) => b.date.localeCompare(a.date));

    // Top Products
    const productSalesMap: { [key: string]: { quantity: number; revenue: number } } = {};
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSalesMap[item.name]) {
          productSalesMap[item.name] = { quantity: 0, revenue: 0 };
        }
        productSalesMap[item.name].quantity += item.quantity;
        productSalesMap[item.name].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.keys(productSalesMap).map(name => ({
      name,
      quantity: productSalesMap[name].quantity,
      revenue: productSalesMap[name].revenue
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    res.json({
      dailyRevenue,
      totalRevenue,
      topProducts
    });
  });

  // Serve Vite in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to port 3000 on 0.0.0.0 (mandatory for Cloud Run ingress)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
