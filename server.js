import express from "express";
import cors from "cors";
import db from "./db.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "supersekretnyklucz"; // możesz dać process.env.SECRET w .env

// ================= LOGIN =================
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            [username, password]
        );
        if (rows.length === 0)
            return res.status(401).json({ error: "Błędny login lub hasło" });

        const user = rows[0];
        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET,
            { expiresIn: "2h" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= MIDDLEWARE JWT =================
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Brak tokena" });

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

// 🔹 Pobierz wszystkie kategorie użytkownika
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

// 🔹 Dodaj kategorię
app.post("/categories", authenticate, async (req, res) => {
    const { name } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO categories (name, user_id) VALUES (?, ?)",
            [name, req.user.id]
        );
        res.json({ id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Usuń kategorię (tylko swoją)
app.delete("/categories/:id", authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM categories WHERE id = ? AND user_id = ?",
            [req.params.id, req.user.id]
        );
        if (rows.length === 0)
            return res.status(403).json({ error: "Brak dostępu" });

        await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Pobierz zakładki dla kategorii
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

// 🔹 Dodaj zakładkę do swojej kategorii
app.post("/categories/:id/tabs", authenticate, async (req, res) => {
    const { name } = req.body;
    try {
        const [cats] = await db.query(
            "SELECT * FROM categories WHERE id = ? AND user_id = ?",
            [req.params.id, req.user.id]
        );
        if (cats.length === 0)
            return res.status(403).json({ error: "Brak dostępu" });

        const [result] = await db.query(
            "INSERT INTO tabs (name, category_id) VALUES (?, ?)",
            [name, req.params.id]
        );
        res.json({ id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Usuń zakładkę
app.delete("/tabs/:id", authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT tabs.id FROM tabs
             JOIN categories ON tabs.category_id = categories.id
             WHERE tabs.id = ? AND categories.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (rows.length === 0)
            return res.status(403).json({ error: "Brak dostępu" });

        await db.query("DELETE FROM tabs WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Pobierz rekordy z zakładki
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

// 🔹 Dodaj rekord
app.post("/tabs/:id/records", authenticate, async (req, res) => {
    const { title, amount, quantity, details } = req.body;
    try {
        const [tabs] = await db.query(
            `SELECT tabs.id FROM tabs
             JOIN categories ON tabs.category_id = categories.id
             WHERE tabs.id = ? AND categories.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (tabs.length === 0)
            return res.status(403).json({ error: "Brak dostępu" });

        const [result] = await db.query(
            "INSERT INTO records (tab_id, title, amount, quantity, details) VALUES (?, ?, ?, ?, ?)",
            [req.params.id, title, amount, quantity, details]
        );
        res.json({ id: result.insertId, title, amount, quantity, details });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔹 Usuń rekord
app.delete("/records/:id", authenticate, async (req, res) => {
    try {
        const [records] = await db.query(
            `SELECT records.id FROM records
             JOIN tabs ON records.tab_id = tabs.id
             JOIN categories ON tabs.category_id = categories.id
             WHERE records.id = ? AND categories.user_id = ?`,
            [req.params.id, req.user.id]
        );
        if (records.length === 0)
            return res.status(403).json({ error: "Brak dostępu" });

        await db.query("DELETE FROM records WHERE id = ?", [req.params.id]);
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
