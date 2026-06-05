const { test, expect } = require('@playwright/test');
const { LoginPage }             = require('../../pages/LoginPage');
const { RentalsPage }           = require('../../pages/RentalsPage');
const { ProductPage }           = require('../../pages/ProductPage');
const { CartPage }              = require('../../pages/CartPage');
const { CheckoutPage }          = require('../../pages/CheckoutPage');
const { OrderConfirmationPage } = require('../../pages/OrderConfirmationPage');
const { existingUser }          = require('../fixtures/auth.fixtures');

// ---------------------------------------------------------------------------
// Billing address — reused across the suite
// ---------------------------------------------------------------------------
const BILLING = {
  country:     'United States of America (the)',
  postalCode:  '10001',
  houseNumber: '42',
  street:      '5th Avenue',
  city:        'New York',
  state:       'NY',
};

// Rental product to purchase.
// Valid choices visible on /rentals: 'Excavator' | 'Bulldozer' | 'Crane'
const RENTAL_PRODUCT = 'Excavator';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function loginAsExistingUser(page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(existingUser.email, existingUser.password);
  await loginPage.getLoginSuccessState();
}

async function clearCart(page) {
  const cartPage = new CartPage(page);
  await cartPage.clearCart();
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
test.describe('Checkout flow', () => {
  test.setTimeout(90_000);

  // ── Rental product checkout (Excavator) ───────────────────────────────────
  //
  // Flow:
  //   1. Login as existing user
  //   2. Clear cart for a clean state
  //   3. Navigate to Rentals via UI: Categories ▶ Rentals
  //   4. Assert Rentals page is loaded and all three products are visible
  //   5. Select Excavator and open its product detail page
  //   6. Assert correct product is shown
  //   7. Add to cart — verify success toast
  //   8. Open cart — verify Excavator is listed
  //   9. Proceed through all checkout steps (billing → payment)
  //  10. Verify "Payment was successful" confirmation
  // ─────────────────────────────────────────────────────────────────────────
  test('rental checkout — Excavator via Rentals category', async ({ page }) => {

    // ── Arrange ──────────────────────────────────────────────────────────────
    await loginAsExistingUser(page);
    await clearCart(page);

    // ── Act: navigate to Rentals via UI nav ───────────────────────────────────
    const rentalsPage = new RentalsPage(page);
    await rentalsPage.navigate();

    // Assert: all three rental products are visible on the overview page
    await expect(page.getByRole('heading', { name: 'Excavator', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bulldozer', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Crane',     exact: true })).toBeVisible();

    // ── Act: select Excavator and open its product detail page ────────────────
    await rentalsPage.selectProduct(RENTAL_PRODUCT);

    // Assert: correct product page loaded
    await expect(page.getByTestId('product-name')).toHaveText(RENTAL_PRODUCT);

    // ── Act: add to cart and verify toast ─────────────────────────────────────
    const productPage = new ProductPage(page);
    await productPage.addToCart();

    const toast = await productPage.getAddToCartMessage();
    expect(toast).toContain('Product added to shopping cart.');

    // ── Act: open cart and verify product ────────────────────────────────────
    const cartPage = new CartPage(page);
    await cartPage.openCart();
    await cartPage.verifyProductsPresent([RENTAL_PRODUCT]);

    // ── Act: proceed through checkout ─────────────────────────────────────────
    await cartPage.proceedToCheckout();

    const checkoutPage = new CheckoutPage(page);

    // Step 2 — account (already logged in)
    await checkoutPage.proceedAsLoggedIn();

    // Step 3 — billing address
    await expect(checkoutPage.countrySelect).toBeVisible({ timeout: 15000 });
    await checkoutPage.fillBillingAddress(BILLING);
    await checkoutPage.proceedFromBilling();

    // Step 4 — payment method
    await checkoutPage.fillPaymentInformation('Cash on Delivery');
    await checkoutPage.placeOrder();

    // ── Assert: order confirmation ────────────────────────────────────────────
    const confirmPage = new OrderConfirmationPage(page);
    await confirmPage.verifyOrderSuccess();

    const confirmationMessage = await confirmPage.getConfirmationMessage();
    expect(confirmationMessage).toContain('Payment was successful');
  });
});
