// userController.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function getUsers() {
    const usersJson = fs.readFileSync('users.json');
    return JSON.parse(usersJson);
}

function saveUsers(users) {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

function login(req, res) {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        req.session.usuario = user;
        return res.sendFile(path.join(__dirname, '..', 'html', 'telaadmin.html'));
    } else {
        return res.send(`
            <script>
                alert('Usuário ou senha incorretos');
                window.history.back();
            </script>
        `);
    }
}

function createUserForm(req, res) {
    res.sendFile(path.join(__dirname, '..', 'html', 'create-user.html'));
}

function createUser(req, res) {
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
}

function userCreated(req, res) {
    res.sendFile(path.join(__dirname, '..', 'html', 'user-created.html'));
}

module.exports = {
    login,
    createUserForm,
    createUser,
    userCreated
};
