const { test, expect } = require('@playwright/test');
const { LoginPage }            = require('../../pages/LoginPage');
const { ProductListPage }      = require('../../pages/ProductListPage');
const { ProductPage }          = require('../../pages/ProductPage');
const { CartPage }             = require('../../pages/CartPage');
const { CheckoutPage }         = require('../../pages/CheckoutPage');
const { OrderConfirmationPage} = require('../../pages/OrderConfirmationPage');
const { existingUser }         = require('../fixtures/auth.fixtures');
const { billingAddress, paymentMethod } = require('../fixtures/checkout.fixtures');

test.describe('E2E — Checkout Flow', () => {
  test.setTimeout(120_000);

  test('logged-in user adds 2 products and completes checkout successfully', async ({ page }) => {

    // ── Arrange: Login ──────────────────────────────────────────────────────
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(existingUser.email, existingUser.password);
    await loginPage.getLoginSuccessState();

    // ── Arrange: Clear any leftover cart items ───────────────────────────────
    const cartPage = new CartPage(page);
    await cartPage.clearCart();

    // ── Arrange: Add 2 available products to cart ───────────────────────────
    // Fetch more candidates than needed so we can skip out-of-stock products.
    const listPage = new ProductListPage(page);
    await listPage.navigate();
    const candidates = await listPage.getRandomProductLinks(10);

    const addedProductNames = [];
    for (const { name, href } of candidates) {
      if (addedProductNames.length === 2) break;

      await page.goto(href);
      await page.waitForURL(/\/product\//);
      const productPage = new ProductPage(page);

      // Skip product if Add to cart button is disabled (out of stock / unavailable)
      const canAdd = await productPage.addToCartButton.isEnabled();
      if (!canAdd) continue;

      await productPage.addToCart();
      const msg = await productPage.getAddToCartMessage();
      expect(msg).toContain('Product added to shopping cart.');
      addedProductNames.push(name);
    }

    expect(addedProductNames.length).toBe(2);

    // ── Act: Open cart ───────────────────────────────────────────────────────
    await cartPage.openCart();

    // Assert both products are visible in the cart
    await cartPage.verifyProductsPresent(addedProductNames);

    // Assert cart count badge reflects what we added
    const cartCount = await cartPage.getCartCount();
    expect(cartCount).toBe(addedProductNames.length);

    // ── Act: Checkout Step 1 → Step 2 (Cart → Sign in) ──────────────────────
    await cartPage.proceedToCheckout();

    // ── Act: Checkout Step 2 → Step 3 (already logged in) ───────────────────
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.proceedAsLoggedIn();

    // ── Act: Checkout Step 3 — Billing Address ──────────────────────────────
    await checkoutPage.fillBillingAddress(billingAddress);
    await checkoutPage.proceedFromBilling();

    // ── Act: Checkout Step 4 — Payment ──────────────────────────────────────
    await checkoutPage.fillPaymentInformation(paymentMethod);
    await checkoutPage.placeOrder();

    // ── Assert: Order confirmed ──────────────────────────────────────────────
    const confirmationPage = new OrderConfirmationPage(page);
    await confirmationPage.verifyOrderSuccess();

    const message = await confirmationPage.getConfirmationMessage();
    expect(message).toContain('Payment was successful');
  });
});
