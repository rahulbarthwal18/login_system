const pool = require('../../dbconfig/dbconfig');

module.exports = {

    search : async(email) => {
       try{
            const sql = `select * from users where email = '${email}'`;
            let result = await pool.query(sql);
            return result;
       }catch(error){
         return error;
       }
    },
    signUp : async(data) => {
        try{
            const sql = `insert into users(first_name, last_name, email, password) values('${data.first_name}','${data.last_name}','${data.email}','${data.hashResult}') `;
            let result = await pool.query(sql, data);
            return result;
        }catch(error){
         return error;
        }
     },
     updateEmailStatus : async(email) => {
        try{
            const sql = `update users set is_email_verify = 1 where email = '${email}'`;
            let result = await pool.query(sql);
            return result;
        }catch(error){
         return error;
        }
     },
     updatePassword : async(data) => {
      try{
           const sql = `update users set password = '${data.password}' where email = '${data.email}' `;
           let result = await pool.query(sql);
           return result;
      }catch(error){
         return error;
      }
   },
   saveResetToken : async(data) => {
    try{
         const sql = `update users set reset_password_key = '${data.reset_password_key}', reset_password_key_expiry ='${data.reset_password_key_expiry}' where email = '${data.email}' `;
         let result = await pool.query(sql);
         return result;
    }catch(error){
      return error;
    }
 },
 searchResetToken : async(token) => {
    try{
         const sql = `select * from users where reset_password_key = '${token}' `;
         let result = await pool.query(sql);
         return result;
    }catch(error){
      return error;
    }
 },
 saveNewPassword : async(data) => {
    try{
         const sql = `update users set reset_password_key = NULL,reset_password_key_expiry =NULL, password = '${data.password}' where email ='${data.email}'`;
         let result = await pool.query(sql);
         return result;
    }catch(error){
      return error;
    }
 },
    
}    