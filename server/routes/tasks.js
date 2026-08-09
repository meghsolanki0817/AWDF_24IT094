const express = require('express');
const router = express.Router();

let tasks = [];
let nextId = 1;

router.get('/', (req, res) => {
  res.status(200).json(tasks);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.status(200).json(task);
});

router.post('/', (req, res) => {
  const { title, description, completed } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const task = { id: nextId++, title, description: description || '', completed: !!completed };
  tasks.push(task);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  const { title, description, completed } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  tasks[idx] = { id, title, description: description || '', completed: !!completed };
  res.status(200).json(tasks[idx]);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  const deleted = tasks.splice(idx, 1)[0];
  res.status(200).json(deleted);
});

module.exports = router;
