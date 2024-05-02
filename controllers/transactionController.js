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
    const { description, value, type, date } = req.body;
    if (!description || isNaN(value) || !type || !date) {
        res.status(400).json({ error: 'Invalid request' });
        return;
    }

    const transaction = { id: uuidv4(), description, value, type, date };

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

// No seu arquivo transactionController.js
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
function updateTransaction(req, res) {
    const transactionId = req.params.id;
    const { description, value, type, date } = req.body;

    fs.readFile(path.join(__dirname, '..', 'transactions.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao ler arquivo de transações' });
        }

        let transactions = JSON.parse(data);
        const transactionIndex = transactions.findIndex(transaction => transaction.id === transactionId);

        if (transactionIndex === -1) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        // Atualiza os campos da transação com os novos valores
        transactions[transactionIndex].description = description;
        transactions[transactionIndex].value = value;
        transactions[transactionIndex].type = type;
        transactions[transactionIndex].date = date;

        fs.writeFile(path.join(__dirname, '..', 'transactions.json'), JSON.stringify(transactions, null, 2), err => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao escrever arquivo de transações' });
            }
            res.status(200).json({ success: true });
        });
    });
}





module.exports = {
    getTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction
};
