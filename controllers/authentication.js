const express = require('express'); //import express
const { validateRequest, sessionMiddleware } = require("../lib/erstwhile");

const router  = express.Router(); 

router.post('/login', sessionMiddleware, function(req, res) {

}); 

router.post('/signup', sessionMiddleware, function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success) {
    res.json({success: true})
  } else {
    res.json(validRequest);
  }
}); 

router.post('/forgotPassword', sessionMiddleware, function(req, res) {

}); 

router.get('/currentUser', sessionMiddleware, function(req, res) {

}); 

module.exports = (app) => {
  app.use('/authentication', router);
};