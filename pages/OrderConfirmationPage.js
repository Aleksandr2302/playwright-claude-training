const { expect } = require('@playwright/test');

class OrderConfirmationPage {
  constructor(page) {
    this.page = page;
    this.successMessage = page.locator('[data-test="payment-success-message"]');
  }

  async getConfirmationMessage() {
    await expect(this.successMessage).toBeVisible();
    return (await this.successMessage.textContent()).trim();
  }

  async verifyOrderSuccess() {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText('Payment was successful');
  }
}

module.exports = { OrderConfirmationPage };
