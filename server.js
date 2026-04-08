const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./db.sqlite");

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  bio TEXT DEFAULT '',
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  vpoints INTEGER DEFAULT 0,
  isAdmin INTEGER DEFAULT 0
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  content TEXT
)
`);

const adminPass = bcrypt.hashSync("cuteboiize14", 10);
db.run(`
INSERT OR IGNORE INTO users (username, password, isAdmin)
VALUES ('Glockyy.est', '${adminPass}', 1)
`);

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || password.length < 6) {
    return res.json({ error: "Invalid input" });
  }

  const hash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hash],
    (err) => {
      if (err) return res.json({ error: "Username taken" });
      res.json({ success: true });
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username=?", [username], async (err, user) => {
    if (!user) return res.json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ error: "Wrong password" });

    res.json({ success: true, user });
  });
});

app.post("/post", (req, res) => {
  const { username, content } = req.body;

  db.run("INSERT INTO posts (username, content) VALUES (?, ?)", [
    username,
    content,
  ]);

  res.json({ success: true });
});

app.get("/posts", (req, res) => {
  db.all("SELECT * FROM posts", [], (err, rows) => {
    res.json(rows);
  });
});

app.listen(3000, () => console.log("Server running"));
