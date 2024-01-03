export class Transaction {
  constructor(amount, account) {
    this.amount = amount;
    this.account = account;
  }
  commit() {
    if (this.value < 0 && this.amount > this.account.balance) return;
    this.account.transactions.push(this.value);
    // this.account.balance += this.value;
  }
}

export class Withdrawal extends Transaction {
  get value() {
    return -this.amount;
  }
}

export class Deposit extends Transaction {
  get value() {
    return this.amount;
  }
}

export default { Transaction, Withdrawal, Deposit };