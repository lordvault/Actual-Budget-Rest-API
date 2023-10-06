const math = require('mathjs');
const yaml = require('js-yaml'));
const fs = require('fs');


function readTaxesFile(){
  // Identify if exist a taxes.yml
  // If exist, then try to load the config.
  // if not exist copy a the base to the folder. return empty.
  /*
  * Its required to generate an structure to show the taxes.
  * A transaction can have multiple taxes.
  *  
  */
  if(fs.existsSync("/usr/app/tax/taxes.yml")){
    const taxex = yaml.safeLoad(fs.readFileSync('/usr/app/tax/taxes.yml'));
  }
  
}

