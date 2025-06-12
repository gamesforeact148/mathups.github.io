# Game Portal

A modern web portal to play games, auto-detecting games from a folder, with login, admin tools, reporting, and dark/light mode.

## Features

- Auto-detects any game folders in `/games` and lists them in a dropdown.
- Single login for user `admin` (password `Archie987`). Only one device at a time per user.
- Admin can view active users and game reports.
- Users can report non-working games.
- Clean UI with dark/light mode.

## Getting Started

### 1. Clone and Install

```sh
git clone <this-repo-url>
cd games-portal
npm install
```

### 2. Setup Backend

```sh
cd backend
npm install
npm start
```
Backend runs on http://localhost:3001

### 3. Setup Frontend

```sh
cd ../frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### 4. Add Games

Place your games in `/games/<game-folder>/index.html`.

Example:
```
games/
  tetris/
    index.html
  snake/
    index.html
```

### 5. Login

- Username: `admin`
- Password: `Archie987`

---

## License

MIT