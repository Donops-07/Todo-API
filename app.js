require('dotenv').config();
const express = require('express');
const cors = require("cors");
const logRequest = require("./logger.js");
const validateTodo = require("./validator.js");
const validatePatch = require("./validate_patch.js");
const errorHandler = require("./errorHandler.js");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors("*"));
app.use(logRequest);

app.get('/', (req, res) => {
    res.send("Todo API is running");
});

let todos = [
    { id: 1, task: 'Learn Node.js', completed: false },
    { id: 2, task: 'Build CRUD API', completed: false },
];

// GET All – Read
app.get('/todos', (req, res) => {
    res.status(200).json(todos); // Send array as JSON
});


//GET Active todos
app.get("/todos/active", (req, res) => {
    const active = todos.filter((todo) => todo.completed === false);
    res.status(200).json({ active });
});

// GET by Id
app.get('/todos/:id', (req, res, next) => {
    try {
        const id = req.params.id;
        if (!(/^\d+$/.test(id))) {
            const error = new Error();
            error.status = 400;
            error.message = "Invalid ID"
            throw error;
        };
        const todo = todos.find((t) => t.id === parseInt(id, 10));
        if (!todo) return res.status(404).json({ message: 'Todo not found' });
        res.status(200).json(todo); // Send single item
    } catch (error) {
        next(error);
    }
});



// POST New – Create
app.post('/todos', validateTodo, (req, res, next) => {
    try {
        const { task } = req.body;
        if (!task) return res.status(400).json({ error: "All fields must be given" });
        const newTodo = { id: todos.length + 1, ...req.body }; // Auto-ID
        todos.push(newTodo);
        res.status(201).json(newTodo);
    } catch (error) {
        next(error);
    }

});

// PATCH Update – Partial
app.patch('/todos/:id', validatePatch, (req, res, next) => {
    try {
        const id = req.params.id;
        if (isNaN(id)) {
            throw new Error("Invalid ID");
        }
        const todo = todos.find((t) => t.id === parseInt(id)); // Array.find()
        if (!todo) return res.status(404).json({ message: 'Todo not found' });
        Object.assign(todo, req.body); // Merge: e.g., {completed: true}
        res.status(200).json(todo);
    } catch (error) {

        next(error);
    }
});

// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const initialLength = todos.length;
        todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
        if (todos.length === initialLength)
            return res.status(404).json({ error: 'Not found' });
        res.status(204).send(); // Silent success
    } catch (error) {

        next(error);
    }
});

app.get('/todo/completed', (req, res, next) => {
    try {
        const completed = todos.filter((t) => t.completed === true);
        res.json(completed); // Custom Read!
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 