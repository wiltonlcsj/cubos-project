import RuleService from '../services/RuleService';

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
  async create(req, res) {
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
  async delete(req, res) {
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
  async index(req, res) {
    const response = await RuleService.listRules(req.query.page, req.query.per_page);
    return res.status(response.status).json(response.body);
  }


  /**
   * Function to list all available schedule 
   * @async
   * @param {Request} req Object that specify HTTP request
   * @param {Response} res Object that specify HTTP response
   * @returns {Response} With status and content of response
   * @memberof RuleController
   */
  async searchSchedule(req, res) {
    const response = await RuleService.listSchedule(req.query.startday, req.query.endday, req.query.page, req.query.per_page,);
    return res.status(response.status).json(response.body);
  }
}

export default new RuleController();