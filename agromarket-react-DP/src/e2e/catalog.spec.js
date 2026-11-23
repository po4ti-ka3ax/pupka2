import { test, expect } from '@playwright/test';

// @smoke — только чтение, можно запускать против продакшена

test('@smoke главная открывается, каталог показывает товары', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/АгроМаркет/);
  await expect(page.getByTestId('product-card').first()).toBeVisible();
});

test('@smoke страница товара открывается из каталога', async ({ page }) => {
  await page.goto('/');
  const first = page.getByTestId('product-card').first();
  const link = first.getByRole('link').first();
  const name = await link.innerText();
  await link.click();

  await expect(page).toHaveURL(/\/products\/\d+/);
  await expect(page.getByRole('heading', { name })).toBeVisible();
});
