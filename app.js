const express = require('express');
const handlebars = require('express-handlebars');
const mongooseConnection = require('./dao/mongooseConnection');
const { Server } = require('socket.io');
const path = require('path');
const ProductManager = require('./dao/mongo/productManagerMongo'); // Altere o caminho de acordo com a estrutura da sua pasta.
const MessageManager = require('./dao/mongo/messageManagerMongo'); // Altere o caminho de acordo com a estrutura da sua pasta.

const app = express();
const PORT = 8080;

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint para listar todos os produtos
app.get('/products', async (req, res) => {
    try {
        const { limit } = req.query;
        const products = await ProductManager.getProducts();

        if (limit) {
            return res.json(products.slice(0, Number(limit)));
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter produtos.' });
    }
});

// Endpoint para listar produto por ID
app.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await ProductManager.getProductById(pid);

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter o produto.' });
    }
});

// View para exibir todos os produtos com handlebars
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductManager.getProducts();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar produtos em tempo real.' });
    }
});

// Configuração do servidor HTTP e WebSocket
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Novo cliente conectado!');

    socket.on('new-product', async (data) => {
        try {
            await ProductManager.addProduct(data);
            const products = await ProductManager.getProducts();
            io.emit('products-updated', products);
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
        }
    });

    socket.on('delete-product', async (id) => {
        try {
            await ProductManager.deleteProduct(id);
            const products = await ProductManager.getProducts();
            io.emit('products-updated', products);
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
        }
    });
});

