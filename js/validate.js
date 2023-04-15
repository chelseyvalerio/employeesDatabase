const validator = require('validator');

const validate = {
  valString(string) {
    return string !== '' || 'Please enter a valid response!';
  },
  valSalary(num) {
    if (validator.isDecimal(num)) return true;
    return 'Salary must contain a decimal!';
  },
  isSame(string1, string2) {
    if (string1 === string2) return true;
  }
};

module.exports = validate;