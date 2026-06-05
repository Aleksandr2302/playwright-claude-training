
const { expect } = require('@playwright/test');

class RegistrationPage {
  static PATH = '/auth/register';

  constructor(page) {
    this.page = page;

    this.firstNameInput  = page.getByTestId('first-name');
    this.lastNameInput   = page.getByTestId('last-name');
    this.dobInput        = page.getByTestId('dob');
    this.countrySelect   = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code');
    this.houseNumberInput= page.getByTestId('house_number');
    this.streetInput     = page.getByTestId('street');
    this.cityInput       = page.getByTestId('city');
    this.stateInput      = page.getByTestId('state');
    this.phoneInput      = page.getByTestId('phone');
    this.emailInput      = page.getByTestId('email');
    this.passwordInput   = page.getByTestId('password');
    this.submitButton    = page.getByTestId('register-submit');
  }

  async navigate() {
    await this.page.goto(RegistrationPage.PATH);
  }

  async fillFirstName(value) {
    await this.firstNameInput.fill(value);
  }

  async fillLastName(value) {
    await this.lastNameInput.fill(value);
  }

  async fillDateOfBirth(value) {
    await this.dobInput.fill(value);
  }

  async fillAddressFields({ country, postalCode, houseNumber, street, city, state }) {
    await this.countrySelect.selectOption(country);
    await this.postalCodeInput.fill(postalCode);
    await this.houseNumberInput.fill(houseNumber);
    await this.streetInput.fill(street);
    await this.cityInput.fill(city);
    await this.stateInput.fill(state);
  }

  async fillContactInfo({ phone }) {
    await this.phoneInput.fill(phone);
  }

  async fillCredentials({ email, password }) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitRegistration() {
    await this.submitButton.click();
  }

  async getSuccessMessage() {
    const alert = this.page.getByRole('alert').first();
    await expect(alert).toBeVisible();
    return alert.textContent();
  }
}

module.exports = { RegistrationPage };
