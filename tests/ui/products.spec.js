const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { HomePage } = require('../../pages/HomePage');
const { ProductCard } = require('../../pages/components/ProductCard');

test.describe('Product card structure', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    await allure.epic('UI Tests');
    await allure.label('layer', 'ui');
    homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForProductsToLoad();
  });

  test('every product card has a visible, non-empty name', async () => {
  const cards = homePage.getProductCards();
  const count = await cards.count();

  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = new ProductCard(cards.nth(i));

    await expect(card.name).toBeVisible();

    const name = await card.getName();

    expect(name.trim()).not.toBe('');
  }
});

  test('every product card has a visible price in currency format', async () => {
  const cardLocators = homePage.getProductCards();
  const count = await cardLocators.count();

  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = new ProductCard(cardLocators.nth(i));

    await expect(card.price).toBeVisible();
    await expect(card.price).toHaveText(/^\$\d+(\.\d{1,2})?$/);
  }
});

test('Show only eco-friendly products filters results correctly', async () => {
  const cardLocators = homePage.getProductCards();

  // 1. включаем фильтр
  await homePage.ecoFilterCheckbox.check();

  // 2. даём UI обновиться (важно)
  await cardLocators.first().waitFor();

  const count = await cardLocators.count();
  expect(count).toBeGreaterThan(0);

  // 3. проверяем каждую карточку
  for (let i = 0; i < count; i++) {
    const card = new ProductCard(cardLocators.nth(i));

    await expect(card.ecoBadge, `Card ${i} should be eco-friendly`).toBeVisible();
  }
});

  test('clicking a product card navigates to the product detail page', async ({ page }) => {
    const firstCard = new ProductCard(homePage.getProductCards().first());
    const firstCardName = await firstCard.getName();

    await firstCard.click();
    await page.waitForURL(/\/product\//);

    // Name on detail page must match what was shown on the card
    await expect(page.getByTestId('product-name')).toHaveText(firstCardName);

    // unit-price renders the numeric value only — no currency symbol in the DOM
    await expect(page.getByTestId('unit-price')).toHaveText(/^\d+(\.\d{1,2})?$/);

    await expect(page.getByTestId('product-description')).toBeVisible();
    // No data-test on <img>; identify it by its alt text (equals product name).
    // Use toBeAttached rather than toBeVisible: some browsers (WebKit) may not
    // render AVIF images, giving the element 0 dimensions; the DOM presence is
    // what matters here.
    await expect(page.getByRole('img', { name: firstCardName })).toBeAttached();
    await expect(page.getByTestId('quantity')).toBeVisible();
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await expect(page.getByTestId('add-to-favorites')).toBeVisible();
    await expect(page.getByTestId('co2-rating-badge')).toBeVisible();

    await expect(page.getByTestId('specs-title')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Handle Material' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Length' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Material', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Warranty' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Weight' })).toBeVisible();
  });
});


