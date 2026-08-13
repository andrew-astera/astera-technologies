const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "messages.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Ensure the data store exists
if (!fs.existsSync(DATA_FILE)) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Contact form submission
app.post("/api/contact", (req, res) => {
  const { name, email, company, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      error: "Name, email, and message are required.",
    });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Enter a valid email address." });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    company: company ? String(company).slice(0, 200) : "",
    message: String(message).slice(0, 5000),
    receivedAt: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    existing.push(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist contact message:", err);
    return res.status(500).json({ ok: false, error: "Could not save your message. Please try again." });
  }

  return res.status(200).json({ ok: true, message: "Message received. We will reply within one business day." });
});

// Simple health check
app.get("/api/health", (req, res) => res.json({ ok: true, service: "astera-technologies", time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`ASTERA Technologies site running at http://localhost:${PORT}`);
});
