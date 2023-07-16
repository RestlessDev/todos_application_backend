const express = require('express'); //import express
const { validateRequest, sessionMiddleware } = require("../lib/erstwhile");

const router  = express.Router(); 

router.get('/list', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
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
      SELECT t.id, t.title, t.color, t.date, t.description, t.done_flag, t.create_date, t.mod_date,
          count(t.*) OVER() AS total_count
      FROM todos t
      WHERE t.active_flag = true AND t.user_id = $1 ${(!showCompleted ? `AND done_flag = false` : '')}
      ORDER BY ${sort} ${sortOrder} OFFSET ${((page - 1) * (numPerPage || 10))} LIMIT ${(numPerPage || 10)}
      `, [req.session.user_id])
    if(todos.length > 0) {
      let totalCount = todos[0].total_count;
      for(let i = 0; i < todos.length; i++) {
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

router.get('/:id', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success && validRequest.authenticated) {
    if(req.params.id) {
      let todo = await req.orm.rawSQL(`
        SELECT t.id, t.title, t.color, t.date, t.description, t.done_flag, t.create_date, t.mod_date
          FROM todos t
          WHERE t.id = $1 AND t.user_id = $2 AND t.active_flag = true
      `, [req.params.id, req.session.user_id]);
      if(todo.length > 0) {
        res.send(todo[0]); 
      } else {
        res.send({
          success:false, 
          authenticated: validRequest.authenticated,
          errors: [
            "The ID is invalid, or does not belong to this user."
          ]
        })  
      }
    } else {
      res.send({
        success:false, 
        authenticated: validRequest.authenticated,
        errors: [
          "No ID specified."
        ]
      })
    }
  } else {
    res.send(validRequest)
  }
}); 

router.post('/create', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success && validRequest.authenticated) {
    let newTodo = { done_flag: false, user_id: req.session.user_id };
    for(let key in req.body) {
      if(req.body[key].trim() != '') {
        switch(key) {
          case "description":
          case "title":
          case "color":
          case "done_flag":
          case "completion_notes":
            newTodo[key] = req.body[key];
            break;
          case "date": 
            newTodo[key] = new Date(req.body.date);
            break;
        }
      }
    }
    let todoID = await req.orm.insert("todos", {
      data: newTodo
    })
    let todo = await req.orm.findUnique("todos", {where: {id: todoID}});
    delete todo.user_id;
    delete todo.active_flag;
    res.send(todo)
  } else {
    res.send(validRequest)
  }
})

router.post('/:id/update', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success && validRequest.authenticated) {
    if(req.params.id)  {
      let todos = await req.orm.rawSQL(`
        SELECT * FROM todos WHERE id = $1 AND user_id = $2 AND active_flag = true
      `, [req.params.id, req.session.user_id])

      if(todos.length > 0) {
        let newTodo = { mod_date: new Date() };
        for(let key in req.body) {
          switch(key) {
            case "description":
            case "title":
            case "color":
            case "done_flag":
            case "completion_notes":
              newTodo[key] = req.body[key];
              break;
            case "date": 
              newTodo[key] = new Date(req.body.date);
              break;
          }
        }
        let todoID = await req.orm.update("todos", {
          where: {
            id: req.params.id
          },
          data: newTodo
        })
        let todo = {...todos[0], ...newTodo}
        delete todo.user_id;
        delete todo.active_flag;
        res.send(todo)
      } else {
        res.send({
          success:false, 
          authenticated: validRequest.authenticated,
          errors: [
            "The ID is invalid, or does not belong to this user."
          ]
        })
      }
    } else {
      res.send({
        success:false, 
        authenticated: validRequest.authenticated,
        errors: [
          "No ID specified."
        ]
      })
    }
  } else {
    res.send(validRequest)
  }
})

router.post('/:id/delete', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success && validRequest.authenticated) {
    if(req.params.id)  {
      let todos = await req.orm.rawSQL(`
        SELECT * FROM todos WHERE id = $1 AND user_id = $2 AND active_flag = true
      `, [req.params.id, req.session.user_id])

      if(todos.length > 0) {
        let todoID = await req.orm.delete("todos", {
          where: {
            id: req.params.id
          }
        })
        res.send({
          success:true, 
          authenticated: validRequest.authenticated,  
        })
      } else {
        res.send({
          success:false, 
          authenticated: validRequest.authenticated,
          errors: [
            "The ID is invalid, or does not belong to this user."
          ]
        })
      }
    } else {
      res.send({
        success:false, 
        authenticated: validRequest.authenticated,
        errors: [
          "No ID specified."
        ]
      })
    }
  } else {
    res.send(validRequest)
  }
})

module.exports = (app) => {
    app.use('/todo', router);
};