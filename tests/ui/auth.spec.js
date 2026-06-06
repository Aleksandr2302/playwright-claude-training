const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');
const { RegistrationPage } = require('../../pages/RegistrationPage');
const { LoginPage } = require('../../pages/LoginPage');
const { user, existingUser } = require('../fixtures/auth.fixtures');

test.describe('Auth — registration and login E2E', () => {

  test.beforeEach(async () => {
    await allure.epic('UI Tests');
    await allure.label('layer', 'ui');
  });

  test('registers a new user successfully', async ({ page }) => {
    // Arrange
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();

    // Act
    await registrationPage.fillFirstName(user.firstName);
    await registrationPage.fillLastName(user.lastName);
    await registrationPage.fillDateOfBirth(user.dob);
    await registrationPage.fillAddressFields({
      country:     user.country,
      postalCode:  user.postalCode,
      houseNumber: user.houseNumber,
      street:      user.street,
      city:        user.city,
      state:       user.state,
    });
    await registrationPage.fillContactInfo({ phone: user.phone });
    await registrationPage.fillCredentials({ email: user.email, password: user.password });
    await registrationPage.submitRegistration();

    // Assert — successful registration redirects to login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15000 });
  });

  test('logs in with existing customer account', async ({ page }) => {
    // Arrange — uses the demo site's pre-seeded account, no registration dependency
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    // Act
    await loginPage.login(existingUser.email, existingUser.password);

    // Assert
    await loginPage.assertLoginSuccess();
  });

  test('full flow: register then immediately login', async ({ page }) => {
    const timestamp = Date.now();
    const uniqueEmail = `e2e+${timestamp}@example.com`;

    // ── Arrange / Register ──────────────────────────────────────────────────
    const registrationPage = new RegistrationPage(page);
    await registrationPage.navigate();

    await registrationPage.fillFirstName(user.firstName);
    await registrationPage.fillLastName(user.lastName);
    await registrationPage.fillDateOfBirth(user.dob);
    await registrationPage.fillAddressFields({
      country:     user.country,
      postalCode:  user.postalCode,
      houseNumber: user.houseNumber,
      street:      user.street,
      city:        user.city,
      state:       user.state,
    });
    await registrationPage.fillContactInfo({ phone: user.phone });
    await registrationPage.fillCredentials({ email: uniqueEmail, password: user.password });
    await registrationPage.submitRegistration();

    // ── Act / Login ──────────────────────────────────────────────────────────
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15000 });

    const loginPage = new LoginPage(page);
    await loginPage.login(uniqueEmail, user.password);

    // ── Assert ───────────────────────────────────────────────────────────────
    await loginPage.assertLoginSuccess();
  });

});
