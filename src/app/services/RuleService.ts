import RuleValidator from '@validators/RuleValidator';
import RuleRepository from '@repositories/RuleRepository';

import path from 'path';
import ModelHelper from '@helpers/ModelHelper';
import FileHelper from '@helpers/FileHelper';

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
  async createRule(body: RuleInterface) {
    const schema = RuleValidator.createSchema(body);

    /*
     * Check is request body is valid
     */
    try {
      await schema.validate(body);
    } catch (err) {
      return {
        status: 400,
        body: {
          message: 'Validation fails',
          errors: err.errors
            ? err.errors.map((item: string) => {
                return { element: err.path, messages: item };
              })
            : err,
        },
      };
    }

    /*
     * Check if rule has more than 1 attribute (daily, weekdays, date) or none
     */
    if (RuleValidator.checkFieldsOnlyOne(body)) {
      return {
        status: 400,
        body: {
          message: 'Validation fails',
          errors: ['You need to pass only one of date, daily or weekdays'],
        },
      };
    }

    const contentRules = (await FileHelper.readFromFile(
      filejson,
    )) as RuleInterface[];

    /*
     * Check it has a rule with time conflict
     */
    const checkConflict = RuleRepository.checkConflict(body, contentRules);
    if (!checkConflict.success) {
      return {
        status: 400,
        body: { message: 'Validation fails', errors: checkConflict.errors },
      };
    }

    const id = ModelHelper.generateId();
    const { date = null, weekdays = null, daily = false, intervals } = body;

    (contentRules as RuleInterface[]).push({
      id,
      date,
      weekdays,
      daily,
      intervals,
    });

    await FileHelper.writeOnFile(filejson, contentRules);

    return { status: 200, body: { id, date, weekdays, daily, intervals } };
  }

  /**
   * Functions to delete a rule from json with a given id
   * @async
   * @param {number} id Identifier of the rule must be deleted
   * @returns {object} Object with status and body attributes, body can have a set of errors or the message to success
   * and status has http code to send in response
   * @memberof RuleService
   */
  async deleteRule(id: string) {
    const contentRules = (await FileHelper.readFromFile(
      filejson,
    )) as RuleInterface[];
    const ruleIndex = contentRules.findIndex((item: RuleInterface) => {
      if (item.id) return item.id.toString() === id;
      return false;
    });

    if (ruleIndex >= 0) {
      (contentRules as Array<RuleInterface>).splice(ruleIndex, 1);
      await FileHelper.writeOnFile(
        filejson,
        contentRules as Array<RuleInterface>,
      );
      return { status: 200, body: { message: 'Delete was successfull' } };
    }
    return { status: 404, body: { error: 'Rule not found' } };
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
    const schema = RuleValidator.listSchema();

    // Validate the body with given schema
    try {
      await schema.validate({ page, per_page });
    } catch (err) {
      return {
        status: 400,
        body: {
          message: 'Validation fails',
          errors: err.errors.map((item: string) => {
            return { element: err.path, messages: item };
          }),
        },
      };
    }

    const contentRules = await FileHelper.readFromFile(filejson);

    // Calculate the first and last index of set result
    const baseIndex = (Math.abs(page) - 1) * Math.abs(per_page);
    const lastIndex = Math.abs(page) * Math.abs(per_page);

    const result = (contentRules as Array<RuleInterface>).slice(
      baseIndex,
      lastIndex,
    );
    return { status: 200, body: result };
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
  async listSchedule(
    startday: string,
    endday: string,
    page = 1,
    per_page = 10,
  ) {
    const schema = RuleValidator.listScheduleSchema();

    // Validate the body with given schema
    try {
      await schema.validate({ page, per_page, startday, endday });
    } catch (err) {
      return {
        status: 400,
        body: {
          message: 'Validation fails',
          errors: err.errors.map((item: string) => {
            return { element: err.path, messages: item };
          }),
        },
      };
    }

    const contentRules = await FileHelper.readFromFile(filejson);
    const searchedRules = RuleRepository.searchByDates(
      contentRules as Array<RuleInterface>,
      startday,
      endday,
    );

    // Calculate the first and last index of set result
    const baseIndex = (Math.abs(page) - 1) * Math.abs(per_page);
    const lastIndex = Math.abs(page) * Math.abs(per_page);

    const result = searchedRules.slice(baseIndex, lastIndex);
    return { status: 200, body: result };
  }
}

export default new RuleService();
