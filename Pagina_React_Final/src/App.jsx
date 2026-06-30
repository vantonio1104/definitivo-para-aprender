// src/App.jsx
// Reemplaza al index.html + main.js originales como punto de unión.
// Cada sección de la página vanilla es ahora un componente; el estado
// global (carrito, favoritos, auth, filtros, toasts) vive en hooks
// y se pasa por props a quien lo necesite, igual que antes vivía en
// variables globales (cart, favs, sesion, filtered) accesibles desde
// cualquier función de main.js.

import Header from './components/Header';
import Hero from './components/Hero';
import CategoryCarousel from './components/CategoryCarousel';
import ProductGrid from './components/ProductGrid';
import AuthSection from './components/AuthSection';
import ContactForm from './components/ContactForm';
import Checkout from './components/Checkout';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Toasts from './components/Toasts';
import AccessibilityMenu from './components/AccessibilityMenu';

import { useCart } from './hooks/useCart';
import { useFavorites } from './hooks/useFavorites';
import { useProductFilters } from './hooks/useProductFilters';
import { useAuth } from './hooks/useAuth';
import { useToasts } from './hooks/useToasts';

function App() {
  const { toasts, toast } = useToasts();

  const { cart, isOpen, count, total, addToCart, removeFromCart, changeQty, clearCart, toggleCart, closeCart } =
    useCart(toast);

  const { favs, toggleFav } = useFavorites(() => toast('Agregado a favoritos ♥'));

  const { category, sort, filtered, filterByCategory, setSort } = useProductFilters();

  const { sesion, registrarUsuario, iniciarSesion, cerrarSesion } = useAuth();

  return (
    <>
      <Header cartCount={count} onToggleCart={toggleCart} />

      <main>
        <Hero />

        <CategoryCarousel onSelectCategory={filterByCategory} />

        <ProductGrid
          products={filtered}
          favs={favs}
          category={category}
          sort={sort}
          onFilterChange={filterByCategory}
          onSortChange={setSort}
          onToggleFav={toggleFav}
          onAddToCart={addToCart}
        />

        <AuthSection
          sesion={sesion}
          iniciarSesion={iniciarSesion}
          registrarUsuario={registrarUsuario}
          cerrarSesion={cerrarSesion}
          toast={toast}
        />

        <ContactForm />

        <Checkout cart={cart} total={total} onPaySuccess={clearCart} toast={toast} />
      </main>

      <Footer />

      <CartDrawer
        cart={cart}
        isOpen={isOpen}
        total={total}
        onClose={closeCart}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
      />

      <Toasts toasts={toasts} />

      {/* Menú flotante de accesibilidad */}
      <AccessibilityMenu />
    </>
  );
}

export default App;
