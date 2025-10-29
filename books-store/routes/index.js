const { Router } = require('express');
const authRouter = require('./auth.routes.js');
const adminRouter = require('./admin.routes.js');
const { authAdminMiddleware } = require('../middleware/auth.middleware.js');
const routes = Router();

routes.use('/auth', authRouter);
routes.use('/admin', authAdminMiddleware, adminRouter);

module.exports = routes;
