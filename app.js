const express = require('express');
const glob = require('glob');

const cors = require('cors');
const bodyParser = require('body-parser');
const compress = require('compression');
const RestlessORM = require('restlesspgorm');
const {sessionCleanup, handleDescribe} = require("erstwhile-backend");

require('dotenv').config()

const orm = new RestlessORM({
  camelCaps: false,
  debug: false,
  softDeleteColumn: "active_flag"
})

// local includes
const apiDescription = require('./config/description.json');

const app = express()
const port = process.env.PORT || 8030;

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(compress());

app.use(sessionCleanup);

app.use(function(req, res, next) {
  req.orm = orm;
  next();
})

if(process.env.ENVIRONMENT != 'production') {
  app.get('/describe', handleDescribe)    
} 

var controllers = glob.sync('./controllers/*.js');
controllers.forEach((controller) => {
  require(`./${controller}`)(app);
});

app.get('/', (req, res) => {
  res.json({success: true})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})