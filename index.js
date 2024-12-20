let api = require('@actual-app/api');
const express = require('express');
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

BUDGET_ID = process.env.BUDGET_ID;
SERVER_URL = process.env.SERVER_URL;
SERVER_PASSWORD = process.env.SERVER_PASSWORD;

let apiInitialized = false;

async function initializeApi() {
  console.log("Connecting to server "+SERVER_URL);
  await api.init({
    dataDir: '/tmp/actual',
    // dataDir: './tmp',
    serverURL: SERVER_URL,
    password: SERVER_PASSWORD,
  })
  .then(() => {
    console.log("API initialized");
    apiInitialized = true;
  })
  .catch((reason) => {
    console.log("Error initializing API: "+reason);
    throw new Error("Error initializing API");
  });

  console.log("Downloading budget");
  // This is the ID from Settings → Show advanced settings → Sync ID
  await api.downloadBudget(BUDGET_ID)
  .then((response) => console.log("Budget downloaded!"))
  .catch((reason) => {
    console.log("2 - Error found: "+reason);
    throw new Error("Error downloading budget");
  });
}

initializeApi();

app.get('/healthcheck', (req, res) => {
  if (!apiInitialized) {
    throw new Error("API not initialized");
  }
  res.json({status: 'ok'});
});

app.post('/', (req, res, next) => {
  console.log("POST / received")
  console.log(req.body);
  addTransaction(req.body.account_id, req.body.transaction_date, req.body.amount, req.body.payee, req.body.notes, req.body.imported_id)
    .then((response) => {
      if(response){
        res.json({status: 'Success'});
      }else{
        res.status(500).json({status: 'Error', error: 'Internal error, please review docker logs.'})
      }    
    }).catch((reason) => {
      console.log(reason);
      res.status(500).json({status: 'Error', error: 'Internal error, please review docker logs.' +reason });
    });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke! ');
});

async function addTransaction(accountId, transactionDate, amount, payee, notes, imported_id){
  if (!apiInitialized) {
    throw new Error("API not initialized");
  }
    
  amount = validateAmount(amount);
    accountId = validateEmpty("AccountId", accountId);
    payee = validateEmpty("Payee", payee);

    var transaction = {
      date: transactionDate,
      amount: amount,
      payee_name: payee,
      notes: notes,
      imported_id: imported_id,
    };
    console.log("Starting process for: |"+transaction.date +"| - |"+transaction.amount+"| - |"+transaction.payee_name+"| - |"+transaction.notes+"| - |"+transaction.imported_id+"|");

    await api.importTransactions(accountId, [transaction])
    .then((response) => console.log("Transaction imported!"))
    .catch((reason) => { 
      console.log("3 - Error found: "+reason)
      throw new Error("Error importing transaction");
    });

    return true;
}

async function getAccounts(){
  // This is the ID from Settings → Show advanced settings → Sync ID
  await api.downloadBudget(BUDGET_ID)
  .then((response) => console.log("Budget downloaded!"))
  .catch((reason) => {
    console.log("2 - Error found: "+reason);
    throw new Error("Error downloading budget");
  });

  let accounts = await getAccounts();
  console.log(accounts);

  return true;
}

function validateEmpty(fieldName, field){
  if (field == null || field == "") {
    throw new Error("Invalid "+fieldName+" value "+field);
  }
  return (field+"").trim();
}

function validateAmount(amount){
  try {
    console.log(typeof amount);
    if(typeof amount == "string"){
      return Number(amount);
    }
    return amount;
  }catch(err){
    throw new Error("Invalid Amount format");
  }
}

process.on('exit', async (code) => {
  console.log("Shutting down communication");
  await api.shutdown();
  console.log(`About to exit with code: ${code}`);
});

process.on('SIGINT', async () => {
  console.log("Shutting down communication");
  await api.shutdown();
  console.log('Received SIGINT. Shutting down.');
  process.exit();
});

process.on('uncaughtException', async (err) => {
  console.log("Shutting down communication");
  await api.shutdown();
  console.log(`Uncaught exception: ${err}`);
  process.exit(1);
});

try{
  app.listen(8080);
}catch(e) {
  console.log("LAST CATCH!");
}