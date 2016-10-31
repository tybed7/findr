var express = require('express'),
    _       = require('lodash'),
    config  = require('./config'),
    jwt     = require('jsonwebtoken'),
    request = require('request');

var app = module.exports = express.Router();
var pg = require('pg');

pg.defaults.ssl = true;
var connection = pg.connect(process.env.DATABASE_URL, function(err, client){
  if(err) console.log("Error: "+err);
  else
  console.log("Connected to postgres");
});
/*var connection = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    port: process.env.RDS_PORT
});*/

function getUsers(){
    connection.query('SELECT * FROM  `Users`', function(error,results){
    if(error)
    console.log("its an error: " + error);
    else(results)
    console.log("it worked: "+ results);
    });
}

function createToken(user) {
  return jwt.sign(_.omit(user, 'lname'), config.secret, { expiresIn: 60*60*5 });
}

function getUserScheme(req) {
  
  var username;
  var type;
  var jwtToken;
  var userSearch = {};

  // The POST contains a username and not an email
  if(req.body.username) {
    username = req.body.username;
    type = 'username';
    userSearch = { username: username };
  }
  // The POST contains an email and not an username
  else if(req.body.email) {
    username = req.body.email;
    type = 'email';
    userSearch = { email: username };
  }

  return {
    username: username,
    type: type,
    userSearch: userSearch
  }
}


app.get('/users', function(req, res) {
 res.status(200);
 res.send("did it");
});

app.post('/users', function(req, res) {
  
  console.log("Here is the request: " + req.body.authToken);
  if (!req.body.fname || !req.body.lname) {
    return res.status(400).send("You must send the first name and the last name");
  }
console.log("got here");

  console.log(req.body);
  var profile = _.pick(req.body, ['fname','lname']);
    console.log(profile);
    jwtToken = createToken(profile);
    console.log(jwtToken);
    
    var options = {
      url: "https://nodefindr.herokuapp.com/api/protected/users",
      method: "POST",
      form:{fname: req.body.fname, lname: req.body.lname, authToken: req.body.authToken, refreshToken: req.body.refreshToken, id: req.body.id},
      headers:{
        'Authorization': 'Bearer '+jwtToken
      }

    }

    
    request(options,callback);
    function callback(error, response, body) {
  console.log("hit user callback");
  console.log(body);
  var res = Object;
  
  if (!error && response.statusCode == 200) {
    console.log("no error");
    res.status = 200;
    return sendBack(res);
  }
  body = JSON.parse(body);
  console.log(body);
  console.log(body.code);
  if(body.code == "23505"){
    console.log("Looks like that account is being used");
    res.status = 400;
    res.message = "Looks like that account is being used";
    return sendBack(res);
    
  }
  
  
};

  function sendBack(data){
    console.log("hit user sendBack");
    console.log(data);
    var info = new Object;
    
    info.message = data.message;
    console.log(info);
    if(!data.status == 200){
      return res.status(data.status).send(info);
    }
    else{
      info.jwt = jwtToken;
      return res.status(data.status).send(info);

    }
    
    
  }
    
    
});



app.post('/sessions/create', function(req, res) {

  var userScheme = getUserScheme(req);

  if (!userScheme.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }

  var user = _.find(users, userScheme.userSearch);
  
  if (!user) {
    return res.status(401).send("The username or password don't match");
  }

  if (user.password !== req.body.password) {
    return res.status(401).send("The username or password don't match");
  }

  res.status(201).send({
    id_token: createToken(user)
  });
});
