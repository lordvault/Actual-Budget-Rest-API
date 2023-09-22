Project API to create Transactions on 'Actual Budget'
-

-- Actual Budget link

This project provides a docker image on nodejs 18, that allows consume the 'actual budget node sdk/api' to create transactions on a account.


The account must exist on the Actual Server.

Docker Environment params:
-
- SERVER_URL: The url where the 'Actual budget' is hosted, with port.
- BUDGET_ID: This is the ID from Settings → Show advanced settings → Sync ID

- SERVER_PASSWORD: This is the password you use to log into the server


Comand to run the docker:
```
sudo docker run -p 49160:8080 -e BUDGET_ID="b0f1e0fa-7e2b-404e-8399-ccbf88442328" -e SERVER_URL="https://actual.myhostserver.com" -e SERVER_PASSWORD="myActualPassword" lordvault/node-actual-budget-rest-api
```

REST SERVICE PARAMS:
-
- accountId: The id of the account to add the transaction. (you can get the id from the URL of the actual UI)
![Alt text](image.png)
- amount: The amount of money for the transaction, without dots or commas, last 2 digits are the decimals.
- payee: The payee associated to the transaction
- notes: Notes to add on the transaction, the system already adds: "API-created 2023-03-21 12:24 - {your_note}"


CURL to consume the API:
```
curl --location 'http://actual.myhostserver.com/' \
--header 'Content-Type: application/json' \
--data '{
    "accountId": "eeeeeeee-1111-4444-1111-d42a4a7b82cb",
    "amount": 13500,
    "payee": "Banco de bogota",
    "notes": "Tasker"
}'
```



Personal usage
- 
This api was created to use with mobile app 'Tasker', reading the bank notifications i can get the Payee and amount information of my transactions. (For this moment only payments). 
With that information i avoid to have to enter manually the information on the 'Actual Budget' server.


Pending Features
- 
[ ] Add security to rest service (App token)

[ ] Support income transactions.