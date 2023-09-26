let api = require('@actual-app/api');
const express = require('express');
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/', (req, res, next) => {
  console.log(req.body);
  addTransaction(req.body.accountId, getCurrentDateFormatted(), req.body.amount, req.body.payee, req.body.notes)
    .then((response) => {
      console.log(response);
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
  res.status(500).send('Something broke!');
});

BUDGET_ID = process.env.BUDGET_ID;
SERVER_URL = process.env.SERVER_URL;
SERVER_PASSWORD = process.env.SERVER_PASSWORD;

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

    var current_date = getCurrentDatTimeFormatted();
    notes= 'API-created '+current_date+" - "+notes;

    console.log("Downloading budget");
    // This is the ID from Settings → Show advanced settings → Sync ID
    await api.downloadBudget(BUDGET_ID)
    .then((response) => console.log("Budget downloaded!"))
    .catch((reason) => {
      console.log("2 - Error found: "+reason);
      throw new Error("Error downloading budget");
    });

    
    await api.importTransactions(accountId, [
      {
        date: transactionDate,
        amount: amount,
        payee_name: payee,
        notes: notes,
      },
    ]).then((response) => console.log("Transaction imported!"))
    .catch((reason) => { 
      console.log("3 - Error found: "+reason)
      throw new Error("Error importing transaction");
    });

    console.log("Shutting down comunication");
    await api.shutdown();
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

function getCurrentDatTimeFormatted(){
  let date_time = new Date();
  let date = ("0" + date_time.getDate()).slice(-2);
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  let year = date_time.getFullYear();
  let hours = date_time.getHours();
  let minutes = date_time.getMinutes();
  let seconds = date_time.getSeconds();
  return (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
}

function getCurrentDateFormatted(){
  let date_time = new Date();
  let date = ("0" + date_time.getDate()).slice(-2);
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  let year = date_time.getFullYear();
  return (year + "-" + month + "-" + date );
}

try{
  app.listen(8080);
}catch(e) {
  console.log(e);
  return false;
}