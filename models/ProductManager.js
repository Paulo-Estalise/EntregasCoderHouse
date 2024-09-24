const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.loadProducts();
    }

    loadProducts() {
        if (fs.existsSync(this.path)) {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(data);
            this.currentId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
        } else {
            this.currentId = 1;
        }
    }

    saveProducts() {
        fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
    }

    addProduct({ title, description, price, thumbnail, code, stock }) {
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.error('Todos os campos são obrigatórios');
            return;
        }

        if (this.products.some(product => product.code === code)) {
            console.error('O código do produto já existe');
            return;
        }

        const newProduct = {
            id: this.currentId++,
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };

        this.products.push(newProduct);
        this.saveProducts();
        console.log('Produto adicionado com sucesso:', newProduct);
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (product) {
            return product;
        } else {
            console.error('Não encontrado');
            return null;
        }
    }

    updateProduct(id, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            console.error('Produto não encontrado');
            return;
        }

        this.products[productIndex] = { ...this.products[productIndex], ...updatedFields };
        this.saveProducts();
        console.log('Produto atualizado com sucesso:', this.products[productIndex]);
    }

    deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            console.error('Produto não encontrado');
            return;
        }

        this.products.splice(productIndex, 1);
        this.saveProducts();
        console.log('Produto deletado com sucesso');
    }
}

// Exemplo de uso
const manager = new ProductManager('products.json');

manager.addProduct({
    title: 'Produto A',
    description: 'Descrição do Produto A',
    price: 100,
    thumbnail: '/imagens/produtoA.jpg',
    code: 'A001',
    stock: 10
});

console.log(manager.getProducts());
console.log(manager.getProductById(1));

manager.updateProduct(1, { price: 120, stock: 15 });
console.log(manager.getProductById(1));

manager.deleteProduct(1);
console.log(manager.getProducts());
