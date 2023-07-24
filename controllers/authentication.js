const express = require('express'); //import express
const { validateRequest, sessionMiddleware } = require("erstwhile-backend");
const bcrypt = require("bcrypt")
const saltRounds = 10

const router  = express.Router(); 

router.post('/login', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success) {
    // search for the email
    let userResult = await req.orm.rawSQL(`
      SELECT id, first_name, last_name, hashed_password, email
        FROM users u
        WHERE u.username = $1 OR u.email = $2
    `, [req.body.username, req.body.username]);
    if(userResult.length > 0) {
      // hash the password
      bcrypt.compare(req.body.password, userResult[0].hashed_password, async function(err, match) {
        if(match == true) {
          let sessionKey = await req.orm.insert("erstwhile_sessions", { data: {
            user_id: userResult[0].id,
            expires: new Date(new Date().getTime() + ((process.env.ERSTWHILE_SESSION_TIMEOUT || 60)*60000)),
            session_data: {}
          }})
          delete userResult[0].hashed_password;
          res.send({
            success:true, 
            authenticated: true,
            sessionKey: sessionKey,
            user: userResult[0]
          })
        } else {
          res.send({
            success:false, 
            authenticated: false,
            errors: [
              "Invalid username/password combination."
            ]
          })  
        }
      })
    } else {
      res.send({
        success:false, 
        authenticated: false,
        errors: [
          "This email address and/or username is not found."
        ]
      })
    }
  } else {
    res.json(validRequest);
  }
}); 

router.post('/signup', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success) {
    // search for the email
    let userResult = await req.orm.rawSQL(`
      SELECT count(u.*) as user_count
        FROM users u
        WHERE u.username = $1 OR u.email = $2
    `, [req.body.username, req.body.email]);
    if(userResult[0].user_count == 0) {
      // hash the password
      bcrypt
        .hash(req.body.password, saltRounds)
        .then(async hash => {
          let user = await req.orm.insert("users", { data: {
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            hashed_password: hash
          }})
          res.send({
            success:true, 
            authenticated: false
          })
        })
        .catch(err => {
          console.error(err.message)
          res.send({
            success:false, 
            authenticated: false,
            errors: [
              "Error while hashing password."
            ]
          })
        })
    } else {
      res.send({
        success:false, 
        authenticated: false,
        errors: [
          "This email address and/or username is already in use."
        ]
      })
    }
  } else {
    res.json(validRequest);
  }
}); 

router.post('/forgotPassword', sessionMiddleware, function(req, res) {

}); 

router.get('/currentUser', sessionMiddleware, async function(req, res) {
  if(req.session?.user_id) {
    let userResult = await req.orm.rawSQL(`
    SELECT id, first_name, last_name, email
      FROM users u
      WHERE u.id = $1
    `, [req.session.user_id]);
    if(userResult.length > 0) {
      res.send(userResult[0]);
    } else {
      res.send({
        success:false, 
        authenticated: false,
        errors: [
          "User not logged in."
        ]
      })
    }
  } else {
    res.send({
      success:false, 
      authenticated: false,
      errors: [
        "User not logged in."
      ]
    })
  } 
}); 

router.get('/logout', sessionMiddleware, async function(req, res) {
  if(req.session?.user_id) {
    await req.orm.delete("erstwhile_sessions", {where: {id: req.get("Erstwhile-Session")}});
    req['session'] = {};
  } 
  res.send({
    success: true, 
    authenticated: false
  })
}); 

module.exports = (app) => {
  app.use('/authentication', router);
};