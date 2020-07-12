import * as Yup from 'yup';
import {
  isEqual,
  isAfter,
  parse,
  isSameDay,
  isPast,
  addMinutes,
  setDate,
  setMonth,
  setYear,
  isDate,
  getDate,
  getYear,
  getMonth,
} from 'date-fns';

class RuleValidator {
  createSchema(body: RuleInterface): Yup.ObjectSchema {
    return Yup.object().shape({
      daily: Yup.boolean().notRequired().oneOf([true]),
      weekdays: Yup.array()
        .of(Yup.number().integer().min(0).max(6))
        .test('uniqueDay', '${path} must not repeat array values', value => {
          if (!value) return true;

          return value.length === new Set(value.map((a: number) => a)).size;
        })
        .notRequired(),
      date: Yup.date()
        .transform(function (value: string | Date, originalvalue: string) {
          if (this.isType(value)) return value;
          const newValue = parse(`${originalvalue}`, 'dd-MM-yyyy', new Date());
          return newValue || undefined;
        })
        .test('isSameDay', '${path} is not a valid day', value =>
          body.date && value
            ? isSameDay(new Date(), value) || isAfter(value, new Date())
            : true,
        )
        .notRequired(),
      intervals: Yup.array()
        .of(
          Yup.object({
            begin: Yup.date()
              .transform(function (castValue, originalValue) {
                return parse(`${originalValue}`, 'HH:mm', new Date());
              })
              .test('isPast', '${path} is in the past', value => {
                if (!body.date) return true;

                // Check in case of given a date if schedule is in the past
                let { date } = body;
                if (!isDate(date)) {
                  date = parse(body.date as string, 'dd-MM-yyyy', new Date());
                }

                return !isPast(
                  setYear(
                    setMonth(
                      setDate(value, getDate(date as Date)),
                      getMonth(date as Date),
                    ),
                    getYear(date as Date),
                  ),
                );
              })
              .required(),
            end: Yup.date()
              .transform((castValue, originalValue) => {
                return parse(`${originalValue}`, 'HH:mm', new Date());
              })
              .test(
                'isAfterBegin',
                '${path} is before or equal to begin',
                function (value) {
                  // End of interval must be one minute later at least
                  const { begin } = this.parent;
                  return (
                    isAfter(value, addMinutes(begin, 1)) ||
                    isEqual(value, addMinutes(begin, 1))
                  );
                },
              )
              .required(),
          }),
        )
        .required(),
    });
  }

  listSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      page: Yup.number().integer().notRequired(),
      per_page: Yup.number().integer().notRequired(),
    });
  }

  listScheduleSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      page: Yup.number().integer().notRequired(),
      per_page: Yup.number().integer().notRequired(),
      startday: Yup.date()
        .transform(function (value, originalvalue) {
          if (this.isType(value)) return value;
          const newValue = parse(`${originalvalue}`, 'dd-MM-yyyy', new Date());
          return newValue || undefined;
        })
        .required(),
      endday: Yup.date()
        .transform(function (value, originalvalue) {
          if (this.isType(value)) return value;
          const newValue = parse(`${originalvalue}`, 'dd-MM-yyyy', new Date());
          return newValue || undefined;
        })
        .required(),
    });
  }

  /**
   * Function to validate if only of given fields are present on request
   * @param {RuleInterface} body Body content from Http request
   * @returns {boolean} false if just one was specified and true if more than one was specified
   * @memberof ModelHelper
   */
  checkFieldsOnlyOne(body: RuleInterface) {
    const fields = ['weekdays', 'daily', 'date'];
    let initialValue = 0;
    return (
      fields.reduce((sum, actual) => {
        return body[actual] !== undefined ? ++initialValue : initialValue;
      }, initialValue) !== 1
    );
  }
}

export default new RuleValidator();
