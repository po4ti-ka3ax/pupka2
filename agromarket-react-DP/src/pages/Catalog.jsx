import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../api.js';

export default function Catalog({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}`);
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.items || data.products || []);
      } catch {
        setError('Не удалось загрузить товары');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return <p>Загрузка товаров...</p>;
  }

  if (error) {
    return <p role="alert" className="error">{error}</p>;
  }

  if (products.length === 0) {
    return <p>Товаров пока нет</p>;
  }

  return (
    <section>
      <h2>Каталог товаров</h2>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
