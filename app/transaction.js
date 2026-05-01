if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'node',
  };
}
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

    // Pre-flight check
    const isUp = await utils.isServerUp(SERVER_URL);
    if (!isUp) {
        throw new Error("Actual Server is unreachable at " + SERVER_URL + ". Please check your connection or server status.");
    }

    console.log("Connecting to server "+SERVER_URL);
    try {
      await utils.withRetry(() => api.init({
        dataDir: '/tmp/actual',
        serverURL: SERVER_URL,
        password: SERVER_PASSWORD,
      }));
      console.log("End initialization");
    } catch (reason) {
      console.log("1 - Error found: "+reason);
      throw new Error("Error initializating app after multiple attempts");
    }

    var current_date = utils.getCurrentDateTimeFormatted();
    notes= 'API-created '+current_date+" - "+notes;

    console.log("Downloading budget");
    try {
      await utils.withRetry(() => api.downloadBudget(BUDGET_ID));
      console.log("Budget downloaded!");
    } catch (reason) {
      console.log("2 - Error found: "+reason);
      throw new Error("Error downloading budget after multiple attempts");
    }

    let transactionList = []
    var baseTransaction = createTransaction(transactionDate, amount, payee, notes)
    transactionList.push(baseTransaction)
    for(const tax of taxesList ){
      var taxTransaction = createTransaction(transactionDate, tax.value, tax.name, notes);
      transactionList.push(taxTransaction)
    }

    console.log(transactionList);
    
    try {
      await api.importTransactions(accountId, transactionList);
      console.log("Transaction imported!");
    } catch (reason) {
      console.log("3 - Error found: "+reason)
      throw new Error("Error importing transaction");
    }

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
  if (isNaN(numericAmount)) {
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