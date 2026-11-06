export default function ProductCard({ product, onAdd, featured }) {
  const isOutOfStock = product.stock === 0 || product.quantity === 0;

  return (
    <article className={featured ? 'card card--featured' : 'card'}>
      {featured && <span className="badge">Товар недели</span>}
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price} тг</p>
      {isOutOfStock && <p className="out-of-stock">Нет в наличии</p>}
      <button 
        onClick={() => onAdd && onAdd(product)} 
        disabled={isOutOfStock}
      >
        В корзину
      </button>
    </article>
  );
}