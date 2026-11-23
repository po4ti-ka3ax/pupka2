export const API_URL = import.meta.env.VITE_API_URL || 'https://agromarket-api-dmtrp.onrender.com/api';

// Обёртка над fetch: добавляет токен, разбирает JSON и превращает ошибки API в исключения
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  // Токен был, но сервер его не принял (истёк / подделан) — выходим из аккаунта
  if (res.status === 401 && token) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }

  if (!res.ok) {
    const error = new Error(data?.error || `Ошибка ${res.status}`);
    error.status = res.status;
    error.details = data?.details; // ЛР11, middleware validate: [{ field, message }]
    throw error;
  }
  return data;
}

// Список сообщений для показа пользователю: details из ответа 400 или общий текст ошибки
export function errorMessages(err) {
  if (Array.isArray(err?.details) && err.details.length > 0) {
    return err.details.map((d) => d.message);
  }
  return [err?.message || 'Что-то пошло не так'];
}
