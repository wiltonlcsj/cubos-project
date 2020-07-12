import { Router } from 'express';

import RuleController from './app/controllers/RuleController';

const routes = Router();

routes.post('/rules', RuleController.create);
routes.delete('/rules/:id', RuleController.delete);
routes.get('/rules', RuleController.index);

routes.get('/search-schedule', RuleController.searchSchedule);

export default routes;
