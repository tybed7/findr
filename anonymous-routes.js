var express = require('express'),
    quoter  = require('./quoter'),
    dotenv  = require('dotenv'),
    http = require('http'),
    request = require('request');
var app = module.exports = express.Router();
var authData = {
authToken : null,
refreshToken : null,
google : null,
fname : null,
lname : null
}
var holdData = {
  refreshToken : null,
  id_token : null
}
app.get('/api/random-quote', function(req, res) {
  res.status(200).send(quoter.getRandomOne());
});

app.post('/api/secret', function(req, res) {
  
  authData.fname = req.body.firstname;
  authData.lname = req.body.lastname;
  console.log(authData.lname);
  res.status(200)
  res.send(getGoogleUrl());
});





app.get('/api/callback/', function(req,res){
  console.log("hit the get callback");
  console.log("this is the request to server: "+req);
  console.log("1: "+ req.body);
  console.log("2: "+req.data);
  

  

  var requestToken = (req.url).split(/=|&/)[1];
  console.log("request token: "+requestToken);
    
  request.post({url:'https://accounts.google.com/o/oauth2/token', form: {code:requestToken, client_id:process.env.clientId, client_secret: process.env.clientSecret, redirect_uri: "https://nodefindr.herokuapp.com/api/callback", grant_type: "authorization_code"}}, function(error,res, body){
    if(error){
      console.log('upload failed:'+ error);
    }
    var obj = JSON.parse(body);
    console.log('Server response:'+obj);
    authData.authToken = obj.access_token;
    console.log("body auth: "+obj.access_token);
    console.log("data auth: "+authData.authToken);
    authData.refreshToken = obj.refresh_token;
    request.post('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='+obj.id_token, function(err,res,body){
      var obj2 = JSON.parse(body);
      console.log("hit post");
      console.log(obj2.aud);
      console.log(process.env.clientId);
      if(obj2.aud === process.env.clientId){
        console.log("iiiiiif");
        authData.google = obj2.sub;
        console.log(authData.google);
        console.log(authData.fname);
        console.log(authData.lname);
        console.log(authData.authToken);
        console.log(authData.refreshToken);
        request.post({url:'https://nodefindr.herokuapp.com/users', form: {fname: authData.fname, lname: authData.lname, authToken: authData.authToken, refreshToken: authData.refreshToken, id: authData.google}}, function(error, res, body){
        console.log("got back to anon");
        
        console.log((!res.statusCode == 200));
        console.log((res.statusCode == 200));
        console.log((!res.statusCode === 200));
        console.log((res.statusCode === 200));
        if(!res.statusCode == 200){
          console.log('failed: '+error);
          var data = body;
          return sendBack(res.statusCode, data)
        }
          console.log('Worked: ' + body);
          var data = body
          return sendBack(res.statusCode, data);
        });
        
      }
    })

    function sendBack(status,data){
      console.log("hit sendback");
      console.log(status);
      var obj = JSON.parse(data);
      console.log(obj.message);
      console.log((status === 200));
      console.log((!status === 200));
      console.log((!status == 200));
      console.log((status==200));
      if(status === 200){
        console.log("enter if");
        return sendInfo(status,obj.message,obj.jwt);
      }else return sendInfo(status,obj.message, null);
      
    }
    
  });
  function sendInfo(status, data, jwt){
    console.log("hit sendInfo");
    console.log(status);
    console.log(data);
    if(status === 200){
      console.log("status is 200");
      var obj = new Object;
      obj.refreshToken = authData.refreshToken;
      obj.id_token = jwt;
      console.log(obj);
      holdData = obj;
      return res.status(status).send("<script>window.close()</script>");
    }else{
      console.log("status is not 200");
      return res.status(status).send(data);
      
    }
  }
 




})

app.post('/api/authToken',function(req,res){
  request.post({url:'https://nodefindr.herokuapp.com/users', form: {fname: authData.fname}})
  res.status(200);
  res.send("Auth token: "+ authData.authToken+ "refresh token: "+authData.refreshToken+ "id: "+authData.google+"firstname: "+authData.fname+"lastname: "+authData.lname);
})

app.get('/api/authToken',function(req,res){
  console.log(holdData.id_token);
  console.log(holdData.refreshToken);
  res.status(200);
  res.send("JWT: "+ holdData.id_token+ "Refresh Token: "+holdData.refreshToken);
})

function getGoogleUrl(){
  var secret = new Object;
  secret.url = "https://accounts.google.com/o/oauth2/auth?client_id="+process.env.clientId+"&redirect_uri=https://nodefindr.herokuapp.com/api/callback&scope=https://www.googleapis.com/auth/plus.login+profile&approval_prompt=force&response_type=code&access_type=offline";
  JSON.stringify(secret);
  return secret;
}
