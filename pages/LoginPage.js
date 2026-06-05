const { expect } = require('@playwright/test');

class LoginPage {
  static PATH = '/auth/login';

  constructor(page) {
    this.page = page;

    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    // nav-menu is the visible user dropdown toggle — only present when authenticated
    this.navMenu = page.getByTestId('nav-menu');
    // page-title is the H1 on /account — confirms the dashboard rendered
    this.pageTitle = page.getByTestId('page-title');
  }

  async navigate() {
    await this.page.goto(LoginPage.PATH);
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async assertLoginSuccess() {
    await expect(this.page).toHaveURL(/\/account/);
    await expect(this.navMenu).toBeVisible();
    await expect(this.pageTitle).toHaveText('My account');
  }
}

module.exports = { LoginPage };
