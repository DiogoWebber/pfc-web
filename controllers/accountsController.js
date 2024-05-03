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

module.exports = {
    getAccounts,
    addAccounts
};
