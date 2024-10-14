const express = require('express');
const { engine } = require('express-handlebars'); // Importando o método 'engine' diretamente
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mongooseConnection = require('./dao/mongo/mongooseConnection');
const { Server } = require('socket.io');
const path = require('path');
const ProductManager = require('./dao/mongo/productManagerMongo');
const MessageManager = require('./dao/mongo/messageManagerMongo');

const app = express();
const PORT = 8080;

// Conexão com o MongoDB
mongooseConnection();

// Configuração do Handlebars
app.engine('handlebars', engine({ // Corrigido aqui
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    extname: '.handlebars',
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuração de sessão
app.use(session({
    secret: 'seuSegredoAqui',
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
    const user = await findUserByEmail(email); // Suponha que essa função exista
    if (!user) {
        return done(null, false, { message: 'Usuário não encontrado' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return done(null, false, { message: 'Senha incorreta' });
    }

    return done(null, user);
}));

// Estratégia de Autenticação com GitHub
passport.use(new GitHubStrategy({
    clientID: 'SEU_CLIENT_ID',
    clientSecret: 'SEU_CLIENT_SECRET',
    callbackURL: 'http://localhost:8080/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    const user = await findOrCreateUserByGitHub(profile); // Implementar esta função
    return done(null, user);
}));

// Rota padrão (Página inicial)
app.get('/', (req, res) => {
    res.render('home', { title: 'Página Inicial' });
});
app.get('/realtimeproducts', (req, res) => {
    res.render('realtimeproducts');
});
// Rota de Login
app.post('/login', passport.authenticate('local', {
    successRedirect: '/products',
    failureRedirect: '/login',
    failureFlash: true
}));

// Rota de Registro
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Gerar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Salvar o novo usuário no banco de dados
    await createUser({ email, password: hashedPassword }); // Implementar esta função

    res.redirect('/login');
});

// Rota de Autenticação com GitHub
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/products');
    }
);

// Rota de Logout
app.post('/logout', (req, res) => {
    req.logout(() => {
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

// Implementação de funções auxiliares
async function findUserByEmail(email) {
    // Implementar a lógica para encontrar um usuário pelo e-mail no banco de dados
}

async function createUser(user) {
    // Implementar a lógica para criar um novo usuário no banco de dados
}

async function findOrCreateUserByGitHub(profile) {
    // Implementar a lógica para encontrar ou criar um usuário com base no perfil do GitHub
}
