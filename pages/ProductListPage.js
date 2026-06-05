const { expect } = require('@playwright/test');

class ProductListPage {
  static PATH = '/';

  constructor(page) {
    this.page = page;
    this.productCards = page.locator('a[data-test^="product-"]');
  }

  async navigate() {
    await this.page.goto(ProductListPage.PATH);
    await expect(this.productCards.first()).toBeVisible();
  }

  getAllProducts() {
    return this.productCards;
  }

  async selectRandomProduct() {
    const count = await this.productCards.count();
    expect(count).toBeGreaterThan(0);

    const randomIndex = Math.floor(Math.random() * count);
    const card = this.productCards.nth(randomIndex);

    const name = (await card.getByTestId('product-name').textContent()).trim();
    // Navigate by href to avoid overlay-interception issues on the listing page
    const href = await card.getAttribute('href');
    await this.page.goto(href);
    await this.page.waitForURL(/\/product\//);

    return name;
  }

  /**
   * Returns count unique random { name, href } pairs without navigating away.
   * Used by multi-product flows to collect links before visiting each product page.
   */
  async getRandomProductLinks(count) {
    const total = await this.productCards.count();
    expect(total).toBeGreaterThan(0);

    const indices = Array.from({ length: total }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    const links = [];
    for (const idx of indices) {
      const card = this.productCards.nth(idx);
      const name = (await card.getByTestId('product-name').textContent()).trim();
      const href = await card.getAttribute('href');
      links.push({ name, href });
    }
    return links;
  }

  /**
   * Selects a random product whose "Increase quantity" button is enabled.
   * Iterates through shuffled product indices until a suitable one is found.
   */
  async selectRandomProductWithQuantity() {
    const count = await this.productCards.count();
    expect(count).toBeGreaterThan(0);

    // Shuffle indices so we try in a random order without repetition
    const indices = Array.from({ length: count }, (_, i) => i)
      .sort(() => Math.random() - 0.5);

    for (const idx of indices) {
      const card = this.productCards.nth(idx);
      const href = await card.getAttribute('href');
      const name = (await card.getByTestId('product-name').textContent()).trim();

      await this.page.goto(href);
      await this.page.waitForURL(/\/product\//);

      const increaseBtn = this.page.getByRole('button', { name: 'Increase quantity' });
      const isEnabled = await increaseBtn.isEnabled();
      if (isEnabled) return name;

      // Product has no adjustable quantity — go back and try another
      await this.page.goto(ProductListPage.PATH);
      await expect(this.productCards.first()).toBeVisible();
    }

    throw new Error('No product with an enabled Increase quantity button found on this page');
  }
}

module.exports = { ProductListPage };
