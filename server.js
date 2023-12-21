const express = require("express");
const app = express();

app.use(express.static("public"));

const { generateKeyPair, encrypt, decrypt, sign, verify } = require('./server/crypto.js');

app.get("/", function(request, response) {
    response.send("Hello world");
});

const { publicKey, privateKey } = generateKeyPair();

const originalMessage = 'Hello, RSA!';

const encryptedMessage = encrypt(originalMessage, publicKey);

const decryptedMessage = decrypt(encryptedMessage, privateKey);


app.get("/crypto", function(request, response) {
  response.send(`${originalMessage}, \n${encryptedMessage}`);
});

app.set('view engine', 'ejs');

app.get('/start', (req, res) => {
  res.render('index');
});

app.listen(3001, () => {
  console.log("server started on port 3001");
});