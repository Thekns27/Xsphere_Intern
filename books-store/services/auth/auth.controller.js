const database = require('../../database');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { tokenKey, expireIn, adminTokenKey } = require('../../utils');
const { lease } = require('../admin/admin.controller');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const registerUser = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({

               message: 'Validation error',
               errors: errors.array(),

          });
     }
     const client = await database.connectDatabase();
     try {
          const { name, email, password } = req.body;
          const users = await client.query('INSERT INTO users (name,email,password) VALUES ($1, $2,$3) RETURNING *', [name, email, password]);

          res.json(users.rows[0])
     } catch (err) {

          if (err.code === '23505') {
               res.status(400).json({
                    message: "email already exists!"
               })
          }
          else if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
     }
     finally {
          await database.disconnectDatabase();
     }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const loginUser = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({message: 'Validation error',errors: errors.array()});
     }
     const client = await database.connectDatabase();
     try {
          const { email, password } = req.body;
          const user = await client.query('SELECT * FROM users WHERE email=$1 AND password=$2;', [email, password]);

          if (user.rows.length === 0) {
               res.status(400).json({
                    message: "email or password is incorrect!"
               })
          }
          const accessToken = jwt.sign({
               userId: user.rows[0].id,
               email: user.rows[0].email,
          }, tokenKey, { expiresIn: expireIn });

          res.json({user: user.rows[0],accessToken})

     } catch (err) {
          console.log(err)
          if (err.code === '23505') {
               res.status(400).json({
                    message: "email already exists!"
               })
          }
          else if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
     }
     finally {
          await database.disconnectDatabase();
     }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const validateUser = async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const user = req.user;
          const exist = await client.query('SELECT * FROM users WHERE email=$1;', [user.email]);

          if (exist.rows.length === 0) {
               res.status(400).json({
                    message: "user not found!"
               })
          }
          res.json(exist.rows[0])

     } catch (err) {

          if (err.code === '23505') {
               res.status(400).json({
                    message: "email already exists!"
               })
          }
          else if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
     }
     finally {
          await database.disconnectDatabase();
     }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const adminRegister = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({message: 'Validation error', errors: errors.array()});
     }
     const client = await database.connectDatabase();
     try {
          const { name, email, password } = req.body;
          const admins = await client.query('INSERT INTO admins (name,email,password) VALUES ($1, $2,$3) RETURNING *', [name, email, password]);

          res.json(admins.rows[0])
     } catch (err) {

          if (err.code === '23505') {
               res.status(400).json({
                    message: "email already exists!"
               })
          }
          else if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
     }
     finally {
          await database.disconnectDatabase();
     }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const adminLogin = async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
          return res.status(400).json({message: 'Validation error',errors: errors.array()});
     }
     const client = await database.connectDatabase();
     try {
          const { email, password } = req.body;
          const admin = await client.query('SELECT * FROM admins WHERE email=$1 AND password=$2;', [email, password]);

          if (admin.rows.length === 0) {
               res.status(400).json({message: "email or password is incorrect!"
               })
          }
          const accessToken = jwt.sign({
               adminId: admin.rows[0].id,
               email: admin.rows[0].email,
          }, adminTokenKey, { expiresIn: expireIn });
               res.json({admin: admin.rows[0],accessToken})

     } catch (err) {
          console.log(err)
          if (err.code === '23505') {
               res.status(400).json({message: "email already exists!"})
          }
          else if (err.code === '23502') {
               res.status(400).json({message: `${err.column} is require!`})
          }
          else if (err.code === '23503') {
               res.status(400).json({message: "foreign key violation!"})
          }
          else if (err.code === '42P01') {
               res.status(400).json({message: "table does not exist!"})
          } else {
               res.status(500).json({message: "internal server error!"})
          }
     }
     finally {
          await database.disconnectDatabase();
     }
}
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const validateAdmin = async (req, res) => {

     const client = await database.connectDatabase();
     try {
          const admin = req.admin;
          const exist = await client.query('SELECT * FROM admins WHERE email=$1;', [admin.email]);

          if (exist.rows.length === 0) {
               res.status(400).json({ message: "user not found!"})
          }
          res.json(exist.rows[0])

     } catch (err) {

          if (err.code === '23505') {
               res.status(400).json({
                    message: "email already exists!"
               })
          }
          else if (err.code === '23502') {
               res.status(400).json({
                    message: `${err.column} is require!`
               })
          }
          else if (err.code === '23503') {
               res.status(400).json({
                    message: "foreign key violation!"
               })
          }
          else if (err.code === '42P01') {
               res.status(400).json({
                    message: "table does not exist!"
               })
          } else {

               res.status(500).json({
                    message: "internal server error!"
               })
          }
     }
     finally {
          await database.disconnectDatabase();
     }
}
module.exports = {
     registerUser,
     loginUser,
     validateUser,
     adminRegister,
     adminLogin,
     validateAdmin
}