import express from "express";
import cors from "cors";
import db from "./db.js"; // twoje połączenie do MySQL

const app = express();
app.use(cors());
app.use(express.json());

// Pobierz wszystkie kategorie
app.get("/categories", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM categories");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pobierz zakładki dla kategorii
app.get("/categories/:id/tabs", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tabs WHERE category_id = ?", [
            req.params.id,
        ]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pobierz rekordy dla zakładki
app.get("/tabs/:id/records", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM records WHERE tab_id = ?", [
            req.params.id,
        ]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dodaj rekord do zakładki
app.post("/tabs/:id/records", async (req, res) => {
    const { title, amount, quantity, details } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO records (tab_id, title, amount, quantity, details) VALUES (?, ?, ?, ?, ?)",
            [req.params.id, title, amount, quantity, details]
        );
        res.json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () =>
    console.log(`✅ API działa na http://localhost:${PORT}`)
);
