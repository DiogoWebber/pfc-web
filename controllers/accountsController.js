// controllers/accountsController.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function getAccounts(req, res) {
    fs.readFile(path.join(__dirname, '..', 'accounts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const accounts = JSON.parse(data);
        res.json(accounts);
    });
}

function addAccounts(req, res) {
    const { accountName, bank, accountNumber, balance } = req.body;
    if (!accountName || !bank || !accountNumber || isNaN(balance)) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    const account = { id: uuidv4(), accountName, bank, accountNumber, balance };

    fs.readFile(path.join(__dirname, '..', 'accounts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const accounts = JSON.parse(data);
        accounts.push(account);
        fs.writeFile(path.join(__dirname, '..', 'accounts.json'), JSON.stringify(accounts, null, 2), err => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.status(201).json({ success: true, account });
        });
    });
}
function deleteAccount(req, res) {
    const accountId = req.params.id; // Supondo que você esteja passando o ID do objeto a ser excluído como um parâmetro na URL
    fs.readFile(path.join(__dirname, '..', 'accounts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        let accounts = JSON.parse(data);
        const index = accounts.findIndex(account => account.id === accountId);

        if (index === -1) {
            res.status(404).json({ error: 'Conta não Econtrada' });
            return;
        }

        accounts.splice(index, 1);

        fs.writeFile(path.join(__dirname, '..', 'accounts.json'), JSON.stringify(accounts, null, 2), err => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.status(200).json({ success: true });
        });
    });
}
module.exports = {
    getAccounts,
    addAccounts,
    deleteAccount
};
