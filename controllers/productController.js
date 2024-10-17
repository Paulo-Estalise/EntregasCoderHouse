const ProductDao = require('../dao/mongo/productDao');


export const getProducts = async (req, res) => {
    try {
        const products = await ProductDao.getAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await ProductDao.getById(id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produto' });
    }
};
