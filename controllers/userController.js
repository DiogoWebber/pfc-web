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

function sendSuccessResponse(res, data) {
    res.status(200).json({ success: true, data });
}

function sendErrorResponse(res, statusCode, message) {
    res.status(statusCode).json({ success: false, error: message });
}

function login(req, res) {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        return sendErrorResponse(res, 401, 'Usuário ou senha incorretos');
    }

    if (user.level !== 'ON') {
        return sendErrorResponse(res, 403, 'Você não possui permissão de acesso.');
    }

    // Usuário encontrado e possui nível de acesso 'ON', armazena na sessão e redireciona para a página de administração
    req.session.usuario = user;
    sendSuccessResponse(res, 'Usuário autenticado com sucesso!');
}

function createUserForm(req, res) {
    res.sendFile(path.join(__dirname, '..', 'html', 'login'));
}

function createUser(req, res) {
    const { username, password, email, status } = req.body;
    const users = getUsers();
    const userExists = users.find(user => user.username === username);

    if (userExists) {
        return sendErrorResponse(res, 400, 'Nome de usuário indisponível');
    }

    const id = uuidv4();
    users.push({ id, username, password, email, level: 'OFF', status });
    saveUsers(users);
    sendSuccessResponse(res, 'Usuário criado com sucesso!');
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
        sendSuccessResponse(res, 'Nível do usuário atualizado com sucesso.');
    } else {
        sendErrorResponse(res, 404, 'Usuário não encontrado.');
    }
}

module.exports = {
    login,
    createUserForm,
    createUser,
    getAllUsers,
    updateUserLevel
};
