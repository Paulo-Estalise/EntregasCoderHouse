const mongoose = require('mongoose');

const mongooseConnection = async () => {
    try {
        // Substitua 'sua_string_de_conexão_aqui' pela sua string de conexão real
        await mongoose.connect('mongodb://localhost:27017/ecommerce');

        console.log('MongoDB conectado com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
    }
};

module.exports = mongooseConnection;

