import Account from './helpers/Account.js';
import { Withdrawal, Deposit } from './helpers/Transaction.js';
import { displayOptions } from './helpers/Common.js';
import { displayCategory, addCategory } from './helpers/Category.js';

// let storageList = [];
// const storage = localStorage;

$(() => {
  //Start coding here!
  const accountSelect = document.querySelector('.account-select');
  const fromSelect = document.querySelector('.from-select');
  const toSelect = document.querySelector('.to-select');

  $.ajax({
    url:  'http://localhost:3000/accounts',
    method: 'GET'
  })
  .done(data => {
    displayOptions(data, accountSelect);
    displayOptions(data, fromSelect);
    displayOptions(data, toSelect);
  });

  displayCategory();
  displayTransactionsList();
  displayAccountSummary();
});

let accounts = [];

const matchAccount = (currentAccount) => {
  return accounts.find(account => account.username === currentAccount);
}

const conductTransaction = () => {
  const formElements = document.forms[1];

  // transaction type
  const selectedTransaction = formElements.transaction.value;

  // account
  const selectedAccountElement = formElements.account;
  const selectedAccountId = Number(selectedAccountElement.options[selectedAccountElement.selectedIndex].getAttribute('id'));

  // account from
  const selectedFromAccountElement = formElements.from;
  const selectedFromAccountId = Number(selectedFromAccountElement.options[selectedFromAccountElement.selectedIndex].getAttribute('id'));

  // account to
  const selectedToAccountElement = formElements.to;
  const selectedToAccountId = Number(selectedToAccountElement.options[selectedToAccountElement.selectedIndex].getAttribute('id'));

  // category
  const selectedCategoryElement = formElements.category;
  const selectedCategoryId = Number(selectedCategoryElement.options[selectedCategoryElement.selectedIndex].getAttribute('id'));

  // description
  const descriptionData = formElements.description.value;

  // amount
  const amount = Number(formElements.amount.value);

  const currentAccount = selectedAccountElement.options[selectedAccountElement.selectedIndex].value;
  const accountUser = matchAccount(currentAccount);
  const sender = selectedFromAccountElement.options[selectedFromAccountElement.selectedIndex].value;
  const matchedSender = matchAccount(sender);
  const receiver = selectedToAccountElement.options[selectedToAccountElement.selectedIndex].value;
  const matchedReceiver = matchAccount(receiver);
  let transaction;
  let senderTransaction;
  let receiverTransaction;

  if (selectedTransaction === 'deposit') {
    transaction = new Deposit(amount, accountUser);
    transaction.commit();
  } else if (selectedTransaction === 'withdraw') {
    transaction = new Withdrawal(amount, accountUser);
    const amountBeforeCommit = accountUser.balance;
    transaction.commit();
    const amountAfterCommit = accountUser.balance;
    if (amountBeforeCommit === amountAfterCommit) {
      alert('The transaction has failed due to insufficient funds.');
      return;
    }
  } else {
    senderTransaction = new Withdrawal(amount, matchedSender);
    const amountBeforeCommit = matchedSender.balance;
    senderTransaction.commit();
    const amountAfterCommit = matchedSender.balance;
    if (amountBeforeCommit === amountAfterCommit) return;
    receiverTransaction = new Deposit(amount, matchedReceiver);
    receiverTransaction.commit();
  }

  $.ajax({
    url:  'http://localhost:3000/transactions',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      newTransaction:{
        accountId: selectedAccountId, // account ID for Deposits or Withdraws
        accountIdFrom: selectedFromAccountId || "", // sender ID if type = 'Transfer', otherwise null
        accountIdTo: selectedToAccountId || "", // receiver ID if type = 'Transfer', otherwise null,
        type: selectedTransaction, // 'Deposit', 'Withdraw', 'Transfer'
        amount: transaction ? transaction.amount : senderTransaction.amount, // amount of the transaction
        categoryId: selectedCategoryId, // category ID
        description: descriptionData, // description of the transaction
      }
    })
  })
  .done(() => {
    const transactionList = document.querySelector('.transaction-list');
    while(transactionList.firstChild) {
      transactionList.removeChild(transactionList.firstChild);
    }

    displayTransactionsList();
  })
  .fail(() => {
    console.log('An error has occurred.');
  });
}

