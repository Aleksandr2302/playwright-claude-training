const { expect } = require('@playwright/test');

class ProductCategoriesPage {
  static PATH = '/';

  // Stable core parent category names (IDs are resolved dynamically at runtime
  // because the demo site occasionally rebuilds with new IDs)
  static CORE_PARENT_NAMES = ['Hand Tools', 'Power Tools', 'Rentals', 'Other'];

  constructor(page) {
    this.page = page;

    // Regular product cards on the / and /category/* pages (anchor tags)
    this.productCards = page.locator('a[data-test^="product-"]');

    // Rental product cards on /rentals — rendered as <div>, not <a>
    this.rentalProductCards = page.locator('div[data-test^="product-"]');

    // Empty-state element rendered when a category has 0 products
    this.emptyStateMessage = page.getByTestId('category-empty');

    this._categoryTree = null; // lazy-loaded per instance
  }

  async navigate() {
    await this.page.goto(ProductCategoriesPage.PATH);
    await expect(this.productCards.first()).toBeVisible({ timeout: 20000 });
  }

  // ── Category API helpers ──────────────────────────────────────────────────

  /** Fetches (and caches) the full categories tree from the API. */
  async _getCategoryTree() {
    if (!this._categoryTree) {
      const resp = await this.page.request.get(
        'https://api.practicesoftwaretesting.com/categories/tree'
      );
      this._categoryTree = await resp.json();
    }
    return this._categoryTree;
  }

  /**
   * Returns a Map<subCategoryId, parentCategoryId> built from the category tree.
   * Used to validate that filtered products actually belong to the right parent.
   */
  async buildSubToParentMap() {
    const tree = await this._getCategoryTree();
    const map = new Map();
    for (const parent of tree) {
      for (const sub of parent.sub_categories || []) {
        map.set(sub.id, parent.id);
      }
    }
    return map;
  }

  /**
   * Returns the current API id for a parent category looked up by name.
   * Avoids relying on hardcoded IDs that may change as the demo site rebuilds.
   */
  async getParentCategoryId(categoryName) {
    const tree = await this._getCategoryTree();
    const parent = tree.find(c => c.name === categoryName);
    if (!parent) throw new Error(`Parent category "${categoryName}" not found in API`);
    return parent.id;
  }

  /** Resolves a category name (parent or sub) to its API id. */
  async _resolveCategoryId(categoryName) {
    const tree = await this._getCategoryTree();
    for (const parent of tree) {
      if (parent.name === categoryName) return parent.id;
      for (const sub of parent.sub_categories || []) {
        if (sub.name === categoryName) return sub.id;
      }
    }
    throw new Error(`Category "${categoryName}" not found in API category tree`);
  }

  // ── UI interactions ───────────────────────────────────────────────────────

  /**
   * Clicks the category checkbox for the given category name and waits for
   * the products API to respond. Returns the parsed JSON response body.
   *
   * DOM structure: <label><input data-test="category-{id}"> Name</label>
   * The input lives inside the label, so we resolve name → id via the API
   * and click the input directly using its data-test attribute.
   */
  async selectCategory(categoryName) {
    const categoryId = await this._resolveCategoryId(categoryName);

    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('/products') && resp.status() === 200,
      { timeout: 15000 }
    );

    // Use a generous timeout — the demo server can be slow under parallel load
    await this.page.getByTestId(`category-${categoryId}`).click({ timeout: 20000 });

    const response = await responsePromise;
    return response.json();
  }

  getDisplayedProducts() {
    return this.productCards;
  }

  /**
   * Returns true when no product cards are visible after a category filter.
   * Caller is responsible for waiting for the filter to apply (selectCategory
   * already awaits the API response, so by the time this is called the DOM
   * should reflect the filtered state).
   */
  async isEmptyStateVisible() {
    const count = await this.productCards.count();
    return count === 0;
  }

  // ── Helper finders ────────────────────────────────────────────────────────

  /**
   * Returns the first parent-level category from the API that:
   *   - is NOT one of the three stable core categories
   *   - has no sub_categories
   *   - (checked lazily) has 0 products
   * Limits product-count checks to the first 5 candidates to avoid timeouts.
   */
  async findEmptyCategory() {
    const tree = await this._getCategoryTree();
    const stableNames = new Set(ProductCategoriesPage.CORE_PARENT_NAMES);

    const candidates = tree
      .filter(cat => !stableNames.has(cat.name) && cat.sub_categories.length === 0)
      .slice(0, 5);

    for (const cat of candidates) {
      const resp = await this.page.request.get(
        `https://api.practicesoftwaretesting.com/products?category_id=${cat.id}&page=1`
      );
      const data = await resp.json();
      if (data.total === 0) return cat;
    }
    return null;
  }

  /**
   * Checks whether a "Rentals" parent category exists in the API tree.
   * Returns the category object or null.
   */
  async findRentalsCategory() {
    const tree = await this._getCategoryTree();
    return tree.find(c => c.name === 'Rentals') ?? null;
  }

  // ── Pure-UI navigation helpers (no API calls) ─────────────────────────────

  /**
   * Navigates to /category/special-tools via the top-nav dropdown:
   *   Categories ▶ Special Tools
   *
   * Special Tools is the UI-accessible empty category on v5 — it appears in
   * the nav but has 0 products, making it the canonical target for empty-state
   * tests without needing any API lookup.
   */
  async navigateToSpecialTools() {
    await this.page.goto('/');
    await this.page.getByTestId('nav-categories').click();
    const link = this.page.getByTestId('nav-special-tools');
    await expect(link).toBeVisible({ timeout: 5000 });
    await link.click();
    await this.page.waitForURL('**/category/special-tools');
  }

  /**
   * Navigates to /rentals via the top-nav dropdown:
   *   Categories ▶ Rentals
   *
   * The Rentals section is a dedicated route (not a sidebar checkbox filter)
   * that lists Excavator, Bulldozer and Crane as div[data-test^="product-"]
   * cards.
   */
  async navigateToRentals() {
    await this.page.goto('/');
    await this.page.getByTestId('nav-categories').click();
    const link = this.page.getByTestId('nav-rentals');
    await expect(link).toBeVisible({ timeout: 5000 });
    await link.click();
    await this.page.waitForURL('**/rentals');
  }
}

module.exports = { ProductCategoriesPage };
