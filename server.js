const express = require("express");
const app = express();
const fs = require('node:fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

class Transaction {
  constructor(sender, recipient, amount) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = new Date();
  }
}

app.use(bodyParser.json());

app.use(express.static("public"));
app.set('view engine', 'ejs');

const { generateKeyPair, encrypt, decrypt, createP12File } = require('./server/crypto.js');
const { createTransaction, formatDateTime, padZero } = require("./server/transaction.js");
const { createBlock, createBlockchain, createGenesisBlock, calculateHash, createNewBlock, isChainValid } = require("./server/block.js");


const blockchain = createBlockchain();
let genesisBlock = createGenesisBlock();
blockchain.chain.push(genesisBlock);

app.get("/", function(request, response) {
    response.send("Hello world");
});

app.get('/cryptoBailyq', (req, res) => {
  res.render('index');
});

app.post('/cryptoBailyq', async (req, res) => {
  try {
    const user = req.body;
    if (fs.existsSync(path.join(__dirname, `/users/${user.username}`))) {
      console.log(`The folder ${user.username} already exists.`);
      return res.status(400).json({ message: 'User folder already exists' });
    } else {
      fs.mkdir(path.join(__dirname, `users/${user.username}`), (err) => {
        if(err) {
            console.log("Ошибка при создании папки:", err);
        } else {
            console.log("Папка успешно создана.");
        }
      });
      fs.writeFile(path.join(__dirname, `users/${user.username}/${user.username}.txt`), JSON.stringify(user) ,(writeErr) => {
        if (writeErr) {
          console.log("Ошибка при создании записи в файл:", writeErr);
          res.status(500).json({ message: 'Error creating and writing to file' });
        } else {
          console.log("Файл успешно создан и записан.");
        }
      });
      const { publicKey, privateKey } = generateKeyPair();
      console.log(publicKey)
      console.log(privateKey)
      fs.writeFile(path.join(__dirname, `users/${user.username}/${user.username}_publicKey.p12`), publicKey , (error) => {
        if (error) {
          console.log("Ошибка при создании записи в файл:", error);
          res.status(500).json({ message: 'Error creating and writing to file' });
        } else {
          console.log("Файл успешно создан и записан.");
        }
      });
      fs.writeFile(path.join(__dirname, `users/${user.username}/${user.username}_privateKey.p12`), privateKey , (error) => {
        if (error) {
          console.log("Ошибка при создании записи в файл:", error);
          res.status(500).json({ message: 'Error creating and writing to file' });
        } else {
          console.log("Файл успешно создан и записан.");
        }
      });

      res.status(200).json({ message: 'Success' });
    }
  } catch (error) {
    console.error(error);
  }
});

