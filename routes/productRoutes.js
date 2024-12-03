const express = require('express');
const router = express.Router();
const generateMockProducts = require('../mocks/mockProducts');

router.get('/mockingproducts', (req, res) => {
  const mockProducts = generateMockProducts();
  res.status(200).json(mockProducts);
});

module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Produtos
 *   description: Operações relacionadas a produtos
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     responses:
 *       200:
 *         description: Lista de produtos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do produto.
 *                   name:
 *                     type: string
 *                     description: Nome do produto.
 */
router.get('/', (req, res) => {
  res.json([{ id: '1', name: 'Produto A' }]);
});
