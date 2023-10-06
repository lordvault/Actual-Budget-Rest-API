const utils = require('./utils');

async function addTransaction(accountId, transactionDate, amount, payee, notes){

    amount = validateAmount(amount);
    accountId = validateEmpty("AccountId", accountId);
    payee = validateEmpty("Payee", payee);

    console.log("Starting process for: |"+transactionDate +"| - |"+amount+"| - |"+payee+"| - |"+notes);

    console.log("Connecting to server "+SERVER_URL);
    await api.init({
      // Budget data will be cached locally here, in subdirectories for each file.
      dataDir: '/tmp/actual',
      // This is the URL of your running server
      serverURL: SERVER_URL,
      // This is the password you use to log into the server
      password: SERVER_PASSWORD,
    })
    .then((response) => console.log("End initialization"))
    .catch((reason) => {
      console.log("1 - Error found: "+reason);
      throw new Error("Error initializating app");
    });

    var current_date = utils.getCurrentDatTimeFormatted();
    notes= 'API-created '+current_date+" - "+notes;

    console.log("Downloading budget");
    // This is the ID from Settings → Show advanced settings → Sync ID
    await api.downloadBudget(BUDGET_ID)
    .then((response) => console.log("Budget downloaded!"))
    .catch((reason) => {
      console.log("2 - Error found: "+reason);
      throw new Error("Error downloading budget");
    });


    var transaction = {
      date: transactionDate,
      amount: amount,
      payee_name: payee,
      notes: notes,
    };

    if(GENERATE_UNIC_ID){
      console.log("Adding unique id to transaction")
      transaction.imported_id = crypto.randomUUID();
    }

    console.log(transaction);
    
       await api.importTransactions(accountId, [transaction])
    .then((response) => console.log("Transaction imported!"))
    .catch((reason) => { 
      console.log("3 - Error found: "+reason)
      throw new Error("Error importing transaction");
    });

    console.log("Shutting down comunication");
    await api.shutdown();
    return true;
}


module.exports = {addTransaction};