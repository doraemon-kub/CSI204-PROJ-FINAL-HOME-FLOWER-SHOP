import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { io } from 'socket.io-client';
import Navbar from './component/Navbar';
import HeroBanner from './component/HeroBanner';
import HomeView from './component/HomeView';
import WireframeView from './component/WireframeView';
import Footer from './component/Footer';
import CartDrawer from './component/CartDrawer';
import AuthModal from './component/AuthModal';
import OrdersModal from './component/OrdersModal';
import CheckoutModal from './component/CheckoutModal';
import OrderTermsView from './component/OrderTermsView';
import ErrorBoundary from './component/ErrorBoundary';

const API_URL = '/api';

export default function App() {
  // Navigation View State
  const [view, setView] = useState('#home');

  // Modals & Drawers States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Authentication State — stored as JSON object in localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hf_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Shopping Cart State (synced with backend)
  const [cart, setCart] = useState([]);

  // Products State (fetched from API)
  const [products, setProducts] = useState([]);

  // Categorized Products
  const bestSellers = products.slice(0, 4);
  const driedFlowers = products.filter(p => p.category === 'ready-made');
  const artificialFlowers = products.filter(p => p.category === 'custom');
  const gifts = products.filter(p => p.category === 'gift');

  // --- Fetch Products from API ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`);
        const mappedProducts = response.data.map(p => ({
          ...p,
          img: p.image ? `http://localhost:3000/uploads/${p.image}` : '',
        }));
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
  }, []);

  // --- Fetch Cart & Setup WebSocket when User changes ---
  useEffect(() => {
    if (!user || !user.id) {
      setCart([]);
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await axios.get(`${API_URL}/cart/${user.id}`);
        const userCart = response.data;
        // Map backend cart items → frontend format (need product info)
        const mappedItems = await Promise.all(
          (userCart.items || []).map(async (item) => {
            try {
              const prodRes = await axios.get(`${API_URL}/products/${item.productId}`);
              const prod = prodRes.data;
              return {
                id: prod.id,
                name: prod.name,
                price: prod.price,
                img: prod.image ? `http://localhost:3000/uploads/${prod.image}` : '',
                quantity: item.quantity,
                cartItemId: item.cartItemId,
              };
            } catch {
              return {
                id: item.productId,
                name: 'สินค้า',
                price: 0,
                img: '',
                quantity: item.quantity,
                cartItemId: item.cartItemId,
              };
            }
          })
        );
        setCart(mappedItems);
      } catch (err) {
        console.error('Failed to fetch cart', err);
      }
    };

    fetchCart();

    // Setup Socket.IO for real-time updates
    const socket = io('http://localhost:3000');
    socket.emit('joinUserRoom', user.id);

    socket.on('cartUpdated', () => {
      fetchCart();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Sync Hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      setView(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      setView(window.location.hash);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hf_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hf_user');
    }
  }, [user]);

  // Body class toggle for wireframe mode
  useEffect(() => {
    const isWireframe = [
      '#dried-flowers', 
      '#artificial-flowers', 
      '#gifts', 
      '#order-terms',
      '#refund',
      '#faq'
    ].includes(view);
    if (isWireframe) {
      document.body.classList.add('wf-mode');
    } else {
      document.body.classList.remove('wf-mode');
    }
    
    if (view === '#best-sellers' || view === '#how-to-buy') {
      const targetId = view.substring(1);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [view]);

  // Handler for view changing
  const handleViewChange = (newView) => {
    if (newView.startsWith('#')) {
      if (newView === '#orders') {
        if (!user) {
          setIsAuthOpen(true);
          return;
        }
        setIsOrdersOpen(true);
      } else {
        window.location.hash = newView;
        setView(newView);
      }
    }
  };

  // Add to cart — requires login, calls API
  const handleAddToCart = async (product) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      await axios.post(`${API_URL}/cart/${user.id}/add`, {
        productId: product.id,
        quantity: 1,
      });
      // Re-fetch cart after adding
      const response = await axios.get(`${API_URL}/cart/${user.id}`);
      const userCart = response.data;
      const mappedItems = await Promise.all(
        (userCart.items || []).map(async (item) => {
          try {
            const prodRes = await axios.get(`${API_URL}/products/${item.productId}`);
            const prod = prodRes.data;
            return {
              id: prod.id,
              name: prod.name,
              price: prod.price,
              img: prod.image ? `http://localhost:3000/uploads/${prod.image}` : '',
              quantity: item.quantity,
              cartItemId: item.cartItemId,
            };
          } catch {
            return {
              id: item.productId,
              name: 'สินค้า',
              price: 0,
              img: '',
              quantity: item.quantity,
              cartItemId: item.cartItemId,
            };
          }
        })
      );
      setCart(mappedItems);
      
      // 💡 จุดที่แก้ไข: เอา setIsCartOpen(true) ออก เพื่อไม่ให้ตะกร้าเด้งเปิดขึ้นมาทุกครั้งหลังเพิ่มสินค้า
    } catch (err) {
      console.error('Failed to add to cart', err);
      alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
  };

  // Helper to re-fetch cart
  const refetchCart = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/cart/${user.id}`);
      const userCart = response.data;
      const mappedItems = await Promise.all(
        (userCart.items || []).map(async (item) => {
          try {
            const prodRes = await axios.get(`${API_URL}/products/${item.productId}`);
            const prod = prodRes.data;
            return {
              id: prod.id,
              name: prod.name,
              price: prod.price,
              img: prod.image ? `http://localhost:3000/uploads/${prod.image}` : '',
              quantity: item.quantity,
              cartItemId: item.cartItemId,
            };
          } catch {
            return {
              id: item.productId,
              name: 'สินค้า',
              price: 0,
              img: '',
              quantity: item.quantity,
              cartItemId: item.cartItemId,
            };
          }
        })
      );
      setCart(mappedItems);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  };

  const handleIncreaseQty = async (id) => {
    const item = cart.find(i => i.id === id);
    if (!item || !user) return;
    try {
      await axios.put(`${API_URL}/cart/${user.id}/update/${item.cartItemId}`, {
        quantity: item.quantity + 1,
      });
      await refetchCart();
    } catch (err) {
      console.error('Failed to increase qty', err);
    }
  };

  const handleDecreaseQty = async (id) => {
    const item = cart.find(i => i.id === id);
    if (!item || !user) return;
    
    // 💡 จุดที่แก้ไข: ถ้ามีสินค้าอยู่ 1 ชิ้นแล้วกดลบ จะ return ออกไปทันที ไม่มีการลบสินค้าทิ้ง
    if (item.quantity <= 1) {
      return;
    }
    
    try {
      await axios.put(`${API_URL}/cart/${user.id}/update/${item.cartItemId}`, {
        quantity: item.quantity - 1,
      });
      await refetchCart();
    } catch (err) {
      console.error('Failed to decrease qty', err);
    }
  };

  const handleRemoveItem = async (id) => {
    const item = cart.find(i => i.id === id);
    if (!item || !user) return;
    try {
      await axios.delete(`${API_URL}/cart/${user.id}/remove/${item.cartItemId}`);
      await refetchCart();
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
  };

  // Total items in cart for the badge count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ErrorBoundary>
    <>
      <Navbar 
        currentView={view}
        onViewChange={handleViewChange}
        cartCount={cartCount}
        onCartToggle={() => {
          if (!user) {
            setIsAuthOpen(true);
            return;
          }
          setIsCartOpen(true);
        }}
        onAuthToggle={() => setIsAuthOpen(true)}
        user={user ? user.email : null}
        onLogout={handleLogout}
      />

      {/* Show Hero banner on Home page */}
      {view === '#home' && <HeroBanner />}

      <main>
        {(view === '#home' || view === '#best-sellers' || view === '#how-to-buy') && (
          <HomeView 
            onViewChange={handleViewChange} 
            bestSellers={bestSellers} 
            onAddToCart={handleAddToCart}
          />
        )}

        {view === '#dried-flowers' && (
          <WireframeView 
            headerText="หน้าสินค้า (ดอกไม้แห้ง)"
            descriptionLinkText="คำอธิบาย ดอกไม้แห้งดีอย่างไร/คืออะไร"
            filters={['จัดส่งฟรี', 'แนะนำ Custom']}
            products={driedFlowers}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === '#artificial-flowers' && (
          <WireframeView 
            headerText="หน้าสินค้า (ดอกไม้ประดิษฐ์)"
            descriptionLinkText="คำอธิบาย ดอกไม้ประดิษฐ์ดีอย่างไร/คืออะไร"
            filters={['จัดส่งฟรี', 'แนะนำ Custom']}
            products={artificialFlowers}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === '#gifts' && (
          <WireframeView 
            headerText="หน้าสินค้า (ของขวัญ)"
            descriptionLinkText="ของขวัญสุดพิเศษ"
            filters={['ตุ๊กตาหมี', 'เทียนหอม', 'กล่อง/การ์ด', 'การ์ด']}
            products={gifts}
            onAddToCart={handleAddToCart}
          />
        )}

        {(view === '#order-terms' || view === '#refund' || view === '#faq') && (
          <OrderTermsView onViewChange={handleViewChange} />
        )}
      </main>

      <Footer onViewChange={handleViewChange} />

      {/* Slide Drawer: Cart */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        user={user}
        onIncreaseQty={handleIncreaseQty}
        onDecreaseQty={handleDecreaseQty}
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <OrdersModal 
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        user={user}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        user={user}
        onCartUpdated={refetchCart}
      />
    </>
    </ErrorBoundary>
  );
}