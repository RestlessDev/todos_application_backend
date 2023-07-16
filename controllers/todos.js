const express = require('express'); //import express
const { validateRequest, sessionMiddleware } = require("../lib/erstwhile");

const router  = express.Router(); 

router.get('/list', sessionMiddleware, async function(req, res) {
  let validRequest = validateRequest(req);
  if(validRequest.success && validRequest.authenticated) {
    // console.log(req.query)
    let start = req.query.start || 0;
    start = parseInt(start);

    let numPerPage = req.query.length || 10;
    numPerPage = parseInt(numPerPage);

    let showCompleted = '';
    switch(req.query.status) {
      case "not-complete":
        showCompleted = `AND done_flag = false `;
        break;
      case "complete":
        showCompleted = `AND done_flag = true `;
        break;
    }

    let params = [req.session.user_id];
    let search = '';
    if(req.query.search) {
      search = ` AND (title ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%' OR completion_notes ILIKE '%' || $2 || '%')`;
      params.push(req.query.search)
      
    }

    let columns = req.query.columns;
    let sortOptions = ['date', 'title', 'color', 'done_flag'];
    let sort = req.query.order ? (sortOptions.indexOf(columns[req.query.order[0]['column']].data) >= 0 ? columns[req.query.order[0]['column']].data : 'date') : 'date';

    let sortOrders = ['asc', 'desc'];
    let sortOrder = req.query.order ? (sortOrders.indexOf(req.query.order[0]['dir']) >= 0 ? req.query.order[0]['dir'] : 'asc') : 'asc';

    let sql = `
    SELECT t.id, t.title, t.color, t.date, t.description, t.done_flag, t.create_date, t.mod_date,
        count(t.*) OVER() AS total_count
    FROM todos t
    WHERE t.active_flag = true AND t.user_id = $1 ${showCompleted} ${search}
    ORDER BY ${sort} ${sortOrder} OFFSET ${start} LIMIT ${(numPerPage || 10)}
    `;
    let todos = await req.orm.rawSQL(sql, params)

    if(todos.length > 0) {
      let totalCount = todos[0].total_count;
      for(let i = 0; i < todos.length; i++) {
        delete todos[i].total_count;
      }
      res.json({
        data: todos,
        draw: req.query.draw || 1,
        recordsFiltered: totalCount,
        recordsTotal: totalCount
      })
    } else {
      res.json({
        draw: 1,
        data: [],
        recordsFiltered: 0,
        recordsTotal: 0
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