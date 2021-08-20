require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'bethel.balistreri2@ethereal.email',
        pass: 'ekEj1NuV3ev5qhWuqt'
    }
});
module.exports = {
    transporter
}