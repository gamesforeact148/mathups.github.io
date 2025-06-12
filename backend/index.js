import express from "express";
import session from "express-session";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const users = JSON.parse(fs.readFileSync(path.join(__dirname, "users.json"), "utf8"));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: "lax" }
}));

const activeSessions = {};

function requireLogin(req, res, next) {
  if (!req.session.username) return res.status(401).send("Login required");
  next();
}
function requireAdmin(req, res, next) {
  if (req.session.username !== "admin") return res.status(403).send("Admin only");
  next();
}

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) return res.status(401).send("Invalid credentials");
  if (activeSessions[username]) return res.status(403).send("Already logged in elsewhere");
  req.session.username = username;
  activeSessions[username] = req.sessionID;
  res.json({ username });
});

// Logout
app.post("/api/logout", requireLogin, (req, res) => {
  const username = req.session.username;
  if (username) delete activeSessions[username];
  req.session.destroy(() => {});
  res.sendStatus(200);
});

// Games list
app.get("/api/games", requireLogin, (req, res) => {
  const gamesDir = path.join(__dirname, "../games");
  if (!fs.existsSync(gamesDir)) return res.json([]);
  const games = fs.readdirSync(gamesDir).filter(f => 
    fs.lstatSync(path.join(gamesDir, f)).isDirectory() &&
    fs.existsSync(path.join(gamesDir, f, "index.html"))
  );
  res.json(games);
});

// Game report
app.post("/api/report", requireLogin, (req, res) => {
  const { game, issue } = req.body;
  if (!game || !issue) return res.status(400).send("Missing game or issue");
  fs.appendFileSync(path.join(__dirname, "reports.log"), `${new Date().toISOString()} - ${game}: ${issue}\n`);
  res.sendStatus(200);
});

// Admin: get reports
app.get("/api/admin/reports", requireLogin, requireAdmin, (req, res) => {
  const logPath = path.join(__dirname, "reports.log");
  const reports = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf-8") : "";
  res.send(reports);
});

// Admin: get active users
app.get("/api/admin/active", requireLogin, requireAdmin, (req, res) => {
  res.json(Object.keys(activeSessions));
});

// Serve static games
app.use("/games", requireLogin, express.static(path.join(__dirname, "../games")));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));