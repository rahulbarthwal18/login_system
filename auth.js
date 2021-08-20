const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = {
    verifyAccessToken : (req, res, next) => {
        try{
            let authHeader = req.headers["authorization"];
            let token = authHeader && authHeader.split(" ")[1];
            if(token == null) return res.status(401).json({error: "Token is null"});
            let decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.userId = decode.user_id;
            req.userEmail = decode.email;
            console.log(req.userId);
            console.log(req.userEmail);
            next();
        }catch(error){
            res.status(401).json({error: "Invalid Authorization"});
        }
    },
    // verifyRefreshToken : (req, rex, next) => {
    //     try{
    //         let authHeader = req.headers["authorization"];
    //         let token = authHeader && authHeader.split(" ")[1];
    //         if(token == null) return res.status(401).json({error: "Token is null"});
    //         let decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //         req.userId = decode.user_id;
    //         req.userEmail = decode.email;
    //         console.log(req.userId);
    //         console.log(req.userEmail);
    //         next();
    //     }catch(error){
    //         res.status(401).json({error: "Invalid Authorization"});
    //     }
    // }
}