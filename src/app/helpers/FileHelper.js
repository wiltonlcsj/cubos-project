import fs from 'fs';
import path from 'path';
const fsPromises = fs.promises;

class FileHelper {
  async readFromFile(file, encode = 'utf-8') {
    try {
      return JSON.parse(await fsPromises.readFile(file, encode))
    } catch (error) {
      await this.writeOnFile(file, []);
      try {
        return JSON.parse(await fsPromises.readFile(file, encode));
      } catch (error) {
        console.log('Something happened');
        console.log(error);
        return false;
      }
    }
  }

  async writeOnFile(file, content, encode = 'utf-8') {
    try {
      await fsPromises.writeFile(file, JSON.stringify(content), encode);
    } catch (error) {
      console.log('Something happened');
      console.log(error);
      return false;
    }
  }
}

export default new FileHelper();