app.get('/download', (req, res) => {
  const username = req.query.user;
  const key = req.query.key;

  if (!username || !key) {
    return res.status(400).send('Не указан файл для скачивания.');
  }
  const filePath = path.join(__dirname, `users/${username}/${username}_${key}Key.p12`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Файл не найден.');
  }
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  res.setHeader('Content-disposition', `attachment; filename=${username}_${key}Key.p12`);
  res.setHeader('Content-type', 'application/octet-stream');
  res.setHeader('Content-Length', fileSize);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

app.get("/user/:username/:page", (req,res) => {
  let user = req.params.username;
  let page = req.params.page;
  fs.readFile(path.join(__dirname, `users/${user}/${user}.txt`), 'utf8', (err, data) => {
    if (err) {
      console.error(`Ошибка при чтении файла: ${err.message}`);
    } else {
      res.render("user", {user: JSON.parse(data), page: page});
    }
  });
});

app.post('/transaction', async (req, res) => {
  try {
    const username = req.body.username;
    const receiverName = req.body.receiver;
    const amount = +req.body.amount;
    if (fs.existsSync(path.join(__dirname, `/users/${receiverName}`))) {
      fs.readFile(path.join(__dirname, `users/${username}/${username}.txt`), 'utf8', (err, data) => {
        if (err) {
          console.error('Ошибка чтения файла:', err);
          return;
        }
        let user = JSON.parse(data);
        if (user.balance < amount) {
          return res.status(400).json({ message: "Insufficient funds to send a balance" });
        } else {
          fs.readFile(path.join(__dirname, `users/${receiverName}/${receiverName}.txt`), 'utf8', (err, data_receiver) => {
            if (err) {
              console.error(`Ошибка при чтении файла: ${err.message}`);
              return;
            }
            let receiver = JSON.parse(data_receiver);
            user.balance -= amount;
            receiver.balance += amount;
            fs.writeFile(path.join(__dirname, `users/${username}/${username}.txt`), JSON.stringify(user) ,(writeErr) => {
              if (writeErr) {
                console.log("Ошибка при создании записи в файл:", writeErr);
                return res.status(500).json({ message: 'Error creating and writing to file' });
              }
            });
            fs.writeFile(path.join(__dirname, `users/${receiverName}/${receiverName}.txt`), JSON.stringify(receiver) ,(writeErr) => {
              if (writeErr) {
                console.log("Ошибка при создании записи в файл:", writeErr);
                return res.status(500).json({ message: 'Error creating and writing to file' });
              }
            });
            const transaction = createTransaction(username, receiverName, amount);
            const block = createNewBlock(transaction, blockchain);
            blockchain.chain.push(block);
            res.status(200).json({ message: 'Success' });
          });
        }
      });
    } else {
      console.log(`Пользователь с указанным именем не найден.`);
      return res.status(400).json({ message: "Username not found" });
    }
  } catch (error) {
    console.error(error);
  }
});


app.post('/user', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    if (fs.existsSync(path.join(__dirname, `/users/${username}`))) {
      fs.readFile(path.join(__dirname, `users/${username}/${username}.txt`), 'utf8', (err, data) => {
        if (err) {
          console.error('Ошибка чтения файла:', err);
          return;
        }
        let user = JSON.parse(data);
        if (user.password != password) {
          return res.status(400).json({ message: "Password is not right" });
        }
        res.status(200).json({ message: 'Success' });
      });
    } else {
      console.log(`Пользователь с указанным именем не найден.`);
      return res.status(400).json({ message: "Username not found" });
    }
  } catch (error) {
    console.error(error);
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, "privateKey.p12");
  }
});

const upload = multer({ storage: storage });

// app.post('/upload', upload.single('file'), (req, res) => {
//   try {
//     const message = "blockchain";
//     let privateKey;
//     fs.readdir(path.join(__dirname, "uploads"), (err, files1) => {
//       if (err) {
//         console.error('Ошибка чтения папки:', err);
//         return;
//       }
//       files1.forEach(file1 => {
//         fs.readFile(path.join(__dirname, `uploads/${file1}`), 'utf8', (err, data) => {
//           if (err) {
//               console.error(err);
//               return;
//           }
//           privateKey = data;
//         });
//       });
//     });

//     const folderPath = path.join(__dirname, "/users");
//     fs.readdir(folderPath, (err, files) => {
//       if (err) {
//         console.error('Ошибка чтения папки:', err);
//         return;
//       }
//       files.forEach(file => {
//         const filePath = path.join(folderPath, file);
//         fs.readdir(filePath, (err, files2) => {
//           if (err) {
//             console.error('Ошибка чтения папки:', err);
//             return;
//           }
//           files2.forEach(file2 => {
//             if (file2.endsWith('_publicKey.p12')) {
//               let publicKey;
//               fs.readFile(file2, 'utf8', (err, data) => {
//                 if (err) {
//                     console.error(err);
//                     return;
//                 }
//                 publicKey = data;
//               });
//               console.log(publicKey)
//               console.log(privateKey)
//               let encryption = encrypt(message, privateKey);
//               console.log("hello")
//               if (message == decrypt(encryption, publicKey)) {
//                 let username;
//                 files2.forEach(file3 => {
//                   if (file3.endsWith('.txt')) {
//                     let user = JSON.parse(file3);
//                     username = user.username;
//                   }
//                 });
//                 return res.status(200).json({ message: 'Success', user: username });
//               }
//             }
//           });
//         });
//       });
//     });
//   } catch (error) {
//     console.error(error);
//   }
// });

app.post('/getTransactions', (req, res) => {
  try {
    console.log(blockchain)
    res.status(400).json({ message: "Success", blockchain: JSON.stringify(blockchain) });
  } catch (error) {
    console.error(error);
  }
});

app.listen(3001, () => {
  console.log("server started on port 3001");
});