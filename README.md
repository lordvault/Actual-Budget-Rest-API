Project API to create Transactions on 'Actual Budget'
-

-- Actual Budget link

This project provides a docker image on nodejs 20, that allows consume the 'actual budget node sdk/api' to create transactions on a account.

The account must exist on the Actual Server.

Docker Environment params:

- SERVER_URL: The url where the 'Actual budget' is hosted, with port.
- BUDGET_ID: This is the ID from Settings → Show advanced settings → Sync ID
- SERVER_PASSWORD: This is the password you use to log into the server

docker-compose:
```
version: "3"
services:

  actual-rest-api:
    image: ghcr.io/paulcoates/actual-budget-rest-api:latest
    restart: always
    container_name: actual-rest-api
    network_mode: host
    ports:
      - 8080:8080
    environment:
      # The container is run as the user with this PUID and PGID (user and group id).
      # - TZ=${TZ} Optional, this avoid date issues for transactions
      # - GENERATE_UNIC_ID=true 
      - SERVER_URL=https://actual.myhostserver.com
      - SERVER_PASSWORD=myActualPassword
      - BUDGET_ID=xxxxxx-7e2b-404e-8399-ccbf88442328
```

REST SERVICE PARAMS:

- accountId: The id of the account to add the transaction. (you can get the id from the URL of the actual UI)
![Alt text](image.png)
- amount: The amount of money on cents. For $1 you need to send 100 as value.
- payee: The payee associated to the transaction, if not exists, the actual creates the payee automatically
- notes: Notes to add on the transaction
- transaction_id: The id of the transaction, this is used to avoid duplicated transactions.


CURL to consume the API:
```
▶ curl --location 'https://actualapi.ts.coates.network/' \
--header 'Content-Type: application/json' \
--data '{
    "account_id": "9cdea6e3-4770-4b3b-8d32-XXXXXX",
    "transaction_date": "2024-04-09",
    "amount": -4499,
    "payee": "Temu",
    "notes": "",
    "transaction_id": "29eb97e0-1d23-4440-8b89-XXXXXX"
}'
```
