const fs = require('fs');
const os = require('os');
const path = require('path');
const taxes = require('../app/taxes');

describe('taxes.js integration (real js-yaml & mathjs)', () => {
  let tmpDir;
  const originalBase = process.env.BASE_FILE_LOCATION;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'actual-taxes-test-'));
    process.env.BASE_FILE_LOCATION = tmpDir + path.sep;
  });

  afterEach(() => {
    if (originalBase === undefined) {
      delete process.env.BASE_FILE_LOCATION;
    } else {
      process.env.BASE_FILE_LOCATION = originalBase;
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('parses the repository sample taxes.yml and evaluates formulas accurately', () => {
    const samplePath = path.resolve(__dirname, '..', 'taxes.yml');
    fs.copyFileSync(samplePath, path.join(tmpDir, 'taxes.yml'));

    const parsed = taxes.readTaxesFile();
    expect(parsed).toEqual({
      'account-id-to-apply-tax': {
        '4x1000': { formula: '(transactionAmount / 1000) * 4' },
        retencion: { formula: '(transactionAmount * 0.25)' },
      },
    });

    const result = taxes.evaluateTaxes(-100000, 'account-id-to-apply-tax');
    expect(result).toEqual([
      { name: '4x1000', value: -400 },
      { name: 'retencion', value: -25000 },
    ]);
  });

  it('returns null / empty taxes for an empty or whitespace-only taxes.yml (js-yaml v5 compat)', () => {
    fs.writeFileSync(path.join(tmpDir, 'taxes.yml'), '', 'utf8');
    expect(taxes.readTaxesFile()).toBeNull();
    expect(taxes.evaluateTaxes(-50000, 'acc1')).toEqual([]);

    fs.writeFileSync(path.join(tmpDir, 'taxes.yml'), '   \n\t\n', 'utf8');
    expect(taxes.readTaxesFile()).toBeNull();
    expect(taxes.evaluateTaxes(-50000, 'acc1')).toEqual([]);
  });

  it('returns null / empty taxes for a comment-only taxes.yml (js-yaml v5 compat)', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'taxes.yml'),
      '# No active tax rules configured\n# account-id:\n',
      'utf8'
    );
    expect(taxes.readTaxesFile()).toBeNull();
    expect(taxes.evaluateTaxes(-50000, 'acc1')).toEqual([]);
  });

  it('returns null / empty taxes for an explicit YAML null document', () => {
    fs.writeFileSync(path.join(tmpDir, 'taxes.yml'), 'null\n', 'utf8');
    expect(taxes.readTaxesFile()).toBeNull();
    expect(taxes.evaluateTaxes(-50000, 'acc1')).toEqual([]);
  });

  it('returns null / empty taxes when taxes.yml does not exist', () => {
    expect(taxes.readTaxesFile()).toBeNull();
    expect(taxes.evaluateTaxes(-50000, 'acc1')).toEqual([]);
  });

  it('throws YAMLException for malformed YAML', () => {
    fs.writeFileSync(path.join(tmpDir, 'taxes.yml'), 'account:\n  tax: [unclosed\n', 'utf8');
    expect(() => taxes.readTaxesFile()).toThrow();
  });
});
