Project API to create Transactions on 'Actual Budget'
-

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/lordvault)[<img src="mercado-pago.png" alt="Sample Image" width="120">](https://link.mercadopago.com.co/lordvault)

[Actual Budget link](https://actualbudget.org/)

This project provides a docker image on nodejs 20, that allows consume the ['actual budget node sdk/api'](https://actualbudget.org/docs/api/) to create transactions on an account.


The account must exist on your Actual Server.

Docker Environment params:
-
- SERVER_URL: The url where the 'Actual budget' is hosted, with port.
- BUDGET_ID: This is the ID from Settings → Show advanced settings → Sync ID

- SERVER_PASSWORD: This is the password you use to log into the server


Comand to run the docker:
```
sudo docker run -p 49160:8080 -e BUDGET_ID="xxxxxxx-7e2b-404e-8399-ccbf88442328" -e SERVER_URL="https://actual.myhostserver.com" -e SERVER_PASSWORD="myActualPassword" ghcr.io/lordvault/actual-budget-rest-api:latest
```

To use taxes feature add to the command this after the SERVER_PASSWORD:
```
 -v /home/localpc/some-path/taxes.yml:/actual/taxes/taxes.yml:ro ...
```



docker-compose:

```
version: "3"
services:

  actual-rest-api:
    image: ghcr.io/lordvault/actual-budget-rest-api:latest
    restart: always
    container_name: actual-rest-api
    network_mode: host
    ports:
      - 49160:49160
    environment:
      # The container is run as the user with this PUID and PGID (user and group id).
      # - TZ=${TZ} Optional, this avoid date issues for transactions
      # - GENERATE_UNIC_ID=true 
      - SERVER_URL=https://actual.myhostserver.com
      - SERVER_PASSWORD=myActualPassword
      - BUDGET_ID=xxxxxx-7e2b-404e-8399-ccbf88442328
    #Optional mount to make use of Taxes feature.
    #volumes:
    #  - /home/localpc/some-path/taxes.yml:/actual/taxes/taxes.yml:ro  
```     

GENERATE_UNIC_ID = Boolean, this generates an unique id for each transaction. https://actualbudget.org/docs/api/reference#transaction they mention "Transactions with the same imported_id will never be added more than once.". But anyways 2 transaction with different imported_id, are not created twice. (NOT WORKING)

TZ = Your timezone, ie America/Bogota. Review your Actual server has the same timezone. 



TAXES FILE:
-

In order to use taxes, you should create a file with this format:
```
account-id-to-apply-tax:
 4x1000:
  formula: "(transactionAmount / 1000) * 4"
 retencion:
  formula: "(transactionAmount * 0.25)"
```
In this example we have 2 taxes to apply to ALL the transactions received through the api service. The first one its named '4x1000' and second one is 'retencion'. As you can see both declare the formula field as a math expression, the only variable is 'transactionAmount' this refers to the amount of transaction received on the request.

Update your docker run command or docker-compose file, to mount your file on the container location ``/actual/taxes/taxes.yml``

In case you dont require taxes feature, just leave commented the volumes section on docker-compose.

REST SERVICE PARAMS:
-
- accountId: The id of the account to add the transaction. (you can get the id from the URL of the actual UI)
![Alt text](image.png)
- amount: The amount of money on cents. For $1 you need to send 100 as value.
- payee: The payee associated to the transaction, if not exists, the actual creates the payee automatically
- notes: Notes to add on the transaction, the system already adds: "API-created 2023-03-21 12:24 - {your_note}"


CURL to consume the API:
```
curl --location 'http://actual.myhostserver.com/' \
--header 'Content-Type: application/json' \
--data '{
    "accountId": "eeeeeeee-1111-4444-1111-d42a4a7b82cb",
    "amount": -1350000,
    "payee": "Banco de bogota",
    "notes": "Tasker"
}'
```
In this example we send a transaction payment from establishment 'Banco de bogota' for amount of 13.500,00 (remember sent the amount on cents). In this transaction i send a note with "Tasker" because usually i like to identify where comes the transaction. You can see this transaction note on the Actual UI, appended to a mention of 'API-create date time' . ie: 
``API-created 2025-03-03 10:30:44 - tasker``


Important: The negative value represent a payment, a positive value represents an income or deposite.

Personal usage
- 
This api was created to use with mobile app [Tasker](https://tasker.joaoapps.com/), reading the bank notifications i can get the Payee and amount information of my transactions. (For this moment only payments). 
With that information i avoid to have to enter manually the information on the 'Actual Budget' server.


Pending Features
- 
[ ] Add security to rest service (App token)

[ ] Support income transactions.

[x] ~~Automatic taxes. In colombia some account adds a fee over the transaction named '4x1000'. The idea its to receive a flag on the request with the account, to apply the fee on the transaction.~~

[ ] Validate server comunication before create transaction
 
[ ] Add functional testing ? load testing ? unit testing ? 

Detected Issues:
- 
- Sometimes a PostError its generated cuz the system cant communicate with the actual server. This breaks the system and stop the container.


Throubleshots: 
- Time in time, actual updates the api, this takes a little of effort updating the node libraries and verifying all still working as expected.