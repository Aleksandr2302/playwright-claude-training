const { test, expect } = require('@playwright/test');
const { LoginPage }       = require('../../pages/LoginPage');
const { ProductListPage } = require('../../pages/ProductListPage');
const { ProductPage }     = require('../../pages/ProductPage');
const { existingUser }    = require('../fixtures/auth.fixtures');

test.describe('Product interaction flow', () => {
  test.setTimeout(90_000);

  // ─── Authenticated user tests ──────────────────────────────────────────────
  // Each test in this group logs in via beforeEach so auth state is isolated.

  test.describe('Authenticated user', () => {

    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(existingUser.email, existingUser.password);
      await loginPage.getLoginSuccessState();
    });

    test('quantity counter increases to 3 after two clicks', async ({ page }) => {
      // Arrange
      const listPage = new ProductListPage(page);
      await listPage.navigate();
      await listPage.selectRandomProductWithQuantity();

      const productPage = new ProductPage(page);

      // Act — click + twice (initial value is 1, target is 3)
      await productPage.increaseQuantity(2);

      // Assert
      const qty = await productPage.getQuantityValue();
      expect(qty).toBe(3);
    });

    test('add to cart shows success message', async ({ page }) => {
      // Arrange
      const listPage = new ProductListPage(page);
      await listPage.navigate();
      await listPage.selectRandomProduct();

      const productPage = new ProductPage(page);

      // Act
      await productPage.addToCart();

      // Assert
      const message = await productPage.getAddToCartMessage();
      expect(message).toContain('Product added to shopping cart.');
    });

    test('add to favorites triggers a successful API response', async ({ page }) => {
      // Arrange
      const listPage = new ProductListPage(page);
      await listPage.navigate();
      await listPage.selectRandomProduct();

      const productPage = new ProductPage(page);

      // Act
      const status = await productPage.addToFavorites();

      // Assert — 201 = newly added, 409 = already in favourites; both confirm the feature fires correctly
      expect([201, 409]).toContain(status);
    });

    test('compare button adds product to compare list in sessionStorage', async ({ page }) => {
      // Arrange
      const listPage = new ProductListPage(page);
      await listPage.navigate();
      await listPage.selectRandomProduct();

      const productId = page.url().split('/product/')[1];
      const productPage = new ProductPage(page);

      // Act
      const compareIds = await productPage.addToCompare();

      // Assert — the current product ID is present in the sessionStorage compare list
      expect(compareIds).toContain(productId);
    });

  });

  // ─── Guest user tests ──────────────────────────────────────────────────────
  // No beforeEach login — these tests run as anonymous / unauthenticated users.

  test.describe('Guest user', () => {

    test('unauthorized user cannot add product to favorites', async ({ page }) => {
      // Arrange — no login; user is anonymous
      const listPage = new ProductListPage(page);
      await listPage.navigate();
      await listPage.selectRandomProduct();

      const productPage = new ProductPage(page);

      // Act — click "Add to favourites"; API returns 401, UI shows error alert
      const status = await productPage.addToFavorites();
      const message = await productPage.getAlertMessage();

      // Assert
      expect(status).toBe(401);
      expect(message).toBe('Unauthorized, can not add product to your favorite list.');
    });

  });

});
