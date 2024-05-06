window.onload = function () {
    fetch('/api/transactions?limit=5') // Busca apenas as últimas 5 transações (altere conforme necessário)
        .then(response => response.json())
        .then(transactions => {
            const lastTransactionsList = document.getElementById('lastTransactions');
            lastTransactionsList.innerHTML = '';

            transactions.forEach(transaction => {
                const { days, hours } = calculateTimeToPay(transaction.date);
                const transactionItem = document.createElement('li');
                transactionItem.textContent = `Faltam ${days} dias e ${hours} horas para pagar ${transaction.description} com valor de R$ ${transaction.value.toFixed(2)}.`;
                lastTransactionsList.appendChild(transactionItem);
            });

            // Abrir o modal automaticamente após carregar as transações
            openTransactionModal();
        })
        .catch(error => console.error('Erro:', error));
};

// Função para calcular os dias e horas restantes para pagar uma transação
function calculateTimeToPay(transactionDate) {
    const currentDate = new Date(); // Isso cria um objeto de data e hora local
    const transactionDateObj = new Date(transactionDate); // Isso cria um objeto de data e hora a partir da data da transação
    // Converter para o fuso horário de Brasília (UTC-03:00)
    currentDate.setUTCHours(currentDate.getUTCHours() - 3);
    // Calcular a diferença em horas
    const differenceInTime = transactionDateObj.getTime() - currentDate.getTime();
    const differenceInHours = Math.floor(differenceInTime / (1000 * 3600)); // Diferença em horas
    const days = Math.floor(differenceInHours / 24);
    const hours = differenceInHours % 24;
    return { days, hours };
}

// Funções para abrir e fechar o modal de transações
function openTransactionModal() {
    const modal = document.getElementById('transactionModal');
    modal.style.display = 'block';
}

function closeTransactionModal() {
    const modal = document.getElementById('transactionModal');
    modal.style.display = 'none';
}
// Função para enviar a nova transação para o servidor
function submitTransaction() {
    const description = document.getElementById('description').value;
    const value = parseFloat(document.getElementById('value').value);
    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;

    // Validar se a data está no formato correto (DD/MM/YYYY)
    if (!isValidDateFormat(date)) {
        alert('Por favor, insira uma data no formato DD/MM/YYYY.');
        return;
    }

    if (!description || isNaN(value) || !type) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const transaction = { description, value, type, date: formatDate(date) };
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Erro ao adicionar transação');
        })
        .then(data => {
            if (data.success) {
                // Se a transação for adicionada com sucesso, atualizar a tabela de transações e os totais
                updateTransactionTable();
                updateTotals();
            } else {
                // Se houver algum erro, exibir uma mensagem de erro
                alert('Erro ao adicionar transação. Por favor, tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao adicionar transação. Por favor, tente novamente.');
        });
}

// Função para validar o formato da data (DD/MM/YYYY)
function isValidDateFormat(dateString) {
    const pattern = /^\d{2}\/\d{2}\/\d{4}$/;
    return pattern.test(dateString);
}

function deleteTransactionHandler(transactionId) {
    fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Erro ao excluir transação');
        })
        .then(data => {
            if (data.success) {
                // Se a transação for excluída com sucesso, atualize a tabela de transações e os totais
                updateTransactionTable();
                updateTotals();
            } else {
                // Se houver algum erro, exiba uma mensagem de erro
                alert('Erro ao excluir transação. Por favor, tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao excluir transação. Por favor, tente novamente.');
        });
}

function updateTransactionHandler(transactionId, description, value, type, date) {
    const updatedTransaction = { description, value, type, date };

    fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTransaction)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Erro ao editar transação: ' + response.statusText);
        })
        .then(data => {
            if (data.success) {
                updateTransactionTable();
                updateTotals();
            } else {
                alert('Erro ao editar transação. Por favor, tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao editar transação. Por favor, tente novamente.');
        });
}


