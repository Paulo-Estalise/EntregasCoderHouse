const express = require('express');
const router = express.Router();
const generateMockProducts = require('../mocks/mockProducts');

router.get('/mockingproducts', (req, res) => {
  const mockProducts = generateMockProducts();
  res.status(200).json(mockProducts);
});

module.exports = router;