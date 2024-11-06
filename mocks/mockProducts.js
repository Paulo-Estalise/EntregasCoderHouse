const { faker } = require('@faker-js/faker');

function generateMockProducts(quantity = 100) {
  const products = [];

  for (let i = 0; i < quantity; i++) {
    products.push({
      _id: faker.database.mongodbObjectId(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      thumbnail: faker.image.imageUrl(),
      code: faker.datatype.uuid(),
      stock: faker.datatype.number({ min: 1, max: 100 }),
    });
  }

  return products;
}

module.exports = generateMockProducts;