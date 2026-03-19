if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'node',
  };
}

const request = require('supertest');
const app = require('../app/index');
const transactions = require('../app/transaction');
const utils = require('../app/utils');

jest.mock('../app/transaction');
jest.mock('../app/utils');

describe('POST /', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BUDGET_ID = 'test-budget';
    process.env.SERVER_URL = 'http://localhost:8080';
    process.env.SERVER_PASSWORD = 'password';
  });

  it('should return Success when transaction is added successfully', async () => {
    utils.getCurrentDateFormatted.mockReturnValue('2023-10-27');
    transactions.addTransaction.mockResolvedValue(true);

    const response = await request(app)
      .post('/')
      .send({
        accountId: 'acc123',
        amount: 1000,
        payee: 'Test Payee',
        notes: 'Test Notes'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'Success' });
    expect(transactions.addTransaction).toHaveBeenCalledWith(
      'acc123',
      '2023-10-27',
      1000,
      'Test Payee',
      'Test Notes'
    );
  });

  it('should return Error when transaction addition fails', async () => {
    utils.getCurrentDateFormatted.mockReturnValue('2023-10-27');
    transactions.addTransaction.mockResolvedValue(false);

    const response = await request(app)
      .post('/')
      .send({
        accountId: 'acc123',
        amount: 1000,
        payee: 'Test Payee',
        notes: 'Test Notes'
      });

    expect(response.statusCode).toBe(500);
    expect(response.body.status).toBe('Error');
    expect(response.body.error).toContain('Internal error');
  });

  it('should return Error when an exception occurs', async () => {
    utils.getCurrentDateFormatted.mockReturnValue('2023-10-27');
    transactions.addTransaction.mockRejectedValue(new Error('Test Error'));

    const response = await request(app)
      .post('/')
      .send({
        accountId: 'acc123',
        amount: 1000,
        payee: 'Test Payee',
        notes: 'Test Notes'
      });

    expect(response.statusCode).toBe(500);
    expect(response.body.status).toBe('Error');
    expect(response.body.error).toContain('Test Error');
  });
});
