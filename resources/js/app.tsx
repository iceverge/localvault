import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    ArrowDownUp,
    ArrowRight,
    BriefcaseBusiness,
    Check,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    Code2,
    Copy,
    Database,
    Ellipsis,
    ExternalLink,
    Eye,
    EyeOff,
    Fingerprint,
    Folder,
    Globe,
    KeyRound,
    LayoutGrid,
    List,
    LoaderCircle,
    LockKeyhole,
    Menu,
    Monitor,
    Plus,
    RefreshCw,
    Search,
    Shield,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Star,
    Trash2,
    UserRound,
    Users,
    Wallet,
    WandSparkles,
    X,
} from "lucide-react";
import {
    defaultOptions,
    passwordPrefix,
    minimumPasswordLength,
    generatePassword,
    passwordStrength,
    type GeneratorOptions,
} from "./password";
import "../css/app.css";

type Account = {
    id: number;
    site: string;
    url: string | null;
    username: string | null;
    email: string | null;
    category: string;
    notes: string | null;
    favorite: boolean;
    updated_at: string;
    created_at: string;
};
type Form = {
    site: string;
    url: string;
    username: string;
    email: string;
    password: string;
    category: string;
    notes: string;
    favorite: boolean;
};
const categories = [
    "Work",
    "Personal",
    "Finance",
    "Social",
    "Development",
    "Other",
];
const categoryIcons = [
    BriefcaseBusiness,
    UserRound,
    Wallet,
    Users,
    Code2,
    Folder,
];
const emptyForm: Form = {
    site: "",
    url: "",
    username: "",
    email: "",
    password: "",
    category: "Personal",
    notes: "",
    favorite: false,
};
async function api<T>(
    path: string,
    method = "GET",
    data?: unknown,
): Promise<T> {
    const response = await fetch(`/api/${path}`, {
        method,
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.querySelector<HTMLMetaElement>(
                'meta[name="csrf-token"]',
            )!.content,
        },
        body: data === undefined ? undefined : JSON.stringify(data),
        cache: "no-store",
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            response.status === 419
                ? "Your session expired. Refresh the page and try again."
                : Object.values(error.errors ?? {})
                      .flat()
                      .join(" ") ||
                      error.message ||
                      "Something went wrong. Please try again.",
        );
    }
    return response.status === 204 ? (undefined as T) : response.json();
}
function hostname(url: string | null) {
    try {
        return new URL(url!).hostname.replace(/^www\./, "");
    } catch {
        return "No website added";
    }
}
function dateLabel(date: string) {
    return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
function SiteIcon({ account }: { account: Account }) {
    const Icon = categoryIcons[categories.indexOf(account.category)] ?? Globe;
    return (
        <span
            className={`site-icon tone-${categories.indexOf(account.category)}`}
        >
            <Icon size={21} strokeWidth={1.7} />
        </span>
    );
}
function App() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [view, setView] = useState("All accounts");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All categories");
    const [sort, setSort] = useState("updated");
    const [layout, setLayout] = useState("list");
    const [modal, setModal] = useState<
        "account" | "generator" | "about" | null
    >(null);
    const [editing, setEditing] = useState<Account | null>(null);
    const [form, setForm] = useState<Form>(emptyForm);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");
    const [deleting, setDeleting] = useState<Account | null>(null);
    const [options, setOptions] = useState<GeneratorOptions>(defaultOptions);
    const [generated, setGenerated] = useState(() =>
        generatePassword(defaultOptions),
    );
    const [revealed, setRevealed] = useState<Record<number, string>>({});
    const [mobileNav, setMobileNav] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const deleteRef = useRef<HTMLDialogElement>(null);
    async function load() {
        setLoading(true);
        setLoadError("");
        try {
            setAccounts(await api<Account[]>("accounts"));
        } catch (e) {
            setLoadError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        void load();
    }, []);
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(""), 3500);
            return () => clearTimeout(timer);
        }
    }, [toast]);
    useEffect(() => {
        if (modal) dialogRef.current?.showModal();
        else dialogRef.current?.close();
    }, [modal]);
    useEffect(() => {
        if (deleting) deleteRef.current?.showModal();
        else deleteRef.current?.close();
    }, [deleting]);
    useEffect(() => {
        const keydown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", keydown);
        return () => window.removeEventListener("keydown", keydown);
    }, []);
    useEffect(() => {
        const clear = () => setRevealed({});
        document.addEventListener("visibilitychange", clear);
        return () => document.removeEventListener("visibilitychange", clear);
    }, []);
    useEffect(() => {
        if (Object.keys(revealed).length) {
            const timer = setTimeout(() => setRevealed({}), 15000);
            return () => clearTimeout(timer);
        }
    }, [revealed]);
    function closeModal() {
        setModal(null);
        setForm(emptyForm);
        setShowPassword(false);
        setError("");
    }
    function openAccount(account?: Account) {
        setEditing(account ?? null);
        setForm(
            account
                ? {
                      site: account.site,
                      url: account.url ?? "",
                      username: account.username ?? "",
                      email: account.email ?? "",
                      password: "",
                      category: account.category,
                      notes: account.notes ?? "",
                      favorite: account.favorite,
                  }
                : { ...emptyForm },
        );
        setError("");
        setShowPassword(false);
        setModal("account");
    }
    function navigate(next: string) {
        setView(next);
        setCategory("All categories");
        setSearch("");
        setMobileNav(false);
    }
    async function save(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const data: Partial<Form> = { ...form };
            if (editing && !data.password) delete data.password;
            const account = await api<Account>(
                editing ? `accounts/${editing.id}` : "accounts",
                editing ? "PUT" : "POST",
                data,
            );
            setAccounts((current) => [
                account,
                ...current.filter((a) => a.id !== account.id),
            ]);
            setRevealed({});
            closeModal();
            setToast(
                editing
                    ? "Account updated successfully"
                    : "Account added to your vault",
            );
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    }
    async function favorite(account: Account) {
        try {
            const updated = await api<Account>(
                `accounts/${account.id}/favorite`,
                "PATCH",
                { favorite: !account.favorite },
            );
            setAccounts((current) =>
                current.map((a) => (a.id === updated.id ? updated : a)),
            );
        } catch (e) {
            setToast((e as Error).message);
        }
    }
    async function copy(value: string, label = "Password") {
        try {
            await navigator.clipboard.writeText(value);
            setToast(`${label} copied to clipboard`);
        } catch {
            setToast(
                "Clipboard access is unavailable. Use the reveal button to select and copy.",
            );
        }
    }
    async function reveal(account: Account, copyOnly = false) {
        try {
            const { password } = await api<{ password: string }>(
                `accounts/${account.id}/reveal`,
                "POST",
            );
            if (copyOnly) await copy(password);
            else
                setRevealed((current) => ({
                    ...current,
                    [account.id]: password,
                }));
        } catch (e) {
            setToast((e as Error).message);
        }
    }
    async function remove() {
        if (!deleting) return;
        setSaving(true);
        try {
            await api(`accounts/${deleting.id}`, "DELETE");
            setAccounts((current) =>
                current.filter((a) => a.id !== deleting.id),
            );
            setRevealed({});
            setDeleting(null);
            closeModal();
            setToast("Account deleted");
        } catch (e) {
            setToast((e as Error).message);
        } finally {
            setSaving(false);
        }
    }
    function regenerate(next = options) {
        try {
            setGenerated(generatePassword(next));
            setError("");
        } catch (e) {
            setError((e as Error).message);
        }
    }
    const filtered = accounts
        .filter(
            (a) =>
                (view !== "Favorites" || a.favorite) &&
                (!categories.includes(view) || a.category === view) &&
                (category === "All categories" || a.category === category) &&
                `${a.site} ${a.url ?? ""} ${a.username ?? ""} ${a.email ?? ""}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
            sort === "name"
                ? a.site.localeCompare(b.site)
                : sort === "oldest"
                  ? a.updated_at.localeCompare(b.updated_at)
                  : b.updated_at.localeCompare(a.updated_at),
        );
    const favorites = accounts.filter((a) => a.favorite).length;
    const recent = accounts.filter(
        (a) => Date.now() - new Date(a.created_at).getTime() < 7 * 86400000,
    ).length;
    const strength = passwordStrength(form.password);
    return (
        <div className="app-shell">
            {mobileNav && (
                <div
                    className="nav-scrim"
                    onClick={() => setMobileNav(false)}
                />
            )}
            <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
                <a className="brand" href="/">
                    <span className="brand-symbol">
                        <Shield size={24} />
                        <KeyRound size={11} />
                    </span>
                    LocalVault<span className="brand-dot">.</span>
                </a>
                <div className="workspace">
                    <div className="workspace-icon">
                        <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                        <strong>Personal workspace</strong>
                        <span>Local environment</span>
                    </div>
                    <span className="online-dot" />
                </div>
                <p className="nav-label">WORKSPACE</p>
                <nav>
                    <button
                        className={view === "All accounts" ? "active" : ""}
                        onClick={() => navigate("All accounts")}
                    >
                        <LayoutGrid size={18} />
                        All accounts
                        <span className="nav-count">{accounts.length}</span>
                    </button>
                    <button
                        className={view === "Favorites" ? "active" : ""}
                        onClick={() => navigate("Favorites")}
                    >
                        <Star size={18} />
                        Favorites<span className="nav-count">{favorites}</span>
                    </button>
                    <button
                        onClick={() => {
                            setError("");
                            setModal("generator");
                        }}
                    >
                        <WandSparkles size={18} />
                        Password generator
                        <ChevronRight size={14} className="nav-arrow" />
                    </button>
                </nav>
                <div className="nav-label category-heading">
                    CATEGORIES<span>{categories.length}</span>
                </div>
                <nav className="category-nav">
                    {categories.map((cat, index) => {
                        const Icon = categoryIcons[index];
                        return (
                            <button
                                key={cat}
                                className={view === cat ? "active" : ""}
                                onClick={() => navigate(cat)}
                            >
                                <Icon size={17} />
                                {cat}
                                <span className="nav-count">
                                    {
                                        accounts.filter(
                                            (a) => a.category === cat,
                                        ).length
                                    }
                                </span>
                            </button>
                        );
                    })}
                </nav>
                <div className="sidebar-bottom">
                    <div className="local-note">
                        <ShieldCheck size={20} />
                        <strong>Yours. And only yours.</strong>
                        <p>
                            Your credentials, stored locally.
                            <br />
                            Always within reach.
                        </p>
                        <span>
                            <span className="online-dot" /> LOCAL STORAGE ACTIVE
                        </span>
                    </div>
                    <button
                        className="help-button"
                        onClick={() => setModal("about")}
                    >
                        <CircleHelp size={17} />
                        About your vault
                        <ExternalLink size={14} />
                    </button>
                    <div className="profile">
                        <span>ME</span>
                        <div>
                            <strong>My workspace</strong>
                            <small>Personal account vault</small>
                        </div>
                        <Monitor size={17} />
                    </div>
                </div>
            </aside>
            <div className="main-shell">
                <header className="topbar">
                    <div className="breadcrumb">
                        <button
                            className="icon-button mobile-menu"
                            aria-label="Open navigation"
                            onClick={() => setMobileNav(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <span>Workspace</span>
                        <ChevronRight size={14} />
                        <strong>{view}</strong>
                    </div>
                    <div className="topbar-right">
                        <span className="local-badge">
                            <span className="online-dot" />
                            Local only
                        </span>
                        <span className="topbar-divider" />
                        <span className="avatar">ME</span>
                    </div>
                </header>
                <main>
                    <div className="page-heading">
                        <div>
                            <div className="eyebrow">
                                YOUR PRIVATE WORKSPACE
                            </div>
                            <h1>
                                {view === "All accounts"
                                    ? "A place for every account."
                                    : view === "Favorites"
                                      ? "Your everyday essentials."
                                      : `${view}, organized.`}
                            </h1>
                            <p>
                                Keep your credentials organized, secure, and
                                close at hand.
                            </p>
                        </div>
                        <button
                            className="button primary"
                            onClick={() => openAccount()}
                        >
                            <Plus size={18} />
                            Add account
                        </button>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div>
                                <span>Total accounts</span>
                                <strong>
                                    {loading ? "—" : accounts.length}
                                    <small>in your vault</small>
                                </strong>
                            </div>
                            <span className="stat-icon">
                                <LayersIcon />
                            </span>
                        </div>
                        <div className="stat-card">
                            <div>
                                <span>Favorites</span>
                                <strong>
                                    {loading ? "—" : favorites}
                                    <small>quick access</small>
                                </strong>
                            </div>
                            <span className="stat-icon gold">
                                <Star size={21} />
                            </span>
                        </div>
                        <div className="stat-card">
                            <div>
                                <span>Recently added</span>
                                <strong>
                                    {loading ? "—" : recent}
                                    <small>in the last 7 days</small>
                                </strong>
                            </div>
                            <span className="stat-icon violet">
                                <Sparkles size={21} />
                            </span>
                        </div>
                        <div className="stat-card storage-stat">
                            <div>
                                <span>Storage status</span>
                                <strong>
                                    <span className="online-dot" />
                                    On device
                                </strong>
                                <small>
                                    <LockKeyhole size={12} />
                                    Encrypted passwords
                                </small>
                            </div>
                            <span className="stat-icon green">
                                <Database size={21} />
                            </span>
                        </div>
                    </div>
                    <section className="vault-section">
                        <div className="section-title">
                            <div>
                                <h2>
                                    {view}
                                    <span>{filtered.length}</span>
                                </h2>
                                <p>
                                    {view === "Favorites"
                                        ? "The accounts you reach for most."
                                        : "A little order for your digital life."}
                                </p>
                            </div>
                            <div className="layout-toggle">
                                <button
                                    aria-label="List view"
                                    className={
                                        layout === "list" ? "selected" : ""
                                    }
                                    onClick={() => setLayout("list")}
                                >
                                    <List size={17} />
                                </button>
                                <button
                                    aria-label="Grid view"
                                    className={
                                        layout === "grid" ? "selected" : ""
                                    }
                                    onClick={() => setLayout("grid")}
                                >
                                    <LayoutGrid size={17} />
                                </button>
                            </div>
                        </div>
                        <div className="toolbar">
                            <label className="search-box">
                                <Search size={18} />
                                <input
                                    ref={searchRef}
                                    placeholder="Search accounts, usernames, or emails..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    aria-label="Search accounts"
                                />
                                <kbd>⌘ K</kbd>
                            </label>
                            <div className="filters">
                                <label className="select-wrap">
                                    <SlidersHorizontal size={15} />
                                    <select
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(e.target.value)
                                        }
                                        aria-label="Filter category"
                                    >
                                        <option>All categories</option>
                                        {categories.map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={13} />
                                </label>
                                <label className="select-wrap sort-select">
                                    <ArrowDownUp size={15} />
                                    <select
                                        value={sort}
                                        onChange={(e) =>
                                            setSort(e.target.value)
                                        }
                                        aria-label="Sort accounts"
                                    >
                                        <option value="updated">
                                            Last updated
                                        </option>
                                        <option value="name">Name A–Z</option>
                                        <option value="oldest">
                                            Oldest updated
                                        </option>
                                    </select>
                                    <ChevronDown size={13} />
                                </label>
                            </div>
                        </div>
                        {loading ? (
                            <div className="empty-state">
                                <LoaderCircle className="spin" size={28} />
                                <h3>Opening your vault…</h3>
                            </div>
                        ) : loadError ? (
                            <div className="empty-state">
                                <Database size={28} />
                                <h3>Couldn’t open your vault</h3>
                                <p>{loadError}</p>
                                <button
                                    className="button"
                                    onClick={() => void load()}
                                >
                                    <RefreshCw size={16} />
                                    Try again
                                </button>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-illustration">
                                    <span className="orbit orbit-one" />
                                    <span className="orbit orbit-two" />
                                    <span className="empty-key">
                                        <KeyRound size={32} strokeWidth={1.5} />
                                    </span>
                                    <span className="floating-lock">
                                        <LockKeyhole size={15} />
                                    </span>
                                    <span className="floating-star">
                                        <Star size={13} />
                                    </span>
                                </div>
                                <span className="empty-eyebrow">
                                    {accounts.length === 0
                                        ? "A FRESH START"
                                        : "KEEP THINGS ORGANIZED"}
                                </span>
                                <h3>
                                    {accounts.length === 0
                                        ? "Your digital life, all together."
                                        : "No accounts found."}
                                </h3>
                                <p>
                                    {accounts.length === 0 ? (
                                        <>
                                            Bring your logins into one private,
                                            organized space.
                                            <br />
                                            Add your first account to make
                                            yourself at home.
                                        </>
                                    ) : (
                                        "Try another search or add an account to this collection."
                                    )}
                                </p>
                                <button
                                    className="button primary"
                                    onClick={() => openAccount()}
                                >
                                    <Plus size={17} />
                                    {accounts.length === 0
                                        ? "Add your first account"
                                        : "Add account"}
                                </button>
                                {accounts.length === 0 && (
                                    <span className="empty-footnote">
                                        <ShieldCheck size={13} />
                                        Stored on your device. No sign-in
                                        required.
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div
                                className={
                                    layout === "grid"
                                        ? "account-grid"
                                        : "table-scroll"
                                }
                            >
                                {layout === "list" ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ACCOUNT</th>
                                                <th>USERNAME / EMAIL</th>
                                                <th>CATEGORY</th>
                                                <th>LAST UPDATED</th>
                                                <th>
                                                    <span className="sr-only">
                                                        Actions
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((account) => (
                                                <tr key={account.id}>
                                                    <td>
                                                        <button
                                                            className="account-name"
                                                            onClick={() =>
                                                                openAccount(
                                                                    account,
                                                                )
                                                            }
                                                        >
                                                            <SiteIcon
                                                                account={
                                                                    account
                                                                }
                                                            />
                                                            <span>
                                                                <strong>
                                                                    {
                                                                        account.site
                                                                    }
                                                                </strong>
                                                                <small>
                                                                    {hostname(
                                                                        account.url,
                                                                    )}
                                                                </small>
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div className="credential">
                                                            <span>
                                                                {account.username ||
                                                                    account.email ||
                                                                    "—"}
                                                            </span>
                                                            <small>
                                                                {account.username
                                                                    ? account.email
                                                                    : ""}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`category-pill tone-${categories.indexOf(account.category)}`}
                                                        >
                                                            {account.category}
                                                        </span>
                                                    </td>
                                                    <td className="date-cell">
                                                        {dateLabel(
                                                            account.updated_at,
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="row-actions">
                                                            <button
                                                                className={`icon-button ${account.favorite ? "is-favorite" : ""}`}
                                                                aria-label={`${account.favorite ? "Unfavorite" : "Favorite"} ${account.site}`}
                                                                onClick={() =>
                                                                    void favorite(
                                                                        account,
                                                                    )
                                                                }
                                                            >
                                                                <Star
                                                                    size={16}
                                                                    fill={
                                                                        account.favorite
                                                                            ? "currentColor"
                                                                            : "none"
                                                                    }
                                                                />
                                                            </button>
                                                            <button
                                                                className="icon-button"
                                                                aria-label={`Copy ${account.site} password`}
                                                                onClick={() =>
                                                                    void reveal(
                                                                        account,
                                                                        true,
                                                                    )
                                                                }
                                                            >
                                                                <Copy
                                                                    size={16}
                                                                />
                                                            </button>
                                                            <button
                                                                className="icon-button"
                                                                aria-label={`Edit ${account.site}`}
                                                                onClick={() =>
                                                                    openAccount(
                                                                        account,
                                                                    )
                                                                }
                                                            >
                                                                <Ellipsis
                                                                    size={19}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    filtered.map((account) => (
                                        <article
                                            className="account-card"
                                            key={account.id}
                                        >
                                            <div className="card-top">
                                                <SiteIcon account={account} />
                                                <button
                                                    className={`icon-button ${account.favorite ? "is-favorite" : ""}`}
                                                    aria-label={`Favorite ${account.site}`}
                                                    onClick={() =>
                                                        void favorite(account)
                                                    }
                                                >
                                                    <Star
                                                        size={17}
                                                        fill={
                                                            account.favorite
                                                                ? "currentColor"
                                                                : "none"
                                                        }
                                                    />
                                                </button>
                                            </div>
                                            <button
                                                className="card-name"
                                                onClick={() =>
                                                    openAccount(account)
                                                }
                                            >
                                                {account.site}
                                            </button>
                                            <p>{hostname(account.url)}</p>
                                            <div className="card-credential">
                                                {account.username ||
                                                    account.email ||
                                                    "No username added"}
                                            </div>
                                            <div className="card-footer">
                                                <span
                                                    className={`category-pill tone-${categories.indexOf(account.category)}`}
                                                >
                                                    {account.category}
                                                </span>
                                                <button
                                                    className="icon-button"
                                                    aria-label={`Copy ${account.site} password`}
                                                    onClick={() =>
                                                        void reveal(
                                                            account,
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <Copy size={15} />
                                                </button>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        )}
                        <div className="table-footer">
                            <span>
                                {filtered.length
                                    ? `Showing ${filtered.length} of ${accounts.length} accounts`
                                    : "Your accounts will appear here"}
                            </span>
                            <span>
                                <LockKeyhole size={12} />
                                Private by design
                            </span>
                        </div>
                    </section>
                    <div className="bottom-grid">
                        <div className="generator-banner">
                            <span className="banner-icon">
                                <WandSparkles size={24} />
                            </span>
                            <div>
                                <span className="eyebrow">
                                    ONE LESS THING TO THINK ABOUT
                                </span>
                                <h3>Better passwords. Less effort.</h3>
                                <p>
                                    Create a strong, unique password in a single
                                    click.
                                </p>
                            </div>
                            <button
                                className="button"
                                onClick={() => {
                                    setError("");
                                    setModal("generator");
                                }}
                            >
                                Generate password
                                <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="privacy-card">
                            <Fingerprint size={30} strokeWidth={1.3} />
                            <div>
                                <strong>A quieter kind of security.</strong>
                                <p>
                                    No cloud sync. No subscriptions.
                                    <br />
                                    Just you and your vault.
                                </p>
                            </div>
                        </div>
                    </div>
                    <footer className="page-footer">
                        <span>
                            LocalVault <span>·</span> A private space for your
                            credentials.
                        </span>
                        <span>
                            <span className="online-dot" />
                            Made to stay local
                        </span>
                    </footer>
                </main>
            </div>
            <dialog
                ref={dialogRef}
                className={`modal ${modal === "account" ? "account-modal" : ""}`}
                onCancel={closeModal}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closeModal();
                }}
            >
                <div className="modal-heading">
                    <span className="modal-icon">
                        {modal === "generator" ? (
                            <WandSparkles size={21} />
                        ) : modal === "about" ? (
                            <ShieldCheck size={21} />
                        ) : (
                            <KeyRound size={21} />
                        )}
                    </span>
                    <button
                        className="icon-button"
                        aria-label="Close dialog"
                        onClick={closeModal}
                    >
                        <X size={20} />
                    </button>
                </div>
                {modal === "account" && (
                    <form onSubmit={save}>
                        <h2>
                            {editing ? "Account details" : "Add an account"}
                        </h2>
                        <p className="modal-description">
                            {editing
                                ? "Your credentials, right where you need them."
                                : "Give your credentials a place to call home."}
                        </p>
                        <div className="form-grid">
                            <label className="field full">
                                Site name <span>*</span>
                                <input
                                    autoFocus
                                    required
                                    maxLength={255}
                                    placeholder="e.g. GitHub"
                                    value={form.site}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            site: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <label className="field full">
                                Website URL
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={form.url}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            url: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <label className="field">
                                Username
                                <input
                                    maxLength={255}
                                    autoComplete="off"
                                    placeholder="Your username"
                                    value={form.username}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            username: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <label className="field">
                                Email address
                                <input
                                    type="email"
                                    maxLength={255}
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <div className="field full">
                                <div className="field-title">
                                    <label htmlFor="password">
                                        {editing ? "New password" : "Password"}
                                        {!editing && <span> *</span>}
                                    </label>
                                    <button
                                        type="button"
                                        className="text-button"
                                        onClick={() => {
                                            setForm({
                                                ...form,
                                                password:
                                                    generatePassword(options),
                                            });
                                            setShowPassword(true);
                                        }}
                                    >
                                        <WandSparkles size={13} />
                                        Generate
                                    </button>
                                </div>
                                <div className="password-input">
                                    <input
                                        id="password"
                                        autoComplete="new-password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required={!editing}
                                        maxLength={4096}
                                        value={form.password}
                                        placeholder={
                                            editing
                                                ? "Leave blank to keep current password"
                                                : "Enter or generate a password"
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password: e.target.value,
                                            })
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="icon-button"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                </div>
                                {form.password && (
                                    <div
                                        className={`strength strength-${strength.score}`}
                                    >
                                        <div>
                                            {[1, 2, 3, 4].map((n) => (
                                                <i
                                                    key={n}
                                                    className={
                                                        n <= strength.score
                                                            ? "filled"
                                                            : ""
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <span>{strength.label}</span>
                                    </div>
                                )}
                                {editing && (
                                    <div className="existing-password">
                                        <span className="secret">
                                            {revealed[editing.id] ??
                                                "••••••••••••"}
                                        </span>
                                        <button
                                            type="button"
                                            className="text-button"
                                            onClick={() => {
                                                if (revealed[editing.id])
                                                    setRevealed({});
                                                else void reveal(editing);
                                            }}
                                        >
                                            {revealed[editing.id] ? (
                                                <EyeOff size={14} />
                                            ) : (
                                                <Eye size={14} />
                                            )}
                                            Current password
                                        </button>
                                        <button
                                            type="button"
                                            className="icon-button"
                                            aria-label="Copy current password"
                                            onClick={() =>
                                                void reveal(editing, true)
                                            }
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <label className="field">
                                Category
                                <select
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            category: e.target.value,
                                        })
                                    }
                                >
                                    {categories.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="favorite-check">
                                <input
                                    type="checkbox"
                                    checked={form.favorite}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            favorite: e.target.checked,
                                        })
                                    }
                                />
                                <Star size={16} />
                                Add to favorites
                            </label>
                            <label className="field full">
                                Notes
                                <textarea
                                    rows={3}
                                    maxLength={10000}
                                    placeholder="Anything else you’d like to remember..."
                                    value={form.notes}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            notes: e.target.value,
                                        })
                                    }
                                />
                            </label>
                        </div>
                        {error && (
                            <p role="alert" className="error-message">
                                {error}
                            </p>
                        )}
                        <div className="modal-footer">
                            {editing ? (
                                <button
                                    className="icon-button delete-button"
                                    type="button"
                                    aria-label="Delete account"
                                    onClick={() => setDeleting(editing)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            ) : (
                                <span className="form-security">
                                    <LockKeyhole size={13} />
                                    Encrypted on save
                                </span>
                            )}
                            <div>
                                <button
                                    type="button"
                                    className="button"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="button primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <LoaderCircle
                                            size={16}
                                            className="spin"
                                        />
                                    ) : (
                                        <Check size={16} />
                                    )}{" "}
                                    {editing ? "Save changes" : "Save account"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
                {modal === "generator" && (
                    <>
                        <h2>A stronger starting point.</h2>
                        <p className="modal-description">
                            {passwordPrefix
                                ? `Passwords start with ${passwordPrefix}. Length includes the prefix.`
                                : "Unique passwords, generated on your device."}
                        </p>
                        <div className="generated-password">
                            <output>{generated}</output>
                            <div>
                                <button
                                    className="icon-button"
                                    aria-label="Regenerate password"
                                    onClick={() => regenerate()}
                                >
                                    <RefreshCw size={19} />
                                </button>
                                <button
                                    className="icon-button"
                                    aria-label="Copy generated password"
                                    onClick={() => void copy(generated)}
                                >
                                    <Copy size={19} />
                                </button>
                            </div>
                        </div>
                        <div className="generator-strength">
                            <ShieldCheck size={15} />
                            {passwordStrength(generated).label} password
                            <span>Cryptographically random</span>
                        </div>
                        <label className="length-label" htmlFor="length">
                            Password length<strong>{options.length}</strong>
                        </label>
                        <input
                            id="length"
                            className="length-slider"
                            type="range"
                            min={minimumPasswordLength}
                            max={Math.max(64, minimumPasswordLength)}
                            value={options.length}
                            onChange={(e) => {
                                const next = {
                                    ...options,
                                    length: Number(e.target.value),
                                };
                                setOptions(next);
                                regenerate(next);
                            }}
                        />
                        <div className="generator-options">
                            {(
                                [
                                    "uppercase",
                                    "lowercase",
                                    "numbers",
                                    "symbols",
                                ] as const
                            ).map((key, index) => (
                                <label key={key}>
                                    <span>
                                        {
                                            [
                                                "Uppercase letters",
                                                "Lowercase letters",
                                                "Numbers",
                                                "Symbols",
                                            ][index]
                                        }
                                        <small>
                                            {
                                                ["A–Z", "a–z", "0–9", "!@#$"][
                                                    index
                                                ]
                                            }
                                        </small>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={options[key]}
                                        onChange={(e) => {
                                            const next = {
                                                ...options,
                                                [key]: e.target.checked,
                                            };
                                            if (
                                                !next.uppercase &&
                                                !next.lowercase &&
                                                !next.numbers &&
                                                !next.symbols
                                            )
                                                return;
                                            setOptions(next);
                                            regenerate(next);
                                        }}
                                    />
                                </label>
                            ))}
                        </div>
                        {error && (
                            <p className="error-message" role="alert">
                                {error}
                            </p>
                        )}
                        <div className="generator-actions">
                            <button
                                className="button"
                                onClick={() => regenerate()}
                            >
                                <RefreshCw size={16} />
                                Regenerate
                            </button>
                            <button
                                className="button primary"
                                onClick={() => void copy(generated)}
                            >
                                <Copy size={16} />
                                Copy password
                            </button>
                        </div>
                        <button
                            className="text-button use-password"
                            onClick={() => {
                                openAccount();
                                setForm({ ...emptyForm, password: generated });
                                setShowPassword(true);
                            }}
                        >
                            Use in a new account
                            <ArrowRight size={14} />
                        </button>
                    </>
                )}
                {modal === "about" && (
                    <>
                        <h2>Your vault. Your device.</h2>
                        <p className="modal-description">
                            LocalVault is a personal account manager built for
                            everyday use.
                        </p>
                        <div className="about-list">
                            <div>
                                <Database size={20} />
                                <p>
                                    <strong>Local SQLite storage</strong>Your
                                    records live in this project’s database,
                                    with no cloud service.
                                </p>
                            </div>
                            <div>
                                <ShieldCheck size={20} />
                                <p>
                                    <strong>Encrypted passwords</strong>
                                    Passwords use Laravel’s authenticated
                                    encryption and your app key.
                                </p>
                            </div>
                            <div>
                                <Monitor size={20} />
                                <p>
                                    <strong>No sign-in required</strong>Access
                                    is restricted to localhost. Anyone using
                                    this computer can open the vault.
                                </p>
                            </div>
                            <div>
                                <LockKeyhole size={20} />
                                <p>
                                    <strong>Keep your backup complete</strong>
                                    Back up database/database.sqlite and the
                                    .env file together. Keep the APP_KEY safe;
                                    it is needed to decrypt your passwords.
                                </p>
                            </div>
                        </div>
                        <button
                            className="button primary full-width"
                            onClick={closeModal}
                        >
                            Got it
                            <Check size={16} />
                        </button>
                    </>
                )}
            </dialog>
            <dialog
                ref={deleteRef}
                className="modal delete-modal"
                onCancel={() => setDeleting(null)}
            >
                <span className="danger-icon">
                    <Trash2 size={23} />
                </span>
                <h2>Delete {deleting?.site}?</h2>
                <p className="modal-description">
                    This permanently removes the account and its credentials
                    from your vault.
                </p>
                <div className="generator-actions">
                    <button
                        className="button"
                        onClick={() => setDeleting(null)}
                    >
                        Keep account
                    </button>
                    <button
                        className="button danger"
                        disabled={saving}
                        onClick={() => void remove()}
                    >
                        Delete account
                    </button>
                </div>
            </dialog>
            {toast && (
                <div className="toast" role="status">
                    <Check size={17} />
                    {toast}
                    <button
                        className="icon-button"
                        aria-label="Dismiss notification"
                        onClick={() => setToast("")}
                    >
                        <X size={15} />
                    </button>
                </div>
            )}
        </div>
    );
}
function LayersIcon() {
    return <KeyRound size={21} />;
}
createRoot(document.getElementById("root")!).render(<App />);
