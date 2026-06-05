const { expect } = require('@playwright/test');

/**
 * RentalsPage — page object for the /rentals overview page.
 *
 * Rental product cards on this page are <div data-test="product-{id}"> elements
 * (not <a> anchors like regular product listings).  Clicking a card navigates
 * to the standard /product/{id} detail page.
 *
 * Navigation path (UI-only):
 *   Categories button  →  Rentals link  →  /rentals
 */
class RentalsPage {
  static PATH = '/rentals';

  constructor(page) {
    this.page = page;

    // Nav triggers
    this.categoriesButton = page.getByTestId('nav-categories');
    this.rentalsLink      = page.getByTestId('nav-rentals');

    // Page landmark
    this.pageTitle   = page.getByTestId('page-title');
    // All rental product cards on the overview page
    this.productCards = page.locator('[data-test^="product-"]');
  }

  /**
   * Navigates to /rentals via the top-nav Categories → Rentals UI flow.
   * Waits for the "Rentals" heading to confirm the page is fully loaded.
   */
  async navigate() {
    await this.categoriesButton.click();
    await this.rentalsLink.click();
    await this.page.waitForURL('**/rentals');
    await expect(this.pageTitle).toHaveText('Rentals', { timeout: 10000 });
  }

  /**
   * Clicks the rental product card whose visible text contains `productName`
   * (case-sensitive, e.g. 'Excavator', 'Bulldozer', 'Crane').
   * Waits for navigation to the /product/{id} detail page.
   */
  async selectProduct(productName) {
    const card = this.productCards
      .filter({ hasText: productName })
      .first();

    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await this.page.waitForURL(/\/product\//);
  }
}

module.exports = { RentalsPage };
