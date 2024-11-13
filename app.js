require('dotenv').config(); // Carrega as variáveis do .env

const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { Server } = require('socket.io');
const path = require('path');
const config = require('./config/config'); // Ajuste na importação do config
const mongooseConnection = require('./dao/mongo/mongooseConnection');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const ProductManager = require('./dao/mongo/productManagerMongo');
const MessageManager = require('./dao/mongo/messageManagerMongo');
const generateMockProducts = require('./mocks/mockProducts'); // Import do módulo de mocking
const errorHandler = require('./middlewares/errorHandler'); // Import do middleware de erro
const logger = require('./logger'); // Importa o logger

const app = express();

// Conexão com o MongoDB
mongooseConnection(config.mongoUri);

// Configuração do Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    extname: '.handlebars',
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuração de sessão
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Estratégia Local (Login/Registro)
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    const user = await findUserByEmail(email); // Função implementada
    if (!user) {
        logger.warn('Usuário não encontrado no login local');
        return done(null, false, { message: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        logger.warn('Senha incorreta no login local');
        return done(null, false, { message: 'Senha incorreta' });
    }

    return done(null, user);
}));

// Estratégia de Autenticação com GitHub
passport.use(new GitHubStrategy({
    clientID: config.githubClientId,
    clientSecret: config.githubClientSecret,
    callbackURL: 'http://localhost:8080/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    const user = await findOrCreateUserByGitHub(profile); // Implementar esta função
    return done(null, user);
}));

// Rotas
app.use('/products', productRoutes);
app.use('/users', userRoutes);

// Endpoint de Mocking para produtos
app.get('/mockingproducts', (req, res, next) => {
    try {
        const mockProducts = generateMockProducts(); // Gera 100 produtos fictícios
        res.status(200).json(mockProducts);
        logger.info('Mocking de produtos gerado com sucesso');
    } catch (error) {
        logger.error('Erro ao gerar mocking de produtos', error);
        next(error); // Encaminha o erro para o middleware de erro
    }
});

// Rota de Logout
app.post('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
        logger.info('Usuário deslogado com sucesso');
    });
});

// Configuração do Socket.IO
const server = app.listen(config.port, () => {
    logger.info(`Servidor rodando na porta ${config.port}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
    logger.info('Novo cliente conectado!');

    socket.on('new-product', async (data) => {
        try {
            await ProductManager.addProduct(data);
            const products = await ProductManager.getProducts();
            io.emit('products-updated', products);
            logger.info('Novo produto adicionado e atualizado via websocket');
        } catch (error) {
            logger.error('Erro ao adicionar produto:', error);
        }
    });

    socket.on('delete-product', async (id) => {
        try {
            await ProductManager.deleteProduct(id);
            const products = await ProductManager.getProducts();
            io.emit('products-updated', products);
            logger.info('Produto deletado e atualizado via websocket');
        } catch (error) {
            logger.error('Erro ao deletar produto:', error);
        }
    });
});

// Endpoint para testar o logger
app.get('/loggerTest', (req, res) => {
    logger.debug('Teste de log debug');
    logger.http('Teste de log http');
    logger.info('Teste de log info');
    logger.warn('Teste de log warning');
    logger.error('Teste de log error');
    logger.log({ level: 'fatal', message: 'Teste de log fatal' });

    res.send('Teste de logger completo. Verifique o console e o arquivo errors.log para os resultados.');
});

// Middleware de erro
app.use(errorHandler); // Middleware de erro após todas as rotas

// Funções auxiliares 
async function findUserByEmail(email) {
    // Implementar a lógica para buscar usuário por email no banco de dados
}

async function findOrCreateUserByGitHub(profile) {
    // Implementar a lógica para encontrar ou criar um usuário com o perfil do GitHub
}
