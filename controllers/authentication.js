const express = require('express'); //import express
const { validateRequest } = require("../lib/erstwhile");

const router  = express.Router(); 

router.post('/login', function(req, res) {

}); 

router.post('/signup', function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success) {

  } else {
    res.json(validRequest);
  }
}); 

router.post('/forgotPassword', function(req, res) {

}); 

router.get('/currentUser', function(req, res) {

}); 


module.exports = router;