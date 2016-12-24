var express = require('express');
var app = express();
var path = require('path');
let nodemailer = require('nodemailer');
let creds = require('./creds/email.json');

// Heroku passes a port # as an environment var
const PORT = process.env.PORT || 8081;
// Heroku doesn't like __dirname, so we set the current
// working directory to an ENV variable to reference
// a static directory containing data files
process.env.PWD = process.cwd();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(express.static('dist'));

app.get('*', function (request, response){
    console.log(request.url);
    let p = path.resolve(process.env.PWD, 'dist', 'index.html');
    console.log(p);
    response.sendFile(p);
});

app.post('/email', jsonParser, function(req, res) {
    let body = req.body;
    console.log(body);
    if (body.url !== '') {
        res.end('too bad');
    }

    // Email!
    var smtpConfig = {
        service: 'gmail',
        auth: {
            user: creds.user,
            pass: creds.password
        }
    };

    let transporter = nodemailer.createTransport(smtpConfig);
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: `<${body.sender}>`, // sender address
        to: 'jamie.charry@gmail.com', // list of receivers
        subject: `New mail from jcharry.com - sender ${body.sender}`, // Subject line
        text: `Message from: ${body.sender}\n\n${body.message}`, // plaintext body
    };
    transporter.verify((error, success) => {
        if (error) {
            console.log(error);
            res.end(error);
        } else {
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    res.end(error);
                } else {
                    console.log(info);
                    res.send('success');
                }
            });
        }
    });

    console.log('hit email route');
});

app.listen(PORT, function() {
    console.log('listening on port ' + PORT);
});
