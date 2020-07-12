import 'jest-extended';
import 'jest-chain';
import fs from 'fs';
import path from 'path';
import FileHelper from '@helpers/FileHelper';

const filepath = path.resolve('./data/test.json');

afterAll(() => {
  fs.unlinkSync(filepath);
});

describe('Unit tests for FileHelper', () => {
  it('Should be able to write a file', async () => {
    const response = await FileHelper.writeOnFile(filepath, [{ test: 'okay' }]);
    expect(response).toBeBoolean().toBe(true);
  });

  it('Should be able to read on file', async () => {
    await FileHelper.writeOnFile(filepath, [{ test: 'okay' }]);
    const content = await FileHelper.readFromFile(filepath);
    expect(content).toBeArray();
    expect((content as Array<{ [key: string]: string }>).shift())
      .toBeObject()
      .toHaveProperty('test');
  });
});
