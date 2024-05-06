var openModalLink = document.getElementById('openModal');
var modal = document.getElementById('myModal');
var createUserForm = document.getElementById('createUserForm');

openModalLink.addEventListener('click', function (event) {
    event.preventDefault();
    modal.style.display = 'block';
    createUserForm.style.display = 'block';
});

modal.querySelector('.close').addEventListener('click', function () {
    modal.style.display = 'none';
    createUserForm.style.display = 'none';
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/admin';
            } else {
                alert(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('createUserForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var newUsername = document.getElementById('newUsername').value;
    var newPassword = document.getElementById('newPassword').value;
    var email = document.getElementById('email').value;

    fetch('/user/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newUsername, password: newPassword, email: email })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuário criado com sucesso!');
                closeModal();
            } else {
                alert(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
});

function closeModal() {
    modal.style.display = 'none';
    createUserForm.style.display = 'none';
}