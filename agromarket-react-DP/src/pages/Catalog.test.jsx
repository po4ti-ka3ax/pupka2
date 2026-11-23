import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import Catalog from './Catalog';

// В методичке страница называется CatalogPage, у нас — Catalog
const CatalogPage = Catalog;

const products = [
  { id: 1, name: 'Мёд гречишный', price: 3500, category: 'Мёд' },
  { id: 2, name: 'Пшеница 3 класса', price: 120, category: 'Зерно' },
];

// Ответ «сервера»: Response — стандартный класс, как в настоящем fetch
function mockFetch(body, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function renderCatalog() {
  return render(
    <MemoryRouter>
      <Catalog />
    </MemoryRouter>,
  );
}

describe('Catalog', () => {
  test('показывает товары из API', async () => {
    renderWithProviders(<CatalogPage />);
    expect(await screen.findByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.getByText('Картофель молодой')).toBeInTheDocument();
  });

  test('пока данные грузятся — индикатор загрузки', async () => {
    server.use(http.get('*/api/products', async () => {
      await delay(200);
      return HttpResponse.json([]);
    }));
    renderWithProviders(<CatalogPage />);
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  test('пустой каталог — понятное сообщение', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json([])));
    renderWithProviders(<CatalogPage />);
    expect(await screen.findByText(/товаров пока нет/i)).toBeInTheDocument();
  });

  test('сервер упал (500) — сообщение об ошибке, а не белый экран', async () => {
    server.use(http.get('*/api/products', () =>
      HttpResponse.json({ error: 'Internal' }, { status: 500 })));
    renderWithProviders(<CatalogPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/не удалось загрузить/i);
  });

  test('сначала показывает загрузку, потом товары', async () => {
    mockFetch(products);
    renderCatalog();

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
    // findBy ждёт, пока «придёт ответ сервера» и React перерисует экран
    expect(await screen.findByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.getByText('Пшеница 3 класса')).toBeInTheDocument();
    expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument();
  });

  test('запрашивает правильный адрес', async () => {
    const spy = mockFetch(products);
    renderCatalog();
    await screen.findByText('Мёд гречишный');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0][0])).toMatch(/\/api\/products/);
  });

  test('при ошибке сервера показывает сообщение', async () => {
    mockFetch({ error: 'Внутренняя ошибка сервера' }, 500);
    renderCatalog();
    // ЗАДАНИЕ: подставьте свой текст ошибки
    expect(await screen.findByText(/не удалось|ошибка/i)).toBeInTheDocument();
  });

  test('сервер вернул пустой массив — показывается «Товаров пока нет»', async () => {
    mockFetch([]);
    renderCatalog();

    // Ждем исчезновения загрузки или появления текста об отсутствии товаров
    expect(await screen.findByText(/товаров пока нет|нет товаров|пусто/i)).toBeInTheDocument();
  });

  test('сеть недоступна — fetch отклоняется с ошибкой', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    renderCatalog();

    // Проверяем, что при сетевой ошибке выводится сообщение об ошибке
    expect(await screen.findByText(/не удалось|ошибка|произошла ошибка/i)).toBeInTheDocument();
  });

  // ЗАДАНИЕ: сервер вернул [] — показывается «Товаров пока нет»
  // ЗАДАНИЕ: сеть недоступна — fetch отклоняется:
  // ЗАДАНИЕ: vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
});
