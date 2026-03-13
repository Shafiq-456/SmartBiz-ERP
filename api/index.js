const db = require('../server/db');
const seedDatabase = require('../server/autoSeed');
const app = require('../server/index');

// Auto-seed on Vercel cold start
seedDatabase(db);

// Export Express app as Vercel serverless function
module.exports = app;
