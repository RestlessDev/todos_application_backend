const express = require('express');
const glob = require('glob');

const ejs = require('ejs');
const cors = require('cors');
const bodyParser = require('body-parser');
const compress = require('compression');
const RestlessORM = require('restlesspgorm');
const {sessionCleanup} = require("./lib/erstwhile")

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

// set the view engine to ejs
app.set('view engine', 'ejs');
// static files
app.use(express.static('public'));

app.use(function(req, res, next) {
  req.orm = orm;
  next();
})

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