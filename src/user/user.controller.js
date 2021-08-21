require('dotenv').config();
const services = require('./user.services');
const bycryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {transporter} = require('./user.mail');
const crypto = require('crypto');

module.exports = {
    signup: async(req, res, next) => {
        try{
            const {first_name, last_name, email, password} = req.body;

            let result = await services.search(email);
            if(result.affectedRows){
               return res.status(200).json({message: "User with this email already exists"});
            }
            else{
                let hashResult = await bycryptjs.hash(password, 10);
                if(hashResult){
                    const accountToken = jwt.sign({
                        first_name,last_name,
                        email,hashResult
                     }, process.env.USER_ACCOUNT_ACTIVATE, {expiresIn: '30min'});
                     
                    var mailOptions = {
                        from: '"Rahul Barthwal" <rahulbarthwal442@gmail.com>',
                        to: email,
                        subject: 'Account activation link',
                        html: `<h2>Please click on given link to activate your account</h2><br>
                        <a href="${process.env.CLIENT_URL}/user/auth/activate/${accountToken}">Click here</a> `,
                      };
                      
                     let response =await transporter.sendMail(mailOptions);
                      if(!response.messageId) {
                        return  res.status(400).json({error: "bad_request",error_description: 'Error on sending email'});
                      }else{
                        return res.status(200).json({message: "Email has been sent, kindly activate your account", token: accountToken});
                      }
                }else{
                    return  res.status(400).json({error: "bad_request",error_description: 'Hash Password not generated'});
                }
                
            }
            

        }catch(error){
            return  res.status(400).json({error: "bad_request",error_description: 'Something went wrong'});
        }
    },
    activateAccount: async(req, res, next) => {
        try{
            const {token} = req.body;
            if(token){
            jwt.verify(token, process.env.USER_ACCOUNT_ACTIVATE, async(err, decodedToken) => {
                if(err){
                    return res.status(400).json({error: "bad_request",error_description: 'Incorrect or expired link'});
                }else{
                    const {first_name, last_name, email, hashResult} = decodedToken;
                  let result = await services.search(email);
                  if(result.affectedRows){
                    return res.status(200).json({message: "User with this email already exists."});
                }else{
                    const {first_name, last_name, email, hashResult} = decodedToken;
                    let result = await services.signUp(decodedToken);
                    if (result.affectedRows) {
                        await services.updateEmailStatus(email);

                        var mailOptions = {
                            from: '"Rahul Barthwal" <rahulbarthwal442@gmail.com>',
                            to: email,
                            subject: 'Account Activation Confirmation',
                            html: `<h2>Your account has been successfully activated</h2>`,
                          };
                          
                         let response =await transporter.sendMail(mailOptions);
                          if(!response.messageId) {
                            return res.status(400).json({error: "bad_request",error_description: 'Error on sending email'});
                          }else{
                            return res.status(200).json({message: "Your account has been successfully activated"});
                          }
                    }
                
            } 
                }
            }); 

            }else{
                return res.status(400).json({error: "bad_request",error_description: 'Something went wrong'});
            }

        }catch(error){
            return res.status(400).json({error: "bad_request",error_description: 'Something went wrong'});
        }
    },
    login: async(req, res, next) => {
        try{
            const {email, password} = req.body;
            let result = await services.search(email);
            if(result){
                if(result.length<1){
                    return res.status(401).json({error: "unauthorized",error_description: 'Auth Failed'});

                }
                else{
    
                  let match =  await bycryptjs.compareSync(password, result[0].password);
                  if(match)
                  {
                      
                    let accessToken = jwt.sign({
                        user_id: result[0].id,
                        email: result[0].email,
                        
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: "1h"
                    });
                    // let refreshToken = jwt.sign({
                    //     email: result[0].email,
                    //     user_id: result[0].user_id
                    // }, process.env.REFRESH_TOKEN_SECRET);
                    
                    return res.status(200).json({accessToken});
                  }
                }
                
            }else{
                return res.status(400).json({error: "bad_request",error_description: 'Something went wrong'});
            }
        }catch(error){
            return res.status(400).json({error: "bad_request",error_description: 'Something went wrong'});
        }
    },
    resetPassword: async(req, res, next) => {
        try{
            let {email} = req.body;
         let token = await crypto.randomBytes(64).toString('hex');
         if(!token){
             return res.status(400).json({error: "bad_request",error_description: 'Token not generated'});
         }else{
            let findEmailResponse = await services.search(email);
            if(findEmailResponse){
                //1hr token
                let reset_token_expiry = Date.now() + 3600000; 
                let data = {email: req.body.email, reset_password_key: token, reset_password_key_expiry:reset_token_expiry};
                let savedTokenResponse = await services.saveResetToken(data);
                if(savedTokenResponse.affectedRows){
                    var mailOptions = {
                        from: '"Rahul Barthwal" <rahulbarthwal442@gmail.com>',
                        to: email,
                        subject: 'Reset Password link',
                        html: `<h2>Click on the link to reset passoword</h2><br>
                        <a href="${process.env.CLIENT_URL}/user/auth/reset/${token}">Click here</a> `,
                      };
                      
                     let response =await transporter.sendMail(mailOptions);
                      if(!response.messageId) {
                        return res.status(400).json({error: "bad_request",error_description: 'Error on sending email'});
                      }else{
                        return res.status(200).json({message: "Email has been sent please reset your password", token:token });
                      }
                }
            }else{
                return res.status(400).json({error: "bad_request",error_description: 'Email with this account is not registered'});
            }
         }
            
        }catch(error){
            return res.status(400).json({error: "bad_request",error_description: 'Something went wrong'});
        }
    },
    newPassword: async(req, res, next) => {
        try{
            const {token,password} = req.body;
            if(token){
                let tokenResultResponse = await services.searchResetToken(token);
                if(tokenResultResponse){
                    let email =  tokenResultResponse[0].email;
                    let reset_expiry = Date.now();
                    if(reset_expiry > tokenResultResponse[0].reset_password_key_expiry){
                        return res.status(400).json({error: "bad_request",error_description: 'Reset token is expired'});
                    }else{
                        const {token,password} = req.body;
                        let hashResult = await bycryptjs.hash(password, 10);
                        console.log(hashResult);
                        if(hashResult){  
                            let data ={email: email, password: hashResult};
                            console.log(data);
                            let saveNewPasswordResponse = await services.saveNewPassword(data);
                            console.log(saveNewPasswordResponse);
                            if(saveNewPasswordResponse){
                                var mailOptions = {
                                    from: '"Rahul Barthwal" <rahulbarthwal442@gmail.com>',
                                    to: email,
                                    subject: 'Password Reset',
                                    html: `<h2>Your password has been reset successfully</h2>`,
                                  };
                                  
                                 let response =await transporter.sendMail(mailOptions);
                                  if(!response.messageId) {
                                    return res.status(400).json({error: "bad_request",error_description: 'Error on sending email'});
                                  }else{
                                    return res.status(200).json({message: "Password reset sucessfully"});
                                  }
                                
                            }else{
                                return res.status(400).json({error: "bad_request",error_description: 'Password not reset'});
                            }
                        }else{
                            return res.status(400).json({error: "bad_request",error_description: 'Hash password not generated'});
                        }   
                    }
                }
            }
        }catch(error){
            return res.status(400).json({error: "bad_request",error_description: 'Hash password not generated'});
        }
    },
    
    updatePassword: async(req, res, next) => {
        try{
            let {old_password, new_password} =req.body;
            let result = await services.search(req.userEmail);
            if(result.length<1){
            return res.status(401).json({error: "unauthorized",error_description: 'Auth Failed'});
            }else{
                let match =  await bycryptjs.compareSync(old_password, result[0].password);
                if(match){
                    let hashResult = await bycryptjs.hash(new_password, 10);
                    if(hashResult){  
                        let data2 ={email: req.userEmail, password: hashResult};
                        let result = await services.updatePassword(data2);
                        if(result){
                            var mailOptions = {
                                from: '"Rahul Barthwal" <rahulbarthwal442@gmail.com>',
                                to: data2.email,
                                subject: 'Password Changed',
                                html: ` 
                                <h1 style='color:Green'>Your password has been changed successfully</h1>`,
                            };
                            let response =await transporter.sendMail(mailOptions);
                            if(!response.messageId) {
                               return res.status(200).json({error: "bad_request",error_description: 'Error on sending email'});
                            }
                            return  res.status(200).json({ message: "Password changed email sent" });
                        }else{
                           return res.status(400).json({error: "bad_request",error_description: 'password not updated'});
                        }
                    }else{
                        return res.status(400).json({error: "bad_request",error_description: 'Hash password not generated'});
                    }
                }else{
                    res.status(400).json({error: "bad_request",error_description: 'Password not matched'});
                }    
            }

        }catch(error){
           return res.status(400).json({error: "bad_request",error_description: 'Something went wrong'});
        }
    },

}


