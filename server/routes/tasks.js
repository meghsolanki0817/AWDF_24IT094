const express = require('express');
const Task = require('../models/Task');
const router = express.Router();
const memoryTasks = [];
let nextMemoryId = 1;

const useMongo = () => require('mongoose').connection.readyState === 1;

const findMemoryTask = (id) => memoryTasks.find((task) => task._id === id);

router.get('/', async (req, res, next) => {
  try {
    const tasks = useMongo() ? await Task.find().sort({ createdAt: -1 }) : [...memoryTasks].reverse();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = useMongo() ? await Task.findById(req.params.id) : findMemoryTask(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description = '', completed = false } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    const task = useMongo()
      ? await Task.create({ title, description, completed })
      : { _id: `local-${nextMemoryId++}`, title: title.trim(), description: description.trim(), completed: Boolean(completed), createdAt: new Date().toISOString() };
    if (!useMongo()) memoryTasks.push(task);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    let task;
    if (useMongo()) {
      task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    } else {
      task = findMemoryTask(req.params.id);
      if (task) {
        Object.assign(task, req.body);
        task.title = task.title.trim();
        task.description = (task.description || '').trim();
        task.completed = Boolean(task.completed);
      }
    }
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    let task;
    if (useMongo()) {
      task = await Task.findByIdAndDelete(req.params.id);
    } else {
      const index = memoryTasks.findIndex((item) => item._id === req.params.id);
      task = index === -1 ? null : memoryTasks.splice(index, 1)[0];
    }
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
