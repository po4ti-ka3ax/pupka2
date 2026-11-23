import { http, HttpResponse } from 'msw';

export const products = [
  { id: 1, name: 'Мёд гречишный', price: 3500, category: 'Мёд' },
  { id: 2, name: 'Картофель молодой', price: 250, category: 'Овощи' },
];

export const farmer = { id: 7, name: 'Айгерим', email: 'farmer@agro.kz', role: 'farmer' };

// '*' в начале — подходит любой адрес API (localhost:3000, Render ...)
export const handlers = [
  http.get('*/api/products', () => HttpResponse.json(products)),

  http.post('*/api/products', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 100, ...body }, { status: 201 });
  }),

  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    if (password === 'secret123') {
      return HttpResponse.json({ token: 'test-token', user: { ...farmer, email } });
    }
    return HttpResponse.json({ error: 'Неверный e-mail или пароль' }, { status: 401 });
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    const { name, email } = await request.json();
    return HttpResponse.json(
      { token: 'new-token', user: { id: 8, name, email, role: 'buyer' } },
      { status: 201 },
    );
  }),

  http.get('*/api/auth/me', () => HttpResponse.json(farmer)),
];
