/**
 * Class to create some functions helpers to models
 * @class ModelHelper
 */
class ModelHelper {

  /**
   * Function that generates a random id between 1 and 99999999
   * @returns {number} The generated number for Id
   * @memberof ModelHelper
   */
  generateId() {
    return Math.floor(Math.random() * (99999999 - 1)) + 0;
  }

  /**
   * Function to validate if only of given fields are present on request
   * @param {object} body Body content from Http request
   * @param {Array<string>} fields Array with name of the fields that must be tested
   * @returns {boolean} false if just one was specified and true if more than one was specified
   * @memberof ModelHelper
   */
  checkFieldsOnlyOne(body, fields) {
    let initialValue = 0;
    return fields.reduce((sum, actual) => {
      return body[actual] !== undefined ? ++initialValue : initialValue;
    }, initialValue) !== 1;
  }
}

export default new ModelHelper();