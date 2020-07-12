import RuleService from '@services/RuleService';
import { Request, Response } from 'express';

/**
 * Class that controller actions from model Rule
 * @class RuleController
 */
class RuleController {
  /**
   * Function to call a create from Rule
   * @async
   * @param {Request} req Object that specify HTTP request
   * @param {Response} res Object that specify HTTP response
   * @returns {Response} With status and content of response
   * @memberof RuleController
   */
  async create(req: Request, res: Response) {
    const response = await RuleService.createRule(req.body);
    return res.status(response.status).json(response.body);
  }

  /**
   * Function to delete from Rule from a given id
   * @async
   * @param {Request} req Object that specify HTTP request
   * @param {Response} res Object that specify HTTP response
   * @returns {Response} With status and content of response
   * @memberof RuleController
   */
  async delete(req: Request, res: Response) {
    const response = await RuleService.deleteRule(req.params.id);
    return res.status(response.status).json(response.body);
  }

  /**
   * Function to list all rules stored
   * @async
   * @param {Request} req Object that specify HTTP request
   * @param {Response} res Object that specify HTTP response
   * @returns {Response} With status and content of response
   * @memberof RuleController
   */
  async index(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const response = await RuleService.listRules(
        Number(page),
        Number(perPage),
      );
      return res.status(response.status).json(response.body);
    }

    return res
      .status(500)
      .json('Something happened, please repeat the request');
  }

  /**
   * Function to list all available schedule
   * @async
   * @param {Request} req Object that specify HTTP request
   * @param {Response} res Object that specify HTTP response
   * @returns {Response} With status and content of response
   * @memberof RuleController
   */
  async searchSchedule(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const response = await RuleService.listSchedule(
        req.query.startday as string,
        req.query.endday as string,
        Number(page),
        Number(perPage),
      );
      return res.status(response.status).json(response.body);
    }

    return res
      .status(500)
      .json('Something happened, please repeat the request');
  }
}

export default new RuleController();
