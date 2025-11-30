import { useEffect, useState } from "react";

function App() {
    // Stan logowania i token
    const [token, setToken] = useState(null);
    const [view, setView] = useState("login"); // "login", "register", "app"

    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [registerData, setRegisterData] = useState({ username: '', password: '' });
    const [showRegister, setShowRegister] = useState(false);



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

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            const data = await res.json();
            if (res.ok) {
                alert('Konto utworzone! Zaloguj się.');
                setRegisterData({ username: '', password: '' });
                setShowRegister(false);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Błąd sieci');
        }
    };


    // ================= FETCH KATEGORII =================
    useEffect(() => {
        if (!token) return;
        fetch("http://localhost:3000/categories", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Błąd pobierania kategorii:", err));
    }, [token]);

    // ================= FETCH ZAKŁADEK =================
    useEffect(() => {
        if (!token || !selectedCategory) return;
        fetch(`http://localhost:3000/categories/${selectedCategory}/tabs`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setTabs(data))
            .catch(err => console.error("Błąd pobierania zakładek:", err));
    }, [token, selectedCategory]);

    // ================= FETCH REKORDÓW =================
    useEffect(() => {
        if (!token || !selectedTab) return;
        fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setRecords(data))
            .catch(err => console.error("Błąd pobierania rekordów:", err));
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

    // ================= USUWANIE REKORDU =================
    const handleDelete = async (id) => {
        const res = await fetch(`http://localhost:3000/records/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setRecords(records.filter(r => r.id !== id));
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
            <div style={{ padding: '20px' }}>
                <h1>Tracker wydatków</h1>
                <h2>{showRegister ? 'Rejestracja nowego konta' : 'Logowanie'}</h2>

                {showRegister ? (
                    <form onSubmit={handleRegisterSubmit}>
                        <input type="text" name="username" placeholder="Nazwa użytkownika"
                               value={registerData.username} onChange={handleRegisterChange} required />
                        <input type="password" name="password" placeholder="Hasło"
                               value={registerData.password} onChange={handleRegisterChange} required />
                        <button type="submit">Zarejestruj</button>
                        <br/><button type="button" onClick={() => setShowRegister(false)}>Mam konto</button>
                    </form>
                ) : (
                    <form onSubmit={handleLoginSubmit}>
                        <input type="text" name="username" placeholder="Login"
                               value={loginData.username} onChange={handleLoginChange} required />
                        <input type="password" name="password" placeholder="Hasło"
                               value={loginData.password} onChange={handleLoginChange} required />
                        <button type="submit">Zaloguj</button>
                        <br/><button type="button" onClick={() => setShowRegister(true)}>Utwórz konto</button>
                    </form>
                )}
            </div>
        );
    }



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
                    <ul style={{ listStyle: "none", padding: 0 }}>
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
                        <button type="submit">Dodaj</button>
                    </form>
                </>
            )}
        </div>
    );
}

export default App;
