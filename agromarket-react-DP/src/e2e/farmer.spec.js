import { test, expect } from '@playwright/test';

// Фермер — готовый аккаунт из сида (регистрация выдаёт роль покупателя, см. mass assignment в ЛР11).
// Данные — в .env.e2e (он в .gitignore), см. .env.e2e.example
const email = process.env.E2E_FARMER_EMAIL;
const password = process.env.E2E_FARMER_PASSWORD;
const apiURL = process.env.E2E_API_URL || 'http://localhost:3000/api';

test.skip(!email || !password, 'Заполните E2E_FARMER_EMAIL и E2E_FARMER_PASSWORD в .env.e2e');

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/пароль/i).fill(password);
  await page.getByRole('button', { name: /войти/i }).click();
  await expect(page.getByRole('button', { name: /выйти/i })).toBeVisible();
});

test('фермер добавляет товар, и он появляется в каталоге', async ({ page }) => {
  const name = `Тестовый мёд ${Date.now()}`;

  await page.getByLabel('Название').fill(name);
  await page.getByLabel('Категория').fill('Мёд');
  await page.getByLabel(/цена/i).fill('1500');
  await page.getByRole('button', { name: 'Добавить', exact: true }).click();

  const card = page.getByTestId('product-card').filter({ hasText: name });
  await expect(card).toBeVisible();

  // товар действительно сохранён в базе, а не только в состоянии React
  await page.reload();
  await expect(card).toBeVisible();

  // тест убирает за собой
  await card.getByRole('button', { name: /удалить/i }).click();
  await expect(card).toHaveCount(0);
});

test('цена -500 не принимается', async ({ page, request }) => {
  const name = `Отрицательная цена ${Date.now()}`;
  const price = page.getByLabel(/цена/i);

  await page.getByLabel('Название').fill(name);
  await price.fill('-500');
  await page.getByRole('button', { name: 'Добавить', exact: true }).click();

  // 1) Ошибку показывает браузер: input min="1" не пускает форму на сервер
  expect(await price.evaluate((el) => el.validity.rangeUnderflow)).toBe(true);
  await expect(page.getByTestId('product-card').filter({ hasText: name })).toHaveCount(0);

  // 2) Сервер проверяет сам (zod): запрос в обход формы получает 400
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const res = await request.post(`${apiURL}/products`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name, category: 'Мёд', price: -500, unit: 'кг' },
  });
  expect(res.status()).toBe(400);
});
