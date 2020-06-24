import RuleService from '../services/RuleService';

class RuleController {
  async create(req, res) {
    const response = await RuleService.createRule(req.body);
    return res.status(response.status).json(response.body);
  }

  async delete(req, res) {
    const response = await RuleService.deleteRule(req.params.id);
    return res.status(response.status).json(response.body);
  }

  async index(req, res) {
    const response = await RuleService.listRules(req.query.page, req.query.per_page);
    return res.status(response.status).json(response.body);
  }

  async searchSchedule(req, res) {
    const response = await RuleService.listSchedule(req.query.startday, req.query.endday, req.query.page, req.query.per_page,);
    return res.status(response.status).json(response.body);
  }
}

export default new RuleController();