import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Shield, Info, ArrowLeftRight, HelpCircle } from 'lucide-react';
import DeviceFrame from './components/DeviceFrame';
import CustomerApp from './components/CustomerApp';
import AdminApp from './components/AdminApp';
import { Product, Order, UserProfile, SalesReport, OrderStatus } from './types';

export default function App() {
  // Device mode choice on first load or header switcher
  // 'dual' (side-by-side desktop demo) | 'customer' (customer phone view) | 'admin' (admin phone view)
  const [viewMode, setViewMode] = useState<'dual' | 'customer' | 'admin'>('dual');
  
  // Data State managed by fetching APIs from Express Server
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile>({
    name: 'Gracia Ester Tendean',
    email: 'gracia@polimando.ac.id',
    phone: '08234146147',
    address: 'Jl. Raya Politeknik No. 45, Buha, Mapanget, Manado'
  });
  
  const [reports, setReports] = useState<SalesReport>({
    dailyRevenue: [],
    totalRevenue: 0,
    topProducts: []
  });

  const [isLoading, setIsLoading] = useState(true);

  // Sync state with mobile layout size (if actually loaded on a phone, force single active client)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode(prev => prev === 'dual' ? 'customer' : prev);
      }
    };
    handleResize(); // trigger initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // API Call Helpers
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to sync products', e);
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to sync orders', e);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setActiveProfile(data);
      }
    } catch (e) {
      console.error('Failed to sync profile', e);
    }
  };

  const refreshReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      console.error('Failed to sync reports', e);
    }
  };

  const initData = async () => {
    setIsLoading(true);
    await Promise.all([
      refreshProducts(),
      refreshOrders(),
      refreshProfile(),
      refreshReports()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  // Post new product menu
  const handleAddProduct = async (p: Partial<Product>): Promise<Product> => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    const newProd = await res.json();
    await refreshProducts();
    return newProd;
  };

  // Edit existing product menu
  const handleEditProduct = async (id: string, p: Partial<Product>): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    const updated = await res.json();
    await refreshProducts();
    return updated;
  };

  // Delete product
  const handleDeleteProduct = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    await refreshProducts();
    return res.ok;
  };

  // Placing New Orders (checkout)
  const handleCreateOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const newOrder = await res.json();
    await Promise.all([refreshOrders(), refreshReports()]);
    return newOrder;
  };

  // Changing Order Stasuses (admin processing / cancel / succeed)
  const handleUpdateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const updated = await res.json();
    await Promise.all([refreshOrders(), refreshReports()]);
    return updated;
  };

  const handleUpdateProfile = async (p: UserProfile) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveProfile(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#ece5d3] p-4 lg:p-6 flex flex-col gap-6 font-sans">
      
      {/* 1. APP HERO HEADER BRAND BAR */}
      <header className="max-w-7xl mx-auto w-full bg-white rounded-3xl p-5 shadow-sm border border-[#8B261D]/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-3xl font-extrabold shadow shadow-primary/30">
            KJ
          </div>
          <div>
            <h1 className="text-xl font-black text-primary leading-tight uppercase font-sans tracking-wide">
              Kios Josh • Sistem Pemesanan Makanan
            </h1>
            <p className="text-xs text-neutral/70 mt-0.5 font-light">
              Implementasi Digitalisasi UMKM Kuliner Sulut - Kelompok 1 (4 TI 6 Politeknik Negeri Manado)
            </p>
          </div>
        </div>

        {/* View mode toggle controllers */}
        <div className="flex bg-neutral/5 p-1 rounded-2xl border border-primary/5">
          <button 
            onClick={() => setViewMode('dual')}
            className={`hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
              viewMode === 'dual' 
                ? 'bg-primary text-white shadow' 
                : 'text-neutral/70 hover:text-primary'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Dual Screen Demo (Desktop)</span>
          </button>
          
          <button 
            onClick={() => setViewMode('customer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
              viewMode === 'customer' 
                ? 'bg-primary text-white shadow' 
                : 'text-neutral/70 hover:text-primary'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Customer App</span>
          </button>

          <button 
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
              viewMode === 'admin' 
                ? 'bg-primary text-white shadow' 
                : 'text-neutral/70 hover:text-primary'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Kasir</span>
          </button>
        </div>
      </header>

      {/* 2. REALTIME DEMO ANNOUNCEMENTS INFOBAR */}
      <div className="max-w-7xl mx-auto w-full bg-primary text-white rounded-2xl px-5 py-3.5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2.5 text-xs">
          <ArrowLeftRight className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
          <p className="font-light">
            <strong className="text-amber-300 font-bold uppercase">Uji Coba Ganda Nyata (Real-time Sync)</strong>: 
            Kirim pesanan dari HP Customer, maka tablet Admin di kanannya (atau di HP lain) akan langsung berdering menyambut order baru secara otomatis tanpa reload!
          </p>
        </div>
        <div className="text-[10px] bg-white/10 px-2.5 py-1 rounded font-mono border border-white/10 shrink-0 uppercase tracking-widest text-[#E9B44C]">
          Node / Express Backend Active ✓
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col justify-center items-center py-24 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-sm font-semibold text-primary font-mono select-none tracking-widest">MENYINGKRONKAN DATABASE KIOS...</span>
        </div>
      ) : (
        /* 3. SIMULATOR AREA HOUSING ACTIVE SCREENS */
        <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
          
          {/* A. DUAL SCREEN MODE (Side-by-side) */}
          {viewMode === 'dual' && (
            <div className="hidden lg:grid grid-cols-2 gap-8 items-center justify-center py-4 bg-white/20 p-8 rounded-[36px] border border-primary/5 shadow-inner">
              
              {/* Customer Device Simulator */}
              <div className="flex flex-col gap-3">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-primary">
                  📱 GAWAI PELANGGAN (KOSAN / RUMAH)
                </div>
                <DeviceFrame 
                  title="Gawai Pelanggan" 
                  role="customer" 
                  onSwitchRole={() => setViewMode('admin')}
                >
                  <CustomerApp 
                    products={products}
                    onRefreshProducts={refreshProducts}
                    orders={orders}
                    onCreateOrder={handleCreateOrder}
                    activeProfile={activeProfile}
                    onUpdateProfile={handleUpdateProfile}
                    onRoleChosen={(chosen) => setViewMode(chosen)}
                  />
                </DeviceFrame>
              </div>

              {/* Admin Phone Simulator */}
              <div className="flex flex-col gap-3">
                <div className="text-center font-bold text-xs uppercase tracking-wider text-primary">
                  🖥️ TABLET KASIR / DAPUR KIOS JOSH
                </div>
                <DeviceFrame 
                  title="Tablet Kasir" 
                  role="admin" 
                  onSwitchRole={() => setViewMode('customer')}
                >
                  <AdminApp 
                    products={products}
                    onRefreshProducts={refreshProducts}
                    onAddProduct={handleAddProduct}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                    orders={orders}
                    onRefreshOrders={refreshOrders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    activeProfile={activeProfile}
                    reports={reports}
                    onRefreshReports={refreshReports}
                  />
                </DeviceFrame>
              </div>

            </div>
          )}

          {/* B. SINGLE SCREEN: CUSTOMER SPECIAL VIEW */}
          {viewMode === 'customer' && (
            <div className="py-4 flex flex-col justify-center items-center">
              <DeviceFrame 
                title="Google Play Kios Josh" 
                role="customer"
                onSwitchRole={() => setViewMode('admin')}
              >
                <CustomerApp 
                  products={products}
                  onRefreshProducts={refreshProducts}
                  orders={orders}
                  onCreateOrder={handleCreateOrder}
                  activeProfile={activeProfile}
                  onUpdateProfile={handleUpdateProfile}
                  onRoleChosen={(chosen) => setViewMode(chosen)}
                />
              </DeviceFrame>
            </div>
          )}

          {/* C. SINGLE SCREEN: ADMIN SPECIAL VIEW */}
          {viewMode === 'admin' && (
            <div className="py-4 flex flex-col justify-center items-center">
              <DeviceFrame 
                title="Kios Josh Admin" 
                role="admin"
                onSwitchRole={() => setViewMode('customer')}
              >
                <AdminApp 
                  products={products}
                  onRefreshProducts={refreshProducts}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  orders={orders}
                  onRefreshOrders={refreshOrders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  activeProfile={activeProfile}
                  reports={reports}
                  onRefreshReports={refreshReports}
                />
              </DeviceFrame>
            </div>
          )}

        </main>
      )}

      {/* 4. FOOTER CREDITS */}
      <footer className="max-w-7xl mx-auto w-full text-center py-6 text-[10px] text-neutral/50 font-mono flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#8B261D]/10 mt-6">
        <div>
          Gracia Ester Tendean (24024146) • Michael Steve Mamengko (24024147) • Desvita Christi Kilis (24024148)
        </div>
        <div className="font-sans flex gap-4">
          <span>Politeknik Negeri Manado • Teknik Elektro</span>
          <span>© 2026</span>
        </div>
      </footer>

    </div>
  );
}
