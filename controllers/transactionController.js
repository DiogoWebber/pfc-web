// controllers/transactionController.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function getTransactions(req, res) {
    fs.readFile(path.join(__dirname, '..', 'transactions.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const transactions = JSON.parse(data);
        res.json(transactions);
    });
}

function addTransaction(req, res) {
    const { description, value, type } = req.body;
    if (!description || isNaN(value) || !type) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    const transaction = { id: uuidv4(), description, value, type };

    fs.readFile(path.join(__dirname, '..', 'transactions.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const transactions = JSON.parse(data);
        transactions.push(transaction);
        fs.writeFile(path.join(__dirname, '..', 'transactions.json'), JSON.stringify(transactions, null, 2), err => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.status(201).json({ success: true, transaction });
        });
    });
}

function deleteTransaction(req, res) {
    const transactionId = req.params.id;

    fs.readFile(path.join(__dirname, '..', 'transactions.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const transactions = JSON.parse(data);
        const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
        fs.writeFile(path.join(__dirname, '..', 'transactions.json'), JSON.stringify(updatedTransactions, null, 2), err => {
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
    getTransactions,
    addTransaction,
    deleteTransaction
};
