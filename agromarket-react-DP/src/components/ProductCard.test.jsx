import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  const product = {
    name: 'Мёд гречишный',
    price: 3500,
    category: 'Мёд',
    image: 'honey.jpg',
  };

  test('показывает название и цену', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.getByText(/3\s?500/)).toBeInTheDocument();
  });

  test('кнопка «В корзину» вызывает onAdd с товаром', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ProductCard product={product} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /в корзину|в заявку|добавить/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  test('тест «товара нет в наличии»', () => {
    const outOfStockProduct = { ...product, stock: 0 };
    const onAdd = vi.fn();
    
    render(<ProductCard product={outOfStockProduct} onAdd={onAdd} />);

    const button = screen.getByRole('button', { name: /в корзину|в заявку|добавить/i });
    expect(button).toBeDisabled();
  });
});