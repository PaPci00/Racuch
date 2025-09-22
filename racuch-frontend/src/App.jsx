import { useEffect, useState } from "react";

function App() {
    const [categories, setCategories] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [records, setRecords] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null);

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
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default App;
