const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../pages/HomePage');

test.describe('Homepage — initial load', () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('loads at the correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/practicesoftwaretesting\.com/);
  });

  test('navigation bar and banner is visible', async () => {
    await expect(homePage.navbar).toBeVisible();
    await expect(homePage.banner).toBeVisible();
    await expect(homePage.homeNavBar).toBeVisible();
    await expect(homePage.categoryNavBar).toBeVisible();
    await expect(homePage.contactBar).toBeVisible();
    await expect(homePage.signInBar).toBeVisible();
    await expect(homePage.languageBar).toBeVisible();
  });

  test('Toolshop logo is visible', async () => {
    await expect(homePage.logo).toBeVisible();
  });

  test('products grid contains at least one product card', async () => {
    await homePage.waitForProductsToLoad();
    const count = await homePage.getProductCount();
    expect(count, 'Expected at least 1 product on the homepage').toBeGreaterThan(0);
  });


});
