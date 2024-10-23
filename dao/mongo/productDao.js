const ProductModel = require('../../models/product.model');

class ProductDao {
    static async getAll() {
        return await ProductModel.find();
    }

    static async getById(id) {
        return await ProductModel.findById(id);
    }

    // Métodos adicionais para criação, atualização e exclusão podem ser adicionados aqui
}

module.exports = ProductDao;
