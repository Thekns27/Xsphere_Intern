const jwt = require('jsonwebtoken');
const { tokenKey, adminTokenKey } = require('../utils');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authMiddleware(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1]

     if (!token) {
          return res.status(401).send('unauthorize')
     }
     try {
          const verify = jwt.verify(token, tokenKey)
          if (verify) {
               req.user = {
                    userId: verify.userId,
                    email: verify.email
               }
               next()
          } else {
               return res.status(401).send('unauthorize')
          }
     } catch (error) {
          return res.status(401).send('unauthorize')
     }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authAdminMiddleware(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1]

     if (!token) {
          return res.status(401).send('unauthorize')
     }
     try {
          const verify = jwt.verify(token, adminTokenKey)
          if (verify) {
               req.admin = {
                    adminId: verify.adminId,
                    email: verify.email
               }
               next()
          } else {
               return res.status(401).send('unauthorize')
          }
     } catch (error) {
          return res.status(401).send('unauthorize')
     }
}
module.exports = { authMiddleware, authAdminMiddleware }