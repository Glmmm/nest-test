// Runs before the test files are loaded, so AppModule/DataSource pick up the
// test database instead of the development one.
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.TEST_DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT ?? '5432';
process.env.DB_USER = process.env.TEST_DB_USER ?? process.env.DB_USER ?? 'root';
process.env.DB_PASSWORD =
  process.env.TEST_DB_PASSWORD ?? process.env.DB_PASSWORD ?? '123';
process.env.DB_NAME = process.env.TEST_DB_NAME ?? 'nuvve_test';
process.env.DB_SYNCHRONIZE = 'false';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-test-secret';
process.env.JWT_EXPIRES_IN = '1h';
