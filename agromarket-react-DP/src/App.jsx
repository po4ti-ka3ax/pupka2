import ProductCard from "./components/ProductCard";
import { useState, useEffect } from "react";
import "./App.css";

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
    setCartCount(cartCount + 1)
  }

  const filteredProducts = products.filter(((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())));
  return (
    <>
      <div className="catalog">
        <h2>Каталог</h2>
        <p>Товаров в корзине: {cartCount}</p>
        <input
          type="text"
          placeholder="Поиск товара..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="">
          {filteredProducts.map((product) => (
            <ProductCard onAdd={handleAddToCart} key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
