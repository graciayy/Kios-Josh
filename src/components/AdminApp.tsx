import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingBag, Users, Store, Check, Play, X, Edit, 
  Trash2, Plus, RefreshCw, Layers, TrendingUp, UserCheck, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import { Product, Order, OrderStatus, UserProfile, SalesReport } from '../types';

interface AdminAppProps {
  products: Product[];
  onRefreshProducts: () => void;
  onAddProduct: (p: Partial<Product>) => Promise<Product>;
  onEditProduct: (id: string, p: Partial<Product>) => Promise<Product>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  orders: Order[];
  onRefreshOrders: () => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>;
  activeProfile: UserProfile;
  reports: SalesReport;
  onRefreshReports: () => void;
}

export default function AdminApp({
  products,
  onRefreshProducts,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  orders,
  onRefreshOrders,
  onUpdateOrderStatus,
  activeProfile,
  reports,
  onRefreshReports
}: AdminAppProps) {
  // Navigation Screens: 'admin_login' | 'dashboard' | 'orders' | 'products' | 'reports' | 'profile' | 'add_product' | 'edit_product'
  const [screen, setScreen] = useState<string>('admin_login');
  const [adminUsername, setAdminUsername] = useState('admin_josh');
  const [adminPassword, setAdminPassword] = useState('1234');
  const [isOpenShop, setIsOpenShop] = useState(true);

  // Edit / Add product states
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(10000);
  const [prodCategory, setProdCategory] = useState<'Makanan' | 'Minuman' | 'Gorengan & Snack'>('Makanan');
  const [prodStock, setProdStock] = useState(50);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodAvailable, setProdAvailable] = useState(true);

  // Raw Ingredients (Kelola Bahan) - Requested specifically!
  interface IngredientItem {
    id: string;
    name: string;
    qty: string;
    unit: string;
    status: 'Cukup' | 'Hampir Habis' | 'Kritis';
  }

  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('kg');
  
  // Custom interactive search / filter / editing states for manage raw ingredients
  const [ingQuery, setIngQuery] = useState('');
  const [ingFilter, setIngFilter] = useState<'Semua' | 'Cukup' | 'Hampir Habis' | 'Kritis'>('Semua');
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [editIngQty, setEditIngQty] = useState('');
  const [editIngStatus, setEditIngStatus] = useState<'Cukup' | 'Hampir Habis' | 'Kritis'>('Cukup');

  const onRefreshIngredients = async () => {
    try {
      const res = await fetch('/api/ingredients');
      if (res.ok) {
        const data = await res.json();
        setIngredients(data);
      }
    } catch (e) {
      console.error("Failed to fetch ingredients:", e);
    }
  };

  const saveIngredientsToServer = async (updatedList: IngredientItem[]) => {
    try {
      const res = await fetch('/api/ingredients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: updatedList })
      });
      if (res.ok) {
        const data = await res.json();
        setIngredients(data);
      }
    } catch (e) {
      console.error("Failed to save ingredients:", e);
    }
  };

  useEffect(() => {
    onRefreshIngredients();
  }, []);

  // --- KELOLA USER & LOYALITAS STATES ---
  const [userQuery, setUserQuery] = useState('');
  const [selectedUserPhone, setSelectedUserPhone] = useState<string | null>(null);
  
  // Custom bonus points awarded by admin
  const [bonusPoints, setBonusPoints] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('kios_josh_admin_bonus_points');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom loyalty notes/status
  const [userNotes, setUserNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('kios_josh_admin_user_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('kios_josh_admin_bonus_points', JSON.stringify(bonusPoints));
  }, [bonusPoints]);

  useEffect(() => {
    localStorage.setItem('kios_josh_admin_user_notes', JSON.stringify(userNotes));
  }, [userNotes]);

  // --- PERSISTENT NEW ORDER DETECTION & RESTAURANT DOUBLE-CHIME (Request 3) ---
  const [knownOrderIds, setKnownOrderIds] = useState<string[]>([]);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);

  const playIncomingOrderSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // First Note (D5) - bright and clear bell chime
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
      gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.35);

      // Second Note (A5) - slightly higher pitch for standard restaurant ding-dong
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime); 
        gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.45);
      }, 150);
    } catch (e) {
      console.warn("AudioContext failed: user interaction may be required to play sound", e);
    }
  };

  // Real-time watcher trigger for new pending orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      if (knownOrderIds.length === 0) {
        setKnownOrderIds(orders.map(o => o.id));
      } else {
        const currentIds = orders.map(o => o.id);
        const newOrders = orders.filter(o => !knownOrderIds.includes(o.id));
        if (newOrders.length > 0) {
          const pendingNew = newOrders.find(o => o.status === 'pending');
          if (pendingNew && isOpenShop) {
            setNewOrderAlert(pendingNew);
            playIncomingOrderSound();
          }
          setKnownOrderIds(currentIds);
        }
      }
    }
  }, [orders, isOpenShop]);

  // Compile unique users from orders + predefined base members
  const getAggregatedUsers = () => {
    const baseMembers = [
      { name: "Gracia Ester Tendean", phone: "08234146147", email: "gracia@polimando.ac.id", initialOrders: 4, initialSpent: 85000 },
      { name: "Michael Steve Mamengko", phone: "08123456780", email: "michael@polimando.ac.id", initialOrders: 2, initialSpent: 42000 },
      { name: "Desvita Christi Kilis", phone: "08964321234", email: "desvita@polimando.ac.id", initialOrders: 3, initialSpent: 54000 },
      { name: "Joshua M. Pangalila", phone: "08123456789", email: "joshua.m@kiosjosh.id", initialOrders: 5, initialSpent: 110000 },
      { name: "Audrey Christania", phone: "08112233445", email: "audrey@polimando.ac.id", initialOrders: 6, initialSpent: 125000 },
      { name: "Kezia Olivia", phone: "08223344556", email: "kezia@polimando.ac.id", initialOrders: 1, initialSpent: 20000 }
    ];

    // Map by phone to prevent duplicates
    const usersMap: Record<string, {
      name: string;
      phone: string;
      email: string;
      totalOrders: number;
      totalSpent: number;
      orders: Order[];
    }> = {};

    // Initialize with bases
    baseMembers.forEach(bm => {
      usersMap[bm.phone] = {
        name: bm.name,
        phone: bm.phone,
        email: bm.email,
        totalOrders: bm.initialOrders,
        totalSpent: bm.initialSpent,
        orders: []
      };
    });

    // Populate from actual system orders
    orders.forEach(order => {
      const phone = order.customerPhone || "08123456789";
      const name = order.customerName || "Member Kios Josh";
      
      if (!usersMap[phone]) {
        usersMap[phone] = {
          name,
          phone,
          email: `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          totalOrders: 0,
          totalSpent: 0,
          orders: []
        };
      } else {
        // Update user's name if more complete
        if (order.customerName && order.customerName !== "Member Kios Josh") {
          usersMap[phone].name = order.customerName;
        }
      }

      // Add order details (prevent double sum)
      if (!usersMap[phone].orders.some(o => o.id === order.id)) {
        usersMap[phone].orders.push(order);
        
        if (order.status !== 'dibatalkan') {
          usersMap[phone].totalOrders += 1;
          usersMap[phone].totalSpent += order.total;
        }
      }
    });

    // Calculate stats including admin choices
    return Object.values(usersMap).map(u => {
      const pointsFromSpent = Math.floor(u.totalSpent / 100);
      const pointsBonus = bonusPoints[u.phone] || 0;
      const totalPoints = pointsFromSpent + pointsBonus;

      // Determine Tier
      let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
      let tierColor = 'bg-stone-50 text-stone-700 border-stone-200';
      let tierBadge = '🥉';
      
      if (u.totalOrders >= 5 || u.totalSpent >= 100000 || totalPoints >= 1500) {
        tier = 'Platinum';
        tierColor = 'bg-violet-50 text-violet-800 border-violet-200';
        tierBadge = '👑';
      } else if (u.totalOrders >= 3 || u.totalSpent >= 50000 || totalPoints >= 800) {
        tier = 'Gold';
        tierColor = 'bg-amber-50 text-amber-800 border-amber-200';
        tierBadge = '🥇';
      } else if (u.totalOrders >= 2 || u.totalSpent >= 25000 || totalPoints >= 400) {
        tier = 'Silver';
        tierColor = 'bg-slate-100 text-slate-800 border-slate-300';
        tierBadge = '🥈';
      }

      return {
        ...u,
        totalPoints,
        tier,
        tierColor,
        tierBadge,
        notes: userNotes[u.phone] || ''
      };
    });
  };

  useEffect(() => {
    onRefreshProducts();
    onRefreshOrders();
    onRefreshReports();
    onRefreshIngredients();
    const interval = setInterval(() => {
      onRefreshProducts();
      onRefreshOrders();
      onRefreshReports();
      onRefreshIngredients();
    }, 5000); // sync every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Set default values when editing food
  const handleStartEdit = (p: Product) => {
    setEditingProd(p);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdCategory(p.category);
    setProdStock(p.stock);
    setProdDesc(p.description);
    setProdImg(p.imageUrl);
    setProdAvailable(p.isAvailable);
    setScreen('edit_product');
  };

  const handleStartAdd = () => {
    setProdName('');
    setProdPrice(10000);
    setProdCategory('Makanan');
    setProdStock(50);
    setProdDesc('');
    setProdImg('');
    setProdAvailable(true);
    setScreen('add_product');
  };

  const handleSaveAdd = async () => {
    if (!prodName) {
      alert("Nama Kuliner wajib diisi.");
      return;
    }
    await onAddProduct({
      name: prodName,
      price: Number(prodPrice),
      category: prodCategory,
      stock: Number(prodStock),
      description: prodDesc,
      imageUrl: prodImg || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
      isAvailable: prodAvailable
    });
    setScreen('products');
  };

  const handleSaveEdit = async () => {
    if (!editingProd) return;
    await onEditProduct(editingProd.id, {
      name: prodName,
      price: Number(prodPrice),
      category: prodCategory,
      stock: Number(prodStock),
      description: prodDesc,
      imageUrl: prodImg,
      isAvailable: prodAvailable
    });
    setScreen('products');
    setEditingProd(null);
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);
  };

  if (screen === 'admin_login') {
    return (
      <div className="flex-1 bg-white flex flex-col justify-center p-6 font-sans select-none selection:bg-primary/20">
        <div className="w-full max-w-[320px] mx-auto flex flex-col justify-center">
          <div className="text-center mb-8">
            <span className="text-4xl">👩‍🍳</span>
            <h2 className="text-2xl font-bold text-black mt-2 leading-tight">Admin Portal login</h2>
            <p className="text-neutral-500 text-xs mt-1">Kios Josh Manado - Management Panel</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <input 
                id="et_username"
                type="text" 
                value={adminUsername} 
                onChange={e => setAdminUsername(e.target.value)}
                placeholder="Username"
                className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <input 
                id="et_password"
                type="password" 
                value={adminPassword} 
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <button 
              id="btn_admin_login"
              onClick={() => {
                if (!adminUsername || !adminPassword) {
                  alert("Semua data wajib diisi.");
                  return;
                }
                setScreen('dashboard');
              }}
              className="w-full h-14 bg-primary hover:bg-[#721E16] active:scale-[0.98] transition-all text-white font-bold rounded-lg mt-4 cursor-pointer text-sm shadow font-sans"
            >
              Sign In to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5EFE4] relative text-neutral">
      
      {/* 🔔 FLOATING MODAL ALERT UNTUK PESANAN BARU MASUK (Request 3) */}
      {newOrderAlert && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-primary text-neutral overflow-hidden shadow-2xl max-w-sm w-full p-5 flex flex-col gap-4 text-center animate-bounce-short">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-4xl animate-pulse">
              🔔
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#8B261D] uppercase block">Notifikasi Kasir</span>
              <h2 className="text-lg font-black text-neutral mt-0.5 uppercase tracking-tight">Ada Orderan Baru Masuk!</h2>
              <p className="text-[11px] text-neutral/65 mt-1 font-light">Pelanggan baru saja menuntaskan checkout makanan dari gawai.</p>
            </div>

            {/* Order details block */}
            <div className="bg-[#F5EFE4]/60 border border-primary/10 rounded-2xl p-4 text-left flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-neutral text-xs">No. Antrean:</span>
                <span className="font-mono text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black">{newOrderAlert.id}</span>
              </div>
              <p className="text-xs font-black text-primary leading-tight">{newOrderAlert.customerName}</p>
              
              <div className="h-px bg-primary/10 my-1"/>

              <span className="text-[9px] font-bold text-neutral/50 uppercase block">Rincian Menu:</span>
              <div className="flex flex-col gap-1 text-[11px] font-mono leading-tight max-h-24 overflow-y-auto">
                {newOrderAlert.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-primary/10 my-1"/>
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-neutral text-xs">Grand Total:</span>
                <span className="font-black text-primary font-mono">{formatPrice(newOrderAlert.total)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setNewOrderAlert(null)}
                className="flex-1 py-2.5 border border-neutral-300 text-neutral-500 hover:bg-neutral-50 font-bold rounded-xl text-xs uppercase"
              >
                Tutup
              </button>
              <button
                onClick={async () => {
                  await onUpdateOrderStatus(newOrderAlert.id, 'processing');
                  setNewOrderAlert(null);
                  setScreen('orders');
                }}
                className="flex-1 py-2.5 bg-primary text-white font-black rounded-xl text-xs uppercase hover:bg-red-800 transition shadow flex items-center justify-center gap-1"
              >
                Terima & Masak 🧑‍🍳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. ADMIN HEADER SYSTEM */}
      <div className="bg-primary text-white pt-3 pb-4 px-4 shadow flex flex-col gap-2 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">👩‍🍳</span>
            <div>
              <span className="text-[10px] text-amber-300 uppercase tracking-widest block font-bold font-mono">DASHBOARD ADMIN KASIR</span>
              <span className="font-extrabold text-white text-base">Kios Josh</span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              onRefreshProducts();
              onRefreshOrders();
              onRefreshReports();
            }}
            title="Refresh tablet data"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center justify-center text-secondary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Store Open/Close Status */}
        <div className="flex justify-between items-center bg-white/10 px-3 py-1.5 rounded-lg text-xs">
          <span className="font-light">Status Layanan Digital Kios:</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOpenShop ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <button 
              onClick={() => setIsOpenShop(!isOpenShop)}
              className="font-bold underline text-secondary hover:text-white"
            >
              {isOpenShop ? 'BUKA (Menerima Order)' : 'TUTUP (Off sementara)'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. ADMIN PAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        
        {/* --- DASHBOARD MONITOR SCREEN --- */}
        {screen === 'dashboard' && (
          <div className="flex flex-col gap-4">
            
            {/* Daily stats summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-primary/5 shadow-sm">
                <div className="flex items-center gap-2 text-primary/50 text-[10px] font-bold uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                  <span>Pendapatan Selesai</span>
                </div>
                <h3 className="text-sm font-black text-primary mt-1.5 truncate">
                  {formatPrice(reports.totalRevenue)}
                </h3>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-primary/5 shadow-sm">
                <div className="flex items-center gap-2 text-primary/50 text-[10px] font-bold uppercase tracking-wider">
                  <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                  <span>Total Pesanan Masuk</span>
                </div>
                <h3 className="text-base font-black text-neutral mt-1.5">
                  {orders.length} Transaksi
                </h3>
              </div>
            </div>

            {/* Immediate Attention Orders count */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-xs font-black text-neutral/60 uppercase tracking-widest">Antrean Pesanan Menunggu</h3>
                <span className="text-[10px] bg-primary text-white font-mono px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'pending' || o.status === 'processing').length} Aktif
                </span>
              </div>

              {orders.filter(o => o.status === 'pending' || o.status === 'processing').length === 0 ? (
                <div className="text-center py-8 bg-white/50 border border-dashed border-primary/10 rounded-2xl text-xs text-neutral/40">
                  Dapur santai. Belum ada antrean masuk saat ini.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {orders.filter(o => o.status === 'pending' || o.status === 'processing').map(o => (
                    <div key={o.id} className="bg-white rounded-xl border-l-[6px] border-[#8B261D] p-3.5 shadow-sm flex flex-col gap-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-neutral/45 block">No: {o.id}</span>
                          <strong className="text-xs truncate font-bold text-neutral">{o.customerName}</strong>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${o.paymentMethod === 'qris' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                          {o.paymentMethod.toUpperCase()} • {o.pickupOrDelivery}
                        </span>
                      </div>

                      <div className="text-[10.5px] font-mono bg-[#F5EFE4]/40 p-2 rounded border border-primary/5">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{it.quantity}x {it.name}</span>
                            <span>{formatPrice(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center gap-3">
                        <span className="text-xs font-black text-[#8B261D]">{formatPrice(o.total)}</span>
                        
                        {/* Interactive Status Changer directly inside dashboard */}
                        <div className="flex gap-1.5 shrink-0">
                          {o.status === 'pending' && (
                            <button 
                              onClick={() => {
                                onUpdateOrderStatus(o.id, 'processing');
                                alert(`Dapur dikonfirmasi: memasak pesanan ${o.customerName}!`);
                              }}
                              className="px-2.5 py-1.5 bg-[#8B261D] text-white text-[9px] font-black uppercase rounded hover:bg-red-800 active:scale-95 transition"
                            >
                              Masak Kuliner 🧑‍🍳
                            </button>
                          )}
                          {o.status === 'processing' && (
                            <button 
                              onClick={() => {
                                onUpdateOrderStatus(o.id, 'selesai');
                                alert(`Selesai! Pesanan ${o.customerName} siap diantar.`);
                              }}
                              className="px-2.5 py-1.5 bg-secondary text-primary text-[9px] font-black uppercase rounded hover:bg-amber-400 active:scale-95 transition"
                            >
                              Selesai & Kirim ✓
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm("Yakin ingin membatalkan pesanan ini?")) {
                                onUpdateOrderStatus(o.id, 'dibatalkan');
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded border border-rose-200"
                            title="Batalkan Pesanan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ORDER / ANTRIAN MANAGEMENT TAB --- */}
        {screen === 'orders' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-neutral/60 uppercase tracking-widest">Semua Catatan Antrean</h3>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl text-xs text-neutral/45">
                Belum ada database pesanan terekam.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {[...orders].reverse().map(o => (
                  <div key={o.id} className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-neutral/40 font-mono">{o.id}</span>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        o.status === 'selesai' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : o.status === 'processing' 
                            ? 'bg-amber-50 text-amber-800 animate-pulse' 
                            : o.status === 'dibatalkan'
                              ? 'bg-red-50 text-red-800'
                              : 'bg-primary/5 text-primary'
                      }`}>
                        {o.status === 'pending' ? 'Dapur Baru' : o.status === 'processing' ? 'Dimasak' : o.status === 'selesai' ? 'Selesai' : 'Batal'}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-xs font-bold text-neutral leading-tight block">{o.customerName}</strong>
                        <span className="text-[10px] text-neutral/50 block mt-0.5 font-light truncate max-w-[240px]">
                          Tlp: {o.customerPhone} | Alamat: {o.deliveryAddress}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono bg-neutral/5 p-2 rounded">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-neutral/80">
                          <span>{it.quantity}x {it.name}</span>
                          <span>{formatPrice(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Change statuses panel */}
                    <div className="flex justify-between items-center gap-2 pt-1 border-t border-primary/5">
                      <span className="text-xs font-black text-primary">{formatPrice(o.total)}</span>
                      
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => onUpdateOrderStatus(o.id, 'processing')}
                          className={`px-2 py-1 text-[9px] font-bold rounded ${o.status === 'processing' ? 'bg-amber-400 text-primary' : 'bg-neutral/5 text-neutral-500'}`}
                        >
                          Proses
                        </button>
                        <button 
                          onClick={() => onUpdateOrderStatus(o.id, 'selesai')}
                          className={`px-2 py-1 text-[9px] font-bold rounded ${o.status === 'selesai' ? 'bg-emerald-500 text-white' : 'bg-neutral/5 text-neutral-500'}`}
                        >
                          Selesai
                        </button>
                        <button 
                          onClick={() => onUpdateOrderStatus(o.id, 'dibatalkan')}
                          className={`px-2 py-1 text-[9px] font-bold rounded ${o.status === 'dibatalkan' ? 'bg-red-500 text-white' : 'bg-neutral/5 text-neutral-500'}`}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- KELOLA MENU / PRODUCTS TAB SCREEN --- */}
        {screen === 'products' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-neutral/60 uppercase tracking-widest">Daftar Menu Kios Josh ({products.length})</h3>
              <button 
                onClick={handleStartAdd}
                className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold uppercase rounded-xl flex items-center gap-1 shadow cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tambah Kuliner
              </button>
            </div>

            {/* PANDUAN PENGGUNA: Cara Tambah Menu & Ganti Gambar (Request 1) */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200/60 p-4 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs select-none">
                <span>💡</span>
                <span>Panduan Tambah Menu & Ganti Gambar</span>
              </div>
              <div className="flex flex-col gap-2 text-[11px] text-amber-900 font-light leading-relaxed">
                <p>
                  <strong className="font-bold">1. Cara Tambah Menu Baru:</strong> Tekan tombol <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-black">+ Tambah Kuliner</span> di atas. Isi rincian seperti nama masakan, harga porsi, ketersediaan stok, dan deskripsi rasa.
                </p>
                <p>
                  <strong className="font-bold">2. Cara Ganti Gambar Hidangan:</strong> Kios Josh menggunakan tautan (URL) gambar langsung dari internet. Kunjungi website penyedia gambar seperti <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline font-medium hover:text-amber-950">Unsplash</a> atau Google Images, cari gambar makanan yang sesuai, <strong className="font-medium">klik kanan gambar &rarr; pilih &ldquo;Copy Image Address&rdquo;</strong> (Salin Alamat Gambar), lalu tempel (paste) ke kolom <span className="font-mono bg-amber-100 px-1 py-0.2 rounded font-medium">URL Gambar</span> saat menambah/mengedit menu.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pb-8">
              {products.map(p => (
                <div 
                  key={p.id}
                  className="bg-white rounded-xl border border-primary/5 p-3 flex gap-3 shadow-sm relative items-center justify-between"
                >
                  <div className="flex gap-3 items-center overflow-hidden">
                    <div className="w-12 h-12 bg-secondary text-primary rounded-lg overflow-hidden shrink-0 flex items-center justify-center font-black text-sm uppercase">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        p.name.substring(0, 2)
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-neutral truncate leading-tight">{p.name}</h4>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-[10px] font-black text-primary">{formatPrice(p.price)}</span>
                        <span className="text-[8.5px] bg-[#8B261D]/5 text-primary px-1.5 rounded font-mono">stok: {p.stock}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Stok switch & Edit forms) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={async () => {
                        const nextState = !p.isAvailable;
                        await onEditProduct(p.id, { isAvailable: nextState });
                        alert(`${p.name} sekarang: ${nextState ? 'SEDIA/STOK AKTIF' : 'HABIS SEMENTARA'}`);
                      }}
                      title={p.isAvailable ? "Set Habis" : "Set Sedia"}
                      className={`px-2.5 py-1 rounded text-[9px] flex items-center gap-1 font-bold ${
                        p.isAvailable 
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {p.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{p.isAvailable ? 'Sedia' : 'Habis'}</span>
                    </button>

                    <button 
                      onClick={() => handleStartEdit(p)}
                      className="p-1.5 bg-neutral/5 hover:bg-neutral/10 text-neutral rounded-lg"
                      title="Edit Kuliner"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={async () => {
                        if (confirm(`Yakin ingin selamanya menghapus menu "${p.name}" dari tablet Kios Josh?`)) {
                          await onDeleteProduct(p.id);
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200"
                      title="Delete Kuliner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ADD PRODUCT FORM SCREEN --- */}
        {screen === 'add_product' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-neutral/60 uppercase tracking-widest">Tambah Menu Kuliner Baru</h3>

            <div className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">NAMA HIDANGAN / MAKANAN</label>
                <input 
                  type="text" 
                  value={prodName} 
                  onChange={e => setProdName(e.target.value)}
                  placeholder="Contoh: Tinutuan Brenebon Spesial"
                  className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">HARGA (RP)</label>
                  <input 
                    type="number" 
                    value={prodPrice} 
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">KATEGORI MENU</label>
                  <select 
                    value={prodCategory} 
                    onChange={e => setProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Gorengan & Snack">Gorengan & Snack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">KETERSEDIAAN STOK PORSI</label>
                <input 
                  type="number" 
                  value={prodStock} 
                  onChange={e => setProdStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">URL GAMBAR FOTO KAMPUS (UNSPLASH)</label>
                <input 
                  type="text" 
                  value={prodImg} 
                  onChange={e => setProdImg(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">DESKRIPSI KULINER</label>
                <textarea 
                  value={prodDesc} 
                  onChange={e => setProdDesc(e.target.value)}
                  placeholder="Paparkan deskripsi menu lezat ini..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-[#8B261D]/10 rounded-xl text-xs focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button 
                onClick={() => setScreen('products')}
                className="flex-1 py-3 bg-neutral-300 text-neutral-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveAdd}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-red-800 cursor-pointer"
              >
                Simpan Menu Baru ✓
              </button>
            </div>
          </div>
        )}

        {/* --- EDIT PRODUCT FORM SCREEN --- */}
        {screen === 'edit_product' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-neutral/60 uppercase tracking-widest">Edit Identitas Kuliner</h3>

            <div className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">NAMA HIDANGAN</label>
                <input 
                  type="text" 
                  value={prodName} 
                  onChange={e => setProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">HARGA PORSI (RP)</label>
                  <input 
                    type="number" 
                    value={prodPrice} 
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">KATEGORI</label>
                  <select 
                    value={prodCategory} 
                    onChange={e => setProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none font-bold"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Gorengan & Snack">Gorengan & Snack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">AKSES STOK (QTY PORSI)</label>
                <input 
                  type="number" 
                  value={prodStock} 
                  onChange={e => setProdStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">FOTO LINK URL</label>
                <input 
                  type="text" 
                  value={prodImg} 
                  onChange={e => setProdImg(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none font-mono text-[9px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-neutral/60 block mb-1">DESKRIPSI BAHAN</label>
                <textarea 
                  value={prodDesc} 
                  onChange={e => setProdDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#F5EFE4]/40 border border-primary/10 rounded-xl text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Instant updates visibility toggle */}
              <div className="flex justify-between items-center bg-[#F5EFE4]/30 p-2.5 rounded-xl border border-primary/5">
                <span className="text-xs font-semibold text-neutral/70">Tampilkan ke Menu Pengguna:</span>
                <input 
                  type="checkbox" 
                  checked={prodAvailable} 
                  onChange={e => setProdAvailable(e.target.checked)}
                  className="w-4 h-4 text-primary bg-[#F5EFE4] rounded focus:ring-primary focus:ring-2"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button 
                onClick={() => setScreen('products')}
                className="flex-1 py-3 bg-neutral-300 text-neutral font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-red-800"
              >
                Update Menu Kios ✓
              </button>
            </div>
          </div>
        )}

        {/* --- SALES REPORTS ANALYSIS SCREEN --- */}
        {screen === 'reports' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black text-neutral/60 uppercase tracking-widest">Analisis Keuangan Kios</h3>

            <div className="bg-white rounded-2xl p-5 border border-primary/5 shadow-sm flex flex-col gap-3">
              <span className="text-[10px] text-neutral/45 block uppercase font-mono tracking-wider">Total Pendapatan Bersih (Selesai)</span>
              <h2 className="text-2xl font-black text-primary leading-tight">{formatPrice(reports.totalRevenue)}</h2>
              
              <div className="border-t border-primary/5 pt-3.5 mt-1.5 flex justify-between text-xs text-neutral/80">
                <span>Rata-rata Order:</span>
                <span className="font-extrabold text-neutral">
                  {reports.dailyRevenue.length > 0 
                    ? formatPrice(reports.totalRevenue / (reports.dailyRevenue.reduce((sum, r) => sum + r.count, 0) || 1)) 
                    : 'Rp 0'}
                </span>
              </div>
            </div>

            {/* Daily timelines list summary */}
            <div>
              <h4 className="text-xs font-extrabold text-neutral/60 uppercase tracking-wider mb-2.5">Timeline Pendapatan Harian</h4>
              <div className="flex flex-col gap-2">
                {reports.dailyRevenue.length === 0 ? (
                  <div className="text-center py-6 bg-white/50 border border-primary/5 rounded-2xl text-xs text-neutral/40">
                    Belum ada omset penjualan terekam hari ini.
                  </div>
                ) : (
                  reports.dailyRevenue.map((day, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-primary/5 shadow-sm flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">📅</span>
                        <div>
                          <strong className="text-xs font-extrabold block text-neutral">{day.date}</strong>
                          <span className="text-[10px] text-neutral/50">{day.count} Transaksi Terselesaikan</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-primary">{formatPrice(day.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Product performance analysis list */}
            <div>
              <h4 className="text-xs font-extrabold text-neutral/60 uppercase tracking-wider mb-2.5">5 Makanan Paling Laris</h4>
              <div className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm flex flex-col gap-3">
                {reports.topProducts.length === 0 ? (
                  <div className="text-center py-4 text-xs text-neutral/40">No data.</div>
                ) : (
                  reports.topProducts.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-neutral/5 pb-2 last:border-none last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-secondary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <strong className="text-xs font-semibold block text-neutral truncate max-w-[160px]">{p.name}</strong>
                          <span className="text-[9.5px] text-neutral-500">{p.quantity} porsi terjual</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#8B261D]">{formatPrice(p.revenue)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- KELOLA USER & LOYALITAS SCREEN --- */}
        {screen === 'users' && (
          <div className="flex flex-col gap-4 pb-12 font-sans text-neutral">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-neutral/60 uppercase tracking-widest">Database Pelanggan Kios Josh</h3>
                <span className="text-[10px] text-neutral/45 block mt-0.5">Kelola loyalitas & poin apresiasi pembeli</span>
              </div>
              <span className="text-[11px] bg-primary text-white font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 shrink-0 select-none">
                <span>👥</span>
                <span>{getAggregatedUsers().length} Pengguna</span>
              </span>
            </div>

            {/* Loyalty tier system thresholds guide */}
            <div className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-violet-500/10 border border-primary/10 rounded-2xl p-3.5 flex flex-col gap-2">
              <span className="text-[10px] font-black text-primary uppercase">Sistem Loyalitas & Level Member:</span>
              <div className="grid grid-cols-3 gap-2 text-[9px] font-sans">
                <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                  <span className="font-bold block text-slate-800">🥈 Silver Member</span>
                  <span className="text-neutral/60 block mt-0.5">2+ Order / Rp 25k spent</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                  <span className="font-bold text-amber-800 block">🥇 Gold Member</span>
                  <span className="text-neutral/60 block mt-0.5">3+ Order / Rp 50k spent</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-violet-200">
                  <span className="font-bold text-violet-800 block">👑 Platinum Member</span>
                  <span className="text-neutral/60 block mt-0.5">5+ Order / Rp 100k spent</span>
                </div>
              </div>
              <p className="text-[8.5px] text-neutral-500 mt-1 italic">
                *Poin Loyalty dihitung otomatis: Rp 100 spent = 1 Poin, atau ditambahkan manual oleh admin.
              </p>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <input 
                type="text" 
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                placeholder="Cari user berdasarkan nama atau no HP..." 
                className="w-full pl-8 pr-4 py-2 bg-white border border-primary/10 rounded-xl text-xs focus:outline-none placeholder-neutral/40"
              />
              <span className="absolute left-2.5 top-2.5 text-xs text-neutral/40">🔍</span>
            </div>

            {/* Users List */}
            <div className="flex flex-col gap-2.5">
              {getAggregatedUsers()
                .filter(u => 
                  u.name.toLowerCase().includes(userQuery.toLowerCase()) || 
                  u.phone.includes(userQuery)
                )
                .map(u => {
                  const isOpened = selectedUserPhone === u.phone;
                  return (
                    <div 
                      key={u.phone} 
                      className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col gap-3 hover:border-primary/20 transition-all cursor-pointer ${isOpened ? 'border-primary/30 ring-2 ring-primary/5 shadow-md' : 'border-primary/5'}`}
                      onClick={() => {
                        setSelectedUserPhone(isOpened ? null : u.phone);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center overflow-hidden">
                          <div className="w-10 h-10 rounded-full bg-primary/5 text-primary text-xs font-black flex items-center justify-center border border-primary/10 shrink-0">
                            {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <strong className="text-xs font-black text-neutral leading-tight truncate max-w-[130px]">{u.name}</strong>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border shrink-0 ${u.tierColor}`}>
                                {u.tierBadge} {u.tier}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral/50 font-mono block mt-0.5 truncate">{u.phone} • {u.email}</span>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black block text-primary">{u.totalPoints} Poin</span>
                          <span className="text-[8.5px] text-neutral/50 block font-mono">Loyalty Poin</span>
                        </div>
                      </div>

                      {/* Simple summary stats row */}
                      <div className="grid grid-cols-2 gap-2 bg-[#F5EFE4]/30 p-2 rounded-lg text-center border border-[#8B261D]/5">
                        <div>
                          <span className="text-[8px] text-neutral/45 block uppercase">Frekuensi Order</span>
                          <span className="text-[11px] font-black text-neutral">{u.totalOrders}x Belanja</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-neutral/45 block uppercase">Total Pembelanjaan</span>
                          <span className="text-[11px] font-black text-secondary">{formatPrice(u.totalSpent)}</span>
                        </div>
                      </div>

                      {/* Notes / Tag Display */}
                      {u.notes && (
                        <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-lg p-2 text-[10px] flex items-start gap-1.5">
                          <span className="shrink-0">📝</span>
                          <p className="leading-tight text-[9.5px]"><strong>Catatan Admin:</strong> {u.notes}</p>
                        </div>
                      )}

                      {/* Expandable interactives drawer panel */}
                      {isOpened && (
                        <div 
                          className="mt-2 pt-3 border-t border-primary/5 flex flex-col gap-3"
                          onClick={e => e.stopPropagation()}
                        >
                          {/* Notes manager */}
                          <div>
                            <label className="text-[8.5px] font-black text-neutral/60 block mb-1">CATATAN KHUSUS PELANGGAN LOYAL (AUTO-SAVE)</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Contoh: Pembeli kosan sangat loyal, suka pedas sambal roa"
                                defaultValue={u.notes}
                                onChange={e => {
                                  setUserNotes(prev => ({ ...prev, [u.phone]: e.target.value }));
                                }}
                                className="text-xs px-2.5 py-1.5 bg-[#F5EFE4]/30 border border-primary/10 rounded-lg flex-1 focus:outline-none focus:border-primary/30"
                              />
                            </div>
                          </div>

                          {/* Gift points & awards controller */}
                          <div className="flex flex-col gap-2 bg-gradient-to-r from-amber-500/5 to-primary/5 border border-primary/5 p-3 rounded-lg">
                            <span className="text-[9.5px] font-bold text-primary block uppercase">🎁 Beri Apresiasi Loyalitas (Bonus Manual):</span>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setBonusPoints(prev => ({ ...prev, [u.phone]: (prev[u.phone] || 0) + 100 }));
                                  alert(`Apresiasi ditambahkan! +100 point diberikan kepada ${u.name}`);
                                }}
                                className="flex-1 py-1.5 bg-[#8B261D] text-white text-[9px] font-extrabold rounded-md hover:bg-red-800 transition active:scale-95 cursor-pointer"
                              >
                                +100 Poin Kios
                              </button>
                              <button 
                                onClick={() => {
                                  setBonusPoints(prev => ({ ...prev, [u.phone]: (prev[u.phone] || 0) + 500 }));
                                  alert(`Apresiasi istimewa! +500 point diberikan kepada ${u.name}`);
                                }}
                                className="flex-1 py-1.5 bg-secondary text-primary text-[9px] font-extrabold rounded-md hover:bg-amber-400 transition active:scale-95 cursor-pointer"
                              >
                                +500 Poin Kios
                              </button>
                              <button 
                                onClick={() => {
                                  const customAmtStr = prompt(`Masukkan jumlah bonus poin kustom buat ${u.name}:`, "250");
                                  if (customAmtStr) {
                                    const amt = parseInt(customAmtStr);
                                    if (!isNaN(amt)) {
                                      setBonusPoints(prev => ({ ...prev, [u.phone]: (prev[u.phone] || 0) + amt }));
                                      alert(`Apresiasi kustom berhasil! +${amt} poin diberikan.`);
                                    }
                                  }
                                }}
                                className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[9px] font-bold rounded-md active:scale-95 cursor-pointer shrink-0"
                              >
                                Kustom
                              </button>
                            </div>
                          </div>

                          {/* Display User Transaction History inside details */}
                          <div>
                            <span className="text-[8.5px] font-black text-neutral/60 block mb-1">STRUK TRANSAKSI AKTIF / SELESAI ({u.orders.length})</span>
                            {u.orders.length === 0 ? (
                              <p className="text-[9px] text-neutral/45 italic ml-1">Belum ada transaksi real-time terekam untuk member ini.</p>
                            ) : (
                              <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                                {u.orders.map(order => (
                                  <div key={order.id} className="bg-neutral-50 border border-neutral-100 rounded p-2 text-[9px] font-mono flex justify-between items-center">
                                    <div>
                                      <span className="font-bold text-neutral">{order.id}</span>
                                      <span className="text-[8px] text-neutral/50 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-[#8B261D] block">{formatPrice(order.total)}</span>
                                      <span className={`text-[8px] font-bold uppercase ${order.status === 'selesai' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.status}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* --- PROFILE, KELOLA BAHAN & KELOLA STOK (WAREHOUSE SCREEN) --- */}
        {screen === 'profile' && (
          <div className="flex flex-col gap-4 pb-12">
            
            {/* Owner banner */}
            <div className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm text-center flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-black border-4 border-secondary shadow-md">
                JP
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-neutral/50 uppercase tracking-widest block font-mono">PEMILIK KIOS</h4>
                <h3 className="text-base font-black text-neutral mt-0.5">{activeProfile.name || 'Joshua M. Pangalila'}</h3>
                <span className="text-[10.5px] text-neutral/60 leading-normal block">{activeProfile.email} | {activeProfile.phone}</span>
                <span className="text-[10.5px] text-neutral/55 leading-normal block mt-1.5 px-6 font-light">{activeProfile.address}</span>
              </div>
            </div>

            {/* Kelola Bahan - Ingredients panel requested! */}
            <div className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-neutral/70 uppercase tracking-wider">Kelola Bahan Baku Kios</span>
                <span className="text-[9px] bg-secondary text-primary font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">Live Server</span>
              </div>
              <p className="text-[10px] text-neutral/50 leading-normal mb-3">Sistem inventarisasi gudang terintegrasi. Set kelayakan stok & pantau kondisi bahan baku.</p>

              {/* Search & Filter Controls */}
              <div className="flex flex-col gap-2 mb-3.5 feedback-field">
                <div className="flex gap-1.5">
                  <input 
                    type="text"
                    value={ingQuery}
                    onChange={e => setIngQuery(e.target.value)}
                    placeholder="Cari nama bahan baku (e.g. Labu, Cakalang)..."
                    className="flex-1 px-2.5 py-1.5 border border-primary/10 rounded-lg text-xs bg-[#F5EFE4]/30 focus:outline-none focus:border-[#8B261D]/50"
                  />
                  {ingQuery && (
                    <button 
                      onClick={() => setIngQuery('')}
                      className="text-neutral/40 hover:text-neutral/80 text-xs px-1"
                    >
                      Batal
                    </button>
                  )}
                </div>
                
                {/* Filter Pills with colored counts */}
                <div className="flex gap-1 overflow-x-auto py-0.5 select-none scrollbar-none">
                  {(['Semua', 'Cukup', 'Hampir Habis', 'Kritis'] as const).map(f => {
                    const count = ingredients.filter(x => f === 'Semua' || x.status === f).length;
                    let activeStyles = 'bg-primary text-white border-primary';
                    let inactiveStyles = 'bg-neutral-50 text-neutral/65 border-neutral-200 hover:bg-neutral-100';
                    
                    if (f === 'Kritis' && ingFilter !== 'Kritis') inactiveStyles = 'bg-rose-50 text-rose-700 border-rose-100 font-bold';
                    if (f === 'Hampir Habis' && ingFilter !== 'Hampir Habis') inactiveStyles = 'bg-amber-50 text-amber-700 border-amber-100 font-bold';
                    
                    return (
                      <button
                        key={f}
                        onClick={() => setIngFilter(f)}
                        className={`text-[9.5px] px-2.5 py-1 rounded-full border shrink-0 font-bold transition-all cursor-pointer ${ingFilter === f ? activeStyles : inactiveStyles}`}
                      >
                        {f === 'Semua' ? '🌾 Semua' : f === 'Cukup' ? '🟢 Cukup' : f === 'Hampir Habis' ? '🟡 Tipis' : '🔴 Kritis'} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Raw ingredients items list */}
              <div className="flex flex-col gap-2 max-h-[290px] overflow-y-auto pr-1">
                {ingredients.length === 0 ? (
                  <div className="text-center py-6 text-neutral/40 text-xs">Menghubungkan ke server bahan baku...</div>
                ) : ingredients.filter(ing => {
                  const matchesQuery = ing.name.toLowerCase().includes(ingQuery.toLowerCase());
                  const matchesFilter = ingFilter === 'Semua' || ing.status === ingFilter;
                  return matchesQuery && matchesFilter;
                }).length === 0 ? (
                  <div className="text-center py-6 text-neutral/40 text-xs italic">Tidak ada bahan baku cocok dengan filter</div>
                ) : (
                  ingredients
                    .filter(ing => {
                      const matchesQuery = ing.name.toLowerCase().includes(ingQuery.toLowerCase());
                      const matchesFilter = ingFilter === 'Semua' || ing.status === ingFilter;
                      return matchesQuery && matchesFilter;
                    })
                    .map((ing, i) => {
                      // Original index inside main array to safely write adjustments
                      const origIndex = ingredients.findIndex(x => x.id === ing.id);
                      
                      let badgeColors = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                      if (ing.status === 'Hampir Habis') {
                        badgeColors = 'text-amber-700 bg-amber-50 border-amber-100';
                      } else if (ing.status === 'Kritis') {
                        badgeColors = 'text-rose-700 bg-rose-50 border-rose-100 animate-pulse';
                      }

                      const isEditing = editingIngId === ing.id;

                      return (
                        <div key={ing.id || i} className={`p-2.5 rounded-xl border transition-all ${isEditing ? 'border-[#8B261D]/40 bg-[#8B261D]/5 shadow-inner' : 'border-primary/5 bg-[#F5EFE4]/35 shadow-sm hover:bg-[#F5EFE4]/50'}`}>
                          {isEditing ? (
                            /* Inline custom fully functional editor */
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[#8B261D] truncate">{ing.name}</span>
                                <span className="text-[8.5px] font-mono text-neutral/40">ID: {ing.id}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[8.5px] font-extrabold uppercase text-neutral/50 block mb-0.5">Jumlah Stok ({ing.unit || 'kg'})</label>
                                  <input 
                                    type="text"
                                    value={editIngQty}
                                    onChange={e => setEditIngQty(e.target.value)}
                                    className="w-full px-2 py-1 text-xs border border-primary/20 rounded-md bg-white font-mono font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8.5px] font-extrabold uppercase text-neutral/50 block mb-0.5">Kelayakan</label>
                                  <select
                                    value={editIngStatus}
                                    onChange={e => setEditIngStatus(e.target.value as any)}
                                    className="w-full px-1 py-1 text-xs border border-primary/20 rounded-md bg-white font-bold"
                                  >
                                    <option value="Cukup">🟢 Cukup</option>
                                    <option value="Hampir Habis">🟡 Hampir Habis</option>
                                    <option value="Kritis">🔴 Kritis</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end mt-1">
                                <button 
                                  onClick={() => setEditingIngId(null)}
                                  className="text-[9.5px] font-bold text-neutral/50 px-2 py-1 rounded bg-[#F5EFE4]/60 hover:bg-[#F5EFE4]"
                                >
                                  Batal
                                </button>
                                <button 
                                  onClick={() => {
                                    const updated = ingredients.map((item, idx) => {
                                      if (idx === origIndex) {
                                        return { ...item, qty: editIngQty, status: editIngStatus };
                                      }
                                      return item;
                                    });
                                    saveIngredientsToServer(updated);
                                    setEditingIngId(null);
                                  }}
                                  className="text-[9.5px] font-black text-white px-3 py-1 bg-[#8B261D] rounded shadow-sm hover:bg-neutral"
                                >
                                  Simpan
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Classic premium item row with inline +/- adjustments */
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col overflow-hidden mr-2">
                                <span className="text-xs font-bold text-neutral leading-tight truncate">{ing.name}</span>
                                <span className="text-[9px] text-neutral/40 font-mono">ID: {ing.id || `ing-${i}`} • Gudang Utama</span>
                              </div>
                              
                              <div className="flex items-center gap-2shrink-0">
                                {/* Interactive Incrementor Actions (Requested specifically) */}
                                <div className="flex items-center gap-1.5 bg-[#F5EFE4] px-1.5 py-0.5 rounded-lg border border-primary/5 select-none leading-none">
                                  <button
                                    onClick={() => {
                                      const currentVal = parseFloat(ing.qty) || 0;
                                      const nextVal = Math.max(0, currentVal - 1);
                                      // Auto adjust status label safely based on next value
                                      let status = ing.status;
                                      if (nextVal <= 3) status = 'Kritis';
                                      else if (nextVal <= 8) status = 'Hampir Habis';
                                      const updated = ingredients.map((item, idx) => {
                                        if (idx === origIndex) {
                                          return { ...item, qty: String(nextVal), status };
                                        }
                                        return item;
                                      });
                                      saveIngredientsToServer(updated);
                                    }}
                                    className="w-4 h-4 rounded bg-white text-primary flex items-center justify-center font-extrabold text-[10px] hover:bg-[#8B261D] hover:text-white transition active:scale-90"
                                    title="Kurangi stok"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-black text-[#8B261D] font-mono min-w-[20px] text-center" title="Klik tombol Atur untuk mengedit langsung">
                                    {ing.qty} <span className="text-[9px] text-neutral/50 font-sans font-light">{ing.unit || 'kg'}</span>
                                  </span>
                                  <button
                                    onClick={() => {
                                      const currentVal = parseFloat(ing.qty) || 0;
                                      const nextVal = currentVal + 1;
                                      let status = ing.status;
                                      if (nextVal > 8) status = 'Cukup';
                                      else if (nextVal > 3) status = 'Hampir Habis';
                                      const updated = ingredients.map((item, idx) => {
                                        if (idx === origIndex) {
                                          return { ...item, qty: String(nextVal), status };
                                        }
                                        return item;
                                      });
                                      saveIngredientsToServer(updated);
                                    }}
                                    className="w-4 h-4 rounded bg-white text-primary flex items-center justify-center font-extrabold text-[10px] hover:bg-[#8B261D] hover:text-white transition active:scale-90"
                                    title="Tambah stok"
                                  >
                                    +
                                  </button>
                                </div>

                                <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border ml-1 shrink-0 ${badgeColors}`}>
                                  {ing.status}
                                </span>
                                
                                <div className="flex gap-1 border-l border-primary/10 pl-1.5 ml-1 select-none shrink-0">
                                  <button 
                                    onClick={() => {
                                      setEditingIngId(ing.id);
                                      setEditIngQty(ing.qty);
                                      setEditIngStatus(ing.status);
                                    }}
                                    className="text-[9px] text-[#8B261D] uppercase font-black hover:underline"
                                  >
                                    Atur
                                  </button>
                                  <span className="text-neutral/25 text-[10px]">•</span>
                                  <button 
                                    onClick={() => {
                                      if (confirm(`Apakah Anda yakin ingin menghapus bahan baku "${ing.name}" dari gudang?`)) {
                                        const updated = ingredients.filter(x => x.id !== ing.id);
                                        saveIngredientsToServer(updated);
                                      }
                                    }}
                                    className="text-[9px] text-rose-600 font-bold hover:underline"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>

              {/* Add Custom ingredient */}
              <div className="flex flex-col gap-2 border-t border-primary/5 pt-3.5 mt-3.5">
                <div className="text-[9px] font-extrabold text-[#8B261D]/70 uppercase tracking-widest font-mono">Tambah Bahan Baku Baru</div>
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    value={newIngName}
                    onChange={e => setNewIngName(e.target.value)}
                    placeholder="Nama bahan (Contoh: Bawang Merah)"
                    className="flex-1 px-3 py-1.5 border border-primary/10 rounded-lg text-xs bg-[#F5EFE4]/30"
                  />
                  <input 
                    type="text" 
                    value={newIngQty}
                    onChange={e => setNewIngQty(e.target.value)}
                    placeholder="Stok"
                    className="w-12 px-2 py-1.5 border border-primary/10 rounded-lg text-xs bg-[#F5EFE4]/30 text-center font-mono font-bold"
                  />
                  <select
                    value={newIngUnit}
                    onChange={e => setNewIngUnit(e.target.value)}
                    className="w-16 px-1.5 py-1.5 border border-primary/10 rounded-lg text-[11px] bg-[#F5EFE4]/30 font-medium"
                  >
                    <option value="kg">kg</option>
                    <option value="Lembar">Lembar</option>
                    <option value="Ikat">Ikat</option>
                    <option value="Porsi">Porsi</option>
                    <option value="Butir">Butir</option>
                    <option value="Bungkus">Bungkus</option>
                  </select>
                  <button 
                    onClick={() => {
                      if (!newIngName || !newIngQty) return;
                      const newItem: IngredientItem = {
                        id: 'ing-' + Date.now(),
                        name: newIngName,
                        qty: newIngQty,
                        unit: newIngUnit,
                        status: 'Cukup'
                      };
                      const updated = [...ingredients, newItem];
                      saveIngredientsToServer(updated);
                      setNewIngName('');
                      setNewIngQty('');
                    }}
                    className="px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-[#8B261D]/90 hover:scale-105 active:scale-95 transition"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* Quick app version info */}
            <div className="text-center text-[10px] text-neutral/40 font-mono">
              KIOS JOSH DIGITAL ADMINISTRATOR v2.4.1 BUILDPOLY 2026
            </div>
          </div>
        )}
      </div>

      {/* 3. ADMIN TABLET BOTTOM BAR NAVIGATION */}
      <div className="h-16 bg-white border-t border-[#8B261D]/10 flex items-center justify-around text-center shrink-0 shadow-lg z-40">
        <button 
          onClick={() => setScreen('dashboard')}
          className={`flex flex-col items-center gap-1 text-[9px] sm:text-[10px] font-bold flex-1 py-1 cursor-pointer transition-all ${screen === 'dashboard' ? 'text-primary scale-105' : 'text-neutral/45 hover:text-primary/70'}`}
        >
          <span className="text-sm">📉</span>
          <span>Analitika</span>
        </button>

        <button 
          onClick={() => setScreen('orders')}
          className={`flex flex-col items-center gap-1 text-[9px] sm:text-[10px] font-bold flex-1 py-1 relative cursor-pointer transition-all ${screen === 'orders' ? 'text-primary scale-105' : 'text-neutral/45 hover:text-[#8B261D]/70'}`}
        >
          <span className="text-sm">📋</span>
          <span>Ubah Order</span>
        </button>

        <button 
          onClick={() => setScreen('products')}
          className={`flex flex-col items-center gap-1 text-[9px] sm:text-[10px] font-bold flex-1 py-1 cursor-pointer transition-all ${screen === 'products' ? 'text-primary scale-105' : 'text-neutral/45 hover:text-primary/70'}`}
        >
          <span className="text-sm">🥫</span>
          <span>Kelola Menu</span>
        </button>

        <button 
          onClick={() => setScreen('users')}
          className={`flex flex-col items-center gap-1 text-[9px] sm:text-[10px] font-bold flex-1 py-1 cursor-pointer transition-all ${screen === 'users' ? 'text-primary scale-105' : 'text-neutral/45 hover:text-primary/70'}`}
          title="Kelola User & Loyalitas"
        >
          <span className="text-sm">👥</span>
          <span>Kelola User</span>
        </button>

        <button 
          onClick={() => setScreen('reports')}
          className={`flex flex-col items-center gap-1 text-[9px] sm:text-[10px] font-bold flex-1 py-1 cursor-pointer transition-all ${screen === 'reports' ? 'text-primary scale-105' : 'text-neutral/45 hover:text-primary/70'}`}
        >
          <span className="text-sm">📈</span>
          <span>Laporan</span>
        </button>

        <button 
          onClick={() => setScreen('profile')}
          className={`flex flex-col items-center gap-1 text-[9px] sm:text-[10px] font-bold flex-1 py-1 cursor-pointer transition-all ${screen === 'profile' ? 'text-primary scale-105' : 'text-neutral/45 hover:text-primary/70'}`}
        >
          <span className="text-sm">🏬</span>
          <span>Kelola Bahan</span>
        </button>
      </div>
    </div>
  );
}
