# Task Manager API

Simple in-memory Express API for Practical 4 (Tasks CRUD).

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
