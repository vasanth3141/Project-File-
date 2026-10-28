# MERN Todo App

A simple task manager built with React, Express, and MongoDB.

## Requirements
- Node.js (LTS) and npm
- MongoDB running locally, or a MongoDB connection string

## Run the backend
```bash
cd todo-backend
npm install
```
Copy `.env.example` to `.env` and adjust `MONGODB_URI` if needed, then:
```bash
npm run dev
```
The API starts at `http://localhost:8000`. Check `http://localhost:8000/health`.

## Run the frontend
Open a second terminal:
```bash
cd todo-frontend
npm install
npm start
```
The React app opens at `http://localhost:3000`.

If your backend is hosted elsewhere, create `todo-frontend/.env` with:
```env
REACT_APP_API_URL=https://your-backend-url
```
Restart the frontend after changing environment variables.

## Notes
- `node_modules` folders are intentionally excluded; run `npm install` in each app folder.
- Do not commit `.env` files or database credentials.
