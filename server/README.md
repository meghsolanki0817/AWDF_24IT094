# Task Manager API

Task Manager backend for Practical 5 using **Express, MongoDB, and Mongoose**.

This server implements a Mongoose schema with required fields, defaults, enum validation, and a pre-save hook to trim the task title.

Install and run:

```powershell
cd server
npm install
copy .env.example .env
# edit .env if needed
npm start
```

For Docker-based development:

```powershell
docker-compose up --build
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
