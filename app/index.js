const express = require('express');
const app = express();
const crypto = require('crypto');
const transactions = require('./transaction');
const utils = require('./utils');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/', (req, res, next) => {
  console.log(req.body);
  transactions.addTransaction(req.body.accountId, utils.getCurrentDateFormatted(), req.body.amount, req.body.payee, req.body.notes)
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
  res.status(500).send('Something broke! ');
});

BUDGET_ID = process.env.BUDGET_ID;
SERVER_URL = process.env.SERVER_URL;
SERVER_PASSWORD = process.env.SERVER_PASSWORD;
GENERATE_UNIC_ID = process.env.GENERATE_UNIC_ID ?? false;
BASE_FILE_LOCATION = "/actual/taxes/"

try{
  app.listen(49160);
  console.log("Starting application");
  console.log("Actual url:"+SERVER_URL);
  console.log("Budget id:"+BUDGET_ID);
}catch(e) {
  console.log("LAST CATCH!");
}