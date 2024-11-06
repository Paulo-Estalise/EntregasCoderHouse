const express = require('express');
const router = express.Router();

// Defina rotas de usuário
router.get('/', (req, res) => {
    res.send('Lista de usuários');
});

router.post('/register', (req, res) => {
    // Lógica de registro de usuário
    res.send('Usuário registrado com sucesso');
});

router.post('/login', (req, res) => {
    // Lógica de login de usuário
    res.send('Login efetuado com sucesso');
});

module.exports = router;
