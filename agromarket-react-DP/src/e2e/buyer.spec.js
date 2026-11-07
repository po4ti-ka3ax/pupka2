
import { test, expect } from '@playwright/test';

// Генерируем уникальную почту для каждого запуска
const createEmail = () =>
  `e2e+${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.kz`;

const password = 'E2E-Test-Password-123';

// Регистрация покупателя через интерфейс
async function registerBuyer(page) {
  const email = createEmail();

  await page.goto('/login');

  await page.getByRole('button', {
    name: /нет аккаунта/i,
  }).click();

  // Заполняем именно поля формы регистрации
  const registerForm = page.locator('form.login-form');

  await registerForm.locator('input[name="name"]').fill('E2E Покупатель');
  await registerForm.locator('input[name="email"]').fill(email);
  await registerForm.locator('input[name="password"]').fill(password);

  const responsePromise = page.waitForResponse(response => {
    return (
      new URL(response.url()).pathname.endsWith('/auth/register') &&
      response.request().method() === 'POST'
    );
  });

  await registerForm.getByRole('button', {
    name: /зарегистрироваться/i,
  }).click();

  const response = await responsePromise;

  expect(response.status()).toBe(201);

  const body = await response.json();

  expect(body.user).toBeTruthy();
  expect(body.token).toBeTruthy();

  const registerUrl = new URL(response.url());

  const apiPrefix = registerUrl.pathname.replace(
    /\/auth\/register\/?$/,
    ''
  );

  const apiBase = `${registerUrl.origin}${apiPrefix}`;

  return {
    email,
    token: body.token,
    apiBase,
  };
}


// 1. Проверка загрузки каталога
test('каталог загружается с сервера', async ({ page }) => {
  // Следим за запросом товаров до открытия страницы
  const productsResponsePromise = page.waitForResponse(response => {
    const url = new URL(response.url());

    return (
      url.pathname.replace(/\/$/, '').endsWith('/products') &&
      response.request().method() === 'GET'
    );
  }, { timeout: 15000 }).catch(() => null);

  await page.goto('/');

  await expect(page).toHaveTitle(/Document/i);

  const productsResponse = await productsResponsePromise;

  expect(
    productsResponse,
    'Приложение не отправило GET-запрос на получение товаров'
  ).not.toBeNull();

  expect(productsResponse.status()).toBe(200);
});


// 2. Проверка прямого перехода на внутреннюю страницу
test('прямая ссылка на внутреннюю страницу не даёт 404', async ({ page }) => {
  const response = await page.goto('/login');

  expect(response).not.toBeNull();
  expect(response.status()).toBe(200);
});


// 3. Покупатель регистрируется и оформляет заявку
test('покупатель регистрируется и оформляет заявку', async ({ page, request }) => {
  const buyer = await registerBuyer(page);

  // Создаём заявку через API
  const orderResponse = await request.post(`${buyer.apiBase}/orders`, {
    headers: {
      Authorization: `Bearer ${buyer.token}`,
    },
    data: {
      name: 'E2E Покупатель',
      email: buyer.email,
      quantity: 20,
    },
  });

  expect(orderResponse.status()).toBe(201);

  const order = await orderResponse.json();

  expect(order.id).toBeTruthy();
});


// 4. Проверка прав покупателя
test('покупатель не может создавать товары через API', async ({ page, request }) => {
  const buyer = await registerBuyer(page);

  const product = {
    name: 'E2E Тестовый товар',
    price: 100,
  };

  // Без токена API должен вернуть 401
  const guestResponse = await request.post(`${buyer.apiBase}/products`, {
    data: product,
  });

  expect(guestResponse.status()).toBe(401);

  // С токеном покупателя API должен вернуть 403
  const buyerResponse = await request.post(`${buyer.apiBase}/products`, {
    headers: {
      Authorization: `Bearer ${buyer.token}`,
    },
    data: product,
  });

  expect(buyerResponse.status()).toBe(403);
});
