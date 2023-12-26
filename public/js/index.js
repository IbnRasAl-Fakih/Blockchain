function withPassword() {
    document.getElementById("with_rsa_key").classList.add("display_none");
    document.getElementById("with_password").classList.remove("display_none");
}

function withRSA() {
    document.getElementById("with_password").classList.add("display_none");
    document.getElementById("with_rsa_key").classList.remove("display_none");
}

function signInBlock() {
    document.getElementById("sign_up").classList.add("display_none");
    document.getElementById("sign_in").classList.remove("display_none");
}

function signUpBlock() {
    document.getElementById("sign_in").classList.add("display_none");
    document.getElementById("sign_up").classList.remove("display_none");
}

let modal = document.getElementById('myModal');
let closeModalBtn = document.getElementById('closeModalBtn');

function openModal() {
    modal.style.display = 'block';
}

closeModalBtn.onclick = function() {
  modal.style.display = 'none';
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

async function createUserSubmit() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let password2 = document.getElementById("password2").value;
    let error = document.getElementById("error_sign_up");

    error.innerHTML = "";

    if (username == "" || password == "" || password2 == "") {
        error.innerHTML = "Не все поля заполнены.";
        return;
    } else if (username.length < 5) {
        error.innerHTML = "Имя пользователя слишком короткое. Пожалуйста, введите не менее 5 символов.";
        return;
    } else if (password.length < 6) {
        error.innerHTML = "Пароль слишком короткий. Введите не менее 6 символов для безопасности.";
        return;
    } else if (password != password2) {
        error.innerHTML = "Пароли не совпадают.";
        return;
    }

    await createUser(username, password);
}

async function createUser(username, password) {
    let error = document.getElementById("error_sign_up");
    var user = { username: username, password: password, balance: 0 };
    try {
        const response = await fetch('/cryptoBailyq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        const responseData = await response.json();
        if (responseData.message == "User folder already exists") {
            error.innerHTML = "Данное имя пользователя уже занято. Пожалуйста, выберите другое имя";
        } else {
            error.innerHTML = "Успешная регистрация! Теперь вы можете войти в свой аккаунт.";
            document.getElementById("modalInner").innerHTML = `
            <p>Успешная регистрация!</p>
            <p>Для вашего удобства, мы предоставляем вам публичный и приватный ключи.</p>
            <p>Никогда не передавайте свой приватный ключ третьим лицам. Храните приватный ключ в безопасном месте, недоступном для посторонних.</p>
            <a href="http://localhost:3001/download?user=${user.username}&key=public">Публичный ключ</a> <br>
            <a href="http://localhost:3001/download?user=${user.username}&key=private">Приватный ключ ключ</a>
            `
            openModal();
        }
        console.log('Ответ от сервера:', responseData.message);
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
    }
}

async function downloadPublicKey() {
    const response = await fetch(`http://localhost:3001/download?user=${user.username}&key=public`);

    if (response.status == 200) {
        const blob = await response.blob();
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadURL;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}


const profile = document.getElementById("profile");
const sendCrypto = document.getElementById("sendCrypto");
const history = document.getElementById("history");

function openProfile(username) {
    location.href = `user/${username}/../../profile`;
}

function openSendCrypto(username) {
    location.href = `user/${username}/../../transaction`;
}

function openHistory(username) {
    location.href = `user/${username}/../../history`;
    showTransactions();
}

async function sendSubmit(username) {
    let receiver = document.getElementById("receiver").value;
    let amount = document.getElementById("amount").value;
    let error = document.getElementById("error_send");

    error.innerHTML = "";

    if (receiver == "" || amount == "") {
        error.innerHTML = "Не все поля заполнены.";
        return;
    } else if (isNaN(amount) || amount <= 0 ) {
        error.innerHTML = "Пожалуйста, введите корректное число.";
        return;
    } else if (username == receiver) {
        error.innerHTML = "Невозможно отправить баланс самому себе.";
        return;
    }

    try {
        const response = await fetch('/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, receiver: receiver, amount: amount}),
        });

        const responseData = await response.json();
        if (responseData.message == "Username not found") {
            error.innerHTML = "Имя пользователя не существует. Пожалуйста, проверьте правильность введенного имени.";
            return;
        } else if (responseData.message == "Insufficient funds to send a balance") {
            error.innerHTML = "Недостаточно средств для отправки баланса.";
            return;
        } else {
            error.innerHTML = "Спасибо, что используете наш сервис! Ваш перевод успешно выполнен.";
            openHistory(username);
        }
        console.log('Ответ от сервера:', responseData.message);
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
    }
}

window.onload = function() {
    showTransactions();
};

async function showTransactions() {
    let blocks;
    try {
        const response = await fetch('/getTransactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({block: "blcok"}),
        });
        
        const responseData = await response.json();
        let blockchain = JSON.parse(responseData.blockchain);
        blocks = blockchain.chain;
        console.log(blocks)
        let htmlResCatalog = ``;
        for (let key in blocks) {
            if (key == 0) {
                continue;
            }
            htmlResCatalog +=`
            <tr>
            <td>${blocks[key].data.timestamp}</td>
            <td>${blocks[key].data.sender}</td>
            <td>${blocks[key].data.recipient}</td>
            <td>${blocks[key].data.amount}</td>
            </tr>`;
        }
        document.getElementById("tableBody").innerHTML = htmlResCatalog;
        console.log('Ответ от сервера:', responseData.message);
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
    }
}

async function signInWithPassword() {
    let username = document.getElementById("sign_in_username").value;
    let password = document.getElementById("sign_in_password").value;
    let error = document.getElementById("error_sign_in");

    error.innerHTML = "";

    if (username == "" || password == "") {
        error.innerHTML = "Не все поля заполнены.";
        return;
    }
    try {
        const response = await fetch('/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        });

        const responseData = await response.json();
        if (responseData.message == "Username not found") {
            error.innerHTML = "Имя пользователя не существует. Пожалуйста, проверьте правильность введенного имени.";
            return;
        } else if (responseData.message == "Password is not right") {
            error.innerHTML = "Неверный пароль. Пожалуйста, попробуйте снова.";
            return;
        }
        location.href = `user/${username}/profile`
        console.log('Ответ от сервера:', responseData.message);
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
    }
}

async function signInWithRSA() {
    const file = document.getElementById("myFileInput").files[0];
    let error = document.getElementById("error_sign");

    if (file == undefined) {
        error.innerHTML = "ЭЦП ключ не прикреплен";
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        const responseData = await response.json();
        console.log('Ответ от сервера:', responseData.message);
        location.href = `user/${responseData.user}/profile`;
    } catch (error) {
        console.error('Ошибка при отправке данных:', error);
    }
}

function quick() {
    location.href = "/cryptoBailyq";
}

