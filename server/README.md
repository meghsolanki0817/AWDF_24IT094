# Task Manager API

Task Manager backend for Practical 4 using **Express** and an in-memory task list.

This server implements a simple REST API with logging middleware, content-type validation, and global error handling.

Install and run:

```powershell
cd server
npm install
npm start
```

Endpoints:

- `GET /tasks` - list tasks
- `GET /tasks/:id` - get a task
- `POST /tasks` - create (requires Content-Type: application/json)
- `PUT /tasks/:id` - update (requires Content-Type: application/json)
- `DELETE /tasks/:id` - delete

Notes:

- `title` is required and trimmed before save.
- `priority` is restricted to `low`, `medium`, or `high`.
- Mongoose validation errors are returned as structured JSON.
- Invalid task IDs return a 400 error and missing tasks return 404.
