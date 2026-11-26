const math = require('mathjs');
const yaml = require('js-yaml');
const fs = require('fs');

function readTaxesFile(){

  var filePath = process.env.BASE_FILE_LOCATION+"taxes.yml";
  console.log(filePath)
  if(!fs.existsSync(filePath)){
    console.log("file doesnt exists!")
    return null;
  }

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    if (!fileContents || !fileContents.trim()) {
      return null;
    }
    const data = yaml.load(fileContents);
    return data ?? null;
  } catch (err) {
    if (err && err.name === 'YAMLException' && err.reason === 'expected a document, but the input is empty') {
      return null;
    }
    console.error('Error reading YAML file:', err.message);
    throw err;
  }
  
}

function evaluateTaxes(transactionAmount, accountId){
  var taxesData = readTaxesFile();
  let taxesList = []
  if(taxesData != null && taxesData[accountId]!=null){
    for( key in taxesData[accountId] ){
      var formula = taxesData[accountId][key]['formula']
      formula = formula.replace("transactionAmount", transactionAmount)
      var taxMap = {
        name:key,
        value:Math.round(math.evaluate(formula))
      }
      taxesList.push(taxMap)
    }
  }
  console.log("Taxes generated for transaction:")
  console.log(taxesList)
  return taxesList
}

module.exports = {evaluateTaxes, readTaxesFile};