const changeDisplayedElements = function() {
  const deposit = document.transactionForm.transaction[0].checked;
  const withdraw = document.transactionForm.transaction[1].checked;
  const transfer = document.transactionForm.transaction[2].checked;
  if (transfer) {
    $('.from').css('display', 'block');
    $('.to').css('display', 'block');
    $('.account').css('display', 'none');
  } else if (deposit || withdraw) {
    $('.from').css('display', 'none');
    $('.to').css('display', 'none');
    $('.account').css('display', 'block');
  }
}

const displayTransactionsList = () => {
  $.ajax({
    url:  'http://localhost:3000/accounts',
    method: 'GET'
  })
  .done(data => {
    data.forEach(user => {
      let account = new Account(user.username);
      accounts.push(account);
      const transactionDataList = user.transactions;

      transactionDataList.forEach((transactionData) => {
        const numberOfTransactions = $('.transaction-list tr').length;
        const formElements = document.forms[1];
        const accountSelect = formElements.account;

        // category
        const selectedCategoryElement = formElements.category;
        // console.log(selectedCategoryElement);
        const selectedOption = selectedCategoryElement.querySelector(`option[id="${transactionData.categoryId}"]`);
        const selectionValue = selectedOption ? selectedOption.value : '';

        // account from
        const selectedAccountSender = accountSelect.querySelector(`option[id="${transactionData.accountIdFrom}"]`);
        const senderAccount = selectedAccountSender ?  selectedAccountSender.value : '';

        // account to
        const selectedAccountReceiver = accountSelect.querySelector(`option[id="${transactionData.accountIdTo}"]`);
        const receiverAccount = selectedAccountReceiver ?  selectedAccountReceiver.value : '';

        // create element
        const tr = document.createElement('tr');
        const id = `<td>${numberOfTransactions + 1}</td>`;
        const username = `<td>${user.username}</td>`;
        const transactionType = `<td>${transactionData.type}</td>`;
        const category = `<td>${selectionValue}</td>`;
        const description = `<td>${transactionData.description}</td>`;
        const amount = `<td>${transactionData.amount}</td>`;
        const from = `<td>${senderAccount}</td>`;
        const to = `<td>${receiverAccount}</td>`;
        $(tr).append(id, username, transactionType, category, description, amount, from, to);
        $('.transaction-list').append(tr);
      });
    });
  });
}

const displayAccountSummary = () => {
  $('.account-summary-list').empty();

  $.ajax({
    url:  'http://localhost:3000/accounts',
    method: 'GET'
  })
  .done(data => {
    data.forEach(user => {
      const accountUser = matchAccount(user.username);

      const tr = document.createElement('tr');
      const accountName = `<td>${accountUser.username}</td>`;
      const balance = `<td>${accountUser.balance}</td>`;
      $(tr).append(accountName, balance);
      $('.account-summary-list').append(tr);
    })
  });
}


$('.account-button').click(() => {
  let name = $(".account-input").val();
  if (name === '') return;

  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  $.ajax({
    url:  'http://localhost:3000/accounts',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      "newAccount": capitalizedName,
      "transactions": []
    })
  })
});

$('.category-button').click(() => {
  const category = $(".category-input").val();
  if (category === '') return;

  addCategory(category);
  $(".category-input").val("");
});

$('.transaction-button').click((e) => {
  e.preventDefault();

  conductTransaction();
  displayAccountSummary();

  document.transactionForm.reset();
});


$('.transaction-form').change(() => {
  changeDisplayedElements();
});