const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();
const memoryTasks = [];
let nextMemoryId = 1;

const useMongo = () => require('mongoose').connection.readyState === 1;

const findMemoryTask = (id, userId) => memoryTasks.find((task) => task._id === id && task.userId === userId);

router.get('/', async (req, res, next) => {
  try {
    const tasks = useMongo() ? await Task.find({ userId: req.user.id }).sort({ createdAt: -1 }) : memoryTasks.filter((task) => task.userId === req.user.id).reverse();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = useMongo() ? await Task.findOne({ _id: req.params.id, userId: req.user.id }) : findMemoryTask(req.params.id, req.user.id);
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
      ? await Task.create({ userId: req.user.id, title, description, completed })
      : { _id: `local-${nextMemoryId++}`, userId: req.user.id, title: title.trim(), description: description.trim(), completed: Boolean(completed), createdAt: new Date().toISOString() };
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
      task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true, runValidators: true });
    } else {
      task = findMemoryTask(req.params.id, req.user.id);
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
      task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    } else {
      const index = memoryTasks.findIndex((item) => item._id === req.params.id && item.userId === req.user.id);
      task = index === -1 ? null : memoryTasks.splice(index, 1)[0];
    }
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
