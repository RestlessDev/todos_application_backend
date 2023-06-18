const express = require('express'); //import express

const router  = express.Router(); 

router.get('/list', function(req, res) {

}); 

router.get('/get', function(req, res) {

}); 

module.exports = (app) => {
    app.use('/todos', router);
};