# Task Manager API

Task Manager backend for Practical 6 using **Express, MongoDB, and Mongoose**. If MongoDB is unavailable, it starts in temporary in-memory mode for local demonstration.

This server implements a simple REST API with logging middleware, content-type validation, and global error handling.

Create a `server/.env` file first:

```env
MONGO_URI=mongodb://127.0.0.1:27017/task-manager
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
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
- `POST /auth/register` hashes passwords with bcrypt and returns a JWT.
- `POST /auth/login` verifies the password and returns a one-hour JWT.
- `GET /auth/me` and all `/tasks` routes require `Authorization: Bearer <token>`.
- Task POST and PUT requests pass through server-side field validation before reaching the controller.
- Mongoose validation errors are returned as structured JSON.
- Invalid task IDs return a 400 error and missing tasks return 404.
