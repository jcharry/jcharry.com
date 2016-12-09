var express = require('express');
var app = express();
var path = require('path');

// Heroku passes a port # as an environment var
const PORT = process.env.PORT || 8081;
// Heroku doesn't like __dirname, so we set the current
// working directory to an ENV variable to reference
// a static directory containing data files
process.env.PWD = process.cwd();
console.log(process.env.PWD);

app.use(express.static('dist'));
// app.use(express.static(process.env.PWD + '/static'));

app.get('*', function (request, response){
    console.log(request.url);
    let p = path.resolve(process.env.PWD, 'dist', 'index.html');
    console.log(p);
    response.sendFile(p);
});

app.listen(PORT, function() {
    console.log('listening on port ' + PORT);
});
