// express module used for starting a server
const express = require("express");
// serializer used for sending data to db
const Sequelize = require('sequelize');
// installed with express used for getting body data
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// use body parser to get raw data from request's body
app.use(bodyParser.json());

// ticks for variable use within a string
app.listen(port, () => console.log(`Server running on port ${port}`));

// set connection with postgres
const sequelize = new Sequelize('postgres://mcodd:Oakland2021@127.0.0.1:5433/todo');

// connect and authenticate to database
sequelize
    .authenticate()
    .then(() => {
        console.log('Connection established');
    })
    .catch(err => {
        console.log('Unable to connect:', err);
    });

// define models
const TodoList = sequelize.define('TodoList', { name: Sequelize.STRING });
const TodoListItem = sequelize.define('Todo', { todo: Sequelize.TEXT, done: Sequelize.BOOLEAN });

// link models as one to many relation
TodoList.hasMany(TodoListItem, {
    onDelete: 'CASCADE'
});
TodoListItem.belongsTo(TodoList);

// synchronizes all the models to the database
sequelize.sync({ force: true })
    .then(() => {
       console.log('Database & tables created');

       TodoList.create({ name: 'Todos'}).then(() =>
           TodoList.findAll()
       ).then((todos) =>
           console.log(todos)
       );
    });

/*
 * Start todoList api endpoints
 */

// get all the lists
app.get('/todos', function (req, res) {
    TodoList.findAll().then((todosList) => {
        res.json(todosList)
    });
})

// get a specific todoList
app.get('/todos/:id', function (req, res) {
    TodoList.findAll({ where: { id: req.params.id }, include: TodoListItem })
        .then((todoList) => {
            if (todoList.length > 0) {
                res.json(todoList);
            }
            else {
                res.json({"error": "Not Found"});
            }
        });
})

// create a new single todoList
app.post('/todos/create', function(req, res) {
    TodoList.create({ name: req.body.name })
        .then((todo) => res.json(todo));
});


// delete todoList
app.delete('/todos/:id/delete', function (req, res) {
   TodoList.findByPk(req.params.id).then((todoList) => {
       if (todoList == null) {
           res.json({"error": "Not Found"});
       }
       else {
           todoList.destroy().then(() => {
               res.json({"message" : `item ${req.params.id} deleted`})
           });
       }
   });
});

/*
 * End todoList api endpoints
 */

/*
 * Start todoListItem api endpoints
 */

// get a specific list item
app.get('/todos/:TodoListId/item/:id', function (req, res) {
   TodoListItem.findOne({ where: { TodoListId: req.params.TodoListId, id: req.params.id } })
       .then((todoListItem) => {
           console.log(todoListItem);
           if (todoListItem == null) {
               res.json({"error" : "Not Found" });
           } else {
               res.json(todoListItem);
           }
       });
});

// post a specific todoListItem into the specific list id
app.post('/todos/:TodoListId/create', function (req, res) {
    TodoList.findByPk(req.params.TodoListId)
        .then((todoList) => {
            if (todoList == null) {
                res.json({"error": "Not Found"});
            } else {
                TodoListItem.create({
                    todo: req.body.todo,
                    done: req.body.done,
                    TodoListId: todoList.id
                }).then((todoItem) => res.json(todoItem));
            }
        });
});

// update data on specific todoListItem
app.put('/todos/:TodoListId/item/:id/update', function(req, res) {
    TodoListItem.findOne({ where: { TodoListId: req.params.TodoListId, id: req.params.id } })
        .then((todoListItem) => {
            console.log(todoListItem);
            if (todoListItem == null) {
                res.json({"error": "Not Found"});
            } else {
                todoListItem.update({
                    done: req.body.done
                }).then((todoListItem) => res.json(todoListItem));
            }
        });
});


// delete todoListItem
app.delete('/todos/:TodoListId/item/:id/delete', function (req, res) {
    TodoListItem.findOne({ where: {TodoListId: req.params.TodoListId, id: req.params.id } })
        .then((todoListItem) => {
            console.log(todoListItem);
            if (todoListItem == null) {
                res.json({"error": "Not Found"});
            }
            else {
                todoListItem.destroy().then(() => {
                    res.json({"message" : `item ${req.params.id} from list ${req.params.TodoListId} was deleted`})
                });
            }
    });
});

/*
 * End todoListItem api endpoints
 */
