import React, { useState, useEffect } from 'react';
import Navbar from './component/Navbar';
import HeroBanner from './component/HeroBanner';
import HomeView from './component/HomeView';
import WireframeView from './component/WireframeView';
import Footer from './component/Footer';
import CartDrawer from './component/CartDrawer';
import AuthModal from './component/AuthModal';
import OrdersModal from './component/OrdersModal';

// --- MOCK PRODUCTS DATA ---
const BEST_SELLERS = [
  {
    id: '1',
    name: 'ช่อดอกลาเวนเดอร์แห้งพรีเมียม',
    price: 450,
    img: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop',
    category: 'ดอกไม้แห้ง',
    badge: 'ขายดี',
    rating: 5,
    reviewsCount: 24
  },
  {
    id: '2',
    name: 'ช่อดอกทิวลิปประดิษฐ์สไตล์เกาหลี',
    price: 390,
    img: 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?q=80&w=600&auto=format&fit=crop',
    category: 'ดอกไม้ประดิษฐ์',
    badge: 'ใหม่',
    rating: 4,
    reviewsCount: 18
  },
  {
    id: '3',
    name: 'เซ็ตกล่องของขวัญดอกไม้กุหลาบและเทียนหอม',
    price: 750,
    img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop',
    category: 'ของขวัญ',
    badge: 'แนะนำ',
    rating: 5,
    reviewsCount: 32
  },
  {
    id: '4',
    name: 'ช่อไฮเดรนเยียแห้งแนววินเทจ',
    price: 590,
    img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=600&auto=format&fit=crop',
    category: 'ดอกไม้แห้ง',
    badge: 'ขายดี',
    rating: 4,
    reviewsCount: 15
  }
];

const DRIED_FLOWERS = Array.from({ length: 6 }, (_, i) => ({
  id: `df-${i + 1}`,
  name: 'Basic 1',
  price: 1000,
  img: '',
  tag: 'แนะนำ Custom'
}));

const ARTIFICIAL_FLOWERS = Array.from({ length: 6 }, (_, i) => ({
  id: `af-${i + 1}`,
  name: 'Basic 1',
  price: 1000,
  img: '',
  tag: 'จัดส่งฟรี'
}));

const GIFTS = [
  { id: 'gf-1', name: 'Teddy', price: 200, img: '', tag: 'ตุ๊กตาหมี' },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `gf-${i + 2}`,
    name: 'Basic 1',
    price: 1000,
    img: '',
    tag: i % 2 === 0 ? 'เทียนหอม' : 'กล่อง/การ์ด'
  }))
];

export default function App() {
  // Navigation View State
  const [view, setView] = useState('#home');

  // Modals & Drawers States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState(() => {
    return localStorage.getItem('hf_user') || null;
  });

  // Shopping Cart State
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('hf_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sync Hash changes and window scroll
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      setView(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initialize
    if (window.location.hash) {
      setView(window.location.hash);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Sync state to local storage and update body classes on view change
  useEffect(() => {
    localStorage.setItem('hf_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hf_user', user);
    } else {
      localStorage.removeItem('hf_user');
    }
  }, [user]);

  useEffect(() => {
    // Add/remove wireframe mode class on body
    const isWireframe = ['#dried-flowers', '#artificial-flowers', '#gifts'].includes(view);
    if (isWireframe) {
      document.body.classList.add('wf-mode');
    } else {
      document.body.classList.remove('wf-mode');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  // Handler for view changing
  const handleViewChange = (newView) => {
    // For hash views, update the location hash directly (so back/forward works, matching the original JS layout router)
    if (newView.startsWith('#')) {
      if (newView === '#orders') {
        setIsOrdersOpen(true);
      } else {
        window.location.hash = newView;
        setView(newView);
      }
    }
  };

  // Add to cart helper
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    // Open drawer after adding
    setIsCartOpen(true);
  };

  const handleIncreaseQty = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQty = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleLoginSuccess = (email) => {
    setUser(email);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Total items in cart for the badge count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar 
        currentView={view}
        onViewChange={handleViewChange}
        cartCount={cartCount}
        onCartToggle={() => setIsCartOpen(true)}
        onAuthToggle={() => setIsAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Show Hero banner on Home page or if view matches standard banners */}
      {view === '#home' && <HeroBanner />}

      <main>
        {view === '#home' && (
          <HomeView 
            onViewChange={handleViewChange} 
            bestSellers={BEST_SELLERS} 
            onAddToCart={handleAddToCart}
          />
        )}

        {view === '#dried-flowers' && (
          <WireframeView 
            headerText="หน้าสินค้า (ดอกไม้แห้ง)"
            descriptionLinkText="คำอธิบาย ดอกไม้แห้งดีอย่างไร/คืออะไร"
            filters={['จัดส่งฟรี', 'แนะนำ Custom']}
            products={DRIED_FLOWERS}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === '#artificial-flowers' && (
          <WireframeView 
            headerText="หน้าสินค้า (ดอกไม้ประดิษฐ์)"
            descriptionLinkText="คำอธิบาย ดอกไม้ประดิษฐ์ดีอย่างไร/คืออะไร"
            filters={['จัดส่งฟรี', 'แนะนำ Custom']}
            products={ARTIFICIAL_FLOWERS}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === '#gifts' && (
          <WireframeView 
            headerText="หน้าสินค้า (ของขวัญ)"
            descriptionLinkText="ของขวัญสุดพิเศษ"
            filters={['ตุ๊กตาหมี', 'เทียนหอม', 'กล่อง/การ์ด', 'การ์ด']}
            products={GIFTS}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Supporting standard anchor scrolling for info sections inside main view */}
        {(view === '#how-to-buy') && (
          <HomeView 
            onViewChange={handleViewChange} 
            bestSellers={BEST_SELLERS} 
            onAddToCart={handleAddToCart}
          />
        )}
      </main>

      <Footer onViewChange={handleViewChange} />

      {/* Slide Drawer: Cart */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onIncreaseQty={handleIncreaseQty}
        onDecreaseQty={handleDecreaseQty}
        onRemoveItem={handleRemoveItem}
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
      />
    </>
  );
}
