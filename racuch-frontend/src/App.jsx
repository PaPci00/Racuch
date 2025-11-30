import { useEffect, useState } from "react";

function App() {
    // ================= STANY =================
    const [token, setToken] = useState(null);
    const [view, setView] = useState("login"); // "login", "register", "app"

    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [registerData, setRegisterData] = useState({ username: "", password: "" });

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

    // ================= REJESTRACJA =================
    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData)
            });
            const data = await res.json();
            if (data.token) {
                setToken(data.token);
                setView("app");
                setRegisterData({ username: "", password: "" });
            } else {
                alert(data.error || "Błąd rejestracji");
            }
        } catch (err) {
            alert("Błąd połączenia");
        }
    };

    // ================= LOGOWANIE =================
    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData)
            });
            const data = await res.json();
            if (data.token) {
                setToken(data.token);
                setView("app");
                setLoginData({ username: "", password: "" });
            } else {
                alert("Błąd logowania");
            }
        } catch (err) {
            alert("Błąd połączenia");
        }
    };

    // ================= WYLOGOWANIE =================
    const handleLogout = () => {
        setToken(null);
        setView("login");
        setLoginData({ username: "", password: "" });
        setCategories([]);
        setTabs([]);
        setRecords([]);
        setSelectedCategory(null);
        setSelectedTab(null);
    };

    // ================= POBIERANIE DANYCH =================
    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:3000/categories", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Błąd pobierania kategorii:", err));
    }, [token]);

    useEffect(() => {
        if (!token || !selectedCategory) return;
        fetch(`http://localhost:3000/categories/${selectedCategory}/tabs`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setTabs(data))
            .catch(err => console.error("Błąd pobierania zakładek:", err));
    }, [token, selectedCategory]);

    useEffect(() => {
        if (!token || !selectedTab) return;
        fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setRecords(data))
            .catch(err => console.error("Błąd pobierania rekordów:", err));
    }, [token, selectedTab]);

    // ================= OBSŁUGA REKORDÓW =================
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTab) return;

        try {
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
        } catch (err) {
            alert("Błąd dodawania rekordu");
        }
    };

    const handleDeleteRecord = async (id) => {
        try {
            const res = await fetch(`http://localhost:3000/records/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setRecords(records.filter(r => r.id !== id));
        } catch (err) {
            alert("Błąd usuwania rekordu");
        }
    };

    // ================= OBSŁUGA KATEGORII =================
    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
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
        } catch (err) {
            alert("Błąd dodawania kategorii");
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
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
        } catch (err) {
            alert("Błąd usuwania kategorii");
        }
    };

    // ================= OBSŁUGA ZAKŁADEK =================
    const handleAddTab = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return;
        try {
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
        } catch (err) {
            alert("Błąd dodawania zakładki");
        }
    };

    const handleDeleteTab = async (id) => {
        try {
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
        } catch (err) {
            alert("Błąd usuwania zakładki");
        }
    };

    // ================= RENDER =================
    if (view === "register") {
        return (
            <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
                <h1>📊 Tracker wydatków – Rejestracja</h1>
                <form onSubmit={handleRegisterSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Login"
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Hasło"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                    />
                    <button type="submit">Zarejestruj się</button>
                </form>
                <button
                    onClick={() => setView("login")}
                    style={{ marginTop: "10px", width: "100%" }}
                >
                    Masz już konto? Zaloguj się
                </button>
            </div>
        );
    }

    if (view === "login") {
        return (
            <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
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
                <button
                    onClick={() => setView("register")}
                    style={{ marginTop: "10px", width: "100%" }}
                >
                    Nie masz konta? Zarejestruj się
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>📊 Tracker wydatków</h1>
                <button onClick={handleLogout}>🚪 Wyloguj</button>
            </div>

            {/* ================= KATEGORIE ================= */}
            <h2>Kategorie</h2>
            <form onSubmit={handleAddCategory} style={{ marginBottom: "10px" }}>
                <input
                    type="text"
                    placeholder="Nowa kategoria"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ padding: "5px", marginRight: "10px" }}
                    required
                />
                <button type="submit">➕ Dodaj kategorię</button>
            </form>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {categories.map(c => (
                    <li key={c.id} style={{
                        padding: "10px",
                        border: "1px solid #ddd",
                        marginBottom: "5px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span
                            style={{ cursor: "pointer", fontWeight: selectedCategory === c.id ? "bold" : "normal" }}
                            onClick={() => {
                                setSelectedCategory(c.id);
                                setSelectedTab(null);
                                setRecords([]);
                            }}
                        >
                            📁 {c.name}
                        </span>
                        <button
                            onClick={() => handleDeleteCategory(c.id)}
                            style={{ background: "#ff4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px" }}
                        >
                            ❌ Usuń
                        </button>
                    </li>
                ))}
            </ul>

            {/* ================= ZAKŁADKI ================= */}
            {selectedCategory && (
                <>
                    <h2>Zakładki</h2>
                    <form onSubmit={handleAddTab} style={{ marginBottom: "10px" }}>
                        <input
                            type="text"
                            placeholder="Nowa zakładka"
                            value={newTab}
                            onChange={(e) => setNewTab(e.target.value)}
                            style={{ padding: "5px", marginRight: "10px" }}
                            required
                        />
                        <button type="submit">➕ Dodaj zakładkę</button>
                    </form>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {tabs.map(t => (
                            <li key={t.id} style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                                marginBottom: "5px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <span
                                    style={{ cursor: "pointer", fontWeight: selectedTab === t.id ? "bold" : "normal" }}
                                    onClick={() => setSelectedTab(t.id)}
                                >
                                    📋 {t.name}
                                </span>
                                <button
                                    onClick={() => handleDeleteTab(t.id)}
                                    style={{ background: "#ff4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px" }}
                                >
                                    ❌ Usuń
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* ================= REKORDY ================= */}
            {selectedTab && (
                <>
                    <h2>Rekordy</h2>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {records.map(r => (
                            <li key={r.id} style={{
                                padding: "15px",
                                border: "1px solid #ddd",
                                marginBottom: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <div>
                                    <strong>{r.title}</strong> – <span style={{ color: "#2e7d32" }}>{r.amount} zł</span>
                                    {Number(r.quantity) > 0 ? ` (${r.quantity}x)` : ""}
                                    {r.details && <div style={{ fontSize: "0.9em", color: "#666", marginTop: "5px" }}>{r.details}</div>}
                                </div>
                                <button
                                    onClick={() => handleDeleteRecord(r.id)}
                                    style={{ background: "#ff4444", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px" }}
                                >
                                    ❌ Usuń
                                </button>
                            </li>
                        ))}
                    </ul>

                    <h3>Dodaj rekord</h3>
                    <form onSubmit={handleSubmit} style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                        gap: "10px",
                        marginTop: "20px"
                    }}>
                        <input
                            type="text"
                            name="title"
                            placeholder="Tytuł"
                            value={formData.title}
                            onChange={handleChange}
                            style={{ padding: "8px" }}
                            required
                        />
                        <input
                            type="number"
                            name="amount"
                            placeholder="Kwota"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            style={{ padding: "8px" }}
                            required
                        />
                        <input
                            type="number"
                            name="quantity"
                            placeholder="Ilość"
                            value={formData.quantity}
                            onChange={handleChange}
                            style={{ padding: "8px" }}
                        />
                        <input
                            type="text"
                            name="details"
                            placeholder="Szczegóły"
                            value={formData.details}
                            onChange={handleChange}
                            style={{ padding: "8px" }}
                        />
                        <button type="submit" style={{
                            background: "#4caf50",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "4px"
                        }}>
                            ➕ Dodaj
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default App;
