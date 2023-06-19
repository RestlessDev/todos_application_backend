const express = require('express'); //import express
const { validateRequest, sessionMiddleware } = require("../lib/erstwhile");

const router  = express.Router(); 

router.get('/list', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
  console.log(validRequest)
  if(validRequest.success && validRequest.authenticated) {
    let page = req.query.page || 1;
    page = parseInt(page);

    let numPerPage = req.query.num_per_page || 10;
    numPerPage = parseInt(numPerPage);

    let sortOptions = ['date', 'title', 'color'];
    let sort = req.query.sort ? (sortOptions.indexOf(req.query.sort) >= 0 ? req.query.sort : 'date') : 'date';

    let sortOrders = ['asc', 'desc'];
    let sortOrder = req.query.sort_order ? (sortOrders.indexOf(req.query.sort_order) >= 0 ? req.query.sort_order : 'asc') : 'asc';

    let showCompleted = req.query.show_completed ? req.query.show_completed == 'true' : false;

    let todos = await req.orm.rawSQL(`
      SELECT t.id, t.title, t.color, t.date, t.description,
          count(t.*) OVER() AS total_count
      FROM todos t
      WHERE t.active_flag = true AND t.user_id = $1 ${(!showCompleted ? `AND done_flag = false` : '')}
      ORDER BY ${sort} ${sortOrder} OFFSET ${((page - 1) * (numPerPage || 10))} LIMIT ${(numPerPage || 10)}
      `, [req.session.user_id])
    if(todos.length > 0) {
      let totalCount = todos[0].total_count;
      for(let i = 0; i < todos.length; todos++) {
        delete todos[i].total_count;
      }
      res.json({
        data: todos,
        page: page,
        total: Math.ceil(totalCount / numPerPage)
      })
    } else {
      res.json({
        data: [],
        page: 0,
        total: 0
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

router.get('/get', sessionMiddleware, async function(req, res) {

}); 

module.exports = (app) => {
    app.use('/todo', router);
};