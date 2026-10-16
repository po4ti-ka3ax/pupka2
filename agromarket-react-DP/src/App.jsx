import ProductCard from "./components/ProductCard";
import { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm.jsx";
import AddProductForm from "./components/AddProductForm.jsx"; // создадим в шаге 6.4
import { API_URL, apiFetch } from "./api.js";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ContactForm from "./components/ContactForm";

function App() {
  const testProduct = {
    id: 1,
    name: "Тест",
    price: 100,
    image: "https://placehold.co/300x200",
  };

  let hasError = false;

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null"),
  );

  function handleLogin(user, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "http://localhost:3000/api";

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();
        setProducts(result);
        renderProducts(products);
      } catch (error) {
        hasError = !hasError;
      }
    }

    loadProducts();
  }, []);

  const handleAddToCart = () => {
    setCartCount(cartCount + 1);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (!localStorage.getItem("token")) return; // не входили — проверять нечего
    apiFetch('/auth/me')
      .then((user) => setUser(user))
      .catch(() => {});
    // ЗАДАНИЕ: вызовите apiFetch('/auth/me') и положите результат в setUser.
    // ЗАДАНИЕ: ошибку перехватите пустым .catch(() => {}) —
    // ЗАДАНИЕ: при 401 apiFetch сам выполнит выход
  }, []);

  return (
    <>
      <div className="catalog">
        <div className="auth-bar">
          {user ? (
            <>
              <span>
                Вы вошли как <b>{user.name}</b> ({user.role})
              </span>
              <button onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </div>

        <Header />

        <main className="page">
          {user?.role === "admin" && (
            <AddProductForm onAdded={(p) => setProducts([...products, p])} />
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
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  onAdd={handleAddToCart}
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
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
