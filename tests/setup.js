const mongoose = require('mongoose');
const dbClient = require('../config/dbClient');

beforeAll(async () => {
  await dbClient.conectarBD();
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await dbClient.desconectarBD();
});