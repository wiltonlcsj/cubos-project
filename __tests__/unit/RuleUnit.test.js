import Rule from '../../src/app/models/Rule';
import Faker from 'faker/locale/pt_BR';

const data = [
  {
    id: 1,
    date: '25-06-2020',
    daily: false,
    weekdays: null,
    intervals: [
      { begin: "17:00", end: '18:00' }
    ]
  }
];

describe('Unit tests for Rule model', () => {
  it('Should be success false if some conflict occurs', () => {
    const response = Rule.checkConflict({
      date: '25-06-2020',
      daily: false,
      weekdays: null,
      intervals: [{ begin: '17:30', end: '18:30' }]
    }, data);

    expect(response).toBeObject();
    expect(response.success).toBeBoolean().toBe(false);
    expect(response.errors).not.toBeEmpty();
  });

  it('Should be success true if some conflict occurs', () => {
    const response = Rule.checkConflict({
      date: null,
      daily: true,
      weekdays: null,
      intervals: [{ begin: '08:00', end: '09:30' }]
    }, data);

    expect(response).toBeObject();
    expect(response.success).toBeBoolean().toBe(true);
    expect(response.errors).toBeEmpty();
  });

  it('Should be return a empty set if no intervals was found', () => {
    const response = Rule.searchByDates(data, '26-06-2020', '27-06-2020');
    expect(response).toBeArray().toBeEmpty();
  });

  it('Should be return a empty set if some intervals were found', () => {
    const response = Rule.searchByDates(data, '25-06-2020', '27-06-2020');
    expect(response).toBeArray().not.toBeEmpty();
  });
})