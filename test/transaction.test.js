const transactions = require('../app/transaction');
const utils = require('../app/utils');
const api = require('@actual-app/api');
const taxes = require('../app/taxes');

jest.mock('@actual-app/api');
jest.mock('../app/utils');
jest.mock('../app/taxes');

describe('transaction.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.SERVER_URL = 'http://localhost:8080';
    global.SERVER_PASSWORD = 'password';
    global.BUDGET_ID = 'budget-id';
    global.GENERATE_UNIC_ID = false;

    // Mock successful API initialization and budget download
    api.init.mockResolvedValue();
    api.downloadBudget.mockResolvedValue();
    api.importTransactions.mockResolvedValue();
    api.shutdown.mockResolvedValue();

    // Mock taxes to return empty list by default
    taxes.evaluateTaxes.mockReturnValue([]);

    // Mock utils date formatting
    utils.getCurrentDateTimeFormatted.mockReturnValue('2023-10-27 10:00:00');
  });

  it('should throw error if server pre-flight check fails', async () => {
    utils.isServerUp.mockResolvedValue(false);

    await expect(transactions.addTransaction('acc123', '2023-10-27', 1000, 'Payee', 'Notes'))
      .rejects.toThrow('Actual Server is unreachable at http://localhost:8080');
    
    expect(utils.isServerUp).toHaveBeenCalledWith('http://localhost:8080');
    expect(api.init).not.toHaveBeenCalled();
  });

  it('should proceed and import transaction if pre-flight check succeeds', async () => {
    utils.isServerUp.mockResolvedValue(true);
    // Ensure withRetry calls the function immediately for normal tests
    utils.withRetry.mockImplementation((fn) => fn());

    const result = await transactions.addTransaction('acc123', '2023-10-27', 1000, 'Payee', 'Notes');

    expect(result).toBe(true);
    expect(utils.isServerUp).toHaveBeenCalledWith('http://localhost:8080');
    expect(api.init).toHaveBeenCalled();
    expect(api.importTransactions).toHaveBeenCalledWith('acc123', expect.any(Array));
  });

  it('should retry api.init if it fails initially', async () => {
    utils.isServerUp.mockResolvedValue(true);
    
    // Use actual withRetry for this specific test
    const actualUtils = jest.requireActual('../app/utils');
    utils.withRetry.mockImplementation(actualUtils.withRetry);

    // Fail first, succeed second
    api.init
      .mockRejectedValueOnce(new Error('Transient Error'))
      .mockResolvedValueOnce();

    const result = await transactions.addTransaction('acc123', '2023-10-27', 1000, 'Payee', 'Notes');

    expect(result).toBe(true);
    expect(api.init).toHaveBeenCalledTimes(2);
  });

  it('should include taxes in the transaction list', async () => {
    utils.isServerUp.mockResolvedValue(true);
    utils.withRetry.mockImplementation((fn) => fn());
    taxes.evaluateTaxes.mockReturnValue([{ name: 'tax1', value: 100 }]);

    await transactions.addTransaction('acc123', '2023-10-27', 1000, 'Payee', 'Notes');

    expect(api.importTransactions).toHaveBeenCalledWith(
      'acc123',
      expect.arrayContaining([
        expect.objectContaining({ amount: 1000, payee_name: 'Payee' }),
        expect.objectContaining({ amount: 100, payee_name: 'tax1' })
      ])
    );
  });
});
