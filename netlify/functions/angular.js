const { createServerRenderer } = require('@netlify/angular-runtime');
module.exports = { handler: createServerRenderer() };