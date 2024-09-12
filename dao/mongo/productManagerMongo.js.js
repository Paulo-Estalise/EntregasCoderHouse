const Product = require('../models/product.model');

class ProductManagerMongo {
    async addProduct(productData) {
        const product = new Product(productData);
        return await product.save();
    }

    async getProducts() {
        return await Product.find();
    }

    async getProductById(id) {
        return await Product.findById(id);
    }

    async updateProduct(id, updatedFields) {
        return await Product.findByIdAndUpdate(id, updatedFields, { new: true });
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }
}

module.exports = new ProductManagerMongo();
