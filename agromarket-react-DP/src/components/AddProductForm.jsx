import { useState } from 'react';
import { apiFetch, errorMessages } from '../api.js';

export default function AddProductForm({ onAdded }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const product = await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({ ...data, price: Number(data.price) }),
      });
      onAdded?.(product); // сообщаем App о новом товаре
      form.reset();
    } catch (err) {
      // 400 от сервера (zod): «Цена должна быть больше 0» и т.п. — из details
      setErrors(errorMessages(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Новый товар</h3>

      <label htmlFor="product-name">Название</label>
      <input id="product-name" name="name" placeholder="Название" required />

      <label htmlFor="product-category">Категория</label>
      <input id="product-category" name="category" placeholder="Категория" />

      {/* min="1" — первая линия защиты в браузере; сервер всё равно проверяет сам */}
      <label htmlFor="product-price">Цена, ₸</label>
      <input id="product-price" name="price" type="number" min="1" placeholder="Цена, ₸" required />

      <label htmlFor="product-unit">Единица</label>
      <input id="product-unit" name="unit" placeholder="Единица (кг, л)" defaultValue="кг" />

      {errors.length > 0 && (
        <div role="alert" className="error">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
      <button type="submit" disabled={loading}>Добавить</button>
    </form>
  );
}
