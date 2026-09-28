import ProductCard from "./components/ProductCard";
import { useState, useEffect } from "react";
import "./App.css";
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
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("http://localhost:3001/products");
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
  
  return (
    <>
      <div className="catalog">
        <Header />

        <main className="page">
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
            <ContactForm/>
          </section>
        </main>
      </div>
      <Footer/>
    </>
  );
}

export default App;
