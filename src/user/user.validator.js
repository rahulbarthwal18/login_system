const {body, validationResult} = require('express-validator');

const signupValidator = [
    body('first_name').trim().not().isEmpty().withMessage("First_name is required").escape(),
    body('last_name').trim().not().isEmpty().withMessage("Last name is required").escape(),
    body('email').trim().not().isEmpty().withMessage("Email Address is required")
    .isEmail().withMessage("Invalid Email address").escape(),
    body('password').trim().not().isEmpty().withMessage("Password is required")
    .isLength({ min:  8}).withMessage("The password must be of minimum of 8 characters long")
    .isStrongPassword().withMessage("Password is weak, require strong password"),
    body('confirm_password').trim().not().isEmpty().withMessage("Confirm password is required")
    .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
]

const loginValidator = [
    body('email').trim().not().isEmpty().withMessage("Email Address is required")
    .isEmail().withMessage("Invalid Email address").escape(),
    body('password').trim().not().isEmpty().withMessage("Password is required")
    .isLength({ min:  8}).withMessage("The password must be of minimum of 8 characters long")
    .isStrongPassword().withMessage("Password is weak, require strong password"),
]

const newPasswordValidator = [
    body('password').trim().not().isEmpty().withMessage(" Password is required")
    .isLength({ min:  8}).withMessage("The password must be of minimum of 8 characters long")
    .isStrongPassword().withMessage("Password is weak, require strong password"),
    body('confirm_password').trim().not().isEmpty().withMessage("Confirm password is required")
    .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
]

const resetPasswordValidator = [
    body('email').trim().not().isEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address").escape(),
]

const result = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
     res.status(400).json({errors: errors.array()[0].msg});
    }
    next();
}

module.exports = {
    signupValidator,
    newPasswordValidator,
    resetPasswordValidator,
    loginValidator,
    result
}