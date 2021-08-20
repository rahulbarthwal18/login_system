require('dotenv').config();
const express = require('express');
const app = express();
const router = express.Router();
const controller = require('./user.controller');
const {verifyAccessToken} = require('../../auth');
const {signupValidator,newPasswordValidator,resetPasswordValidator, loginValidator,result} = require('./user.validator');

router.post('/signup',signupValidator, result, controller.signup);

router.post('/email_activate', controller.activateAccount);
//login
router.post('/login', loginValidator, result, controller.login);
//reset password
router.patch('/reset_password',resetPasswordValidator,result,controller.resetPassword);
//new password 
router.post('/new_password',newPasswordValidator,result, controller.newPassword);

  
module.exports = router;

