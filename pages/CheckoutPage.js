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
    await this.countrySelect.selectOption(country);
    await this.postalCodeInput.fill(postalCode);
    await this.houseNumberInput.fill(houseNumber);
    await this.streetInput.fill(street);
    await this.cityInput.fill(city);
    await this.stateInput.fill(state);
  }

  async proceedFromBilling() {
    await expect(this.proceedBillingButton).toBeEnabled();
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
