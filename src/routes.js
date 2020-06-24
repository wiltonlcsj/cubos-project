import { Router } from 'express';
import FileHelper from './app/helpers/FileHelper';

import RuleController from './app/controllers/RuleController';

FileHelper.setFiles();

const routes = new Router();

routes.post('/rules', RuleController.create);
routes.delete('/rules/:id', RuleController.delete);
routes.get('/rules', RuleController.index);

routes.get('/search-schedule', RuleController.searchSchedule);

export default routes;