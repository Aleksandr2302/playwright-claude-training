const { expect } = require('@playwright/test');

class HomePage {
  static PATH = '/';

  constructor(page) {
    this.page = page;

    // Navigation
    this.navbar = page.getByRole('navigation');
    this.banner = page.getByRole('img', { name: 'Banner' });
    this.homeNavBar = page.getByTestId('nav-home');
    this.categoryNavBar = page.getByTestId('nav-categories');
    this.contactBar = page.getByTestId('nav-contact');
    this.signInBar = page.getByTestId('nav-sign-in');
    this.languageBar = page.getByTestId('language-select');

    this.logo = page
      .getByRole('link', { name: /Practice Software Testing - Toolshop/i })
      .first();

    // Search panel (sidebar)
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.clearSearchButton = page.getByRole('button', { name: 'X' });

    // Card containers are <a> elements; inner elements (product-name, product-price) are h5/span
    // so the tag qualifier correctly excludes them without CSS gymnastics
    this.productCards = page.locator('a[data-test^="product-"]');

    // ECO filter
    this.ecoFilterCheckbox = page.getByRole('checkbox', { name: 'Show only eco-friendly products' });
  }

  async navigate() {
    await this.page.goto(HomePage.PATH);
  }
  //
  

  /**
   * Types a search term and submits the search form.
   * Playwright auto-waits for the resulting DOM update — no explicit sleep needed.
   */
  async search(term) {
    await this.searchInput.clear();
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  getProductCards() {
    return this.productCards;
  }

  async getProductCount() {
    return this.productCards.count();
  }

  async waitForProductsToLoad() {
    await expect(this.productCards.first()).toBeVisible();
  }


  async waitForSearchResults() {
    await expect(this.page.getByText(/Searched for:/i)).toBeVisible();
    await expect(this.productCards.first()).toBeVisible();
  }
}

module.exports = { HomePage };
