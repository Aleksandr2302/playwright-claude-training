const { test, expect } = require('@playwright/test');
const { allure } = require('allure-playwright');

const BASE_URL = 'https://api.practicesoftwaretesting.com';

// Label every test in this file as an API test for Allure grouping
test.beforeEach(async () => {
  await allure.epic('API Tests');
  await allure.label('layer', 'api');
});

test('GET /products returns list with items', async ({ request }) => {
  let body;

  await test.step('send request', async () => {
    const response = await request.get(`${BASE_URL}/products`);
    expect(response.status()).toBe(200);
    body = await response.json();
  });

  await test.step('validate response structure', async () => {
    expect(Array.isArray(body.data), 'body.data should be an array').toBe(true);
    expect(body.data.length, 'product list should not be empty').toBeGreaterThan(0);
  });

  await test.step('validate first product fields', async () => {
    const product = body.data[0];
    expect(typeof product.id, 'id should be a string').toBe('string');
    expect(product.id.trim()).not.toBe('');
    expect(typeof product.name, 'name should be a string').toBe('string');
    expect(product.name.trim()).not.toBe('');
  });
});

test('GET /products/:id returns single product', async ({ request }) => {
  let productId;
  let body;

  await test.step('get a valid product id from list', async () => {
    const listRes = await request.get(`${BASE_URL}/products`);
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    expect(Array.isArray(listBody.data) && listBody.data.length > 0,
      'product list must have at least one item to run this test').toBe(true);
    productId = listBody.data[0].id;
  });

  await test.step('fetch product by id', async () => {
    const response = await request.get(`${BASE_URL}/products/${productId}`);
    expect(response.status()).toBe(200);
    body = await response.json();
  });

  await test.step('validate product fields', async () => {
    expect(body.id).toBe(productId);
    expect(typeof body.name, 'name should be a string').toBe('string');
    expect(body.name.trim()).not.toBe('');
    expect(typeof body.price, 'price should be a number').toBe('number');
    expect(body.price, 'price should be positive').toBeGreaterThan(0);
  });
});

test('POST /carts creates a new cart', async ({ request }) => {
  let body;

  await test.step('send request', async () => {
    const response = await request.post(`${BASE_URL}/carts`);
    expect(response.status()).toBe(201);
    body = await response.json();
  });

  await test.step('validate cart id', async () => {
    expect(typeof body.id, 'cart id should be a string').toBe('string');
    expect(body.id.trim()).not.toBe('');
  });
});

test('POST /users/register creates a new user', async ({ request }) => {
  const email = `test_${Date.now()}@example.com`;
  let body;

  await test.step('send register request', async () => {
    const response = await request.post(`${BASE_URL}/users/register`, {
      data: {
        first_name: 'John',
        last_name: 'Doe',
        address: {
          street: 'Street 1',
          house_number: '12',
          city: 'City',
          state: 'State',
          country: 'Country',
          postal_code: '1234AA',
        },
        phone: '0987654321',
        dob: '1970-01-01',
        password: 'SuperSecure@123',
        email,
      },
    });
    expect(response.status()).toBe(201);
    body = await response.json();
  });

  await test.step('validate created user fields', async () => {
    expect(typeof body.id, 'id should be a string').toBe('string');
    expect(body.id.trim()).not.toBe('');
    expect(body.email).toBe(email);
    expect(body).not.toHaveProperty('password');
  });
});
