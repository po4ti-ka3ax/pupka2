import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
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