function updateTransactionTable() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(transactions => {
            const tableBody = document.getElementById('transactionBody');
            tableBody.innerHTML = '';

            transactions.forEach(transaction => {
                const newRow = document.createElement('tr');

                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = transaction.description;

                const valueCell = document.createElement('td');
                // Verifica se o valor é um número antes de formatá-lo
                valueCell.textContent = typeof transaction.value === 'number' ? transaction.value.toFixed(2) : '';

                const dateCell = document.createElement('td');
                dateCell.textContent = formatDate(transaction.date); // Formatando a data

                const typeCell = document.createElement('td');
                typeCell.textContent = transaction.type === 'entry' ? 'Entrada' : 'Saída';

                const editCell = document.createElement('td');

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.addEventListener('click', () => {
                    // Torna os campos editáveis
                    descriptionCell.contentEditable = true;
                    valueCell.contentEditable = true;
                    dateCell.contentEditable = true;
                    typeCell.contentEditable = true;

                    // Substitui o botão "Editar" por um botão "Salvar"
                    editButton.style.display = 'none';
                    saveButton.style.display = 'inline-block';
                });

                const saveButton = document.createElement('button');
                saveButton.textContent = 'Salvar';
                saveButton.style.display = 'none';
                saveButton.addEventListener('click', () => {
                    // Envie uma solicitação para atualizar a transação
                    updateTransactionHandler(transaction.id, descriptionCell.textContent, parseFloat(valueCell.textContent), typeCell.textContent === 'Entrada' ? 'entry' : 'exit', formatDate(dateCell.textContent));

                    // Torna os campos não editáveis novamente
                    descriptionCell.contentEditable = false;
                    valueCell.contentEditable = false;
                    dateCell.contentEditable = false;
                    typeCell.contentEditable = false;

                    // Substitui o botão "Salvar" por um botão "Editar"
                    saveButton.style.display = 'none';
                    editButton.style.display = 'inline-block';
                });

                const deleteCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.addEventListener('click', () => deleteTransactionHandler(transaction.id));
                deleteCell.appendChild(deleteButton);

                newRow.appendChild(descriptionCell);
                newRow.appendChild(valueCell);
                newRow.appendChild(typeCell);
                newRow.appendChild(dateCell);
                newRow.appendChild(editCell);
                newRow.appendChild(deleteCell);

                editCell.appendChild(editButton);
                editCell.appendChild(saveButton);

                tableBody.appendChild(newRow);
            });
        })
        .catch(error => console.error('Erro:', error));
}

function openModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'block';
    fetchUsers(); // Chamar a função para buscar os usuários quando o modal é aberto
}

function closeModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
}
function fetchUsers() {
    fetch('/user/users')
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('userList');
            userList.innerHTML = ''; // Limpar a lista antes de adicionar os usuários

            // Adicionar cada usuário à lista
            users.forEach(user => {
                const listItem = document.createElement('li');

                // Nome de usuário
                const usernameLabel = document.createElement('span');
                usernameLabel.textContent = `Username: ${user.username}`;
                listItem.appendChild(usernameLabel);

                // Nível do usuário
                const levelLabel = document.createElement('span');
                levelLabel.textContent = `Nível: ${user.level}`;
                listItem.appendChild(levelLabel);

                // Campo de seleção para o novo nível (ON/OFF)
                const newLevelSelect = document.createElement('select');
                const onOption = document.createElement('option');
                onOption.value = 'ON';
                onOption.textContent = 'ON';
                const offOption = document.createElement('option');
                offOption.value = 'OFF';
                offOption.textContent = 'OFF';
                newLevelSelect.appendChild(onOption);
                newLevelSelect.appendChild(offOption);
                newLevelSelect.value = user.level;
                listItem.appendChild(newLevelSelect);

                // Botão para alterar o nível
                const changeLevelButton = document.createElement('button');
                changeLevelButton.textContent = 'Alterar Nível';
                changeLevelButton.addEventListener('click', () => {
                    updateUserLevel(user.id, newLevelSelect.value);
                });
                listItem.appendChild(changeLevelButton);

                userList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Erro:', error));
}


function updateUserLevel(userId, newLevel) {
    // Envie uma solicitação para atualizar o nível do usuário
    fetch(`/user/update-level/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ level: newLevel })
    })
        .then(response => {
            if (response.ok) {
                // Se a atualização for bem-sucedida, recarregue a lista de usuários
                fetchUsers();
            } else {
                throw new Error('Erro ao atualizar nível do usuário');
            }
        })
        .catch(error => console.error('Erro:', error));
}


// Função para formatar a data para o formato "YYYY-MM-DD"
function formatDate(dateString) {
    // Verificar se a data está no formato correto (DD/MM/YYYY)
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!datePattern.test(dateString)) {
        // Se a data não estiver no formato correto, retornar a data original
        return dateString;
    }

    // Se a data estiver no formato correto, realizar a formatação
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
}
function submitAccount() {
    const accountName = document.getElementById('accountName').value;
    const bank = document.getElementById('bank').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const balanceInput = document.getElementById('balance').value;
    const balance = parseFloat(balanceInput.replace(/\./g, '').replace(',', '.')); // Formata o saldo para o formato correto

    if (!accountName || !bank || !accountNumber || isNaN(balance)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const account = { accountName, bank, accountNumber, balance };

    fetch('/accounts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(account)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Erro ao cadastrar conta');
        })
        .then(data => {
            if (data.success) {
                document.getElementById('accountName').value = '';
                document.getElementById('bank').value = '';
                document.getElementById('accountNumber').value = '';
                document.getElementById('balance').value = '';
                updateAccountTable();
            } else {
                alert('Erro ao cadastrar conta. Por favor, tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao cadastrar conta. Por favor, tente novamente.');
        });
}

function deleteAccountHandler(accountId) {
    fetch(`/accounts/${accountId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Erro ao excluir conta');
        })
        .then(data => {
            if (data.success) {
                // Se a conta for excluída com sucesso, atualize a tabela de contas
                updateAccountTable();
            } else {
                // Se houver algum erro, exiba uma mensagem de erro
                alert('Erro ao excluir conta. Por favor, tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao excluir conta. Por favor, tente novamente.');
        });
}

function updateAccountTable() {
    fetch('/accounts')
        .then(response => response.json())
        .then(accounts => {
            const tableBody = document.getElementById('accountBody');
            tableBody.innerHTML = ''; // Limpar o conteúdo atual da tabela

            accounts.forEach(account => {
                const newRow = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = account.accountName;

                const bankCell = document.createElement('td');
                bankCell.textContent = account.bank;

                const numberCell = document.createElement('td');
                numberCell.textContent = account.accountNumber;

                const balanceCell = document.createElement('td');
                balanceCell.textContent = account.balance.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                
                const deleteCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.addEventListener('click', () => deleteAccountHandler(account.id));
                deleteCell.appendChild(deleteButton);

                newRow.appendChild(nameCell);
                newRow.appendChild(bankCell);
                newRow.appendChild(numberCell);
                newRow.appendChild(balanceCell);
                newRow.appendChild(deleteCell); 

                tableBody.appendChild(newRow);
            });
        })
        .catch(error => console.error('Erro:', error));
}





// Função para atualizar os totais de entrada, saída e saldo final
function updateTotals() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(transactions => {
            let entryTotal = 0;
            let exitTotal = 0;

            transactions.forEach(transaction => {
                if (transaction.type === 'entry') {
                    entryTotal += transaction.value;
                } else if (transaction.type === 'exit') {
                    exitTotal += transaction.value;
                }
            });

            const totalEntryElement = document.getElementById('entryTotal');
            totalEntryElement.textContent = entryTotal.toFixed(2);

            const totalExitElement = document.getElementById('exitTotal');
            totalExitElement.textContent = exitTotal.toFixed(2);

            const totalElement = document.getElementById('total');
            const total = entryTotal - exitTotal;
            totalElement.textContent = total.toFixed(2);
        })
        .catch(error => console.error('Erro:', error));
}

// Carregar as transações e os totais ao carregar a página
updateTransactionTable();
updateAccountTable();
updateTotals();