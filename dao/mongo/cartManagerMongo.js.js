const Cart = require('../models/cart.model');

class CartManagerMongo {
    async createCart() {
        const cart = new Cart();
        return await cart.save();
    }

    async addProductToCart(cartId, productId) {
        return await Cart.findByIdAndUpdate(cartId, { $push: { products: productId } }, { new: true });
    }

    async getCartById(id) {
        return await Cart.findById(id).populate('products');
    }
}

module.exports = new CartManagerMongo();
