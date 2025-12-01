import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function App() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState("login");

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "" });

  const [categories, setCategories] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [records, setRecords] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTab, setSelectedTab] = useState(null);

  const [formData, setFormData] = useState({ title: "", amount: "", quantity: "", details: "" });
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
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setView("app");
        setRegisterData({ username: "", password: "" });
      } else {
        alert(data.error || "Błąd rejestracji");
      }
    } catch {
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
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setView("app");
        setLoginData({ username: "", password: "" });
      } else {
        alert("Błąd logowania");
      }
    } catch {
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
    fetch("http://localhost:3000/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error(err));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedCategory) return;
    fetch(`http://localhost:3000/categories/${selectedCategory}/tabs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setTabs)
      .catch((err) => console.error(err));
  }, [token, selectedCategory]);

  useEffect(() => {
    if (!token || !selectedTab) return;
    fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setRecords)
      .catch((err) => console.error(err));
  }, [token, selectedTab]);

  // ================= OBSŁUGA =================
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTab) return;
    try {
      const res = await fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newRecords = await fetch(`http://localhost:3000/tabs/${selectedTab}/records`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());
        setRecords(newRecords);
        setFormData({ title: "", amount: "", quantity: "", details: "" });
      }
    } catch {
      alert("Błąd dodawania rekordu");
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/records/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRecords(records.filter((r) => r.id !== id));
    } catch {
      alert("Błąd usuwania rekordu");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategory }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories([...categories, data]);
        setNewCategory("");
      }
    } catch {
      alert("Błąd dodawania kategorii");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        if (selectedCategory === id) {
          setSelectedCategory(null);
          setTabs([]);
          setRecords([]);
        }
      }
    } catch {
      alert("Błąd usuwania kategorii");
    }
  };

  const handleAddTab = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      const res = await fetch(`http://localhost:3000/categories/${selectedCategory}/tabs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTab }),
      });
      if (res.ok) {
        const data = await res.json();
        setTabs([...tabs, data]);
        setNewTab("");
      }
    } catch {
      alert("Błąd dodawania zakładki");
    }
  };

  const handleDeleteTab = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/tabs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTabs(tabs.filter((t) => t.id !== id));
        if (selectedTab === id) {
          setSelectedTab(null);
          setRecords([]);
        }
      }
    } catch {
      alert("Błąd usuwania zakładki");
    }
  };

  // ================= RENDER =================
  const formPaper = { p: 3, mb: 3, boxShadow: 3, borderRadius: 2, bgcolor: "#f9f9f9" };
  const sectionTitle = { mt: 3, mb: 2, color: "#1976d2" };

  if (view === "register") {
    return (
      <Container maxWidth={false} sx={{ width: "100%", minWidth: 1200, mt: 5, px: 3 }}>
        <Paper sx={{ p: 4, textAlign: "center", boxShadow: 4 }}>
          <Typography variant="h4" mb={3} color="#1976d2">
            📊 Tracker wydatków – Rejestracja
          </Typography>
          <Box component="form" onSubmit={handleRegisterSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField label="Login" name="username" value={registerData.username} onChange={handleRegisterChange} fullWidth required />
            <TextField label="Hasło" name="password" type="password" value={registerData.password} onChange={handleRegisterChange} fullWidth required />
            <Button type="submit" variant="contained" size="large">Zarejestruj się</Button>
            <Button onClick={() => setView("login")} color="secondary">Masz już konto? Zaloguj się</Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (view === "login") {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Paper sx={{ p: 4, textAlign: "center", boxShadow: 4 }}>
          <Typography variant="h4" mb={3} color="#1976d2">
            📊 Tracker wydatków – Logowanie
          </Typography>
          <Box component="form" onSubmit={handleLoginSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField label="Login" name="username" value={loginData.username} onChange={handleLoginChange} fullWidth required />
            <TextField label="Hasło" name="password" type="password" value={loginData.password} onChange={handleLoginChange} fullWidth required />
            <Button type="submit" variant="contained" size="large">Zaloguj</Button>
            <Button onClick={() => setView("register")} color="secondary">Nie masz konta? Zarejestruj się</Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ width: "100%", minWidth: 1200, mt: 5, px: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="#1976d2">📊 Tracker wydatków</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>🚪 Wyloguj</Button>
      </Box>

      {/* Kategorie */}
      <Typography variant="h5" sx={sectionTitle}>Kategorie</Typography>
      <Paper sx={formPaper}>
        <Box component="form" onSubmit={handleAddCategory} display="flex" gap={2}>
          <TextField label="Nowa kategoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} fullWidth required />
          <Button type="submit" variant="contained">➕ Dodaj</Button>
        </Box>
        <List>
          {categories.map((c) => (
            <ListItem key={c.id} secondaryAction={
              <IconButton edge="end" color="error" onClick={() => handleDeleteCategory(c.id)}><DeleteIcon /></IconButton>
            }>
              <Button variant={selectedCategory === c.id ? "contained" : "text"} onClick={() => { setSelectedCategory(c.id); setSelectedTab(null); setRecords([]); }}>
                📁 {c.name}
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Zakładki */}
      {selectedCategory && (
        <>
          <Typography variant="h5" sx={sectionTitle}>Zakładki</Typography>
          <Paper sx={formPaper}>
            <Box component="form" onSubmit={handleAddTab} display="flex" gap={2} mb={2}>
              <TextField label="Nowa zakładka" value={newTab} onChange={(e) => setNewTab(e.target.value)} fullWidth required />
              <Button type="submit" variant="contained">➕ Dodaj</Button>
            </Box>
            <List>
              {tabs.map((t) => (
                <ListItem key={t.id} secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => handleDeleteTab(t.id)}><DeleteIcon /></IconButton>
                }>
                  <Button variant={selectedTab === t.id ? "contained" : "text"} onClick={() => setSelectedTab(t.id)}>
                    📋 {t.name}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}

      {/* Rekordy */}
      {selectedTab && (
        <>
          <Typography variant="h5" sx={sectionTitle}>Rekordy</Typography>
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            {records.map((r) => (
              <Paper key={r.id} sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: 2 }}>
                <Box>
                  <Typography variant="subtitle1">{r.title} – {r.amount} zł {r.quantity > 0 ? `(${r.quantity}x)` : ""}</Typography>
                  {r.details && <Typography variant="body2" color="text.secondary">{r.details}</Typography>}
                </Box>
                <IconButton color="error" onClick={() => handleDeleteRecord(r.id)}><DeleteIcon /></IconButton>
              </Paper>
            ))}
          </Box>

          <Typography variant="h6" mb={1}>Dodaj rekord</Typography>
          <Paper sx={formPaper}>
            <Box component="form" onSubmit={handleSubmit} display="grid" gridTemplateColumns="repeat(4, 1fr) auto" gap={2}>
              <TextField label="Tytuł" name="title" value={formData.title} onChange={handleChange} required />
              <TextField label="Kwota" type="number" name="amount" value={formData.amount} onChange={handleChange} required />
              <TextField label="Ilość" type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
              <TextField label="Szczegóły" name="details" value={formData.details} onChange={handleChange} />
              <Button type="submit" variant="contained">➕ Dodaj</Button>
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default App;
