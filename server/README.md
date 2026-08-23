# Task Manager API

Task Manager backend for Practical 6 using **Express, MongoDB, and Mongoose**. If MongoDB is unavailable, it starts in temporary in-memory mode for local demonstration.

This server implements a simple REST API with logging middleware, content-type validation, and global error handling.

Create a `server/.env` file first:

```env
MONGO_URI=mongodb://127.0.0.1:27017/task-manager
PORT=3000
```

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
- Tasks are persisted in MongoDB and sorted newest first.
- Mongoose validation errors are returned as structured JSON.
- Invalid task IDs return a 400 error and missing tasks return 404.
