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
   * @returns {boolean|array} Returns false if a error occurs or JSON if was successfull
   * @memberof FileHelper
   */
  async readFromFile(
    filepath: string,
  ): Promise<boolean | Array<RuleInterface> | [{ [key: string]: string }]> {
    try {
      const content = await fsPromises.readFile(filepath);
      if (content) {
        return JSON.parse(content.toString());
      }
      return false;
    } catch (err) {
      // If no document was found on filepath must create one
      try {
        await this.writeOnFile(filepath, []);
        const content = await fsPromises.readFile(filepath);
        if (content) {
          return JSON.parse(content.toString());
        }
        return false;
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
   * @param {string} [encoding='utf8'] The encoding used to write the document
   * @returns {boolean} Returns false if some error occurs or true if the write was successful
   * @memberof FileHelper
   */
  async writeOnFile(
    filepath: string,
    content: RuleInterface | RuleInterface[] | [] | [{ [key: string]: string }],
  ): Promise<boolean> {
    try {
      await fsPromises.opendir(path.resolve('./data'));
      await fsPromises.writeFile(filepath, JSON.stringify(content));
      return true;
    } catch (err) {
      try {
        await fsPromises.mkdir(path.resolve('./data'));
        await fsPromises.writeFile(filepath, JSON.stringify(content));
        return true;
      } catch (error) {
        return false;
      }
    }
  }
}

export default new FileHelper();
