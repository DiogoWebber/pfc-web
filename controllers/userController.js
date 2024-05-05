// userController.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function getUsers() {
    const usersJson = fs.readFileSync(path.join(__dirname, '..', 'json', 'users.json'));
    return JSON.parse(usersJson);
}

function saveUsers(users) {
    fs.writeFileSync(path.join(__dirname, '..', 'json', 'users.json'), JSON.stringify(users, null, 2));
}


function login(req, res) {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(user => user.username === username && user.password === password);
    
    if (!user) {
        return res.send(`
            <script>
                alert('Usuário ou senha incorretos');
                window.history.back();
            </script>
        `);
    }

    if (user.level !== 'ON') {
        return res.send(`
            <script>
                alert('Você não possui permissão de acesso.');
                window.history.back();
            </script>
        `);
    }

    // Usuário encontrado e possui nível de acesso 'ON', armazena na sessão e redireciona para a página de administração
    req.session.usuario = user;
    return res.sendFile(path.join(__dirname, '..', 'html', 'telaadmin.html'));
}


function createUserForm(req, res) {
    res.sendFile(path.join(__dirname, '..', 'html', 'create-user.html'));
}

function createUser(req, res) {
    const { username, password, email, status } = req.body;
    const users = getUsers();
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.send(`
        <script>
            alert('Nome de usuário indisponível');
            window.location.href = '/html/create-user.html';
        </script>
    `);
    }
    const id = uuidv4();
    users.push({ id, username, password, email, level: 'OFF', status });
    saveUsers(users);
    return res.send(`
        <script>
            alert('Usuário criado com sucesso!');
            window.location.href = '/html/login.html';
        </script>
    `);
}

function getAllUsers(req, res) {
    const users = getUsers();
    res.json(users);
}
function updateUserLevel(req, res) {
    const { userId } = req.params;
    const { level } = req.body;
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        users[userIndex].level = level;
        saveUsers(users);
        res.json({ success: true, message: 'Nível do usuário atualizado com sucesso.' });
    } else {
        res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
}

module.exports = {
    login,
    createUserForm,
    createUser,
    getAllUsers,
    updateUserLevel
};
