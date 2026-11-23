import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import ProductCard from "./components/ProductCard";
import LoginForm from "./components/LoginForm.jsx";
import AddProductForm from "./components/AddProductForm.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContactForm from "./components/ContactForm";
import ProductPage from "./pages/ProductPage.jsx";
import { API_URL, apiFetch } from "./api.js";
import { useAuth } from "./context/AuthContext.jsx";

// Кто может добавлять и удалять товары (права всё равно проверяет сервер)
const PRODUCT_MANAGERS = ["farmer", "admin"];

function App() {
  // Пользователь, вход и выход живут в AuthProvider (src/context/AuthContext.jsx)
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const canManage = PRODUCT_MANAGERS.includes(user?.role);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.items || data.products || []);
      } catch {
        setError("Не удалось загрузить товары");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleAddToCart = () => {
    setCartCount((count) => count + 1);
  };

  async function handleDelete(product) {
    try {
      await apiFetch(`/products/${product.id}`, { method: "DELETE" });
      setProducts((list) => list.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const home = (
    <>
      {canManage && (
        <AddProductForm onAdded={(p) => setProducts((list) => [...list, p])} />
      )}

      <section id="catalog" className="catalog">
        <div className="catalog-toolbar">
          <h2>Каталог</h2>
          <p>Товаров в корзине: {cartCount}</p>
          <input
            type="search"
            placeholder="Поиск товара..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading && <p>Загрузка товаров...</p>}
        {error && <p role="alert" className="error">{error}</p>}
        {!loading && !error && products.length === 0 && <p>Товаров пока нет</p>}
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              onAdd={handleAddToCart}
              onDelete={canManage ? handleDelete : undefined}
              key={product.id}
              product={product}
              featured={product.id === "1"}
            />
          ))}
        </div>
      </section>
      <aside id="delivery" className="sidebar">
        <h3>Доставка</h3>
        <ul>
          <li>Астана — на следующий день</li>
          <li>Акмолинская область — 2–3 дня</li>
          <li>Бесплатно от 20 000 тг</li>
        </ul>
      </aside>
      <section id="contact">
        <ContactForm />
      </section>
    </>
  );

  return (
    <>
      <div className="catalog">
        <div className="auth-bar">
          {user ? (
            <>
              <span>
                Вы вошли как <b>{user.name}</b> ({user.role})
              </span>
              <button onClick={logout}>Выйти</button>
            </>
          ) : (
            // /register сразу открывает форму регистрации, остальные адреса — вход
            <LoginForm
              key={pathname === "/register" ? "register" : "login"}
              initialMode={pathname === "/register" ? "register" : "login"}
            />
          )}
        </div>

        <Header cartCount={cartCount} />

        <main className="page">
          <Routes>
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="*" element={home} />
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
