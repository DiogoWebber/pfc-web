const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'seu_secreto_aqui',
    resave: false,
    saveUninitialized: true
}));

// Middleware para servir arquivos estáticos, como CSS, JavaScript e imagens
app.use(express.static(path.join(__dirname, '/')));

// Middleware de registro para verificar as solicitações para arquivos estáticos
app.use((req, res, next) => {
    console.log('Recebida solicitação para:', req.url);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        req.session.usuario = user;
        return res.sendFile(path.join(__dirname, 'html', 'telaadmin.html'));
    } else {
        return res.send(`
            <script>
                alert('Usuário ou senha incorretos');
                window.history.back();
            </script>
        `);
    }
});

app.get('/html/sucesso.html', (req, res) => {
    if (req.session && req.session.usuario) {
        res.sendFile(path.join(__dirname, 'html', 'sucesso.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/html/erro.html', (req, res) => {
    console.log("Recebida requisição para a página de erro de login");
    res.sendFile(path.join(__dirname, 'html', 'erro.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

app.get('/html/create-user.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'create-user.html'));
});

app.post('/create-user', (req, res) => {
    const { username, password, email, status } = req.body;
    const users = getUsers();
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.send('Usuário já existe! Escolha outro nome de usuário.');
    }
    const id = uuidv4();
    users.push({ id, username, password, email, level: 'public', status });
    saveUsers(users);
    return res.redirect('/html/user-created.html');
});

app.get('/html/user-created.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'user-created.html'));
});

function getUsers() {
    const usersJson = fs.readFileSync('users.json');
    return JSON.parse(usersJson);
}

function saveUsers(users) {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

function addTransaction() {
    const description = document.getElementById('description').value;
    const value = document.getElementById('value').value;
    const type = document.getElementById('type').value;
    
    const tableBody = document.querySelector('.transaction-table tbody');
    
    const newRow = document.createElement('tr');
    
    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = description;
    
    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    
    const typeCell = document.createElement('td');
    typeCell.textContent = type;
    
    newRow.appendChild(descriptionCell);
    newRow.appendChild(valueCell);
    newRow.appendChild(typeCell);
    
    tableBody.appendChild(newRow);
    
    document.getElementById('description').value = '';
    document.getElementById('value').value = '';
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor em execução na porta http://localhost:${PORT}`);
});
