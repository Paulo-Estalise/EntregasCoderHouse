/**
 * @swagger
 * tags:
 *   name: Carrinhos
 *   description: Operações relacionadas a carrinhos de compras
 */

/**
 * @swagger
 * /carts:
 *   post:
 *     summary: Cria um novo carrinho
 *     tags: [Carrinhos]
 *     responses:
 *       201:
 *         description: Carrinho criado com sucesso.
 */
router.post('/', (req, res) => {
    res.status(201).json({ message: 'Carrinho criado' });
  });
  