import * as Yup from 'yup';
import FileHelper from '../helpers/FileHelper';
import ModelHelper from '../helpers/ModelHelper';
import Rule from '../models/Rule';
import path from 'path';
import { parse, isSameDay, isAfter, isPast, addMinutes, isEqual } from 'date-fns';

const filejson = path.resolve('./data/rules.json');

class RuleService {
  async createRule(body) {
    const schema = Yup.object().shape({
      daily: Yup.boolean().notRequired().oneOf([true]),
      weekdays: Yup.array().of(Yup.number().integer().min(0).max(6)).notRequired(),
      date: Yup.date().transform(function (value, originalvalue) {
        if (this.isType(value)) return value;
        value = parse(`${originalvalue}`, 'dd-MM-yyyy', new Date());
        return (value) ? value : undefined;
      }).test(
        'isSameDay',
        '${path} is not a valid day',
        (value) => {
          return body.date ? isSameDay(new Date(), value) || isAfter(value, new Date()) : true;
        },
      ).notRequired(),
      intervals: Yup.array().of(Yup.object({
        begin: Yup.date().transform(function (castValue, originalValue) {
          return parse(`${originalValue}`, 'HH:mm', new Date())
        }).test(
          'isPast',
          '${path} is in the past',
          (value) => !isPast(value),
        ).required(),
        end: Yup.date().transform((castValue, originalValue) => {
          return parse(`${originalValue}`, 'HH:mm', new Date())
        }).test(
          'isAfterBegin',
          '${path} is before or equal to begin',
          function (value) {
            const { begin } = this.parent;
            return isAfter(value, addMinutes(begin, 1)) || isEqual(value, addMinutes(begin, 1))
          },
        ).required()
      })).required(),
    });

    /*
    * Check is request body is valid
    */
    try {
      await schema.validate(body)
    } catch (err) {
      return {
        status: 400, body: {
          message: 'Validation fails', errors: err.errors.map((item) => {
            return { element: err.path, messages: item }
          })
        }
      };
    }

    /*
    * Check if rule has more than 1 attribute (daily, weekdays, date) or none
    */
    if (Rule.checkFieldsOnlyOne(body)) {
      return { status: 400, body: { message: 'Validation fails', errors: ['You need to pass only one of date, daily or weekdays'] } };
    }

    const contentRule = await FileHelper.readFromFile(filejson);

    /*
    * Check it has a rule with time conflict
    */
    const checkConflict = Rule.checkConflict(body, contentRule);
    if (!checkConflict.success) {
      return { status: 400, body: { message: 'Validation fails', errors: checkConflict.errors } };
    }

    const id = ModelHelper.generateId();
    const { date = null, weekdays = null, daily = false, intervals } = body;

    contentRule.push({ id, date, weekdays, daily, intervals });
    await FileHelper.writeOnFile(filejson, contentRule);

    return { status: 200, body: { id, date, weekdays, daily, intervals } }
  }

  async deleteRule(id) {
    const contentRule = await FileHelper.readFromFile(filejson);
    const ruleIndex = contentRule.findIndex((item) => {
      return item.id == id;
    });

    if (ruleIndex >= 0) {
      contentRule.splice(ruleIndex, 1)
      await FileHelper.writeOnFile(filejson, contentRule);
      return { status: 200, body: { message: 'Delete was successfull' } }
    } else {
      return { status: 404, body: { error: 'Rule not found' } }
    }
  }

  //Todo Validar campos
  async listRules(page = 1, per_page = 10) {
    const contentRule = await FileHelper.readFromFile(filejson);
    const base_index = (Math.abs(page) - 1) * Math.abs(per_page);
    const last_index = Math.abs(page) * Math.abs(per_page);

    const result = contentRule.slice(base_index, last_index);
    return { status: 200, body: { rules: result } }
  }

  //Todo Validar campos
  async listSchedule(startday, endday, page = 1, per_page = 10) {
    const contentRule = await FileHelper.readFromFile(filejson);
    const searchedRules = Rule.searchByDates(contentRule, startday, endday);

    const base_index = (Math.abs(page) - 1) * Math.abs(per_page);
    const last_index = Math.abs(page) * Math.abs(per_page);

    const result = searchedRules.slice(base_index, last_index);
    return { status: 200, body: { rules: result } }
  }
}

export default new RuleService();