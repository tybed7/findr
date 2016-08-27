var express = require('express'),
    jwt     = require('express-jwt'),
    config  = require('./config'),
    quoter  = require('./quoter');
    

var app = module.exports = express.Router();

var jwtCheck = jwt({
  secret: config.secret
});
var pg = require('pg');

pg.defaults.ssl = true;
var connection = pg.connect(process.env.DATABASE_URL, function(err, client){
  if(err) console.log("Error: "+err);
  console.log("Connected to postgres");
});
//yee yee
/*var connection = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    port: process.env.RDS_PORT
});*/
connection.connect(function(err){
    if(err){
        console.error('error connecting: ' + err.stack);
        console.log(process.env.RDS_HOSTNAME);
    return;
    }
    console.log('connected as id ' + connection.threadId);
    console.log(process.env.RDS_HOSTNAME);
});

app.use('/api/protected', jwtCheck);

app.get('/api/protected/random-quote', function(req, res) {
  res.status(200).send(quoter.getRandomOne());
});

app.get('/api/protected/secret', function(req, res) {
  res.status(200).send(getId());
});

app.post("/api/protected/users",function(req,res){

    console.log(req.body.id);
        console.log(req.body.fname);
        console.log(req.body.lname);
        console.log(req.body.authToken);
        console.log(req.body.refreshToken);
    connection.query('INSERT INTO google (id, authtoken) VALUES ("'+req.body.id+'","'+req.body.authToken+'")', function(error,results){
    if(error)
    {
    console.log("its an error1: " + error);
    return res.status(400).send(callback(error,error));
    }
    else if(results){
    console.log("it worked1: "+ results);
    setUser(req);
    }
    
    
    });

function setUser(req){
  connection.query('INSERT INTO Users (firstname, lastname, google) VALUES ("'+req.body.fname+'","'+req.body.lname+'","'+req.body.id+'")', function(error,results){
    if(error){
    return res.status(400).send(callback(error,error));
    }
    else if(results){
    console.log("it worked2: "+ results);
    return res.status(200).send(getUsers(results));
    }
})};

});

app.get("/api/protected/users",function(req,res){

    connection.query('SELECT * FROM  `Users`', function(error,results){
    if(error)
    console.log("its an error: " + error);
    else(results)
    console.log("it worked: "+ results);
    res.status(200).send(getUsers(results));
    
});
});


//

function callback(err, data) {
  if(err) {
    console.log("error");
    console.log(err);
    return err;
  }
  console.log("data");
  console.log(data);
}

function getUsers(results){
  console.log("got here");
  var myArray = new Array;
  for(i = 0; i < results.length; i++){
    var myObject = new Object;
    myObject.id = results[i].id;
    myObject.firstname = results[i].firstname;
    myObject.lastname = results[i].lastname;
    myObject.facebook = results[i].facebook;
    myObject.google = results[i].google;
    myObject.twitter = results[i].twitter;
    myObject.instagram = results[i].instagram;
    myObject.snapchat = results[i].snapchat;
    console.log(myObject);
    myArray.push(myObject);
  }
  var jsonArray = JSON.parse(JSON.stringify(myArray));
  console.log(jsonArray);
  return jsonArray;
}

function getId(){
  return secret = [process.env.clientId,process.env.clientSecret];
}
