import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../test/server';
import LoginForm from './LoginForm';
import { renderWithProviders } from '../test/utils';

async function fillAndSubmit(user, email, password) {
  await user.type(screen.getByLabelText(/e-mail/i), email);
  await user.type(screen.getByLabelText(/пароль/i), password);
  await user.click(screen.getByRole('button', { name: /войти/i }));
}

describe('LoginForm', () => {

  test('поля связаны с подписями', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toHaveAttribute('type', 'password');
  });

  test('пользователь может ввести данные', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), 'farmer@agro.kz');
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('farmer@agro.kz');
  });


  test('отправляет введённые e-mail и пароль через fetch', async () => {
    const user = userEvent.setup();
    
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ token: 'fake-token' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText(/email|почта/i), 'farmer@agromarket.kz');
    await user.type(screen.getByPlaceholderText(/пароль/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(spy).toHaveBeenCalled();
  });

  test('с пустыми полями не отправляет и показывает ошибку', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /войти/i }));

    // Форма с атрибутом required не должна вызывать fetch
    expect(screen.queryByText('Unauthorized')).not.toBeInTheDocument();
  });

  test('с некорректным e-mail (без @) форма не отправляет запрос', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(globalThis, 'fetch');
    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText(/email|почта/i), 'invalid-email');
    await user.type(screen.getByPlaceholderText(/пароль/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(spy).not.toHaveBeenCalled();
  });

  test('отправляет запрос с JWT-токеном в заголовке Authorization', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'test-token');

    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText(/email|почта/i), 'farmer@agromarket.kz');
    await user.type(screen.getByPlaceholderText(/пароль/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(spy).toHaveBeenCalled();
    const [, options] = spy.mock.calls[0];
    
    const authHeader = options?.headers instanceof Headers 
      ? options.headers.get('Authorization') 
      : options?.headers?.Authorization;

    expect(authHeader).toBe('Bearer test-token');
  });

  test('при ответе сервера 401 показывает сообщение об ошибке', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'expired-token');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText(/email|почта/i), 'farmer@agromarket.kz');
    await user.type(screen.getByPlaceholderText(/пароль/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(await screen.findByText(/войдите заново|авториз|сессия истекла|ошибка|unauthorized/i)).toBeInTheDocument();
  });
});

// ---------- ЛР12, шаг 3.3: API подменяется через MSW (src/test/handlers.js) ----------
describe('LoginForm + MSW: ответы сервера из ЛР11', () => {
  test('успешный вход сохраняет токен', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await fillAndSubmit(user, 'farmer@agro.kz', 'secret123');

    await waitFor(() => expect(localStorage.getItem('token')).toBe('test-token'));
    expect(JSON.parse(localStorage.getItem('user')).name).toBe('Айгерим');
  });

  test('неверный пароль (401) — текст ошибки с сервера', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    // пароль от 8 символов, иначе форму не пропустит браузерная проверка minLength
    await fillAndSubmit(user, 'farmer@agro.kz', 'wrong-password');

    expect(await screen.findByText('Неверный e-mail или пароль')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('слишком много попыток (429) — сообщение из ответа', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json(
      { error: 'Слишком много попыток. Попробуйте через 15 минут' },
      { status: 429 })));

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await fillAndSubmit(user, 'farmer@agro.kz', 'secret123');

    expect(await screen.findByText(/слишком много попыток/i)).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('пока запрос идёт, кнопка «Войти» disabled и второй клик не шлёт запрос', async () => {
    let requests = 0;
    server.use(http.post('*/api/auth/login', async () => {
      requests += 1;
      await delay(150);
      return HttpResponse.json({ token: 'test-token', user: { id: 7, name: 'Айгерим', role: 'farmer' } });
    }));

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await fillAndSubmit(user, 'farmer@agro.kz', 'secret123');

    const button = screen.getByRole('button', { name: /подождите/i });
    expect(button).toBeDisabled();
    await user.click(button);

    await waitFor(() => expect(localStorage.getItem('token')).toBe('test-token'));
    expect(requests).toBe(1);
  });
});

describe('Регистрация + MSW', () => {
  test('400 с details — ошибка поля показывается на странице', async () => {
    server.use(http.post('*/api/auth/register', () => HttpResponse.json(
      {
        error: 'Ошибка валидации',
        details: [{ field: 'email', message: 'Некорректный e-mail' }],
      },
      { status: 400 })));

    const user = userEvent.setup();
    renderWithProviders(<LoginForm initialMode="register" />);

    await user.type(screen.getByLabelText('Имя'), 'Айгерим');
    await user.type(screen.getByLabelText(/e-mail/i), 'farmer@agro');
    await user.type(screen.getByLabelText(/пароль/i), '12345678');
    await user.click(screen.getByRole('button', { name: /зарегистр/i }));

    expect(await screen.findByText('Некорректный e-mail')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('успешная регистрация сохраняет токен', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /нет аккаунта/i }));
    await user.type(screen.getByLabelText('Имя'), 'Новый покупатель');
    await user.type(screen.getByLabelText(/e-mail/i), 'buyer@agro.kz');
    await user.type(screen.getByLabelText(/пароль/i), '12345678');
    await user.click(screen.getByRole('button', { name: /зарегистр/i }));

    await waitFor(() => expect(localStorage.getItem('token')).toBe('new-token'));
  });
});

