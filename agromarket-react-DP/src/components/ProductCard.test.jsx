import { screen } from '@testing-library/react';
import ProductCard from './ProductCard';
import { renderWithProviders } from '../test/utils';

const honey = { id: 1, name: 'Мёд гречишный', price: 3500, category: 'Мёд' };

describe('ProductCard', () => {
  test('показывает название, цену и категорию', () => {
    renderWithProviders(<ProductCard product={honey} />);

    expect(screen.getByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.getByText(/3\s?500/)).toBeInTheDocument(); // «3 500 ₸» с неразрывным пробелом
    expect(screen.getByText('Мёд')).toBeInTheDocument();
  });

  test('название — ссылка на страницу товара', () => {
    renderWithProviders(<ProductCard product={honey} />);
    expect(screen.getByRole('link', { name: /мёд гречишный/i }))
      .toHaveAttribute('href', '/products/1');
  });

  test('показывает «Нет в наличии», если stock равен 0', () => {
    renderWithProviders(
      <ProductCard product={{ ...honey, stock: 0, unit: 'кг' }} />
    );

    expect(screen.getByText(/нет в наличии/i)).toBeInTheDocument();
  });
});


// describe('ProductCard', () => {
//   const product = {
//     name: 'Мёд гречишный',
//     price: 3500,
//     category: 'Мёд',
//     image: 'honey.jpg',
//   };

//   test('показывает название и цену', () => {
//     render(<ProductCard product={product} />);
//     expect(screen.getByText('Мёд гречишный')).toBeInTheDocument();
//     expect(screen.getByText(/3\s?500/)).toBeInTheDocument();
//   });

//   test('кнопка «В корзину» вызывает onAdd с товаром', async () => {
//     const user = userEvent.setup();
//     const onAdd = vi.fn();
//     render(<ProductCard product={product} onAdd={onAdd} />);

//     await user.click(screen.getByRole('button', { name: /в корзину|в заявку|добавить/i }));

//     expect(onAdd).toHaveBeenCalledTimes(1);
//     expect(onAdd).toHaveBeenCalledWith(product);
//   });

//   test('тест «товара нет в наличии»', () => {
//     const outOfStockProduct = { ...product, stock: 0 };
//     const onAdd = vi.fn();
    
//     render(<ProductCard product={outOfStockProduct} onAdd={onAdd} />);

//     const button = screen.getByRole('button', { name: /в корзину|в заявку|добавить/i });
//     expect(button).toBeDisabled();
//   });
// });