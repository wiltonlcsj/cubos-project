import * as Yup from 'yup';
import fs from 'fs';
import FileHelper from '../helpers/FileHelper';
import ModelHelper from '../helpers/ModelHelper';
import Rule from '../models/Rule';
import path from 'path';
import {
  parse, isSameDay, isAfter, isPast, addMinutes, isEqual,
  setDate, setMonth, setYear, isDate, getDate, getYear, getMonth
} from 'date-fns';

const filejson = path.resolve('./data/rules.json');

/**
 * Class that receives the body request and execute the operations
 * @class RuleService
 */
class RuleService {

  /**
   * Function to create a new rule
   * @async
   * @param {object} body Object body from http request
   * @returns {object} Object with status and body attributes, body can have a set of errors or the new object created
   * and status has http code to send in response
   * @memberof RuleService
   */
  async createRule(body) {
    const schema = Yup.object().shape({
      daily: Yup.boolean().notRequired().oneOf([true]),
      weekdays: Yup.array().of(Yup.number().integer().min(0).max(6))
        .test(
          'uniqueDay',
          '${path} must not repeat array values',
          (value) => {
            if (!value)
              return true;

            return value.length === new Set(value.map(a => a)).size;
          },
        ).notRequired(),
      date: Yup.date().transform(function (value, originalvalue) {
        if (this.isType(value)) return value;
        value = parse(`${originalvalue}`, 'dd-MM-yyyy', new Date());
        return (value) ? value : undefined;
      }).test(
        'isSameDay',
        '${path} is not a valid day',
        (value) => body.date && value ? (isSameDay(new Date(), value) || isAfter(value, new Date())) : true,
      ).notRequired(),
      intervals: Yup.array().of(Yup.object({
        begin: Yup.date().transform(function (castValue, originalValue) {
          return parse(`${originalValue}`, 'HH:mm', new Date())
        }).test(
          'isPast',
          '${path} is in the past',
          (value) => {
            if (!body.date)
              return true;

            //Check in case of given a date if schedule is in the past
            let date = body.date;
            if (!isDate(date))
              date = parse(body.date, 'dd-MM-yyyy', new Date());

            return !isPast(setYear(setMonth(setDate(value, getDate(date)), getMonth(date)), getYear(date)));
          },
        ).required(),
        end: Yup.date().transform((castValue, originalValue) => {
          return parse(`${originalValue}`, 'HH:mm', new Date())
        }).test(
          'isAfterBegin',
          '${path} is before or equal to begin',
          function (value) {
            //End of interval must be one minute later at least
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
          message: 'Validation fails', errors: err.errors ? err.errors.map((item) => {
            return { element: err.path, messages: item }
          }) : err
        }
      };
    }

    /*
    * Check if rule has more than 1 attribute (daily, weekdays, date) or none
    */
    if (ModelHelper.checkFieldsOnlyOne(body, ['weekdays', 'daily', 'date'])) {
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

  /**
   * Functions to delete a rule from json with a given id
   * @async
   * @param {number} id Identifier of the rule must be deleted
   * @returns {object} Object with status and body attributes, body can have a set of errors or the message to success
   * and status has http code to send in response
   * @memberof RuleService
   */
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

  /**
   * Function that lists all rules in set
   * @async
   * @param {number} [page=1] Number of the requested page
   * @param {number} [per_page=10] Number of sets that each page must have
   * @returns {object} Object with status and body attributes, body has a set of rules
   * and status has http code to send in response
   * @memberof RuleService
   */
  async listRules(page = 1, per_page = 10) {
    const schema = Yup.object().shape({
      page: Yup.number().integer().notRequired(),
      per_page: Yup.number().integer().notRequired(),
    });

    //Validate the body with given schema
    try {
      await schema.validate({ page, per_page })
    } catch (err) {
      return {
        status: 400, body: {
          message: 'Validation fails', errors: err.errors.map((item) => {
            return { element: err.path, messages: item }
          })
        }
      };
    }

    const contentRule = await FileHelper.readFromFile(filejson);

    //Calculate the first and last index of set result
    const base_index = (Math.abs(page) - 1) * Math.abs(per_page);
    const last_index = Math.abs(page) * Math.abs(per_page);

    const result = contentRule.slice(base_index, last_index);
    return { status: 200, body: result }
  }

  /**
   * Function to list all schedules in given intervals of date
   * @async
   * @param {string} startday Start date of filter in format dd-MM-yyyy
   * @param {string} endday End date of filter in format dd-MM-yyyy
   * @param {number} [page=1] Number of the requested page
   * @param {number} [per_page=10] Number of sets that each page must have
   * @returns {object} Object with status and body attributes, body has a set of schedules
   * and status has http code to send in response
   * @memberof RuleService
   */
  async listSchedule(startday, endday, page = 1, per_page = 10) {
    const schema = Yup.object().shape({
      page: Yup.number().integer().notRequired(),
      per_page: Yup.number().integer().notRequired(),
      startday: Yup.date().transform(function (value, originalvalue) {
        if (this.isType(value)) return value;
        value = parse(`${originalvalue}`, 'dd-MM-yyyy', new Date());
        return (value) ? value : undefined;
      }).required(),
      endday: Yup.date().transform(function (value, originalvalue) {
        if (this.isType(value)) return value;
        value = parse(`${originalvalue}`, 'dd-MM-yyyy', new Date());
        return (value) ? value : undefined;
      }).required(),
    });

    //Validate the body with given schema
    try {
      await schema.validate({ page, per_page, startday, endday })
    } catch (err) {
      return {
        status: 400, body: {
          message: 'Validation fails', errors: err.errors.map((item) => {
            return { element: err.path, messages: item }
          })
        }
      };
    }

    const contentRule = await FileHelper.readFromFile(filejson);
    const searchedRules = Rule.searchByDates(contentRule, startday, endday);

    //Calculate the first and last index of set result
    const base_index = (Math.abs(page) - 1) * Math.abs(per_page);
    const last_index = Math.abs(page) * Math.abs(per_page);

    const result = searchedRules.slice(base_index, last_index);
    return { status: 200, body: result }
  }
}

export default new RuleService();