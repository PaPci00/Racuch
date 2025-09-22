import { useEffect, useState } from "react";

function App() {
    const [categories, setCategories] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [records, setRecords] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null);

    // Stan formularza
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        quantity: "",
        details: ""
    });

    // Pobierz kategorie
    useEffect(() => {
        fetch("http://localhost:3000/categories")
            .then(res => res.json())
            .then(data => setCategories(data));
    }, []);

    // Pobierz zakładki po wybraniu kategorii
    useEffect(() => {
        if (selectedCategory) {
            fetch(`http://localhost:3000/categories/${selectedCategory}/tabs`)
                .then(res => res.json())
                .then(data => setTabs(data));
        }
    }, [selectedCategory]);

    // Pobierz rekordy po wybraniu zakładki
    useEffect(() => {
        if (selectedTab) {
            fetch(`http://localhost:3000/tabs/${selectedTab}/records`)
                .then(res => res.json())
                .then(data => setRecords(data));
        }
    }, [selectedTab]);

    // Obsługa formularza
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTab) return;

        const res = await fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            // Po dodaniu pobierz ponownie rekordy
            const newRecords = await fetch(`http://localhost:3000/tabs/${selectedTab}/records`)
                .then(r => r.json());
            setRecords(newRecords);

            // Wyczyść formularz
            setFormData({ title: "", amount: "", quantity: "", details: "" });
        }
    };

    const handleDelete = async (id) => {
        console.log("Usuwam rekord o ID:", id);

        const res = await fetch(`http://localhost:3000/records/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            // odśwież listę rekordów po usunięciu
            setRecords(records.filter(r => r.id !== id));
        }
    };


    return (
        <div style={{ padding: "20px" }}>
            <h1>📊 Tracker wydatków</h1>

            <h2>Kategorie</h2>
            <ul>
                {categories.map(c => (
                    <li key={c.id} onClick={() => {
                        setSelectedCategory(c.id);
                        setSelectedTab(null);
                        setRecords([]);
                    }}>
                        {c.name}
                    </li>
                ))}
            </ul>

            {tabs.length > 0 && (
                <>
                    <h2>Zakładki</h2>
                    <ul>
                        {tabs.map(t => (
                            <li key={t.id} onClick={() => setSelectedTab(t.id)}>
                                {t.name}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {records.length > 0 && (
                <>
                    <h2>Rekordy</h2>
                    <ul>
                        {records.map(r => (
                            <li key={r.id}>
                                {r.title} – {r.amount} zł {r.quantity ? `(${r.quantity})` : ""}
                                {r.details && ` | ${r.details}`}
                                {" "}
                                <button onClick={() => handleDelete(r.id)}>❌ Usuń</button>
                            </li>
                        ))}
                    </ul>

                </>
            )}

            {selectedTab && (
                <>
                    <h2>Dodaj rekord</h2>
                    <form onSubmit={handleSubmit} style={{marginTop: "10px"}}>
                        <input
                            type="text"
                            name="title"
                            placeholder="Tytuł"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="number"
                            name="amount"
                            placeholder="Kwota"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Ilość"
                            value={formData.quantity}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="details"
                            placeholder="Szczegóły"
                            value={formData.details}
                            onChange={handleChange}
                        />
                        <button type="submit">Dodaj</button>
                    </form>
                </>
            )}
        </div>
    );
}

export default App;
