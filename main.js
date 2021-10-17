const modal = {
  //Atributes
  openLink: document.querySelector("#transaction a"),
  closeLink: document.querySelector(".modal-overlay a"),

  //Methods
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },

  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
    form.clearFields();
  },

  loadModal() {
    modal.openLink.onclick = (e) => {
      e.preventDefault();
      modal.open();
    };

    modal.closeLink.onclick = (e) => {
      e.preventDefault();
      modal.close();
    };
  },
};

const storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const transaction = {
  all: storage.get(),

  add(newTransaction) {
    transaction.all.push(newTransaction);
    app.reload();
  },

  remove(index) {
    transaction.all.splice(index, 1);
    app.reload();
  },

  income() {
    return transaction.all
      .filter((transaction) => transaction.amount >= 0)
      .map((income) => income.amount)
      .reduce((total, actual) => total + actual, 0);
  },

  expenses() {
    return transaction.all
      .filter((transaction) => transaction.amount < 0)
      .map((income) => income.amount)
      .reduce((total, actual) => total + actual, 0);
  },

  total() {
    return transaction.income() + transaction.expenses();
  },
};

const pageFinances = {
  //Atributes
  transactionContainer: document.querySelector("#data-table tbody"),

  //Methods
  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense";
    const amount = utils.formatCurrency(transaction.amount);
    const html = `
    <td class="description">${transaction.description}</td>
    <td class=${cssClass}>${amount}</td>
    <td class="data">${transaction.date}</td>
    <td><img onclick="transaction.remove(${index})" src="./src/assets/minus.svg" alt="remover entrada"></td>
    `;
    return html;
  },

  addTransaction(transation, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = pageFinances.innerHTMLTransaction(transation, index);
    tr.dataset.index = index;
    pageFinances.transactionContainer.appendChild(tr);
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = utils.formatCurrency(
      transaction.income()
    );
    document.getElementById("expenseDisplay").innerHTML = utils.formatCurrency(
      transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = utils.formatCurrency(
      transaction.total()
    );
  },

  clearTransactions() {
    pageFinances.transactionContainer.innerHTML = "";
  },
};

const utils = {
  formatDescription(description) {
    return description.trim();
  },

  formatAmount(value) {
    value = value.replace(/\.\,/, "");
    return Number(value) * 100;
  },

  formatDate(date) {
    let dateComponents = date.split("-");
    return `${dateComponents[2]}/${dateComponents[1]}/${dateComponents[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) >= 0 ? "" : "-";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value;
  },
};

const form = {
  //Atributes
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  //Method
  loadForm() {
    document.querySelector("#form form").onsubmit = (e) => {
      e.preventDefault();
      form.submit();
    };

    Array.from(document.querySelectorAll("#form form input")).map(
      (input) =>
        (input.onfocus = (e) => {
          e.target.classList.remove("flagged");
          e.target.nextElementSibling.innerHTML = "";
        })
    );
  },

  getValues() {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value,
    };
  },

  validateData() {
    const { description, amount, date } = form.getValues();
    let status = true;

    if (description.trim() === "") {
      form.description.classList.add("flagged");
      form.description.nextElementSibling.innerHTML =
        "Esse campo não pode ser vazio!";
      status = false;
    }

    if (amount.trim() === "") {
      form.amount.classList.add("flagged");
      form.amount.nextElementSibling.innerHTML =
        "Esse campo não pode ser vazio!";
      status = false;
    }

    if (date.trim() === "") {
      form.date.classList.add("flagged");
      form.date.nextElementSibling.innerHTML = "Esse campo não pode ser vazio!";
      status = false;
    }

    return status;
  },

  formatData() {
    let { description, amount, date } = form.getValues();

    description = utils.formatDescription(description);
    amount = utils.formatAmount(amount);
    date = utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  saveTransaction(newTransaction) {
    transaction.add(newTransaction);
  },

  clearFields() {
    Array.from(document.querySelectorAll("#form form input")).map((input) => {
      input.classList.remove("flagged");
      input.nextElementSibling.innerHTML = "";
    });

    form.description.value = "";
    form.amount.value = "";
    form.date.value = "";
  },

  submit() {
    if (form.validateData()) {
      form.saveTransaction(form.formatData());
      modal.close();
    }
  },
};

const app = {
  init(firstLoad = false) {
    if (firstLoad) {
      modal.loadModal();
      form.loadForm();
    }
    transaction.all.forEach((transaction, index) =>
      pageFinances.addTransaction(transaction, index)
    );
    pageFinances.updateBalance();
    storage.set(transaction.all);
  },

  reload() {
    pageFinances.clearTransactions();
    app.init();
  },
};

app.init(true);
