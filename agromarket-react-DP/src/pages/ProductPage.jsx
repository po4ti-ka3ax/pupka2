import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api.js';

// key={id}: при переходе на другой товар состояние создаётся заново
export default function ProductPage() {
  const { id } = useParams();
  return <ProductDetails key={id} id={id} />;
}

function ProductDetails({ id }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch(`/products/${id}`);
        if (!cancelled) setProduct(data?.product ?? data);
      } catch {
        if (!cancelled) setError('Не удалось загрузить товар');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <section className="product-page">
      <Link to="/">← Каталог</Link>
      {error && <p role="alert" className="error">{error}</p>}
      {!error && !product && <p>Загрузка...</p>}
      {product && (
        <>
          <h1>{product.name}</h1>
          {product.image && <img src={product.image} alt={product.name} />}
          {product.category && <p className="category">{product.category}</p>}
          <p>
            {product.price} тг{product.unit ? ` / ${product.unit}` : ''}
          </p>
          {product.description && <p>{product.description}</p>}
        </>
      )}
    </section>
  );
}
