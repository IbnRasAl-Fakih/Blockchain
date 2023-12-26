class Transaction {
    constructor(sender, recipient, amount) {
      this.sender = sender;
      this.recipient = recipient;
      this.amount = amount;
      this.timestamp = formatDateTime(new Date());
    }
}

function formatDateTime(date) {
  const day = padZero(date.getDate());
  const month = padZero(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());

  return `${day}:${month}:${year}, ${hours}:${minutes}`;
}

function padZero(number) {
  return number.toString().padStart(2, '0');
}

function createTransaction(sender, recipient, amount) {
  return new Transaction(sender, recipient, amount);
}

module.exports = { createTransaction, formatDateTime, padZero }