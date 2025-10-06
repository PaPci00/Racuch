import { useEffect, useState } from "react";

function App() {
    // Stan logowania i token
    const [token, setToken] = useState(null);
    const [loginData, setLoginData] = useState({ username: "", password: "" });

    // Stany danych
    const [categories, setCategories] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [records, setRecords] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null);

    // Stan formularza dodawania rekordu
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        quantity: "",
        details: ""
    });

    // ================= LOGOWANIE =================
    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        });
        const data = await res.json();
        if (data.token) {
            setToken(data.token);
        } else {
            alert("Błąd logowania");
        }
    };

    // ================= WYLOGOWANIE =================
    const handleLogout = () => {
        setToken(null)
        setLoginData({ username: "", password: "" })
    }

    // ================= FETCH KATEGORII =================
    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:3000/categories", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setCategories(data));
    }, [token]);

    // ================= FETCH ZAKŁADEK =================
    useEffect(() => {
        if (!token || !selectedCategory) return;
        fetch(`http://localhost:3000/categories/${selectedCategory}/tabs`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setTabs(data));
    }, [token, selectedCategory]);

    // ================= FETCH REKORDÓW =================
    useEffect(() => {
        if (!token || !selectedTab) return;
        fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setRecords(data));
    }, [token, selectedTab]);

    // ================= FORMULARZ DODAWANIA REKORDU =================
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
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            const newRecords = await fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
                headers: { "Authorization": `Bearer ${token}` }
            }).then(r => r.json());
            setRecords(newRecords);
            setFormData({ title: "", amount: "", quantity: "", details: "" });
        }
    };

    // ================= USUWANIE REKORDU =================
    const handleDelete = async (id) => {
        const res = await fetch(`http://localhost:3000/records/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setRecords(records.filter(r => r.id !== id));
    };

    // ================= RENDER =================
    if (!token) {
        return (
            <div style={{ padding: "20px" }}>
                <h1>📊 Tracker wydatków – Logowanie</h1>
                <form onSubmit={handleLoginSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Login"
                        value={loginData.username}
                        onChange={handleLoginChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Hasło"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                    />
                    <button type="submit">Zaloguj</button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>📊 Tracker wydatków</h1>
            <button onClick={handleLogout}>Wyloguj</button>

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
                                {r.title} – {r.amount} zł
                                {Number(r.quantity) > 0 ? ` (${r.quantity})` : ""}
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
                    <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
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
