const { expect } = require('@playwright/test');
const { ProductCard } = require('./components/ProductCard');

class ProductFiltersPage {
  static PATH = '/';

  constructor(page) {
    this.page = page;

    this.sortDropdown = page.getByTestId('sort');
    this.productCards = page.locator('a[data-test^="product-"]');
  }

  async navigate() {
    await this.page.goto(ProductFiltersPage.PATH);
  }

  async waitForProductsToLoad() {
    await expect(this.productCards.first()).toBeVisible();
  }

  async selectSortOption(optionValue) {
    // Register the response listener before triggering the dropdown so we never
    // miss the response.  With tests running serially (mode:'serial' in the spec)
    // the external server is not under parallel load, so the response arrives
    // well within the explicit 25 s timeout.
    const [response] = await Promise.all([
      this.page.waitForResponse(
        resp =>
          resp.url().includes('/products') &&
          resp.url().includes('sort=') &&
          resp.status() === 200,
        { timeout: 25000 }
      ),
      this.sortDropdown.selectOption(optionValue),
    ]);

    // Use the API response body to know exactly which product should be first,
    // then assert the DOM matches — this confirms Angular's render cycle completed.
    const body = await response.json();
    const firstProductId = body.data[0].id;
    await expect(this.productCards.first()).toHaveAttribute(
      'data-test',
      `product-${firstProductId}`
    );
  }

  getDisplayedProducts() {
    return this.productCards;
  }

  async extractProductNames() {
    const count = await this.productCards.count();
    const names = [];
    for (let i = 0; i < count; i++) {
      const card = new ProductCard(this.productCards.nth(i));
      names.push(await card.getName());
    }
    return names;
  }

  async extractProductPrices() {
    const count = await this.productCards.count();
    const prices = [];
    for (let i = 0; i < count; i++) {
      const card = new ProductCard(this.productCards.nth(i));
      const priceText = await card.getPrice();
      prices.push(parseFloat(priceText.replace('$', '')));
    }
    return prices;
  }

  async extractCO2Ratings() {
    const count = await this.productCards.count();
    const ratings = [];
    for (let i = 0; i < count; i++) {
      const cardLocator = this.productCards.nth(i);
      // Each badge renders all 5 letters (A–E); only the active one carries class "active"
      const activeLetter = cardLocator
        .getByTestId('co2-rating-badge')
        .locator('.co2-letter.active');
      ratings.push((await activeLetter.textContent()).trim());
    }
    return ratings;
  }
}

module.exports = { ProductFiltersPage };
