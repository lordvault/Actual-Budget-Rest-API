let api = require('@actual-app/api');
const utils = require('./utils');
const taxes = require('./taxes');

async function addTransaction(accountId, transactionDate, amount, payee, notes){

    //--- Validaciones transaccion
    validateURL(SERVER_URL);
    validateEmpty("SERVER_PASSWORD", SERVER_PASSWORD);
    validateEmpty("BUDGET_ID", BUDGET_ID);
    amount = validateAmount(amount);
    accountId = validateEmpty("AccountId", accountId);
    payee = validateEmpty("Payee", payee);
    taxesList = taxes.evaluateTaxes(amount, accountId)

    console.log("Starting process for: |"+transactionDate +"| - |"+amount+"| - |"+payee+"| - |"+notes);

    console.log("Connecting to server "+SERVER_URL);
    await api.init({
      dataDir: '/tmp/actual',
      serverURL: SERVER_URL,
      password: SERVER_PASSWORD,
    })
    .then((response) => console.log("End initialization"))
    .catch((reason) => {
      console.log("1 - Error found: "+reason);
      throw new Error("Error initializating app");
    });

    var current_date = utils.getCurrentDateTimeFormatted();
    notes= 'API-created '+current_date+" - "+notes;

    console.log("Downloading budget");
    await api.downloadBudget(BUDGET_ID)
    .then((response) => console.log("Budget downloaded!"))
    .catch((reason) => {
      console.log("2 - Error found: "+reason);
      throw new Error("Error downloading budget");
    });

    let transactionList = []
    var baseTransaction = createTransaction(transactionDate, amount, payee, notes)
    transactionList.push(baseTransaction)
    for(const tax of taxesList ){
      var taxTransaction = createTransaction(transactionDate, tax.value, tax.name, notes);
      transactionList.push(taxTransaction)
    }

    console.log(transactionList);
    
    await api.importTransactions(accountId, transactionList)
    .then((response) => console.log("Transaction imported!"))
    .catch((reason) => {
      console.log("3 - Error found: "+reason)
      throw new Error("Error importing transaction");
    });

    console.log("Shutting down comunication");
    await api.shutdown();
    return true;
}

function createTransaction(transactionDate, amount, payee, notes){
  var transactionTemp = {
      date: transactionDate,
      amount: amount,
      payee_name: payee,
      notes: notes,
    };
  //Feature to add unic transactions
  if(GENERATE_UNIC_ID){
    console.log("Adding unique id to transaction")
    transactionTemp.imported_id = crypto.randomUUID();
  }
  return transactionTemp;
}

function validateEmpty(fieldName, field){
  if (field == null || field == "") {
    throw new Error("Invalid "+fieldName+" value is empty");
  }
  return (field+"").trim();
}

function validateAmount(amount) {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid Amount");
  }
  return numericAmount;
}

function validateURL(url) {
  try {
    new URL(url); // This will throw if the URL is invalid
    return url;
  } catch (err) {
    throw new Error("Invalid SERVER_URL value");
  }
}

module.exports = {addTransaction};