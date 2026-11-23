import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAdd, onDelete, featured }) {
  const isOutOfStock = product.stock === 0 || product.quantity === 0;

  return (
    <article
      className={featured ? 'card card--featured' : 'card'}
      data-testid="product-card"
    >
      {featured && <span className="badge">Товар недели</span>}
      <img src={product.image} alt={product.name} />
      <h3>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      {product.category && <p className="category">{product.category}</p>}
      <p>{product.price} тг</p>
      {isOutOfStock && <p className="out-of-stock">Нет в наличии</p>}
      <button
        onClick={() => onAdd && onAdd(product)}
        disabled={isOutOfStock}
      >
        В корзину
      </button>
      {onDelete && (
        <button type="button" className="danger" onClick={() => onDelete(product)}>
          Удалить
        </button>
      )}
    </article>
  );
}
