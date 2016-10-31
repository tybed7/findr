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

var config = {
  user: process.env.RDS_USERNAME, //env var: PGUSER
  database: process.env.RDS_DB_NAME, //env var: PGDATABASE
  password: process.env.RDS_PASSWORD, //env var: PGPASSWORD
  host: process.env.RDS_HOSTNAME, // Server hosting the postgres database
  port: process.env.RDS_PORT, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

//yee yee scripts
/*var connection = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    port: process.env.RDS_PORT
});*/
/*connection.connect(function(err){
    if(err){
        console.error('error connecting: ' + err.stack);
        console.log(process.env.RDS_HOSTNAME);
    return;
    }
    console.log('connected as id ' + connection.threadId);
    console.log(process.env.RDS_HOSTNAME);
});*/

app.use('/api/protected', jwtCheck);

app.get('/api/protected/random-quote', function(req, res) {
  res.status(200).send(quoter.getRandomOne());
});

app.get('/api/protected/secret', function(req, res) {
  res.status(200).send(getId());
});

app.post("/api/protected/users",function(req,res){

    console.log("User ID:"+req.body.id);
        console.log(req.body.fname);
        console.log(req.body.lname);
        console.log("User Token:"+req.body.authToken);
        console.log(req.body.refreshToken);
        console.log(config);
        
    pool.connect(function(err, client, done) {
      
        
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');
  console.log("INSERT INTO google (id, authtoken) VALUES ('"+req.body.id+"','"+req.body.authToken+"');")
 client.query("INSERT INTO google (id, authtoken) VALUES ($1,$2);", [req.body.id,req.body.authToken], function(error, results){
        if(error)
    {

    console.log("its an error1: " + error);
    return res.status(400).send(callback(error,error));
    }
    else if(results){
    console.log("it worked1: "+ results.rows[0].id + " " + results.rows[0].authToken);
    setUser(req);
    }
    });

  });    
    /*connection.query('INSERT INTO google (id, authtoken) VALUES ("'+req.body.id+'","'+req.body.authToken+'")', function(error,results){
    if(error)
    {
    console.log("its an error1: " + error);
    return res.status(400).send(callback(error,error));
    }
    else if(results){
    console.log("it worked1: "+ results);
    setUser(req);
    }
    */
    
    

function setUser(req){
  pool.connect(function(err, client, done) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

 client.query("INSERT INTO Users (firstname, lastname, google) VALUES ($1,$2,$3)",[req.body.fname,req.body.lname,req.body.id], function(error, results){
        if(error){
      
    return res.status(400).send(callback(error,error));
    }
    else if(results){
    console.log("it worked2: "+ results);
    return res.status(200).send(getUsers(results));
    }
    });
  
})};
pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})
});

app.get("/api/protected/users",function(req,res){
  pool.connect(function(err, client, done) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

 client.query('SELECT * FROM  `Users`', function(error, results){
        if(error)
    console.log("its an error: " + error);
    else(results)
    console.log("it worked: "+ results);
    res.status(200).send(getUsers(results));
  
});
pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})
    
});
})

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

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})

