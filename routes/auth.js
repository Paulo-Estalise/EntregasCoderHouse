const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');

// Exemplo de banco de dados temporário de usuários
let users = [
  {
    email: "adminCoder@coder.com",
    password: bcrypt.hashSync("adminCod3r123", 10), // Senha encriptada
    role: "admin"
  }
];

// Rota para registrar novos usuários
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashPassword, role: 'user' });
  res.redirect('/login');
});

// Rota para login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = { email: user.email, role: user.role };
    return res.redirect('/products');
  }
  
  res.status(401).send('Login inválido');
});

// Rota para logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Erro ao encerrar a sessão');
    }
    res.redirect('/login');
  });
});

module.exports = router;
