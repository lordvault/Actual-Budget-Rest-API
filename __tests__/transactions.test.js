const transactions = require('../app/transaction');



test('validate add transction', () => {
    process.env['SERVER_URL'] = 'http://some.actual.endpoint.com';
    process.env['SERVER_PASSWORD'] = '12345678';
    process.env['BUDGET_ID'] = 'budget-secret';
    BUDGET_ID = process.env.BUDGET_ID;
    SERVER_URL = process.env.SERVER_URL;
    SERVER_PASSWORD = process.env.SERVER_PASSWORD;
    GENERATE_UNIC_ID = process.env.GENERATE_UNIC_ID ?? false;
    BASE_FILE_LOCATION = "/actual/taxes/"
    expect(transactions.addTransaction("accountID", "2021-01-01", 12000, "commerceName", "Added by tasker"))
    .toBe(true);
});