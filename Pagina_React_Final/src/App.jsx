// src/App.jsx
// Reemplaza al index.html + main.js originales como punto de unión.
// Cada sección de la página vanilla es ahora un componente; el estado
// global (carrito, favoritos, auth, filtros, productos, toasts) vive en hooks
// y se pasa por props a quien lo necesite.
//
// Modificado para implementar subpáginas mediante un enrutador basado en estado (sin dependencias externas).

import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryCarousel from './components/CategoryCarousel';
import ProductGrid from './components/ProductGrid';
import AuthSection from './components/AuthSection';
import ContactForm from './components/ContactForm';
import Checkout from './components/Checkout';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import ProductDetailMenu from './components/ProductDetailMenu';
import Toasts from './components/Toasts';
import AccessibilityMenu from './components/AccessibilityMenu';
import AdminPanel from './components/AdminPanel';
import ExternalTrends from './components/ExternalTrends';

import { useCart } from './hooks/useCart';
import { useFavorites } from './hooks/useFavorites';
import { useProductFilters } from './hooks/useProductFilters';
import { useAuth } from './hooks/useAuth';
import { useToasts } from './hooks/useToasts';
import { useProducts } from './hooks/useProducts';
import { useExternalProducts } from './hooks/useExternalProducts';

function App() {
  const { toasts, toast } = useToasts();
  
  // Estado para la subpágina activa: 'inicio', 'catalogo', 'perfil', 'checkout', 'admin'
  const [currentPage, setCurrentPage] = useState('inicio');

  // Estado para controlar la apertura del cajón de favoritos
  const [isFavsOpen, setIsFavsOpen] = useState(false);

  // Estado global para el producto seleccionado en el modal de detalles
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Fuente de verdad de productos (localStorage, con fallback a products.js)
  const { products, addProduct, updateProduct, deleteProduct, discountStock } = useProducts();

  // Traer productos tendencias externas
  const externalProductsHook = useExternalProducts();

  // Lista combinada de productos para el carrito y los detalles
  const combinedProductsList = [...products, ...externalProductsHook.data];

  const { cart, isOpen, count, total, addToCart, removeFromCart, changeQty, clearCart, toggleCart, closeCart } =
    useCart(combinedProductsList, toast);

  const { favs, toggleFav } = useFavorites(() => toast('Agregado a favoritos ♥'));

  // Recibe el array dinámico en lugar de importar el estático
  const { category, sort, filtered, filterByCategory, setSort } = useProductFilters(products);

  const { sesion, registrarUsuario, iniciarSesion, cerrarSesion } = useAuth();

  const isAdmin = sesion?.activo && sesion?.usuario?.rol === 'admin';

  // Maneja la compra exitosa restando el stock físico y vaciando el carrito
  const handlePaymentSuccess = (purchasedCart) => {
    discountStock(purchasedCart);
    clearCart();
    setCurrentPage('inicio'); // Redirecciona a inicio tras compra exitosa
  };

  // Al hacer clic en una categoría del carrusel, filtramos y llevamos al usuario al catálogo
  const handleSelectCategory = (cat) => {
    filterByCategory(cat);
    setCurrentPage('catalogo');
  };

  return (
    <>
      <Header
        cartCount={count}
        onToggleCart={toggleCart}
        sesion={sesion}
        currentPage={currentPage}
        onChangePage={setCurrentPage}
        favsCount={favs.size}
        onToggleFavs={() => setIsFavsOpen((prev) => !prev)}
      />

      <main>
        {/* SUBPÁGINA: INICIO */}
        {currentPage === 'inicio' && (
          <>
            <Hero onNavigate={setCurrentPage} />
            <ContactForm />
          </>
        )}

        {/* SUBPÁGINA: CATÁLOGO */}
        {currentPage === 'catalogo' && (
          <>
            <CategoryCarousel onSelectCategory={handleSelectCategory} />
            <ProductGrid
              products={filtered}
              favs={favs}
              category={category}
              sort={sort}
              onFilterChange={filterByCategory}
              onSortChange={setSort}
              onToggleFav={toggleFav}
              onAddToCart={addToCart}
              onViewDetails={setSelectedProductDetails}
            />
            <ExternalTrends
              onAddToCart={addToCart}
              onViewDetails={setSelectedProductDetails}
              favs={favs}
              onToggleFav={toggleFav}
              externalProductsData={externalProductsHook}
            />
          </>
        )}

        {/* SUBPÁGINA: PERFIL */}
        {currentPage === 'perfil' && (
          <AuthSection
            sesion={sesion}
            iniciarSesion={iniciarSesion}
            registrarUsuario={registrarUsuario}
            cerrarSesion={cerrarSesion}
            toast={toast}
          />
        )}

        {/* SUBPÁGINA: CHECKOUT */}
        {currentPage === 'checkout' && (
          <Checkout cart={cart} total={total} onPaySuccess={handlePaymentSuccess} toast={toast} />
        )}

        {/* SUBPÁGINA: ADMIN (Protegida) */}
        {currentPage === 'admin' && isAdmin && (
          <AdminPanel
            products={products}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
            toast={toast}
          />
        )}
      </main>

      <Footer />

      {/* Cajón lateral del carrito */}
      <CartDrawer
        cart={cart}
        isOpen={isOpen}
        total={total}
        onClose={closeCart}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onNavigate={setCurrentPage}
      />

      {/* Cajón lateral de favoritos */}
      <FavoritesDrawer
        favs={favs}
        products={combinedProductsList}
        isOpen={isFavsOpen}
        onClose={() => setIsFavsOpen(false)}
        onRemove={toggleFav}
        onAddToCart={addToCart}
        onViewDetails={setSelectedProductDetails}
      />

      {/* Modal global de detalles de producto */}
      <ProductDetailMenu
        product={selectedProductDetails}
        onClose={() => setSelectedProductDetails(null)}
        onAddToCart={addToCart}
      />

      <Toasts toasts={toasts} />

      {/* Menú flotante de accesibilidad */}
      <AccessibilityMenu />
    </>
  );
}

export default App;

