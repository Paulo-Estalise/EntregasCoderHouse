import ProductModel from './models/productModel.js';

class ProductDao {
    static async getAll() {
        return await ProductModel.find();
    }

    static async getById(id) {
        return await ProductModel.findById(id);
    }

    // Métodos adicionais para criação, atualização e exclusão podem ser adicionados aqui
}

export default ProductDao;
