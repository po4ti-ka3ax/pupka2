import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import AddProductForm from './AddProductForm';
import { renderWithProviders } from '../test/utils';

async function fillForm(user, { name = 'Мёд липовый', category = 'Мёд', price = '2500' } = {}) {
  await user.type(screen.getByLabelText('Название'), name);
  await user.type(screen.getByLabelText('Категория'), category);
  await user.type(screen.getByLabelText(/цена/i), price);
}

describe('AddProductForm', () => {
  test('успешное добавление передаёт товар из ответа в onAdded', async () => {
    const onAdded = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<AddProductForm onAdded={onAdded} />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    await waitFor(() => expect(onAdded).toHaveBeenCalledTimes(1));
    expect(onAdded.mock.calls[0][0]).toMatchObject({ id: 100, name: 'Мёд липовый', price: 2500 });
  });

  test('цена -500: браузер (min="1") не даёт отправить форму', async () => {
    let requests = 0;
    server.use(http.post('*/api/products', () => {
      requests += 1;
      return HttpResponse.json({}, { status: 201 });
    }));
    const user = userEvent.setup();
    renderWithProviders(<AddProductForm />);

    await fillForm(user, { price: '-500' });
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(screen.getByLabelText(/цена/i)).toBeInvalid();
    expect(requests).toBe(0);
  });

  test('цена -500 в обход браузера: сервер отвечает 400 — видно «Цена должна быть больше 0»', async () => {
    server.use(http.post('*/api/products', () => HttpResponse.json(
      {
        error: 'Ошибка валидации',
        details: [{ field: 'price', message: 'Цена должна быть больше 0' }],
      },
      { status: 400 })));
    const onAdded = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<AddProductForm onAdded={onAdded} />);

    await fillForm(user, { price: '-500' });
    // fireEvent.submit не запускает браузерную валидацию — так ведёт себя запрос из curl/Postman
    fireEvent.submit(screen.getByRole('button', { name: 'Добавить' }).closest('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Цена должна быть больше 0');
    expect(onAdded).not.toHaveBeenCalled();
  });
});
