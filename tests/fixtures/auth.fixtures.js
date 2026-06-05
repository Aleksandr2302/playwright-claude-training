const timestamp = Date.now();

const user = {
  firstName: 'Test',
  lastName: 'Automation',
  dob: '1990-06-15',
  country: 'United States of America (the)',
  postalCode: '10001',
  houseNumber: '42',
  street: '5th Avenue',
  city: 'New York',
  state: 'NY',
  phone: '0212555010',
  email: `testuser+${timestamp}@example.com`,
  password: 'Playwrigh7#QaAut0m',
};

// Pre-existing account available on the demo site for standalone login tests
const existingUser = {
  email: 'customer@practicesoftwaretesting.com',
  password: 'welcome01',
};

module.exports = { user, existingUser };
