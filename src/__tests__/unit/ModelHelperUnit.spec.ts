import 'jest-extended';
import 'jest-chain';
import Faker from 'faker/locale/pt_BR';
import ModelHelper from '@helpers/ModelHelper';

describe('Unit tests for ModelHelper', () => {
  it('Should be return a random id number', () => {
    expect(ModelHelper.generateId()).toBeNumber();
  });

  it('Should be return false if more than one field were specified from list', () => {
    expect(
      ModelHelper.checkFieldsOnlyOne(
        {
          field: Faker.name.findName(),
          exccessfield: Faker.random.number(),
        },
        ['field', 'exccessfield'],
      ),
    )
      .toBeBoolean()
      .toBe(true);
  });

  it('Should be return true if just one field were specified from list', () => {
    expect(
      ModelHelper.checkFieldsOnlyOne(
        {
          field: Faker.name.findName(),
        },
        ['field', 'exccessfield'],
      ),
    )
      .toBeBoolean()
      .toBe(false);
  });
});
