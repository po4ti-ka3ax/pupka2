import { test, expect } from '@playwright/test';

// ВНИМАНИЕ: регистрация создаёт пользователя в базе — только локальный API, не продакшен

test('новый покупатель регистрируется и видит своё имя', async ({ page }) => {
  const email = `e2e${Date.now()}@test.kz`; // уникальный, тест можно повторять

  await page.goto('/register');
  // exact: на странице есть ещё поле «Имя / организация» в форме заявки
  await page.getByLabel('Имя', { exact: true }).fill('E2E Тестов');
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/пароль/i).fill('12345678');
  await page.getByRole('button', { name: /зарегистр/i }).click();

  await expect(page.getByText('E2E Тестов')).toBeVisible(); // имя в шапке
  await expect(page.getByRole('button', { name: /выйти/i })).toBeVisible();
});

test('неверный пароль — ошибка, остаёмся на странице входа', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill('nobody@test.kz');
  await page.getByLabel(/пароль/i).fill('wrong-password');
  await page.getByRole('button', { name: /войти/i }).click();

  await expect(page.getByRole('alert')).toContainText(/неверн|invalid|incorrect/i);
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: /выйти/i })).toHaveCount(0);
});
