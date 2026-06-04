# Playwright Training Automation

This repository is a JavaScript-based Playwright automation starter project for the target application:
https://practicesoftwaretesting.com/

## Project purpose

- Provide a clean Playwright test automation structure.
- Prepare a Page Object Model-friendly layout for UI, API, and end-to-end tests.
- Keep the initial setup minimal and ready for future test implementation.

## Getting started

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Run tests:

```bash
npm test
```

Run Playwright tests directly:

```bash
npx playwright test
```

## Project layout

- `tests/ui` - UI tests and page object related tests
- `tests/api` - API and integration tests
- `tests/e2e` - end-to-end scenarios
- `pages` - page object models and UI structure
- `fixtures` - test fixtures and shared data setup
- `utils` - helper utilities and custom logic
- `test-data` - static test data and sample payloads
