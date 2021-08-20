const dotenv = require('dotenv');
dotenv.config({path: '/.env'});
const express = require('express');
const app = express();

const path = require('path');
const port = process.env.PORT || 3000;
const con = require('./dbconfig/dbconfig.js');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Routes
const forgetRoutes = require('./src/user/user.route');


//forget password
app.use('/api/', forgetRoutes);

//Not found page
app.use('*',(req,res) => {
    res.status(404).send("Page not found");
});


app.listen(port, () => {
    console.log(`Port no. ${port} is running`);
});