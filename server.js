import express from "express";
import cors from "cors";
import db from "./db.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.SERCET; // najlepiej w .env

// ================= LOGIN =================
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            [username, password]
        );
        if (rows.length === 0) return res.status(401).json({ error: "Błędny login lub hasło" });

        const user = rows[0];
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= LOGOUT =================
app.post('./logout', authenticate, (req, res) => {
    res.json({ message: 'Wylogowanie udane'})
});

// ================= MIDDLEWARE JWT =================
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Brak tokena" });

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, SECRET);
        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: "Token niepoprawny" });
    }
};

// ================= ENDPOINTY =================

// Pobierz wszystkie kategorie użytkownika
app.get("/categories", authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM categories WHERE user_id = ?",
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pobierz zakładki dla kategorii
app.get("/categories/:id/tabs", authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT tabs.* FROM tabs
             JOIN categories ON tabs.category_id = categories.id
             WHERE tabs.category_id = ? AND categories.user_id = ?`,
            [req.params.id, req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pobierz rekordy dla zakładki
app.get("/tabs/:id/records", authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT records.* FROM records
             JOIN tabs ON records.tab_id = tabs.id
             JOIN categories ON tabs.category_id = categories.id
             WHERE records.tab_id = ? AND categories.user_id = ?`,
            [req.params.id, req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dodaj rekord do zakładki
app.post("/tabs/:id/records", authenticate, async (req, res) => {
    const { title, amount, quantity, details } = req.body;
    try {
        // Sprawdź, czy zakładka należy do użytkownika
        const [tabs] = await db.query(
            `SELECT tabs.id FROM tabs
             JOIN categories ON tabs.category_id = categories.id
             WHERE tabs.id = ? AND categories.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (tabs.length === 0) return res.status(403).json({ error: "Nie masz dostępu do tej zakładki" });

        const [result] = await db.query(
            "INSERT INTO records (tab_id, title, amount, quantity, details) VALUES (?, ?, ?, ?, ?)",
            [req.params.id, title, amount, quantity, details]
        );
        res.json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Usuń rekord
app.delete("/records/:id", authenticate, async (req, res) => {
    try {
        // Sprawdź, czy rekord należy do użytkownika
        const [records] = await db.query(
            `SELECT records.id FROM records
             JOIN tabs ON records.tab_id = tabs.id
             JOIN categories ON tabs.category_id = categories.id
             WHERE records.id = ? AND categories.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (records.length === 0) return res.status(403).json({ error: "Nie masz dostępu do tego rekordu" });

        const [result] = await db.query("DELETE FROM records WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= START SERVER =================
const PORT = 3000;
app.listen(PORT, () =>
    console.log(`✅ API działa na http://localhost:${PORT}`)
);
