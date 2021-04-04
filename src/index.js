const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAccount = users.find(user => user.username === username);

  if(!userAccount) {
    return response.status(404).json({ error: 'User not found.' });
  }

  request.userAccount = userAccount; //passa o array 'user' para as rotas

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(
    (user) => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists.' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;

  return response.json(userAccount.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { userAccount } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  userAccount.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const userTodo = userAccount.todos.find(todo => todo.id === id);

  if(!userTodo) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  userTodo.title = title;
  userTodo.deadline = new Date(deadline);

  return response.json(userTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;

  const userTodo = userAccount.todos.find(todo => todo.id === id);

  if(!userTodo) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  userTodo.done = true;

  return response.json(userTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { id } = request.params;

  const todoIndex = userAccount.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found.' });
  }

  userAccount.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;