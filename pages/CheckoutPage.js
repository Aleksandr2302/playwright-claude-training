const { expect } = require('@playwright/test');

class CheckoutPage {
  constructor(page) {
    this.page = page;

    // Step 2 — already-logged-in confirmation
    this.proceedLoggedInButton = page.locator('[data-test="proceed-2"]');

    // Step 3 — billing address
    this.countrySelect     = page.locator('[data-test="country"]');
    this.postalCodeInput   = page.locator('[data-test="postal_code"]');
    this.houseNumberInput  = page.locator('[data-test="house_number"]');
    this.streetInput       = page.locator('[data-test="street"]');
    this.cityInput         = page.locator('[data-test="city"]');
    this.stateInput        = page.locator('[data-test="state"]');
    this.proceedBillingButton = page.locator('[data-test="proceed-3"]');

    // Step 4 — payment
    this.paymentMethodSelect = page.locator('[data-test="payment-method"]');
    this.confirmButton       = page.locator('[data-test="finish"]');
  }

  async proceedAsLoggedIn() {
    await this.proceedLoggedInButton.click();
  }

  async fillBillingAddress({ country, postalCode, houseNumber, street, city, state }) {
    // Wait for the billing form to be ready: the country select must be enabled
    // before we start filling (Angular may still be initialising the form group
    // or loading the saved-address profile asynchronously).
    await expect(this.countrySelect).toBeEnabled({ timeout: 15000 });

    await this.countrySelect.selectOption(country);
    await this.postalCodeInput.fill(postalCode);
    await this.houseNumberInput.fill(houseNumber);
    await this.streetInput.fill(street);
    await this.cityInput.fill(city);
    await this.stateInput.fill(state);

    // Tab away from the last field so Angular marks the control as "touched"
    // and runs the final synchronous validation pass before we check the button.
    await this.stateInput.press('Tab');
  }

  async proceedFromBilling() {
    // Angular reactive form validation can take a moment to enable the button
    // after all required fields are filled — use a generous timeout.
    // The 20 s window covers the async saved-address profile load that
    // occasionally overwrites fields and triggers a re-validation cycle.
    await expect(this.proceedBillingButton).toBeEnabled({ timeout: 20000 });
    await this.proceedBillingButton.click();
  }

  async fillPaymentInformation(method = 'Cash on Delivery') {
    await this.paymentMethodSelect.selectOption(method);
  }

  async placeOrder() {
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
  }
}

module.exports = { CheckoutPage };
