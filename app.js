const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const hbs = require('hbs');
const mongooseConnection = require('./dao/mongo/mongooseConnection'); // Atualizado para o caminho correto
const { Server } = require('socket.io');
const path = require('path');
const ProductManager = require('./dao/mongo/productManagerMongo');
const MessageManager = require('./dao/mongo/messageManagerMongo');

const app = express();
const PORT = 8081;

// Conectar ao MongoDB
mongooseConnection(); // Chama a função para conectar ao banco de dados

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'seuSegredoAqui',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

hbs.registerHelper('eq', (a, b) => a === b);

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send('Acesso negado. Apenas para administradores.');
}

app.get('/products', isAuthenticated, async (req, res) => {
    try {
        const products = await ProductManager.getProducts();
        res.render('products', { products, user: req.session.user });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter produtos.' });
    }
});

app.get('/products/:pid', isAuthenticated, async (req, res) => {
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

app.get('/realtimeproducts', isAuthenticated, async (req, res) => {
    try {
        const products = await ProductManager.getProducts();
        res.render('realTimeProducts', { products, user: req.session.user });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar produtos em tempo real.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    const adminEmail = 'adminCoder@coder.com';
    const adminPassword = 'adminCod3r123';

    if (email === adminEmail && password === adminPassword) {
        req.session.user = { email, role: 'admin' };
        return res.redirect('/products');
    } 

    req.session.user = { email, role: 'user' }; 
    res.redirect('/products');
});

app.post('/register', async (req, res) => {
    // Implementar lógica de registro se necessário
    res.redirect('/login');
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Erro ao encerrar a sessão');
        }
        res.redirect('/login');
    });
});

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
