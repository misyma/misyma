if (!process.env.CI || process.env.CI === 'false') {
  require('husky').install();
}
