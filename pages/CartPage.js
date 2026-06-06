const { expect } = require('@playwright/test');

class CartPage {
  static PATH = '/checkout';

  constructor(page) {
    this.page = page;
    this.cartQuantityBadge = page.locator('[data-test="cart-quantity"]');
    this.cartItemRows = page.locator('tbody tr');
    this.proceedButton = page.locator('[data-test="proceed-1"]');
    this.deleteButtons = page.locator('tbody tr td:last-child img');
  }

  async openCart() {
    await this.page.goto(CartPage.PATH);
    await this.page.waitForURL(/\/checkout/);
  }

  async getCartItems() {
    const rows = await this.cartItemRows.all();
    const names = [];
    for (const row of rows) {
      const text = await row.locator('td').first().textContent();
      names.push(text.trim());
    }
    return names;
  }

  async verifyProductsPresent(expectedNames) {
    for (const name of expectedNames) {
      await expect(
        this.page.locator('tbody td').filter({ hasText: name }).first()
      ).toBeVisible();
    }
  }

  async getCartCount() {
    return parseInt(await this.cartQuantityBadge.textContent(), 10);
  }

  async clearCart() {
    await this.openCart();
    let count = await this.deleteButtons.count();
    while (count > 0) {
      await this.deleteButtons.first().click();
      await expect(this.cartItemRows).toHaveCount(count - 1);
      count = await this.deleteButtons.count();
    }
  }
 async proceedToCheckout() {
    await this.proceedButton.click();
  }
  

}

module.exports = { CartPage };
