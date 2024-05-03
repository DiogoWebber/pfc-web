// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const accountsRoutes = require('./routes/accountsRoutes');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'seu_secreto_aqui',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, '/')));
app.use(bodyParser.json());

// Middleware de registro para verificar as solicitações para arquivos estáticos
app.use((req, res, next) => {
    console.log('Recebida solicitação para:', req.url);
    next();
});

// Use suas rotas
app.use('/user', userRoutes);
app.use('/api', transactionRoutes);
app.use('/accounts', accountsRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor em execução na porta http://localhost:${PORT}`);
});
