import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { api, messageOf, User, Transaction, Summary } from "./api";
import "./style.css";

const money = (n: number) =>
  new Intl.NumberFormat("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    n,
  );
const date = (v: string) =>
  new Date(v).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
function useAuth() {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("finance_tracker_token"))
      return setLoading(false);
    api
      .get("/auth/profile")
      .then((r) => setUser(r.data.data))
      .catch(() => localStorage.removeItem("finance_tracker_token"))
      .finally(() => setLoading(false));
  }, []);
  const login = async (email: string, password: string) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("finance_tracker_token", r.data.token);
    setUser(r.data.user);
  };
  const register = async (name: string, email: string, password: string) => {
    await api.post("/auth/register", { name, email, password });
    await login(email, password);
  };
  const logout = () => {
    localStorage.removeItem("finance_tracker_token");
    setUser(null);
  };
  return { user, loading, login, register, logout };
}
const AuthContext = React.createContext<ReturnType<typeof useAuth> | null>(
  null,
);
const useAuthContext = () => React.useContext(AuthContext)!;
function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthContext();
  return (
    <div className="shell">
      <aside>
        <div className="brand">
          Fin<span>Track</span>
        </div>
        <nav>
          <Link to="/dashboard">Overview</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/profile">Profile</Link>
          {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
        </nav>
        <button className="ghost" onClick={logout}>
          Log out
        </button>
      </aside>
      <main>
        <header>
          <div>
            <small>PERSONAL FINANCE</small>
            <h1>Good to see you, {user?.name?.split(" ")[0]}</h1>
          </div>
          <div className="avatar">{user?.name?.[0]}</div>
        </header>
        {children}
      </main>
    </div>
  );
}
function Guard({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading } = useAuthContext();
  if (loading) return <div className="center">Loading your account…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "ADMIN")
    return (
      <div className="center">
        <h2>Access denied</h2>
        <Link to="/dashboard">Return to dashboard</Link>
      </div>
    );
  return <Layout>{children}</Layout>;
}
function Auth({ register = false }) {
  const { user, login, register: signup } = useAuthContext();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" />;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      register
        ? await signup(form.name, form.email, form.password)
        : await login(form.email, form.password);
      nav("/dashboard");
    } catch (x) {
      setError(messageOf(x));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth">
      <div className="auth-card">
        <div className="brand">
          Fin<span>Track</span>
        </div>
        <h2>{register ? "Create your account" : "Welcome back"}</h2>
        <p className="muted">
          {register
            ? "Start understanding your money."
            : "Your financial overview, at a glance."}
        </p>
        <form autoComplete="off" onSubmit={submit}>
          {register && (
            <input
              autoComplete="off"
              required
              minLength={2}
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            autoComplete="off"
            required
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            autoComplete="new-password"
            required
            minLength={register ? 8 : 1}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <div className="error">{error}</div>}
          <button disabled={busy}>
            {busy
              ? register
                ? "Creating…"
                : "Logging in…"
              : register
                ? "Create account"
                : "Log in"}
          </button>
        </form>
        <p className="switch">
          {register ? "Already have an account? " : "New to FinTrack? "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
function Dashboard() {
  const [tx, setTx] = useState<Transaction[]>([]),
    [summary, setSummary] = useState<Summary | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      api.get("/transactions?limit=5"),
      api.get(
        "/transactions/monthly-summary?month=" +
          new Date().toISOString().slice(0, 7),
      ),
    ])
      .then(([a, b]) => {
        setTx(a.data.data);
        setSummary(b.data.data);
      })
      .catch((e) => setError(messageOf(e)));
  }, []);
  return (
    <>
      <section className="grid">
        {[
          ["Income", summary?.totalIncome || 0, "positive"],
          ["Expenses", summary?.totalExpense || 0, "negative"],
          ["Balance", summary?.balance || 0, "accent"],
        ].map((x) => (
          <div className="card" key={x[0] as string}>
            <small>{x[0]}</small>
            <strong className={x[2] as string}>{money(x[1] as number)}</strong>
            <span>This month</span>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>Recent transactions</h2>
          <Link to="/transactions">View all</Link>
        </div>
        {error ? (
          <div className="error">{error}</div>
        ) : tx.length ? (
          <div className="list">
            {tx.map((t) => (
              <div className="row" key={t.id}>
                <div className="dot">{t.title[0]}</div>
                <div>
                  <b>{t.title}</b>
                  <small>
                    {t.category} · {date(t.date)}
                  </small>
                </div>
                <strong className={t.type}>
                  {t.type === "income" ? "+" : "−"}
                  {money(t.amount)}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            No transactions yet.{" "}
            <Link to="/transactions/new">Add your first one</Link>.
          </div>
        )}
      </section>
    </>
  );
}
function Transactions() {
  const [items, setItems] = useState<Transaction[]>([]),
    [search, setSearch] = useState(""),
    [error, setError] = useState("");
  const load = () =>
    api
      .get(
        "/transactions?limit=100" +
          (search ? "&search=" + encodeURIComponent(search) : ""),
      )
      .then((r) => setItems(r.data.data))
      .catch((e) => setError(messageOf(e)));
  useEffect(() => {
    load();
  }, []);
  const remove = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete("/transactions/" + id);
      load();
    } catch (e) {
      setError(messageOf(e));
    }
  };
  return (
    <>
      <div className="page-head">
        <div>
          <h2>Transactions</h2>
          <p className="muted">Track every movement in your money.</p>
        </div>
        <Link className="button" to="/transactions/new">
          + Add transaction
        </Link>
      </div>
      <div className="toolbar">
        <input
          placeholder="Search transactions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button className="secondary" onClick={load}>
          Search
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <section className="panel">
        <div className="table">
          {items.map((t) => (
            <div className="row" key={t.id}>
              <div className="dot">{t.title[0]}</div>
              <div>
                <b>{t.title}</b>
                <small>
                  {t.category} · {date(t.date)}
                </small>
              </div>
              <strong className={t.type}>
                {t.type === "income" ? "+" : "−"}
                {money(t.amount)}
              </strong>
              <Link to={"/transactions/" + t.id + "/edit"}>Edit</Link>
              <button className="link danger" onClick={() => remove(t.id)}>
                Delete
              </button>
            </div>
          ))}
          {!items.length && (
            <div className="empty">No matching transactions.</div>
          )}
        </div>
      </section>
    </>
  );
}
function TransactionForm({ id }: { id?: string }) {
  const nav = useNavigate();
  const [cats, setCats] = useState<string[]>([]),
    [form, setForm] = useState<any>({
      title: "",
      amount: "",
      type: "expense",
      category: "",
      date: new Date().toISOString().slice(0, 10),
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data.data));
    if (id)
      api.get("/transactions?limit=100").then((r) => {
        const t = r.data.data.find((x: Transaction) => x.id === id);
        if (t)
          setForm({
            ...t,
            amount: String(t.amount),
            date: t.date.slice(0, 10),
          });
      });
  }, [id]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...form, amount: Number(form.amount) };
      if (id) await api.put("/transactions/" + id, body);
      else await api.post("/transactions", body);
      nav("/transactions");
    } catch (x) {
      setError(messageOf(x));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel form-panel">
      <h2>{id ? "Edit" : "Add"} transaction</h2>
      <form onSubmit={submit}>
        <label>
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>
        <label>
          Amount
          <input
            required
            min="0"
            step="0.01"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </label>
        <div className="two">
          <label>
            Type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label>
            Date
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
        </div>
        <label>
          Category
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        {error && <div className="error">{error}</div>}
        <div>
          <button disabled={busy}>
            {busy ? "Saving…" : "Save transaction"}
          </button>{" "}
          <Link className="button secondary" to="/transactions">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
function Categories() {
  const [cats, setCats] = useState<string[]>([]);
  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data.data));
  }, []);
  return (
    <section className="panel">
      <h2>Categories</h2>
      <div className="chips">
        {cats.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </section>
  );
}
function Profile() {
  const { user } = useAuthContext();
  const [file, setFile] = useState<File | null>(null),
    [message, setMessage] = useState("");
  const upload = async () => {
    if (!file) return;
    const f = new FormData();
    f.append("profilePicture", file);
    try {
      await api.post("/upload/profile-picture", f);
      setMessage("Profile picture uploaded successfully.");
    } catch (e) {
      setMessage(messageOf(e));
    }
  };
  return (
    <section className="panel profile">
      <h2>Your profile</h2>
      {user?.profilePicture && <img src={user.profilePicture} />}
      <p>
        <b>Name</b>
        {user?.name}
      </p>
      <p>
        <b>Email</b>
        {user?.email}
      </p>
      <p>
        <b>Role</b>
        {user?.role}
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={upload} disabled={!file}>
        Upload picture
      </button>
      {message && <p className="muted">{message}</p>}
    </section>
  );
}
function Admin() {
  const [data, setData] = useState<any>();
  useEffect(() => {
    api.get("/admin/overview").then((r) => setData(r.data.data));
  }, []);
  return (
    <section className="panel">
      <h2>Admin overview</h2>
      {data && (
        <div className="grid">
          <div className="card">
            <small>Total users</small>
            <strong>{data.totalUsers}</strong>
          </div>
          <div className="card">
            <small>Total transactions</small>
            <strong>{data.totalTransactions}</strong>
          </div>
          <div className="card">
            <small>Total income</small>
            <strong className="positive">{money(data.totalIncome)}</strong>
          </div>
          <div className="card">
            <small>Total expenses</small>
            <strong className="negative">{money(data.totalExpenses)}</strong>
          </div>
        </div>
      )}
    </section>
  );
}
function App() {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth register />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <Guard>
              <Dashboard />
            </Guard>
          }
        />
        <Route
          path="/transactions"
          element={
            <Guard>
              <Transactions />
            </Guard>
          }
        />
        <Route
          path="/transactions/new"
          element={
            <Guard>
              <TransactionForm />
            </Guard>
          }
        />
        <Route
          path="/transactions/:id/edit"
          element={
            <Guard>
              <TransactionForm id={useLocation().pathname.split("/")[2]} />
            </Guard>
          }
        />
        <Route
          path="/categories"
          element={
            <Guard>
              <Categories />
            </Guard>
          }
        />
        <Route
          path="/profile"
          element={
            <Guard>
              <Profile />
            </Guard>
          }
        />
        <Route
          path="/admin"
          element={
            <Guard admin>
              <Admin />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthContext.Provider>
  );
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
