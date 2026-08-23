module.exports = (req, res, next) => {
  const { title, description, completed } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be text' });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  next();
};