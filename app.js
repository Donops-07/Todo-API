require('dotenv').config();
const express = require('express');
const cors = require("cors");
const logRequest = require("./middlewares/logger.js");
const validateTodo = require("./middlewares/validator.js");
const validatePatch = require("./middlewares/validate_patch.js");
const errorHandler = require("./middlewares/errorHandler.js");
const connectDB = require("./database/db.js");
const Todo = require("./models/todo_model.js");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors("*"));
app.use(logRequest);
connectDB();

app.get('/', (req, res) => {
    res.send("Todo API is running");
});


app.get("/todos", async (req, res, next) => {
    try {
        const completed = req.query.completed;  //USE /todos?completed=false
        console.log(completed);
        const falseTodo = await Todo.find({ completed: false });
        const trueTodo = await Todo.find({ completed: true });
        if (completed === "false") return res.status(200).json({ falseTodo });
        if (completed) return res.status(200).json({ trueTodo })
        else {
            res.status(400).json({ error: "Does not recognize" });
        };

    } catch (error) {
        console.error("An error occured", error);
    }
    next();
});

// GET All – Read
app.get('/todos', async (req, res) => {
    const todos = await Todo.find({});
    res.status(200).json(todos); // Send array as JSON
});

// GET ONLY COMPLETED TASK
app.get('/todos/completed', async (req, res, next) => {
    try {
        const completed = await Todo.find({ completed: true })
        res.json(completed); // Custom Read!
    } catch (error) {
        next(error);
    }
});


//GET Active todos
app.get("/todos/active", (req, res) => {
    const active = todos.filter((todo) => todo.completed === false);
    res.status(200).json({ active });
});

// GET by Id
app.get('/todos/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        // if (!(/^\d+$/.test(id))) {
        //     const error = new Error();
        //     error.status = 400;
        //     error.message = "Invalid ID"
        //     throw error;
        // };
        const todo = await Todo.findById(req.params.id);

        if (!todo) return res.status(404).json({ message: 'Todo not found' });
        res.status(200).json(todo); // Send single item
    } catch (error) {
        next(error);
    }
});



// POST New – Create
app.post('/todos', validateTodo, async (req, res, next) => {
    try {
        const { task, completed } = req.body;
        if (!task) return res.status(400).json({ error: "All fields must be given" });
        const newTodo = new Todo({
            task,
            completed
        });

        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        next(error);
    }

});

// PATCH Update – Partial
app.patch('/todos/:id', validatePatch, async (req, res, next) => {
    try {
        const id = req.params.id;
        const todo = await Todo.findByIdAndUpdate(
            id,
            req.body, {
            new: true
        });
        if (!todo) return res.status(404).json({ message: 'Todo not found' });
        res.status(200).json(todo);
    } catch (error) {

        next(error);
    }
});

// DELETE Remove
app.delete('/todos/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) return res.status(404).json({ error: 'Not found' });
        res.status(204).send(); // Silent success
    } catch (error) {

        next(error);
    }
});



app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
}); 