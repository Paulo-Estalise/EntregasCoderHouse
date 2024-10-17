import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String },
    stock: { type: Number, required: true }
});

const ProductModel = mongoose.model('Product', productSchema);

export default ProductModel;
