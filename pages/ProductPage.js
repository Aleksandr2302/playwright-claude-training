const { expect } = require('@playwright/test');

class ProductPage {
  constructor(page) {
    this.page = page;

    this.quantityInput   = page.getByTestId('quantity');
    this.increaseButton  = page.getByRole('button', { name: 'Increase quantity' });
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.favoritesButton = page.getByTestId('add-to-favorites');
    this.compareButton   = page.getByTestId('add-to-compare');
    this.cartToast       = page.getByRole('alert');
  }

  async increaseQuantity(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.increaseButton.click();
    }
  }

  async getQuantityValue() {
    return parseInt(await this.quantityInput.inputValue(), 10);
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async getAddToCartMessage() {
    await expect(this.cartToast).toBeVisible();
    return (await this.cartToast.textContent()).trim();
  }

  async getAlertMessage() {
    await expect(this.cartToast).toBeVisible();
    return (await this.cartToast.textContent()).trim();
  }

  /**
   * Clicks "Add to favourites" and waits for the API response.
   * Returns the HTTP status: 201 = newly added, 409 = already in favourites.
   */
  async addToFavorites() {
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('/favorites') && resp.request().method() === 'POST'
    );
    await this.favoritesButton.click();
    const response = await responsePromise;
    return response.status();
  }

  /**
   * Clicks "Compare" and returns the updated compare_ids array from sessionStorage.
   * Compare is fully client-side — no network call is made.
   */
  async addToCompare() {
    const productId = this.page.url().split('/product/')[1];
    await this.compareButton.click();
    const raw = await this.page.evaluate(() => sessionStorage.getItem('compare_ids'));
    return raw ? JSON.parse(raw) : [];
  }
}

module.exports = { ProductPage };
