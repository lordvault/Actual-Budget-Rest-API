const taxes = require('../app/taxes');
const fs = require('fs');
const yaml = require('js-yaml');

jest.mock('fs');
jest.mock('js-yaml');

describe('taxes.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.BASE_FILE_LOCATION = '/actual/taxes/';
  });

  describe('readTaxesFile', () => {
    it('should return null when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = taxes.readTaxesFile();

      expect(result).toBeNull();
      expect(fs.existsSync).toHaveBeenCalledWith('/actual/taxes/taxes.yml');
    });

    it('should return null when file exists but is empty', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('');
      yaml.load.mockReturnValue(null);

      const result = taxes.readTaxesFile();

      expect(result).toBeNull();
      expect(fs.readFileSync).toHaveBeenCalledWith('/actual/taxes/taxes.yml', 'utf8');
    });

    it('should return parsed YAML data when file exists', () => {
      const mockData = { '123': { tax: 0.1 } };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('test yaml content');
      yaml.load.mockReturnValue(mockData);

      const result = taxes.readTaxesFile();

      expect(result).toEqual(mockData);
      expect(fs.readFileSync).toHaveBeenCalledWith('/actual/taxes/taxes.yml', 'utf8');
      expect(yaml.load).toHaveBeenCalledWith('test yaml content');
    });

    it('should throw error when YAML parsing fails', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid yaml');
      yaml.load.mockImplementation(() => { throw new Error('Parse error'); });

      expect(() => taxes.readTaxesFile()).toThrow('Parse error');
    });
  });

  describe('evaluateTaxes', () => {
    it('should return empty array when taxes file is null', () => {
      fs.existsSync.mockReturnValue(false);

      const result = taxes.evaluateTaxes(1000, '123');

      expect(result).toEqual([]);
    });

    it('should return empty array when account has no tax rules', () => {
      const mockData = { '456': { tax: 0.1 } };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('mock content');
      yaml.load.mockReturnValue(mockData);

      const result = taxes.evaluateTaxes(1000, '123');

      expect(result).toEqual([]);
    });

    it('should calculate taxes correctly for an account', () => {
      const mockData = {
        '123': {
          'tax1': { formula: 'transactionAmount * 0.1' },
          'tax2': { formula: 'transactionAmount * 0.05' }
        }
      };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('mock content');
      yaml.load.mockReturnValue(mockData);

      const result = taxes.evaluateTaxes(1000, '123');

      expect(result).toEqual([
        { name: 'tax1', value: 100 },
        { name: 'tax2', value: 50 }
      ]);
    });

    it('should handle complex formulas', () => {
      const mockData = {
        '123': {
          'complexTax': { formula: 'round((transactionAmount + 10) * 0.12, 0)' }
        }
      };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('mock content');
      yaml.load.mockReturnValue(mockData);

      const result = taxes.evaluateTaxes(1000, '123');

      expect(result).toEqual([
        { name: 'complexTax', value: 121 }
      ]);
    });

    it('should handle multiple tax rules per account', () => {
      const mockData = {
        '123': {
          'tax1': { formula: 'transactionAmount * 0.1' },
          'tax2': { formula: 'transactionAmount * 0.05' },
          'tax3': { formula: 'transactionAmount * 0.02' }
        }
      };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('mock content');
      yaml.load.mockReturnValue(mockData);

      const result = taxes.evaluateTaxes(1000, '123');

      expect(result).toEqual([
        { name: 'tax1', value: 100 },
        { name: 'tax2', value: 50 },
        { name: 'tax3', value: 20 }
      ]);
    });
  });
});