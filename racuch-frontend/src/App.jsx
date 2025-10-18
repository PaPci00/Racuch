import { useEffect, useState } from "react";

function App() {
    // ================= STANY =================
    const [token, setToken] = useState(null);
    const [loginData, setLoginData] = useState({ username: "", password: "" });

    const [categories, setCategories] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [records, setRecords] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTab, setSelectedTab] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        quantity: "",
        details: ""
    });

    const [newCategory, setNewCategory] = useState("");
    const [newTab, setNewTab] = useState("");

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

    // ================= POBIERANIE DANYCH =================
    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:3000/categories", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setCategories(data));
    }, [token]);

    useEffect(() => {
        if (!token || !selectedCategory) return;
        fetch(`http://localhost:3000/categories/${selectedCategory}/tabs`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setTabs(data));
    }, [token, selectedCategory]);

    useEffect(() => {
        if (!token || !selectedTab) return;
        fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setRecords(data));
    }, [token, selectedTab]);

    // ================= OBSŁUGA REKORDÓW =================
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleDeleteRecord = async (id) => {
        const res = await fetch(`http://localhost:3000/records/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setRecords(records.filter(r => r.id !== id));
    };

    // ================= OBSŁUGA KATEGORII =================
    const handleAddCategory = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:3000/categories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: newCategory })
        });
        if (res.ok) {
            const data = await res.json();
            setCategories([...categories, data]);
            setNewCategory("");
        }
    };

    const handleDeleteCategory = async (id) => {
        const res = await fetch(`http://localhost:3000/categories/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            setCategories(categories.filter(c => c.id !== id));
            if (selectedCategory === id) {
                setSelectedCategory(null);
                setTabs([]);
                setRecords([]);
            }
        }
    };

    // ================= OBSŁUGA ZAKŁADEK =================
    const handleAddTab = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return;
        const res = await fetch(`http://localhost:3000/categories/${selectedCategory}/tabs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: newTab })
        });
        if (res.ok) {
            const data = await res.json();
            setTabs([...tabs, data]);
            setNewTab("");
        }
    };

    const handleDeleteTab = async (id) => {
        const res = await fetch(`http://localhost:3000/tabs/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            setTabs(tabs.filter(t => t.id !== id));
            if (selectedTab === id) {
                setSelectedTab(null);
                setRecords([]);
            }
        }
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

            {/* ================= KATEGORIE ================= */}
            <h2>Kategorie</h2>
            <form onSubmit={handleAddCategory}>
                <input
                    type="text"
                    placeholder="Nowa kategoria"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                />
                <button type="submit">➕ Dodaj kategorię</button>
            </form>
            <ul>
                {categories.map(c => (
                    <li key={c.id}>
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setSelectedCategory(c.id);
                                setSelectedTab(null);
                                setRecords([]);
                            }}
                        >
                            {c.name}
                        </span>
                        {" "}
                        <button onClick={() => handleDeleteCategory(c.id)}>❌ Usuń</button>
                    </li>
                ))}
            </ul>

            {/* ================= ZAKŁADKI ================= */}
            {selectedCategory && (
                <>
                    <h2>Zakładki</h2>
                    <form onSubmit={handleAddTab}>
                        <input
                            type="text"
                            placeholder="Nowa zakładka"
                            value={newTab}
                            onChange={(e) => setNewTab(e.target.value)}
                            required
                        />
                        <button type="submit">➕ Dodaj zakładkę</button>
                    </form>
                    <ul>
                        {tabs.map(t => (
                            <li key={t.id}>
                                <span
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setSelectedTab(t.id)}
                                >
                                    {t.name}
                                </span>
                                {" "}
                                <button onClick={() => handleDeleteTab(t.id)}>❌ Usuń</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* ================= REKORDY ================= */}
            {selectedTab && (
                <>
                    <h2>Rekordy</h2>
                    <ul>
                        {records.map(r => (
                            <li key={r.id}>
                                {r.title} – {r.amount} zł
                                {Number(r.quantity) > 0 ? ` (${r.quantity})` : ""}
                                {r.details && ` | ${r.details}`}
                                {" "}
                                <button onClick={() => handleDeleteRecord(r.id)}>❌ Usuń</button>
                            </li>
                        ))}
                    </ul>

                    <h3>Dodaj rekord</h3>
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
                        <button type="submit">➕ Dodaj</button>
                    </form>
                </>
            )}
        </div>
    );
}

export default App;
