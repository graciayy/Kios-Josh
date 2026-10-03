import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, MapPin, User, ArrowLeft, Plus, Minus, 
  Trash2, SlidersHorizontal, Check, Star, Navigation, 
  ChevronRight, CreditCard, Clock, RotateCcw, AlertCircle, RefreshCw, Heart
} from 'lucide-react';
import { Product, CartItem, Order, UserProfile, OrderStatus } from '../types';

interface CustomerAppProps {
  products: Product[];
  onRefreshProducts: () => void;
  orders: Order[];
  onCreateOrder: (orderData: Partial<Order>) => Promise<Order>;
  activeProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onRoleChosen?: (role: 'customer' | 'admin') => void;
}

export default function CustomerApp({
  products,
  onRefreshProducts,
  orders,
  onCreateOrder,
  activeProfile,
  onUpdateProfile,
  onRoleChosen
}: CustomerAppProps) {
  // Screens navigation state
  // 'splash' | 'onboarding' | 'login' | 'register' | 'forgot_password' | 'otp_verification' | 'home' | 'product_detail' | 'cart' | 'checkout' | 'maps_picker' | 'payment' | 'success' | 'tracking' | 'profile' | 'history'
  const [screen, setScreen] = useState<string>('splash');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Auth state
  const [authName, setAuthName] = useState('Gracia Ester Tendean');
  const [authPhone, setAuthPhone] = useState('08234146147');
  const [authPass, setAuthPass] = useState('1234');
  const [authEmail, setAuthEmail] = useState('gracia@polimando.ac.id');
  const [otpCode, setOtpCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(59);
  
  // Shopping Cart state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kios_josh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [extraCustomization, setExtraCustomization] = useState<string>('');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  
  // Order flow state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | 'Makanan' | 'Minuman' | 'Gorengan & Snack'>('Semua');
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('delivery');
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('qris');
  const [tempAddress, setTempAddress] = useState('');
  const [checkoutName, setCheckoutName] = useState('Gracia Ester Tendean');
  const [checkoutPhone, setCheckoutPhone] = useState('08234146147');
  const [editName, setEditName] = useState('Gracia Ester Tendean');
  const [editEmail, setEditEmail] = useState('gracia@polimando.ac.id');
  const [editPhone, setEditPhone] = useState('08234146147');
  const [editAddress, setEditAddress] = useState('Jl. Raya Politeknik No. 45, Buha, Mapanget, Manado');
  const [showMapsSim, setShowMapsSim] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [historyOrderSelected, setHistoryOrderSelected] = useState<Order | null>(null);

  // Review state
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kios_josh_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  useEffect(() => {
    localStorage.setItem('kios_josh_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('kios_josh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auto-refresh products and track orders status
  useEffect(() => {
    onRefreshProducts();
    const interval = setInterval(() => {
      onRefreshProducts();
    }, 5000); // 5 sec background sync
    return () => clearInterval(interval);
  }, []);

  // Splash countdown
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('onboarding');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Otp timer effect
  useEffect(() => {
    let interval: any;
    if (screen === 'otp_verification') {
      if (otpTimer > 0) {
        interval = setInterval(() => {
          setOtpTimer(prev => prev - 1);
        }, 1000);
      }
    } else {
      setOtpTimer(59); // reset when not in screen
    }
    return () => clearInterval(interval);
  }, [screen, otpTimer]);

  // Handle active delivery location and profile sync to local fields
  useEffect(() => {
    if (activeProfile) {
      if (activeProfile.address) {
        setTempAddress(activeProfile.address);
        setEditAddress(activeProfile.address);
      }
      if (activeProfile.phone) {
        setAuthPhone(activeProfile.phone);
        setEditPhone(activeProfile.phone);
        setCheckoutPhone(activeProfile.phone);
      }
      if (activeProfile.name) {
        setAuthName(activeProfile.name);
        setEditName(activeProfile.name);
        setCheckoutName(activeProfile.name);
      }
      if (activeProfile.email) {
        setAuthEmail(activeProfile.email);
        setEditEmail(activeProfile.email);
      }
    }
  }, [activeProfile]);

  // Cart helper functions
  const addToCart = (product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prev, { product, quantity: qty, notes: extraCustomization }];
    });
    // Reset additions
    setExtraCustomization('');
    setSelectedToppings([]);
    setToast(`🛒 ${product.name} dimasukkan ke keranjang!`);
  };

  const updateCartQty = (productId: string, val: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + val;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryCostForSpeed = deliveryOption === 'pickup' ? 0 : (deliverySpeed === 'standard' ? 10000 : 20000);
  const platformFee = cart.length > 0 ? 2000 : 0;
  const cartTotal = cartSubtotal + deliveryCostForSpeed + platformFee;

  // Simulate Location Picker near Manado Polytechnic Campus
  const manadoLocs = [
    "Jl. Raya Politeknik No. 25, Buha (Kosan Wisma Merpati)",
    "Politeknik Negeri Manado (Gedung Jurusan Elektro)",
    "Asrama Mahasiswa Politeknik, Mapanget, Manado",
    "Perumahan Griya Paniki Indah, Blok A2, Manado",
    "Jl. Sam Ratulangi No. 12, Wenang Utara, Manado"
  ];

  // Submit actual order
  const handlePlaceOrderSubmit = async () => {
    if (cart.length === 0) return;
    
    const formattedItems = cart.map(c => ({
      productId: c.product.id,
      name: c.product.name,
      price: c.product.price,
      quantity: c.quantity,
      notes: c.notes
    }));

    const result = await onCreateOrder({
      customerName: checkoutName || activeProfile.name || authName,
      customerPhone: checkoutPhone || activeProfile.phone || authPhone,
      items: formattedItems,
      total: cartTotal,
      paymentMethod,
      pickupOrDelivery: deliveryOption,
      deliveryAddress: deliveryOption === 'pickup' ? 'Ambil di Kios' : tempAddress,
      deliveryFee: deliveryCostForSpeed
    });

    setLatestOrder(result);
    clearCart();

    if (paymentMethod === 'qris') {
      setScreen('payment');
    } else {
      setScreen('success');
    }
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleLoginSubmit = () => {
    if (!authEmail || !authPass) {
      alert("Semua data wajib diisi.");
      return;
    }
    onUpdateProfile({
      ...activeProfile,
      name: authName || "Gracia Ester Tendean",
      email: authEmail,
      phone: authPhone || "08234146147",
      address: tempAddress || "Jl. Raya Politeknik No. 45, Buha, Mapanget, Manado"
    });
    setScreen('home');
  };

  const handleRegisterSubmit = () => {
    if (!authName || !authEmail || !authPhone || !authPass) {
      alert("Semua data wajib diisi.");
      return;
    }
    onUpdateProfile({
      ...activeProfile,
      name: authName,
      email: authEmail,
      phone: authPhone,
      address: tempAddress || "Jl. Raya Politeknik No. 45, Buha, Mapanget, Manado"
    });
    setScreen('otp_verification');
  };

  const handleVerifyOtpSubmit = () => {
    if (!otpCode || otpCode.length !== 6) {
      alert("Masukkan 6 digit kode OTP yang valid.");
      return;
    }
    setScreen('home');
  };

  const handleResetPasswordSubmit = () => {
    if (!forgotEmail) {
      alert("Silahkan masukkan alamat Email Anda.");
      return;
    }
    alert(`Tautan reset sandi berhasil dikirim ke: ${forgotEmail}`);
    setScreen('login');
  };

  return (
    <div className="flex-1 flex flex-col h-full relative font-sans text-neutral selection:bg-primary/20 bg-[#F9F4E8]">

      {/* 1. SPLASH SCREEN */}
      {screen === 'splash' && (
        <div className="absolute inset-0 bg-primary flex flex-col justify-between items-center py-24 z-[100] text-center px-6">
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-secondary animate-bounce">
              <span className="text-primary text-5xl">🥘</span>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white font-sans">Kios Josh</h1>
              <p className="text-secondary tracking-wide text-sm mt-2">Manado's Authentic Culinary Hub</p>
            </div>
          </div>
          <div className="w-full max-w-[200px] flex flex-col items-center gap-3">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-loading rounded-full"></div>
            </div>
            <span className="text-[10px] text-white/60 tracking-widest font-mono uppercase">Memuat Aplikasi...</span>
          </div>
        </div>
      )}

      {/* 2. ONBOARDING SCREEN */}
      {screen === 'onboarding' && (
        <div className="absolute inset-0 bg-white flex flex-col justify-center items-center p-6 z-[90] text-center selection:bg-primary/20">
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[320px]">
            <h2 className="text-3xl font-extrabold text-primary tracking-tight">Kios Josh</h2>
            <p className="text-neutral-500 text-sm mt-2 mb-12">Choose your role to continue</p>
            
            <div className="w-full flex flex-col gap-4">
              <button 
                id="btn_customer_mode"
                onClick={() => setScreen('login')}
                className="w-full py-4 bg-primary hover:bg-[#721E16] active:scale-[0.98] transition-all text-white font-extrabold rounded-xl shadow-md cursor-pointer text-sm font-sans"
              >
                Enter as Customer
              </button>
              
              <button 
                id="btn_admin_mode"
                onClick={() => {
                  if (onRoleChosen) {
                    onRoleChosen('admin');
                  } else {
                    alert("Switched to Admin Kasir Mode");
                  }
                }}
                className="w-full py-4 border-2 border-primary hover:bg-neutral-50 active:scale-[0.98] transition-all text-primary font-extrabold rounded-xl bg-white shadow-sm cursor-pointer text-sm font-sans"
              >
                Enter as Shop Administrator
              </button>
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-4">
            Oleh Kelompok 1 - Politeknik Negeri Manado 2026
          </div>
        </div>
      )}

      {/* 3. LOGIN SCREEN */}
      {screen === 'login' && (
        <div className="absolute inset-0 bg-white flex flex-col justify-center p-6 z-[80] font-sans selection:bg-primary/20">
          <div className="w-full max-w-[320px] mx-auto flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-black mb-8 leading-tight">Log In to Your Account</h2>

            <div className="flex flex-col gap-4">
              <div>
                <input 
                  id="et_email"
                  type="email" 
                  value={authEmail} 
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <input 
                  id="et_password"
                  type="password" 
                  value={authPass} 
                  onChange={e => setAuthPass(e.target.value)}
                  placeholder="Password"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="text-right">
                <button 
                  onClick={() => setScreen('forgot_password')}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                id="btn_login"
                onClick={handleLoginSubmit}
                className="w-full h-14 bg-primary hover:bg-[#721E16] active:scale-[0.98] transition-all text-white font-bold rounded-lg mt-4 cursor-pointer text-sm shadow"
              >
                Log In
              </button>

              <button 
                id="tv_register"
                onClick={() => setScreen('register')}
                className="text-sm text-primary hover:underline mt-6 text-center font-semibold block"
              >
                Don't have an account? Sign Up
              </button>

              <button 
                onClick={() => setScreen('onboarding')}
                className="text-xs text-neutral-400 hover:text-neutral-600 text-center mt-4 focus:outline-none"
              >
                ← Back to Role Choice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. REGISTER SCREEN */}
      {screen === 'register' && (
        <div className="absolute inset-0 bg-white flex flex-col justify-center p-6 z-[80] font-sans selection:bg-primary/20">
          <div className="w-full max-w-[320px] mx-auto flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-black mb-8 leading-tight">Create New Account</h2>

            <div className="flex flex-col gap-3">
              <div>
                <input 
                  id="et_name"
                  type="text" 
                  value={authName} 
                  onChange={e => setAuthName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <input 
                  id="et_email"
                  type="email" 
                  value={authEmail} 
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <input 
                  id="et_phone"
                  type="tel" 
                  value={authPhone} 
                  onChange={e => setAuthPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <input 
                  id="et_password"
                  type="password" 
                  value={authPass} 
                  onChange={e => setAuthPass(e.target.value)}
                  placeholder="Password"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <button 
                id="btn_register"
                onClick={handleRegisterSubmit}
                className="w-full h-14 bg-primary hover:bg-[#721E16] active:scale-[0.98] transition-all text-white font-bold rounded-lg mt-4 cursor-pointer text-sm shadow"
              >
                Sign Up
              </button>

              <button 
                id="tv_login"
                onClick={() => setScreen('login')}
                className="text-sm text-primary hover:underline mt-6 text-center font-semibold block"
              >
                Already have an account? Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FORGOT PASSWORD SCREEN */}
      {screen === 'forgot_password' && (
        <div className="absolute inset-0 bg-white flex flex-col justify-center p-6 z-[80] font-sans selection:bg-primary/20">
          <div className="w-full max-w-[320px] mx-auto flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-black mb-4 leading-tight">Reset Password</h2>
            <p className="text-neutral-500 text-xs leading-relaxed mb-6">
              Enter your registered email address below, and we will send you a secure link to reset your password.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <input 
                  id="et_forgot_email"
                  type="email" 
                  value={forgotEmail} 
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <button 
                id="btn_reset_link"
                onClick={handleResetPasswordSubmit}
                className="w-full h-14 bg-primary hover:bg-[#721E16] active:scale-[0.98] transition-all text-white font-bold rounded-lg mt-4 cursor-pointer text-sm shadow"
              >
                Send Reset Link
              </button>

              <button 
                onClick={() => setScreen('login')}
                className="text-sm text-primary hover:underline mt-6 text-center font-semibold block"
              >
                Back to Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. OTP VERIFICATION SCREEN */}
      {screen === 'otp_verification' && (
        <div className="absolute inset-0 bg-white flex flex-col justify-center p-6 z-[80] font-sans selection:bg-primary/20">
          <div className="w-full max-w-[320px] mx-auto flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-black mb-4 leading-tight">Verification Code</h2>
            <p className="text-neutral-500 text-xs leading-relaxed mb-6">
              Enter the 6-digit OTP code sent to your phone number.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <input 
                  id="et_otp_code"
                  type="text" 
                  maxLength={6}
                  value={otpCode} 
                  onChange={e => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    setOtpCode(onlyNums);
                  }}
                  placeholder="------"
                  className="w-full h-14 px-4 bg-white border border-neutral-300 rounded-lg text-2xl font-bold tracking-[0.2em] text-center focus:outline-none focus:border-primary"
                />
              </div>

              <button 
                id="btn_verify_otp"
                onClick={handleVerifyOtpSubmit}
                className="w-full h-14 bg-primary hover:bg-[#721E16] active:scale-[0.98] transition-all text-white font-bold rounded-lg mt-4 cursor-pointer text-sm shadow"
              >
                Verify & Activate
              </button>

              <div className="text-sm text-neutral-500 text-center mt-6">
                {otpTimer > 0 ? (
                  <span>Resend Code in {otpTimer}s</span>
                ) : (
                  <button 
                    onClick={() => {
                      setOtpTimer(59);
                      alert("A new 6-digit OTP code has been sent!");
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Resend Code Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. HOME HEADER (STAYS FIXED FOR STANDARD SCREENS) */}
      {['home', 'menu', 'favorites', 'cart', 'profile_hub', 'profile', 'tracking', 'history', 'success'].includes(screen) && (
        <div className="bg-primary text-white pt-3 pb-4 px-4 shadow flex flex-col gap-3 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏡</span>
              <div>
                <span className="text-[10px] text-white/70 uppercase tracking-widest block font-mono">MITRA DIGITAL UMKM</span>
                <span className="font-extrabold text-white text-base font-sans tracking-wide">Kios Josh</span>
              </div>
            </div>
            
            {/* Quick Switch Button to Cart or Account */}
            <div className="flex gap-2.5 items-center">
              <button 
                onClick={() => {
                  onRefreshProducts();
                }}
                title="Refresh menu & statuses"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center justify-center text-amber-300"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setScreen('cart')}
                className="relative w-9 h-9 rounded-xl bg-[#E9B44C] text-primary flex items-center justify-center shadow font-bold"
              >
                <ShoppingBag className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Location status bar */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-light">
            <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span className="truncate flex-1 text-white/90">
              Kirim ke: <strong className="font-semibold text-secondary">{activeProfile.name}: {activeProfile.address ? activeProfile.address : 'Silahkan atur alamat'}</strong>
            </span>
          </div>
        </div>
      )}

      {/* 5. APP SCREENS RENDERING */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4">
        
        {/* --- CUSTOMER HOME SCREEN --- */}
        {screen === 'home' && (
          <div className="flex flex-col gap-5 pb-8 animate-fade-in animate-once">
            {/* Elegant Welcome Header with Profile name */}
            <div className="bg-white rounded-2xl p-4 border border-primary/5 shadow-sm flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-neutral-45 font-mono uppercase tracking-wider">Selamat Datang Pelanggan</span>
                <h3 className="text-sm font-black text-neutral">Halo, {activeProfile.name || authName}! 👋</h3>
                <span className="text-[10px] text-[#8B261D] font-light">Hari ini mau makan khas Manado apa? Kios Josh siap memasak!</span>
              </div>
              <div className="w-10 h-10 bg-primary/10 border border-primary/10 rounded-full flex items-center justify-center text-primary text-base font-black">
                {activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : 'G'}
              </div>
            </div>

            {/* Simulated Search Bar redirecting to Menu Screen */}
            <div 
              onClick={() => {
                setScreen('menu');
              }}
              className="bg-white border border-primary/10 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm cursor-pointer hover:bg-neutral-50 transition-all font-sans"
            >
              <Search className="w-4 h-4 text-neutral/40" />
              <span className="text-xs text-neutral/40 flex-1">Cari hidangan Kios Josh (Tinutuan, Es Susu, Mie)...</span>
              <SlidersHorizontal className="w-4 h-4 text-primary" />
            </div>

            {/* High fidelity dynamic promo banner slider */}
            <div className="relative overflow-hidden rounded-2xl bg-[#8B261D] text-white p-5 border border-primary/10 shadow-sm">
              <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-[#E9B44C] rounded-full opacity-10" />
              <div className="absolute left-[-20px] top-[-20px] w-24 h-24 bg-white rounded-full opacity-5" />

              <span className="inline-block bg-[#E9B44C] text-primary text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-2 font-sans">
                PROMO HARI INI ⭐
              </span>
              <h4 className="text-sm font-black text-white leading-tight font-sans">ONGKIR GRATIS SE-POLIMANDO!</h4>
              <p className="text-[10.5px] text-white/80 mt-1 font-light leading-relaxed">
                Antaran super cepat langsung ke area kos sekitar kampus Politeknik Negeri Manado. Cepat, nikmat & higienis!
              </p>
              <div className="flex items-center gap-1 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span>
              </div>
            </div>

            {/* Quick Categories Navigation Grid */}
            <div className="flex flex-col gap-2 font-sans">
              <h3 className="text-[10.5px] font-black uppercase tracking-wider text-neutral/50">Kategori Menu Kios</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { name: 'Semua', label: 'Semua', icon: '🍲' },
                  { name: 'Makanan', label: 'Makanan', icon: '🍛' },
                  { name: 'Minuman', label: 'Minuman', icon: '🥤' },
                  { name: 'Gorengan & Snack', label: 'Snack', icon: '🥟' }
                ].map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setCategoryFilter(cat.name as any);
                      setScreen('menu');
                    }}
                    className="bg-white hover:bg-primary/5 active:scale-95 transition-all p-3 border border-primary/5 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[10px] font-extrabold text-[#8B261D]">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rekomendasi Menu Terlaris (Featured Items) */}
            <div className="flex flex-col gap-3 font-sans">
              <div className="flex justify-between items-center">
                <h3 className="text-[10.5px] font-black uppercase tracking-wider text-neutral/50">Rekomendasi Terlaris 🔥</h3>
                <button 
                  onClick={() => {
                    setCategoryFilter('Semua');
                    setScreen('menu');
                  }}
                  className="text-[10px] text-primary font-black hover:underline"
                >
                  Lihat Semua →
                </button>
              </div>

              {/* Grid block displaying top 3 products */}
              <div className="flex flex-col gap-2.5">
                {products.slice(0, 3).map(p => {
                  const cartCount = cart.find(item => item.product.id === p.id)?.quantity || 0;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setScreen('product_detail');
                      }}
                      className="bg-white rounded-2xl border border-primary/5 p-3 flex gap-3 shadow-sm hover:translate-x-1 transition-all cursor-pointer relative"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary text-primary shrink-0 relative flex items-center justify-center font-black text-lg uppercase select-none">
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          p.name.substring(0, 2)
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-neutral truncate pr-2">{p.name}</h4>
                            <span className="text-[9px] font-black text-rose-700 uppercase">{p.category}</span>
                          </div>
                          <p className="text-[10px] text-neutral/50 font-light truncate mt-0.5">{p.description}</p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-black text-[#8B261D]">{formatPrice(p.price)}</span>
                          <div onClick={e => e.stopPropagation()}>
                            {p.isAvailable ? (
                              cartCount === 0 ? (
                                <button 
                                  onClick={() => addToCart(p, 1)}
                                  className="px-3 py-1 bg-[#8B261D] text-white text-[10px] font-black rounded-lg hover:bg-neutral transition active:scale-90"
                                >
                                  + Tambah
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5 bg-primary rounded-lg text-white p-0.5">
                                  <button onClick={() => updateCartQty(p.id, -1)} className="w-4 h-4 flex items-center justify-center text-xs font-bold">-</button>
                                  <span className="text-[10px] font-bold px-0.5">{cartCount}</span>
                                  <button onClick={() => addToCart(p, 1)} className="w-4 h-4 flex items-center justify-center text-xs font-bold">+</button>
                                </div>
                              )
                            ) : (
                              <span className="text-[9px] font-bold text-neutral/40">Habis</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- CUSTOMER MENU CATALOG SCREEN (THE DESIRED DETACHED TAB VIEW!) --- */}
        {screen === 'menu' && (
          <div className="flex flex-col gap-4 animate-fade-in animate-once">
            {/* Search Input Bar (Fitur Cari ada) */}
            <div className="flex gap-2 font-sans">
              <div className="flex-1 bg-white border border-primary/10 rounded-xl px-3 py-2.5 flex items-center gap-2.5 shadow-sm">
                <Search className="w-4 h-4 text-neutral/40" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari Tinutuan, Mie Cakalang, Perkedel, Es Brenebon..."
                  className="flex-1 bg-transparent border-none text-xs text-neutral focus:outline-none placeholder:text-neutral/40"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] text-neutral-400 hover:text-neutral-600 font-bold px-1"
                  >
                    Reset
                  </button>
                )}
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className="p-2.5 bg-white border border-primary/10 rounded-xl text-primary font-bold hover:bg-primary/5 active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* High fidelity Categorization Filter buttons (Kategori lengkap) */}
            <div className="font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral/50 mb-2">Pilih Kategori Hidangan</h3>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {(['Semua', 'Makanan', 'Minuman', 'Gorengan & Snack'] as const).map(cat => {
                  const isActive = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-[10.5px] font-extrabold shadow-sm transition-all duration-150 cursor-pointer whitespace-nowrap ${
                        isActive 
                          ? 'bg-primary text-secondary ring-2 ring-primary/20 scale-[1.02]' 
                          : 'bg-white text-neutral/80 border border-primary/5 hover:bg-primary/5'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Catalogue Grid (Lists foods and drinks fully and functioning) */}
            <div className="grid grid-cols-2 gap-3 pb-12 font-sans">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12 flex flex-col items-center gap-2 text-neutral/50 bg-white/50 rounded-2xl p-6 border-dashed border border-primary/10">
                  <span className="text-3xl">🍲</span>
                  <p className="text-xs font-black">Menu tidak ditemukan atau stok habis.</p>
                  <p className="text-[10px] text-neutral-400">Silahkan cari kata kunci hidangan Manado lainnya.</p>
                </div>
              ) : (
                filteredProducts.map(p => {
                  const cartCount = cart.find(item => item.product.id === p.id)?.quantity || 0;
                  return (
                    <div 
                      key={p.id}
                      className="bg-white rounded-2xl border border-primary/5 overflow-hidden flex flex-col shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer relative"
                      onClick={() => {
                        setSelectedProduct(p);
                        setScreen('product_detail');
                      }}
                    >
                      {/* Product Availability Overlay */}
                      {!p.isAvailable && (
                        <div className="absolute inset-0 bg-neutral/80 backdrop-blur-[1px] z-10 flex flex-col justify-center items-center text-center p-3 text-white">
                          <span className="text-lg">🚫</span>
                          <span className="text-[9px] font-black uppercase mt-1 tracking-widest text-[#E9B44C]">Stok Habis</span>
                        </div>
                      )}

                      <div className="h-28 bg-secondary text-primary w-full relative flex items-center justify-center font-black text-2xl uppercase select-none">
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          p.name.substring(0, 2)
                        )}
                        <span className="absolute top-2 left-2 bg-primary text-secondary px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide shadow-sm">
                          {p.category}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(p.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 shadow hover:bg-white active:scale-90 transition z-20 flex items-center justify-center cursor-pointer"
                        >
                          <Heart className={`w-3 h-3 ${favorites.includes(p.id) ? 'fill-rose-500 text-rose-500' : 'text-neutral/40'}`} />
                        </button>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <h4 className="text-[11px] font-bold text-neutral leading-tight line-clamp-1">{p.name}</h4>
                          <span className="text-[11px] font-black text-primary mt-0.5">{formatPrice(p.price)}</span>
                        </div>

                        {/* Order action trigger */}
                        <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1 bg-[#8B261D]/5 px-1.5 py-0.5 rounded text-[8.5px] font-bold text-primary">
                            <Star className="w-2.5 h-2.5 fill-[#E9B44C] stroke-[#E9B44C]" />
                            <span>4.8</span>
                          </div>

                          {p.isAvailable && (
                            cartCount === 0 ? (
                              <button 
                                onClick={() => addToCart(p, 1)}
                                className="px-2.5 py-1 bg-[#8B261D] text-white text-[9.5px] font-black rounded-lg hover:bg-neutral transition active:scale-90"
                              >
                                + Tambah
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 bg-primary rounded-lg text-white p-0.5">
                                <button onClick={() => updateCartQty(p.id, -1)} className="w-4.5 h-4.5 flex items-center justify-center text-xs font-bold">-</button>
                                <span className="text-[9px] font-bold px-0.5">{cartCount}</span>
                                <button onClick={() => addToCart(p, 1)} className="w-4.5 h-4.5 flex items-center justify-center text-xs font-bold">+</button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* --- FAVORITE SCREEN --- */}
        {screen === 'favorites' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-neutral uppercase mb-1">Menu Favorit Anda ❤️</h3>

            {favorites.length === 0 ? (
              <div className="text-center py-16 flex flex-col justify-center items-center gap-3 text-neutral/50 bg-white rounded-2xl p-6 border border-primary/5 shadow-sm">
                <span className="text-5xl">❤️</span>
                <p className="font-bold text-sm">Belum ada menu favorit</p>
                <p className="text-xs text-center">Ketuk ikon hati pada hidangan Kios Josh untuk menandainya sebagai menu favorit Anda.</p>
                <button 
                  onClick={() => setScreen('home')}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl mt-2 active:scale-95 transition cursor-pointer"
                >
                  Cari Hidangan Lezat
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-8 font-sans">
                {products
                  .filter(p => favorites.includes(p.id))
                  .map(p => {
                    const cartCount = cart.find(item => item.product.id === p.id)?.quantity || 0;
                    return (
                      <div 
                        key={p.id}
                        className="bg-white rounded-2xl border border-primary/5 overflow-hidden flex flex-col shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer relative"
                        onClick={() => {
                          setSelectedProduct(p);
                          setScreen('product_detail');
                        }}
                      >
                        {/* Status Overlay */}
                        {!p.isAvailable && (
                          <div className="absolute inset-0 bg-neutral/80 backdrop-blur-[1px] z-10 flex flex-col justify-center items-center text-center p-3 text-white">
                            <span className="text-lg">🚫</span>
                            <span className="text-[10px] font-black uppercase mt-1 tracking-widest text-[#E9B44C]">Stok Habis</span>
                          </div>
                        )}

                        <div className="h-28 bg-secondary text-primary w-full relative flex items-center justify-center font-black text-2xl uppercase select-none">
                          {p.imageUrl ? (
                            <img 
                              src={p.imageUrl} 
                              alt={p.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            p.name.substring(0, 2)
                          )}
                          <span className="absolute top-2 left-2 bg-white/95 px-1.5 py-0.5 rounded text-[8px] font-black text-[#8B261D] uppercase tracking-wide shadow-sm">
                            {p.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(p.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 shadow z-20 flex items-center justify-center cursor-pointer"
                            title="Hapus dari Favorit"
                          >
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          </button>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-xs font-bold text-neutral truncate leading-tight">{p.name}</h4>
                            <span className="text-xs font-black text-primary block mt-0.5">{formatPrice(p.price)}</span>
                          </div>

                          <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5 bg-[#8B261D]/5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold text-primary">
                              <Star className="w-2.5 h-2.5 fill-[#E9B44C] stroke-[#E9B44C]" />
                              <span>4.8</span>
                            </div>

                            {p.isAvailable && (
                              cartCount === 0 ? (
                                <button 
                                  onClick={() => addToCart(p, 1)}
                                  className="px-3 py-1 bg-[#8B261D] text-white text-[10px] font-black rounded-lg hover:bg-red-800 transition active:scale-90"
                                >
                                  + Tambah
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5 bg-primary rounded-lg text-white p-0.5">
                                  <button 
                                    onClick={() => updateCartQty(p.id, -1)}
                                    className="w-5 h-5 flex items-center justify-center text-xs font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="text-[10px] font-bold px-1">{cartCount}</span>
                                  <button 
                                    onClick={() => addToCart(p, 1)}
                                    className="w-5 h-5 flex items-center justify-center text-xs font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* --- PRODUCT DETAIL SCREEN --- */}
        {screen === 'product_detail' && selectedProduct && (
          <div className="flex flex-col gap-4 pb-12">
            <button 
              onClick={() => setScreen('home')}
              className="self-start flex items-center gap-1 text-xs text-primary font-bold hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Menu
            </button>

            <div className="bg-white rounded-2xl overflow-hidden border border-primary/5 shadow">
              <div className="h-48 relative bg-secondary text-primary flex items-center justify-center font-black text-4xl uppercase select-none">
                {selectedProduct.imageUrl ? (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  selectedProduct.name.substring(0, 2)
                )}
                {!selectedProduct.isAvailable && (
                  <span className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold text-base uppercase">STOK HABIS SEMENTARA</span>
                )}
                <button
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/95 shadow hover:bg-white active:scale-95 transition z-20 flex items-center justify-center cursor-pointer"
                  title="Favorit"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedProduct.id) ? 'fill-rose-500 text-rose-500' : 'text-neutral/40'}`} />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start border-b border-primary/5 pb-3">
                  <div>
                    <span className="px-2 py-0.5 bg-secondary/10 text-primary border border-primary/5 text-[9px] font-bold rounded uppercase">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-base font-black text-neutral mt-1">{selectedProduct.name}</h3>
                  </div>
                  <span className="text-base font-black text-primary">{formatPrice(selectedProduct.price)}</span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-neutral/70 uppercase tracking-wide mb-1">Deskripsi Kuliner:</h4>
                  <p className="text-xs text-neutral/80 leading-relaxed font-light">{selectedProduct.description}</p>
                </div>

                {/* Additional custom notes input requested by user */}
                <div className="border-t border-primary/5 pt-3">
                  <h4 className="text-xs font-extrabold text-neutral/70 uppercase tracking-wide mb-1.5 flex justify-between">
                    <span>Catatan Khusus Pesanan:</span>
                    <span className="text-[10px] text-primary/60 lowercase italic font-normal">opsional</span>
                  </h4>
                  <textarea 
                    value={extraCustomization}
                    onChange={e => setExtraCustomization(e.target.value)}
                    placeholder="Contoh: Tanpa sayur kangkung, ubi potong kecil, telur direbus matang..."
                    rows={3}
                    className="w-full bg-[#F9F4E8]/40 border border-primary/10 rounded-xl p-3 text-xs focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {selectedProduct.isAvailable ? (
              <div className="flex flex-col gap-2.5 mt-4">
                <button 
                  id="add-to-cart-btn"
                  onClick={() => {
                    addToCart(selectedProduct, 1);
                    setScreen('home');
                    alert(`Makanan ${selectedProduct.name} dimasukkan ke keranjang!`);
                  }}
                  className="w-full py-3 bg-[#E9B44C] hover:bg-amber-500 text-primary font-bold rounded-xl active:scale-95 transition shadow text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🛒 Masukkan Keranjang</span>
                  <span>•</span>
                  <span>{formatPrice(selectedProduct.price)}</span>
                </button>

                <button 
                  id="buy-now-btn"
                  onClick={() => {
                    addToCart(selectedProduct, 1);
                    setScreen('cart');
                  }}
                  className="w-full py-3.5 bg-primary hover:bg-red-800 text-white font-extrabold rounded-xl active:scale-95 transition shadow text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⚡ Beli & Pesan Sekarang (Langsung Bayar)</span>
                </button>
              </div>
            ) : (
              <div className="w-full py-3.5 bg-neutral/15 text-neutral-500 font-bold rounded-xl text-center text-sm">
                Maaf, Kuliner ini Sedang Habis
              </div>
            )}
          </div>
        )}

        {/* --- CART SCREEN --- */}
        {screen === 'cart' && (
          <div className="flex flex-col gap-4 pb-12 flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-black text-neutral uppercase">Keranjang Anda</h3>
              <button 
                onClick={clearCart}
                className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Bersihkan
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-16 gap-3 text-neutral/50 bg-white rounded-2xl p-6 border border-primary/5 shadow-sm">
                <span className="text-5xl">🛒</span>
                <p className="font-bold text-sm">Keranjang belanja kosong</p>
                <p className="text-xs text-center">Silahkan ketuk menu di bagian Beranda untuk memesan hidangan favorit.</p>
                <button 
                  onClick={() => setScreen('home')}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl mt-2 active:scale-95 transition cursor-pointer"
                >
                  Pilih Kuliner Kios Josh
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 flex-1">
                {/* Cart Rows mapping */}
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div 
                      key={item.product.id}
                      className="bg-white rounded-xl border border-primary/5 p-3 flex gap-3 shadow-sm"
                    >
                      <div className="w-14 h-14 bg-secondary text-primary rounded-lg overflow-hidden shrink-0 flex items-center justify-center font-black text-lg uppercase select-none">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          item.product.name.substring(0, 2)
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-neutral truncate">{item.product.name}</h4>
                          <span className="text-xs font-black text-[#8B261D] shrink-0">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        {item.notes && (
                          <span className="text-[9px] text-[#8B261D]/75 italic mt-0.5 truncate bg-[#8B261D]/5 px-1.5 py-0.5 rounded">
                            Catatan: {item.notes}
                          </span>
                        )}

                        <div className="flex justify-between items-center mt-2.5">
                          <span className="text-[10px] text-neutral/50 font-mono">{formatPrice(item.product.price)} pcs</span>
                          
                          <div className="flex items-center gap-2 border border-primary/15 rounded-lg p-0.5 bg-[#F9F4E8]/40">
                            <button 
                              onClick={() => updateCartQty(item.product.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-neutral text-xs font-bold hover:bg-primary/5 rounded"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-[#8B261D] px-1">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQty(item.product.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-neutral text-xs font-bold hover:bg-primary/5 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pilihan Pengantaran Singkat (To keep checkout totals perfectly consistent with Cart) */}
                <div className="bg-white rounded-xl border border-primary/5 p-3 flex flex-col gap-2 shadow-sm">
                  <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest block mb-0.5">Metode Terima Hidangan</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setDeliveryOption('delivery')}
                      className={`py-2 px-2 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${deliveryOption === 'delivery' ? 'bg-[#8B261D]/5 border-primary text-primary' : 'bg-primary/5 border-transparent text-primary'}`}
                    >
                      🛵 Kirim Kurir
                    </button>
                    <button 
                      onClick={() => setDeliveryOption('pickup')}
                      className={`py-2 px-2 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${deliveryOption === 'pickup' ? 'bg-[#8B261D]/5 border-primary text-primary' : 'bg-primary/5 border-transparent text-primary'}`}
                    >
                      🏬 Ambil Sendiri
                    </button>
                  </div>

                  {deliveryOption === 'delivery' && (
                    <div className="grid grid-cols-2 gap-2 mt-1 pt-1.5 border-t border-dashed border-primary/10">
                      <button 
                        onClick={() => setDeliverySpeed('standard')}
                        className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-bold transition cursor-pointer border ${deliverySpeed === 'standard' ? 'bg-primary text-white border-primary' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}
                      >
                        Standard (Rp 10rb)
                      </button>
                      <button 
                        onClick={() => setDeliverySpeed('express')}
                        className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-bold transition cursor-pointer border ${deliverySpeed === 'express' ? 'bg-primary text-white border-primary' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}
                      >
                        Express ⚡ (Rp 20rb)
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtotal Card block */}
                <div className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-2.5">
                  <div className="flex justify-between text-xs text-neutral/75">
                    <span>Subtotal Kuliner</span>
                    <span className="font-semibold text-neutral">{formatPrice(cartSubtotal)}</span>
                  </div>

                  {deliveryOption === 'delivery' && (
                    <div className="flex justify-between text-xs text-neutral/75">
                      <span>Ongkos Kirim ({deliverySpeed === 'standard' ? 'Standard' : 'Express⚡'})</span>
                      <span className="font-semibold text-neutral">{formatPrice(deliveryCostForSpeed)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-neutral/75">
                    <span>Biaya Platform/Aplikasi</span>
                    <span className="font-semibold text-neutral">{formatPrice(platformFee)}</span>
                  </div>

                  <div className="border-t border-primary/5 pt-2.5 mt-1 flex justify-between text-sm font-black text-primary">
                    <span>Total Pembayaran</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <button 
                    onClick={() => {
                      setScreen('checkout');
                    }}
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl active:scale-95 transition shadow hover:bg-red-800 text-sm flex justify-between items-center px-4 cursor-pointer align-center justify-center gap-2"
                  >
                    <span>Lanjut ke Formulir Checkout</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- CHECKOUT CONFIRMATION SCREEN --- */}
        {screen === 'checkout' && (
          <div className="flex flex-col gap-4 pb-12">
            <button 
              onClick={() => setScreen('cart')}
              className="self-start flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Keranjang
            </button>

            {/* CARD 1: RECIPIENT DETAILS (Interactive & Editable) */}
            <div className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-3">
              <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest block">Detail Penerima (Bisa Diedit)</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-neutral/60">Nama Penerima</label>
                  <input 
                    type="text" 
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shrink-0 font-medium"
                    placeholder="Nama lengkap..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-neutral/60">No. HP / WhatsApp</label>
                  <input 
                    type="text" 
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shrink-0 font-medium font-mono"
                    placeholder="No HP aktif..."
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: DELIVERY OPTIONS & SERVICE SELECTION */}
            <div className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest block">Opsi Layanan Pengiriman</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setDeliveryOption('delivery')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${deliveryOption === 'delivery' ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}
                  >
                    Kirim Kurir
                  </button>
                  <button 
                    onClick={() => setDeliveryOption('pickup')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${deliveryOption === 'pickup' ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}
                  >
                    Ambil Sendiri
                  </button>
                </div>
              </div>

              {deliveryOption === 'delivery' ? (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 mb-1 bg-[#8B261D]/5 p-2 rounded-lg border border-primary/5">
                      <MapPin className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                      <span className="text-xs font-black text-primary">Tujuan Alamat Rumah / Kos</span>
                    </div>
                    <textarea
                      id="text_area_delivery_address"
                      rows={3}
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      className="w-full text-xs text-neutral p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium resize-none shadow-inner"
                      placeholder="Masukkan alamat lengkap (Kosan, jalan, nomor kamar, patokan)..."
                    />
                  </div>

                  {/* Maps trigger */}
                  <button 
                    onClick={() => setShowMapsSim(true)}
                    className="w-full py-2.5 bg-[#E9B44C]/25 hover:bg-[#E9B44C]/35 text-amber-900 font-extrabold rounded-lg text-[10px] transition flex items-center justify-center gap-2 border border-[#E9B44C]/30 uppercase tracking-wider cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Pilih Titik Maps Kios Josh ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 bg-[#8B261D]/5 p-3.5 rounded-xl border border-[#8B261D]/10">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div className="text-xs text-primary/95">
                    <strong className="block font-bold">Ambil di Kios Josh</strong>
                    Kios Josh, Jl. Raya Politeknik, Buha, Kec. Mapanget, Manado, Sulawesi Utara. Makanan siap dalam 15-20 menit.
                  </div>
                </div>
              )}
            </div>

            {/* CARD 3: ORDER ITEMS LIST */}
            <div className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-2.5">
              <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest block">Rincian Kuliner Dipesan</span>
              <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between border-b border-neutral-100 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-secondary text-primary rounded-xl shrink-0 flex items-center justify-center font-black text-[#8B261D] text-xs uppercase border border-primary/5 shadow-sm overflow-hidden select-none">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          item.product.name.substring(0, 2)
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-neutral block truncate max-w-[150px]">{item.product.name}</span>
                        {item.notes && (
                          <span className="text-[9.5px] text-primary italic block truncate max-w-[150px] font-medium">✨ {item.notes}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-neutral/55 block">{item.quantity}x</span>
                      <span className="text-xs font-black text-primary font-mono">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: DELIVERY SPEED SELECTOR */}
            {deliveryOption === 'delivery' && (
              <div className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-2.5">
                <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest block">Metode Durasi Pengiriman</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliverySpeed('standard')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      deliverySpeed === 'standard' 
                        ? 'border-primary bg-[#8B261D]/5 text-primary' 
                        : 'border-primary/10 hover:bg-primary/5 text-neutral'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold block uppercase">Standard</span>
                    <span className="text-[9px] text-neutral/60 mb-1 leading-tight">30-45 Menit</span>
                    <span className="text-xs font-black">Rp 10.000</span>
                  </button>
                  <button
                    onClick={() => setDeliverySpeed('express')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      deliverySpeed === 'express' 
                        ? 'border-primary bg-[#8B261D]/5 text-primary' 
                        : 'border-primary/10 hover:bg-primary/5 text-neutral'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold block uppercase">Express⚡</span>
                    <span className="text-[9px] text-neutral/60 mb-1 leading-tight">15-20 Menit</span>
                    <span className="text-xs font-black">Rp 20.000</span>
                  </button>
                </div>
              </div>
            )}

            {/* CARD 5: PAYMENT OPTION */}
            <div className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-2.5">
              <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest block">Pilih Metode Pembayaran</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'cash' 
                      ? 'border-primary bg-[#8B261D]/5 text-primary' 
                      : 'border-primary/10 hover:bg-primary/5 text-neutral'
                  }`}
                >
                  <span className="text-lg">💵</span>
                  <div>
                    <span className="text-[10px] font-bold block uppercase">COD / Tunai</span>
                    <span className="text-[9px] text-neutral-500 font-light block">Bayar di Tempat</span>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'qris' 
                      ? 'border-primary bg-[#8B261D]/5 text-primary' 
                      : 'border-primary/10 hover:bg-primary/5 text-neutral'
                  }`}
                >
                  <span className="text-lg">📱</span>
                  <div>
                    <span className="text-[10px] font-bold block uppercase">QRIS Digital</span>
                    <span className="text-[9px] text-neutral-500 font-light block">Scan Instan</span>
                  </div>
                </button>
              </div>
            </div>

            {/* CARD 6: FINAL INVOICE BREAKDOWN */}
            <div className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-2">
              <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest block mb-1">Rincian Pembayaran</span>
              <div className="flex justify-between text-xs text-neutral/70">
                <span>Total Kuliner ({cart.reduce((sum, item) => sum + item.quantity, 0)} Porsi)</span>
                <span className="font-semibold">{formatPrice(cartSubtotal)}</span>
              </div>
              {deliveryOption === 'delivery' && (
                <div className="flex justify-between text-xs text-neutral/70">
                  <span>Ongkos Kirim ({deliverySpeed === 'standard' ? 'Standard' : 'Express⚡'})</span>
                  <span className="font-semibold">{formatPrice(deliveryCostForSpeed)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-neutral/70">
                <span>Biaya Layanan Sistem</span>
                <span className="font-semibold">{formatPrice(platformFee)}</span>
              </div>
              <div className="border-t border-primary/5 pt-2 mt-1.5 flex justify-between text-sm font-black text-primary">
                <span>Total Pembayaran</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrderSubmit}
              className="w-full py-4 bg-primary text-white font-extrabold uppercase rounded-xl active:scale-95 transition mt-4 shadow hover:bg-red-800 text-sm tracking-wide cursor-pointer text-center"
            >
              Ulas & Buat Pesanan Sekarang ✓
            </button>
          </div>
        )}

        {/* --- GOOGLE MAPS PIN DROP REPLICA (MODAL/SCREEN ACCESSIBLE ON DEMAND) --- */}
        {showMapsSim && (
          <div className="fixed inset-0 bg-neutral/65 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[360px] rounded-3xl overflow-hidden border border-primary/10 shadow-2xl flex flex-col">
              <div className="bg-primary text-white p-4 font-bold text-center relative">
                <h4 className="text-xs tracking-wider uppercase">Figma Google Maps Selector</h4>
                <p className="text-[9px] text-white/70 font-light">Pilih titik kos/rumah Anda di sekitar Politeknik Manado</p>
              </div>

              {/* Fake Interactive Google Map Grid */}
              <div className="h-56 bg-neutral-100 relative flex flex-col justify-between p-3" style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/124.9014,-1.4552,14.5,0/360x224?access_token=none')", backgroundSize: 'cover' }}>
                {/* Fallback pattern in case Mapbox rejects mock auth: make a stylized CSS city map layout */}
                <div className="absolute inset-0 bg-amber-50/90 flex flex-col justify-between p-4 relative overflow-hidden">
                  {/* Decorative roads */}
                  <div className="absolute top-1/3 inset-x-0 h-4 bg-white shadow-inner rotate-[5deg]" />
                  <div className="absolute left-1/2 inset-y-0 w-4 bg-white shadow-inner" />
                  <div className="absolute top-10 left-10 w-16 h-10 bg-emerald-100 rounded-lg opacity-80 border border-emerald-300 flex items-center justify-center text-[8px] font-bold text-emerald-800">Kampus Politeknik</div>
                  
                  {/* Drop Pin Icon in center of the phone viewport */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-3xl animate-bounce">📍</span>
                    <span className="bg-primary text-white text-[9.5px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">Kosan/Lokasi Anda</span>
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <span className="text-[9px] text-neutral/50 font-bold uppercase tracking-wider">Rekomendasi Terdekat:</span>
                <div className="flex flex-col gap-2">
                  {manadoLocs.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setTempAddress(loc)}
                      className={`text-left p-2.5 rounded-xl text-xs transition-all ${
                        tempAddress === loc 
                          ? 'bg-secondary/25 border-primary text-primary font-bold' 
                          : 'bg-neutral/5 hover:bg-primary/5 text-neutral'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button 
                    onClick={() => setShowMapsSim(false)}
                    className="flex-1 py-2.5 bg-neutral/10 hover:bg-neutral/20 text-neutral font-bold rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      setShowMapsSim(false);
                    }}
                    className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-red-800"
                  >
                    Konfirmasi Lokasi Alamat ✓
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 8. QRIS SIMULATOR SCREEN --- */}
        {screen === 'payment' && latestOrder && (
          <div className="flex flex-col gap-4 pb-12 align-center text-center">
            <h3 className="text-sm font-black text-primary uppercase">Scan QRIS Kios Josh</h3>
            <p className="text-xs text-neutral/70 px-4">Pembayaran digital instan otomatis aman.</p>

            <div className="bg-white rounded-2xl border border-primary/5 p-6 shadow-md flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-sm font-black text-rose-800">GPN</span>
                <span className="text-sm font-black text-[#8B261D]">•</span>
                <span className="text-sm font-black text-blue-900">QRIS</span>
              </div>

              {/* High Fidelity QR Replica */}
              <div className="w-48 h-48 bg-white border-2 border-primary/10 rounded-xl p-2.5 shadow-inner flex flex-col justify-center items-center relative">
                <div className="w-full h-full bg-neutral-900 text-white font-mono text-[9px] flex flex-wrap justify-between items-center overflow-hidden opacity-90 rounded">
                  {/* Generate pseudo QR grid */}
                  {Array.from({ length: 144 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3.5 h-3.5 ${
                        (i % 3 === 0 && i % 4 === 0) || 
                        (i < 8 && i % 2 === 0) || 
                        (i > 120 && i % 3 === 1) || 
                        i === 35 || i === 76 || i === 99
                          ? 'bg-neutral-900' 
                          : 'bg-white'
                      }`} 
                    />
                  ))}
                </div>
                {/* Center logo */}
                <div className="absolute bg-white p-1 rounded border border-primary/10 shadow-sm text-[8px] font-black text-primary">
                  KJ
                </div>
              </div>

              <div className="w-full border-t border-primary/5 pt-4">
                <span className="text-[10px] text-neutral/45 block">TOTAL PEMBAYARAN</span>
                <span className="text-lg font-black text-[#8B261D] text-center block mt-1">{formatPrice(latestOrder.total)}</span>
              </div>
            </div>

            <div className="bg-[#8B261D]/5 p-3.5 rounded-xl border border-[#8B261D]/10 flex flex-col gap-1 text-center">
              <span className="text-[10px] font-bold text-primary flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                MENUNGGU PEMBAYARAN DIGITAL ANDA...
              </span>
              <p className="text-[9px] text-primary/70 font-light leading-relaxed">System mensimulasi verifikasi QRIS otomatis dalam 3 detik.</p>
            </div>

            <button 
              onClick={() => {
                setScreen('success');
              }}
              className="w-full py-3 bg-secondary text-primary font-bold rounded-xl active:scale-95 transition text-xs shadow cursor-pointer border border-[#E9B44C]"
            >
              Simulasikan Bayar Berhasil ✓
            </button>
          </div>
        )}

        {/* --- 9. ORDER SUCCESS / RECEIPT SCREEN --- */}
        {screen === 'success' && latestOrder && (
          <div className="flex flex-col gap-4 pb-12">
            <div className="text-center py-4 flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-primary text-3xl shadow-lg border-2 border-white animate-bounce">
                ✓
              </div>
              <h3 className="text-base font-black text-primary uppercase">Pembayaran Berhasil!</h3>
              <p className="text-xs text-neutral/75 px-4">Pesanan Anda telah disinkronkan ke tablet dapur Kios Josh.</p>
            </div>

            {/* High Fidelity Checkout Receipt (Struk Belanja) requested! */}
            <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-4 text-[11px] font-mono leading-relaxed flex flex-col gap-3 relative">
              {/* Receipt teeth decorative top */}
              <div className="absolute -top-1.5 inset-x-2 h-3 flex justify-between overflow-hidden opacity-30">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-[#F9F4E8] rotate-45 shrink-0" />
                ))}
              </div>

              <div className="text-center border-b border-neutral/10 pb-3 mt-1.5">
                <span className="font-extrabold text-xs block uppercase">KIOS JOSH MANADO</span>
                <span className="text-[9px] text-neutral-500 font-light block">Jl. Raya Politeknik, Buha, Mapanget</span>
                <span className="text-[9px] text-[#8B261D] block">KORESPONDEN DIGITAL OLEH KELOMPOK 1</span>
              </div>

              <div className="flex flex-col gap-1 border-b border-dashed border-neutral/10 pb-3">
                <div className="flex justify-between">
                  <span>No. Resi:</span>
                  <span className="font-bold">{latestOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nama Pelanggan:</span>
                  <span className="font-bold truncate max-w-[200px]">{latestOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu Kirim:</span>
                  <span>{new Date(latestOrder.createdAt).toLocaleTimeString()} WITA</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span className="uppercase font-bold">{latestOrder.paymentMethod} • {latestOrder.pickupOrDelivery}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-b border-dashed border-neutral/10 pb-3">
                <span className="font-bold uppercase tracking-wider block text-[10px]">DAFTAR BELANJA:</span>
                {latestOrder.items.map((item, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <div className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    {item.notes && (
                      <span className="text-[9.5px] text-primary italic pl-2">- Catatan: {item.notes}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-neutral-500">
                  <span>Ongkir Kurir:</span>
                  <span>{formatPrice(latestOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Sistem Aplikasi:</span>
                  <span>{formatPrice(2000)}</span>
                </div>
                <div className="flex justify-between font-black text-xs text-primary border-t border-dashed border-neutral/10 pt-2.5 mt-1.5">
                  <span>TOTAL BAYAR:</span>
                  <span>{formatPrice(latestOrder.total)}</span>
                </div>
              </div>

              <div className="text-center bg-[#F9F4E8]/60 p-2.5 rounded text-[8.5px] text-neutral-45 leading-normal mt-1 border border-primary/5">
                Matur Nuhun! Terima kasih telah membeli kuliner lokal Sulut. Dukung digitalisasi UMKM daerah.
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2 font-sans">
              <button 
                onClick={() => {
                  setScreen('tracking');
                }}
                className="w-full py-3.5 bg-primary hover:bg-[#721E16] text-white font-extrabold uppercase rounded-xl active:scale-95 transition shadow text-xs tracking-wide cursor-pointer"
              >
                Pantau Status Pengiriman 🛵
              </button>

              <div className="flex gap-2.5">
                <button 
                  onClick={() => {
                    setScreen('home');
                  }}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral font-extrabold uppercase rounded-xl active:scale-95 transition text-[10px]"
                >
                  Ke Beranda 🏠
                </button>
                <button 
                  onClick={() => {
                    alert("Nota Pembayaran Ref: " + latestOrder.id + " berhasil disimpan ke folder penyimpanan gawai Anda! 💾");
                  }}
                  className="flex-1 py-3 bg-[#E9B44C] hover:bg-[#d89721] text-primary font-extrabold uppercase rounded-xl active:scale-95 transition text-[10px]"
                >
                  Simpan Struk (PDF) 💾
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 10. REAL-TIME TRACKING NODES SCREEN --- */}
        {screen === 'tracking' && (
          <div className="flex flex-col gap-4 pb-12">
            <button 
              onClick={() => setScreen('profile_hub')}
              className="self-start flex items-center gap-1 text-[11px] text-primary font-bold hover:underline mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Akun
            </button>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-black text-neutral uppercase">Pelacakan Pesanan Anda</h3>
              <button 
                onClick={() => setScreen('home')}
                className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
              >
                Belanja Lagi
              </button>
            </div>

            {/* Identify latest user tracking state */}
            {(() => {
              const currentOrder = latestOrder || orders[orders.length - 1];
              if (!currentOrder) {
                return (
                  <div className="text-center py-12 bg-white rounded-2xl p-6 border text-neutral/50 text-xs">
                    Tidak ada pesanan aktif yang sedang dipantau.
                  </div>
                );
              }

              // Custom status nodes with accurate colors
              const steps = [
                { key: 'pending', label: 'Order Received / Pesanan Diterima', desc: 'Sistem Kios Josh mengonfirmasi pesanan Anda.', time: '09:30 AM' },
                { key: 'processing', label: 'Preparing Meal / Sedang Dimasak', desc: 'Dapur Kios Josh sedang memasak kuliner segar.', time: '09:35 AM' },
                { key: 'driver_assigned', label: 'Update to "Driver Assigned"', desc: 'Driver pengantar Anda memuat pesanan ke kendaraan.', time: '09:42 AM' },
                { key: 'selesai', label: 'Delivered / Sampai', desc: 'Pesanan mendarat hangat di genggaman Anda!', time: '09:50 AM' }
              ];

              const getStepIndex = (status: OrderStatus) => {
                if (status === 'pending') return 0;
                if (status === 'processing') return 1;
                // Treat driver_assigned separately or mapped
                if (status === 'selesai') return 3;
                return 1; // fallback
              };

              const currentIdx = getStepIndex(currentOrder.status);

              return (
                <div className="flex flex-col gap-4">
                  {/* Order summary tile */}
                  <div className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm flex flex-col gap-2 relative">
                    <span className="absolute top-4 right-4 bg-amber-400 text-primary font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                      {currentOrder.status === 'pending' ? 'Dapur Baru' : currentOrder.status === 'processing' ? 'Dimasak' : currentOrder.status === 'selesai' ? 'Selesai' : 'Batal'}
                    </span>
                    <span className="text-[10px] text-neutral/40 font-mono">RESI: {currentOrder.id}</span>
                    <h4 className="text-xs font-bold text-primary">{currentOrder.items[0]?.name} {currentOrder.items.length > 1 ? `+ ${currentOrder.items.length - 1} Menu` : ''}</h4>
                    <span className="text-xs font-black">{formatPrice(currentOrder.total)} • {currentOrder.paymentMethod.toUpperCase()}</span>
                  </div>

                  {/* Real-Time Polling Alert */}
                  <div className="flex items-center gap-2 bg-[#E9B44C]/10 border border-[#E9B44C]/30 rounded-xl p-3 text-xs text-primary font-sans">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <span>Sinkronisasi Status Real-time Dapur Aktif ✓</span>
                  </div>

                  {/* Timeline Nodes */}
                  <div className="bg-white rounded-2xl border border-primary/5 p-5 shadow-sm flex flex-col gap-5 relative">
                    {steps.map((s, idx) => {
                      const isCompleted = currentIdx >= idx && currentOrder.status !== 'dibatalkan';
                      const isCurrent = currentIdx === idx && currentOrder.status !== 'dibatalkan';

                      return (
                        <div key={idx} className="flex gap-4 relative">
                          {/* Left visual lines and connectors */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border font-sans ${
                              isCurrent 
                                ? 'bg-primary text-white border-primary ring-4 ring-primary/10' 
                                : isCompleted 
                                  ? 'bg-secondary text-primary border-secondary' 
                                  : 'bg-white text-neutral/30 border-neutral/20'
                            }`}>
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            {idx < steps.length - 1 && (
                              <div className={`w-0.5 h-10 mt-1 ${isCompleted ? 'bg-secondary' : 'bg-neutral/10'}`} />
                            )}
                          </div>

                          {/* Right descriptions */}
                          <div className="flex-1 mt-0.5">
                            <div className="flex justify-between items-center gap-2">
                              <h5 className={`text-xs font-extrabold ${isCompleted ? 'text-neutral' : 'text-neutral/40'}`}>{s.label}</h5>
                              <span className="text-[9px] text-neutral/40 font-mono">{s.time}</span>
                            </div>
                            <p className="text-[10px] text-neutral/50 font-light mt-0.5 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      );
                    })}

                    {currentOrder.status === 'dibatalkan' && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 text-xs text-red-800 font-bold mt-2">
                        <span>❌ Pesanan ini telah Dibatalkan oleh Admin. Silahkan hubungi pusat bantuan atau pesan kembali.</span>
                      </div>
                    )}
                  </div>

                  {/* Rating trigger if order is marked Selesai */}
                  {currentOrder.status === 'selesai' && !reviewSuccess && (
                    <div className="bg-[#E9B44C]/10 border border-[#E9B44C]/30 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Beri Rating & Ulasan Kuliner Star!</h4>
                      <p className="text-[10px] text-neutral/75 font-light">Bagaimana rasa Tinutuan dan hidangan Kios Josh yang baru Anda santap?</p>
                      
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            onClick={() => setRatingVal(star)}
                            className="text-lg focus:outline-none focus:scale-125 transition"
                          >
                            <Star className={`w-6 h-6 ${ratingVal >= star ? 'fill-amber-400 stroke-amber-400' : 'text-neutral/20'}`} />
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder="Ketik komentar: Rasanya sangat otentik Manado!..."
                          className="flex-1 px-3 py-2 bg-white border border-primary/10 rounded-xl text-xs focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            setReviewSuccess(true);
                            // Simulate upload
                          }}
                          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-red-800"
                        >
                          Kirim
                        </button>
                      </div>
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 text-center font-bold">
                      ⭐ Ulasan Terkirim! Terima kasih banyak atas dukungan Anda.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* --- CUSTOMER PROFILE DASHBOARD HUB --- */}
        {screen === 'profile_hub' && (
          <div className="flex flex-col gap-4 pb-12">
            <h3 className="text-sm font-black text-neutral uppercase mb-1">Profil & Layanan Pengguna</h3>

            {/* Profile Summary Card */}
            <div className="bg-white rounded-2xl border border-primary/5 p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-secondary font-black text-xs rounded-full flex items-center justify-center border-2 border-secondary shrink-0">
                {activeProfile.name ? activeProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'KJ'}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-extrabold text-neutral text-xs leading-tight truncate">{activeProfile.name || authName}</h4>
                <p className="text-[10px] text-neutral/50 font-mono mt-0.5">{activeProfile.phone || authPhone}</p>
                <div className="flex items-center gap-1 text-[10px] text-neutral/70 mt-1 truncate">
                  <MapPin className="w-3 h-3 text-secondary shrink-0" />
                  <span className="truncate">{activeProfile.address || tempAddress || 'Alamat belum diatur'}</span>
                </div>
              </div>
            </div>

            {/* Features Menu Options */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[10px] text-primary/60 uppercase font-black tracking-widest block">Fitur & Layanan</span>

              {/* Ubah Profil Option */}
              <button 
                onClick={() => setScreen('profile')}
                className="w-full bg-white hover:bg-primary/5 active:scale-[0.98] transition border border-primary/5 p-4 rounded-xl flex items-center justify-between text-left shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xl">👤</span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral">Ubah Profil Saya</h4>
                    <p className="text-[9.5px] text-neutral/50 font-light mt-0.5">Atur nama, email, nomor HP, dan lokasi pengiriman kos.</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral/40" />
              </button>

              {/* Pelacakan Pesanan Option */}
              <button 
                onClick={() => setScreen('tracking')}
                className="w-full bg-white hover:bg-primary/5 active:scale-[0.98] transition border border-primary/5 p-4 rounded-xl flex items-center justify-between text-left shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xl">🛵</span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral">Pelacakan Pesanan Aktif</h4>
                    <p className="text-[9.5px] text-neutral/50 font-light mt-0.5">Pantau estimasi waktu pengerjaan & pengantaran dapur live.</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral/40" />
              </button>

              {/* Riwayat Transaksi Option */}
              <button 
                onClick={() => setScreen('history')}
                className="w-full bg-white hover:bg-primary/5 active:scale-[0.98] transition border border-primary/5 p-4 rounded-xl flex items-center justify-between text-left shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xl">🧾</span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral">Riwayat Transaksi</h4>
                    <p className="text-[9.5px] text-neutral/50 font-light mt-0.5">Periksa struk nota belanja, daftar porsi makanan, dan total Pembayaran.</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral/40" />
              </button>

              {/* Keluar / Logout Option (Sempurna Menyelesaikan Issue #6) */}
              <button 
                id="btn_logout_action"
                onClick={() => {
                  setScreen('onboarding');
                  alert("Anda berhasil logout dari akun Kios Josh.");
                }}
                className="w-full bg-red-50 hover:bg-red-100/50 active:scale-[0.98] transition border border-red-100 p-4 rounded-xl flex items-center justify-between text-left shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xl">🚪</span>
                  <div>
                    <h4 className="text-xs font-bold text-red-600">Keluar dari Akun / Log Out</h4>
                    <p className="text-[9.5px] text-red-400 font-light mt-0.5">Keluar secara aman dan kembali ke menu pemilihan peran gawai.</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
            
            {/* Kampus Info */}
            <div className="text-center mt-6 text-[9.5px] text-neutral/40 font-mono">
              KIOS JOSH DIGITAL APP V2.5 • PNM 24
            </div>
          </div>
        )}

        {/* --- CUSTOMER PROFILE EDIT SCREEN --- */}
        {screen === 'profile' && (
          <div className="flex flex-col gap-4 pb-12">
            <button 
              onClick={() => setScreen('profile_hub')}
              className="self-start flex items-center gap-1 text-[11px] text-primary font-bold hover:underline mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Akun
            </button>
            <h3 className="text-sm font-black text-neutral uppercase mb-1">Pengaturan Profil Pengguna</h3>

            <div className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral/70 block mb-1">Nama Pengguna</label>
                <input 
                  type="text" 
                  value={authName} 
                  onChange={e => {
                    setAuthName(e.target.value);
                    onUpdateProfile({ ...activeProfile, name: e.target.value });
                  }}
                  className="w-full px-4 py-3 bg-[#F9F4E8]/40 border border-primary/10 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral/70 block mb-1">Email Pengguna</label>
                <input 
                  type="email" 
                  value={activeProfile.email || 'gracia@polimando.ac.id'} 
                  onChange={e => {
                    onUpdateProfile({ ...activeProfile, email: e.target.value });
                  }}
                  className="w-full px-4 py-3 bg-[#F9F4E8]/40 border border-primary/10 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral/70 block mb-1">Nomor Handphone Terdaftar</label>
                <input 
                  type="text" 
                  value={authPhone} 
                  onChange={e => {
                    setAuthPhone(e.target.value);
                    onUpdateProfile({ ...activeProfile, phone: e.target.value });
                  }}
                  className="w-full px-4 py-3 bg-[#F9F4E8]/40 border border-primary/10 rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral/70 block mb-1">Alamat Utama Rumah/Kos</label>
                <textarea 
                  value={tempAddress} 
                  onChange={e => {
                    setTempAddress(e.target.value);
                    onUpdateProfile({ ...activeProfile, address: e.target.value });
                  }}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F9F4E8]/40 border border-primary/10 rounded-xl text-xs focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                onUpdateProfile({
                  name: authName,
                  email: activeProfile.email || 'gracia@gmail.com',
                  phone: authPhone,
                  address: tempAddress
                });
                alert("Profil Kios Josh Anda Berhasil Diperbaharui.");
                setScreen('profile_hub');
              }}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl active:scale-95 transition mt-4 shadow hover:bg-red-800 text-xs cursor-pointer"
            >
              Simpan Profil Baru ✓
            </button>
          </div>
        )}

        {/* --- CUSTOMER ORDER HISTORY SCREEN --- */}
        {screen === 'history' && (
          <div className="flex flex-col gap-4 pb-12">
            <button 
              onClick={() => setScreen('profile_hub')}
              className="self-start flex items-center gap-1 text-[11px] text-primary font-bold hover:underline mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Akun
            </button>
            <h3 className="text-sm font-black text-neutral uppercase mb-1">Riwayat Pembelanjaan</h3>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl p-6 border text-neutral/50 text-xs">
                Belum ada transaksi pembelian terdokumentasi.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {[...orders].reverse().map(o => (
                  <div 
                    key={o.id}
                    className="bg-white rounded-xl border border-primary/5 p-4 shadow-sm flex flex-col gap-2.5 cursor-pointer hover:border-primary/20 transition-all"
                    onClick={() => {
                      setLatestOrder(o);
                      setScreen('success');
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-neutral/45 font-mono">{o.id}</span>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        o.status === 'selesai' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : o.status === 'processing' 
                            ? 'bg-amber-50 text-amber-800 animate-pulse' 
                            : o.status === 'dibatalkan'
                              ? 'bg-red-50 text-red-800'
                              : 'bg-primary/5 text-primary'
                      }`}>
                        {o.status === 'pending' ? 'Buka Dapur' : o.status === 'processing' ? 'Dimasak' : o.status === 'selesai' ? 'Selesai' : 'Batal'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-b border-primary/5 py-2">
                      <div>
                        <h4 className="text-xs font-bold text-neutral leading-tight">
                          {o.items[0]?.name} {o.items.length > 1 ? `+ ${o.items.length - 1} menu lainnya` : ''}
                        </h4>
                        <span className="text-[10px] text-neutral/50 block mt-0.5 font-sans">
                          {new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • porsi: {o.items.reduce((sum, i) => sum + i.quantity, 0)}
                        </span>
                      </div>
                      <span className="text-xs font-black text-primary">{formatPrice(o.total)}</span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-primary/75 font-bold uppercase">
                      <span>Metode: {o.paymentMethod.toUpperCase()}</span>
                      <span className="underline hover:text-primary">Lihat Struk / Nota Resi →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. BOTTOM NAVIGATION BAR FOR REGISTERED USERS */}
      {['home', 'menu', 'favorites', 'cart', 'profile_hub', 'profile', 'tracking', 'history', 'success'].includes(screen) && (
        <div className="h-16 bg-white border-t border-[#8B261D]/10 flex items-center justify-around text-center shrink-0 shadow-lg z-40">
          <button 
            onClick={() => setScreen('home')}
            className={`flex flex-col items-center gap-1 text-[10.5px] font-extrabold flex-1 py-1 cursor-pointer transition ${screen === 'home' ? 'text-primary scale-105' : 'text-neutral/40 hover:text-primary/70'}`}
          >
            <span className="text-lg">🏠</span>
            <span>Beranda</span>
          </button>
          
          <button 
            onClick={() => setScreen('menu')}
            className={`flex flex-col items-center gap-1 text-[10.5px] font-extrabold flex-1 py-1 cursor-pointer transition ${screen === 'menu' ? 'text-primary scale-105' : 'text-neutral/40 hover:text-primary/70'}`}
          >
            <span className="text-lg">📋</span>
            <span>Menu</span>
          </button>

          <button 
            onClick={() => setScreen('cart')}
            className={`flex flex-col items-center gap-1 text-[10.5px] font-extrabold flex-1 py-1 relative cursor-pointer transition ${screen === 'cart' ? 'text-primary scale-105' : 'text-neutral/40 hover:text-primary/70'}`}
          >
            <span className="text-lg">🛒</span>
            <span>Keranjang</span>
            {cart.length > 0 && (
              <span className="absolute top-0.5 right-6 bg-[#8B261D] text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          <button 
            onClick={() => setScreen('profile_hub')}
            className={`flex flex-col items-center gap-1 text-[10.5px] font-extrabold flex-1 py-1 cursor-pointer transition ${['profile_hub', 'profile', 'tracking', 'history'].includes(screen) ? 'text-primary scale-105' : 'text-neutral/40 hover:text-primary/70'}`}
          >
            <span className="text-lg">👤</span>
            <span>Profil</span>
          </button>
        </div>
      )}

      {/* Floating Success Toast Overlay */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-primary text-secondary text-xs font-black px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-secondary/20 min-w-[280px] justify-center animate-bounce transition-all">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
