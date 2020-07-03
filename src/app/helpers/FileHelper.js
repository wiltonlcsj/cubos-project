import fs from 'fs';
import path from 'path';
const fsPromises = fs.promises;

/**
 * Class to make easily manipulate json file
 * @class FileHelper
 */
class FileHelper {

  /**
   * Function that read file from path and return a JSON if successfull
   * @async
   * @param {string} filepath Path to file
   * @param {string} [encode='utf-8'] The encoding used to read the document
   * @returns {boolean|object} Returns false if a error occurs or JSON if was successfull 
   * @memberof FileHelper
   */
  async readFromFile(filepath, encode = 'utf-8') {
    try {
      return JSON.parse(await fsPromises.readFile(filepath, encode))
    } catch (error) {
      // If no document was found on filepath must create one
      try {
        await this.writeOnFile(filepath, []);
        return JSON.parse(await fsPromises.readFile(filepath, encode));
      } catch (error) {
        return false;
      }
    }
  }

  /**
   * Function that writes on file from path
   * @async
   * @param {string} filepath Path to file
   * @param {string|object|Array} content Content that must be write on document
   * @param {string} [encode='utf-8'] The encoding used to write the document
   * @returns {boolean} Returns false if some error occurs or true if the write was successful
   * @memberof FileHelper
   */
  async writeOnFile(filepath, content, encode = 'utf-8') {
    try {
      await fsPromises.opendir(path.resolve('./data'));
    } catch (err) {
      try {
        await fsPromises.mkdir(path.resolve('./data'));
        await fsPromises.writeFile(filepath, JSON.stringify(content), encode);
        return true;
      }
      catch (error) {
        return false;
      }
    }
  }
}

export default new FileHelper();