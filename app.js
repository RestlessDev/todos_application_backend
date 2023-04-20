const express = require('express');
const ejs = require('ejs');
require('dotenv').config()

// local includes
const apiDescription = require('./config/description.json');

const app = express()
const port = process.env.PORT || 8030;

// set the view engine to ejs
app.set('view engine', 'ejs');
// static files
app.use(express.static('public'));

if(process.env.ENVIRONMENT != 'production') {
  app.get('/describe', (req, res) => {
    if(req.query.format && req.query.format == 'html') {
      var helpers = require('./views/partials/helpers.js');
      res.render('describe', {desc: apiDescription, helpers})
    } else {
      res.json(apiDescription);
    }
  })    
} 

app.get('/', (req, res) => {
  console.log("hit")
  res.json({success: true})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})