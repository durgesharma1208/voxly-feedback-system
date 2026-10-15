import React, { useState, useEffect, useMemo } from "react";

const CATEGORIES = [
  "Teaching",
  "Faculty",
  "Infrastructure",
  "Library",
  "Canteen",
  "Other",
];

const KEY = "anonymous_feedback_v1";

const getDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const initialFeedback = () => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const icon = (name) => {
  const icons = {
    home: "⌂",
    dashboard: "▦",
    message: "✉",
    chart: "▥",
    search: "⌕",
    shield: "⬡",
    send: "➤",
    star: "★",
    calendar: "▣",
    logout: "↪",
    download: "↓",
    filter: "☷",
    close: "×",
    check: "✓",
    trash: "⌫",
    menu: "☰",
  };
  return icons[name] || "•";
};

export default function Upload() {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("Teaching");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(feedback));
    } catch {
      setNotice("Storage is full. Please export or remove old feedback.");
    }
  }, [feedback]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    const total = feedback.length;
    const today = feedback.filter(f => f.date === getDate()).length;
    const avg = total
      ? feedback.reduce((sum, f) => sum + Number(f.rating || 0), 0) / total
      : 0;

    return {
      total,
      today,
      avg: avg.toFixed(1),
      categories: CATEGORIES.map(name => ({
        name,
        count: feedback.filter(f => f.category === name).length,
      })),
    };
  }, [feedback]);

  const filtered = useMemo(() => {
    return feedback
      .filter(f =>
        (!query || f.message.toLowerCase().includes(query.toLowerCase())) &&
        (filter === "All" || f.category === filter) &&
        (!dateFilter || f.date === dateFilter) &&
        (ratingFilter === "All" || Number(f.rating) === Number(ratingFilter))
      )
      .sort((a, b) =>
        sort === "oldest"
          ? a.createdAt - b.createdAt
          : b.createdAt - a.createdAt
      );
  }, [feedback, query, filter, dateFilter, ratingFilter, sort]);

  const submitFeedback = e => {
    e.preventDefault();

    if (!message.trim()) {
      setNotice("Please write your feedback first.");
      return;
    }

    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      category,
      message: message.trim(),
      rating,
      date: getDate(),
      createdAt: Date.now(),
    };

    setFeedback(old => [...old, item]);
    setMessage("");
    setRating(5);
    setHoverRating(0);
    setSubmitted(true);
    setNotice("Your feedback has been submitted successfully.");
  };

  const login = e => {
    e.preventDefault();

    // Demonstration only: replace with server-side authentication
    // before deploying a real application.
    if (password === "admin123") {
      setAdmin(true);
      setPassword("");
      setLoginError("");
      setPage("dashboard");
      setNotice("Welcome to your dashboard.");
    } else {
      setLoginError("Incorrect password. Please try again.");
    }
  };

  const logout = () => {
    setAdmin(false);
    setPassword("");
    setPage("home");
    setNotice("You have been logged out.");
  };

  const removeFeedback = id => {
    if (!window.confirm("Delete this feedback permanently from this browser?")) {
      return;
    }

    setFeedback(old => old.filter(f => f.id !== id));
    setNotice("Feedback deleted.");
  };

  const exportCSV = () => {
    if (!filtered.length) {
      setNotice("There is no feedback to export.");
      return;
    }

    const escapeCSV = value =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      ["Date", "Category", "Rating", "Message"],
      ...filtered.map(f => [
        f.date,
        f.category,
        f.rating,
        f.message,
      ]),
    ];

    const csv = "\uFEFF" + rows.map(row =>
      row.map(escapeCSV).join(",")
    ).join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "anonymous-feedback.csv";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("CSV file downloaded.");
  };

  const resetFilters = () => {
    setQuery("");
    setFilter("All");
    setDateFilter("");
    setRatingFilter("All");
    setSort("newest");
  };

  const go = next => {
    if (next === "dashboard" && !admin) {
      setPage("login");
    } else {
      setPage(next);
    }
    setMenuOpen(false);
  };

  const percent = count =>
    stats.total ? Math.round(count / stats.total * 100) : 0;

  return (
    <div className="af-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        *{box-sizing:border-box}
        .af-app{
          --bg:#f6f7fb;
          --white:#fff;
          --ink:#171a2d;
          --muted:#858ba1;
          --line:#e9eaf2;
          --purple:#6558e8;
          --purple2:#8277ff;
          --green:#20a879;
          --red:#df5266;
          min-height:100vh;
          background:var(--bg);
          color:var(--ink);
          font-family:'DM Sans',Arial,sans-serif;
          font-size:14px;
        }
        .af-app button,.af-app input,.af-app select,.af-app textarea{
          font:inherit
        }
        .af-app button{cursor:pointer}
        .af-layout{display:flex;min-height:100vh}
        .af-sidebar{
          width:248px;flex-shrink:0;background:#fff;
          border-right:1px solid var(--line);padding:27px 18px;
          display:flex;flex-direction:column;position:sticky;
          top:0;height:100vh;z-index:5;
        }
        .af-brand{display:flex;align-items:center;gap:12px;padding:0 10px 36px}
        .af-logo{
          width:43px;height:43px;border-radius:14px;
          display:grid;place-items:center;color:white;font-size:22px;
          background:linear-gradient(135deg,#7466f0,#a49aff);
          box-shadow:0 7px 18px #7668ef35;
        }
        .af-brand-name{font-size:18px;font-weight:800;letter-spacing:-.7px}
        .af-brand-sub{font-size:11px;color:var(--muted);margin-top:3px}
        .af-label{
          color:#a1a5b5;font-size:10px;font-weight:800;
          letter-spacing:1.7px;padding:0 13px 12px;
        }
        .af-nav{display:grid;gap:6px}
        .af-nav button{
          display:flex;align-items:center;gap:13px;width:100%;
          padding:13px 14px;border:0;border-radius:10px;
          background:transparent;color:#777d94;text-align:left;
          font-weight:600;transition:.2s;
        }
        .af-nav button:hover{background:#f6f5ff;color:var(--purple)}
        .af-nav button.active{background:#efedff;color:#5d50df}
        .af-nav .nav-icon{font-size:19px;width:22px;text-align:center}
        .af-side-bottom{margin-top:auto}
        .af-privacy{
          padding:16px;background:#f5f3ff;border:1px solid #ebe7ff;
          border-radius:12px;margin:0 2px 20px;
        }
        .af-privacy-icon{font-size:20px;color:var(--purple)}
        .af-privacy strong{display:block;margin:9px 0 5px;font-size:12px}
        .af-privacy p{margin:0;color:#85839d;font-size:11px;line-height:1.7}
        .af-side-bottom button{
          width:100%;border:1px solid var(--line);background:white;
          border-radius:9px;padding:11px;color:#686d80;font-weight:600;
        }
        .af-main{flex:1;min-width:0}
        .af-topbar{
          height:76px;background:#ffffffc9;border-bottom:1px solid var(--line);
          display:flex;align-items:center;justify-content:space-between;
          padding:0 38px;gap:15px;
        }
        .af-breadcrumb{font-size:12px;color:var(--muted)}
        .af-breadcrumb b{color:var(--ink)}
        .af-top-right{display:flex;align-items:center;gap:12px}
        .af-live{display:flex;align-items:center;gap:8px;color:#70758b;font-size:12px}
        .af-dot{width:7px;height:7px;background:#29b987;border-radius:50%}
        .af-avatar{
          height:37px;width:37px;border-radius:12px;background:#efedff;
          display:grid;place-items:center;color:var(--purple);font-weight:800;
        }
        .af-content{padding:34px 38px 55px;max-width:1450px;margin:auto}
        .af-heading{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:26px}
        .af-eyebrow{
          text-transform:uppercase;letter-spacing:2px;font-size:10px;
          color:var(--purple);font-weight:800;margin-bottom:10px;
        }
        .af-heading h1{font:800 clamp(26px,3vw,34px) 'Manrope',sans-serif;letter-spacing:-1.5px;margin:0}
        .af-heading p{color:var(--muted);margin:10px 0 0;line-height:1.7}
        .af-pill{
          display:inline-flex;align-items:center;gap:7px;
          border:1px solid #e6e3ff;color:#6659df;background:#f4f2ff;
          border-radius:100px;padding:8px 12px;font-size:11px;font-weight:700;
        }
        .af-hero{
          border-radius:20px;overflow:hidden;position:relative;
          padding:36px 34px;background:linear-gradient(115deg,#242346,#5147a7 65%,#7769e9);
          color:white;margin-bottom:24px;min-height:240px;
          display:flex;align-items:center;justify-content:space-between;gap:20px;
        }
        .af-hero:before{
          content:'';position:absolute;width:310px;height:310px;
          border:1px solid #ffffff19;border-radius:50%;
          right:10%;top:-140px;box-shadow:0 0 0 35px #ffffff07,0 0 0 75px #ffffff05;
        }
        .af-hero-copy{position:relative;z-index:1;max-width:570px}
        .af-hero-tag{
          display:inline-flex;align-items:center;gap:7px;padding:7px 10px;
          border-radius:7px;background:#ffffff15;color:#dedaff;
          font-size:10px;font-weight:700;letter-spacing:.7px;
        }
        .af-hero h2{
          font:800 clamp(24px,3vw,35px) 'Manrope',sans-serif;
          letter-spacing:-1.2px;line-height:1.25;margin:18px 0 12px;
        }
        .af-hero p{font-size:13px;color:#d2d0f3;line-height:1.8;margin:0;max-width:500px}
        .af-hero-art{
          position:relative;z-index:1;flex-shrink:0;width:140px;height:140px;
          border:1px solid #ffffff30;border-radius:35px;
          display:grid;place-items:center;transform:rotate(-7deg);
          background:linear-gradient(135deg,#ffffff22,#ffffff05);
          box-shadow:inset 0 0 40px #ffffff0b;
        }
        .af-hero-art span{font-size:67px;transform:rotate(7deg);color:#fff}
        .af-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}
        .af-stat{
          background:white;border:1px solid var(--line);border-radius:14px;
          padding:21px;min-width:0;
        }
        .af-stat-top{display:flex;justify-content:space-between;gap:10px;align-items:center}
        .af-stat-label{font-size:12px;color:var(--muted);font-weight:600}
        .af-stat-icon{
          width:38px;height:38px;display:grid;place-items:center;
          border-radius:11px;font-size:20px;
        }
        .af-stat-value{font:800 30px 'Manrope',sans-serif;letter-spacing:-1px;margin:15px 0 5px}
        .af-stat-foot{font-size:11px;color:var(--muted)}
        .af-stat-foot b{color:#159c72}
        .af-section{margin-top:30px}
        .af-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
        .af-section-title h2{font:800 18px 'Manrope',sans-serif;letter-spacing:-.5px;margin:0}
        .af-section-title p{font-size:12px;color:var(--muted);margin:5px 0 0}
        .af-text-btn{border:0;background:transparent;color:var(--purple);font-weight:700;font-size:12px}
        .af-panel{background:white;border:1px solid var(--line);border-radius:14px;padding:23px}
        .af-categories{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 28px}
        .af-category-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:9px;font-size:12px}
        .af-category-head span{color:var(--muted)}
        .af-bar{height:7px;border-radius:20px;background:#f0eff7;overflow:hidden}
        .af-bar-fill{height:100%;border-radius:20px;background:linear-gradient(90deg,#6c5ce7,#9a8dff);transition:width .3s}
        .af-form-layout{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(240px,.8fr);gap:24px;align-items:start}
        .af-field{margin-bottom:19px}
        .af-field label{display:block;font-size:12px;font-weight:700;margin-bottom:9px}
        .af-input,.af-select,.af-textarea{
          width:100%;padding:13px 14px;background:#fbfbfe;
          color:var(--ink);border:1px solid #e6e7ef;border-radius:9px;
          outline:none;transition:border .2s,box-shadow .2s;
        }
        .af-input:focus,.af-select:focus,.af-textarea:focus{
          border-color:#8b80f4;box-shadow:0 0 0 3px #7869f018;
        }
        .af-textarea{min-height:165px;resize:vertical;line-height:1.8}
        .af-muted{color:var(--muted);font-size:11px;line-height:1.7}
        .af-rating{display:flex;gap:8px;flex-wrap:wrap}
        .af-star{
          border:1px solid var(--line);background:white;border-radius:9px;
          width:43px;height:42px;color:#d4d4df;font-size:23px;transition:.15s;
        }
        .af-star.selected{color:#f4ae36;background:#fff9e9;border-color:#f5dfad}
        .af-btn{
          display:inline-flex;align-items:center;justify-content:center;gap:9px;
          padding:12px 17px;background:var(--purple);color:white;
          border:1px solid var(--purple);border-radius:9px;
          font-weight:700;font-size:12px;transition:.2s;
        }
        .af-btn:hover{background:#5144d4;transform:translateY(-1px)}
        .af-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
        .af-btn-outline{background:white;color:#565b70;border-color:var(--line)}
        .af-btn-outline:hover{background:#f7f6ff;color:var(--purple)}
        .af-btn-danger{background:#fff4f5;color:#cf4057;border-color:#f4d7dc}
        .af-btn-danger:hover{background:#ffe9ec}
        .af-btn-full{width:100%}
        .af-info-card{
          background:linear-gradient(150deg,#f3f1ff,#fff);
          border:1px solid #e6e1ff;border-radius:14px;padding:23px;
        }
        .af-info-card h3{font:800 17px 'Manrope',sans-serif;margin:14px 0 9px}
        .af-info-card p{font-size:12px;color:#77758f;line-height:1.9}
        .af-info-row{display:flex;gap:11px;align-items:flex-start;margin-top:20px}
        .af-info-check{
          width:25px;height:25px;display:grid;place-items:center;
          background:#e6e1ff;color:#6655df;border-radius:8px;flex-shrink:0;
        }
        .af-info-row strong{display:block;font-size:12px;margin-bottom:4px}
        .af-info-row span{font-size:11px;color:var(--muted);line-height:1.7}
        .af-success{
          padding:17px;background:#effbf5;border:1px solid #ccefe0;
          color:#157d56;border-radius:12px;margin-bottom:18px;
        }
        .af-success strong{display:block;font-size:15px;margin-bottom:5px}
        .af-success p{font-size:12px;line-height:1.7;margin:0}
        .af-login-wrap{max-width:470px;margin:50px auto}
        .af-login-icon{
          width:65px;height:65px;border-radius:19px;
          display:grid;place-items:center;background:#efedff;
          color:var(--purple);font-size:30px;margin-bottom:20px;
        }
        .af-login-wrap h2{font:800 24px 'Manrope',sans-serif;margin:0 0 9px}
        .af-login-wrap>p{font-size:12px;color:var(--muted);line-height:1.8}
        .af-demo{background:#f6f5ff;border-radius:9px;padding:12px;margin:16px 0;font-size:11px;color:#6a60c9;line-height:1.8}
        .af-toolbar{
          display:grid;grid-template-columns:minmax(180px,1.5fr) repeat(4,minmax(105px,1fr));
          gap:10px;margin:20px 0;
        }
        .af-toolbar .af-input,.af-toolbar .af-select{margin:0;font-size:12px;padding:11px}
        .af-search-wrap{position:relative}
        .af-search-wrap .af-input{padding-left:36px}
        .af-search-icon{position:absolute;left:13px;top:10px;color:#8c90a2;font-size:18px}
        .af-results{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px;color:var(--muted);font-size:12px}
        .af-feedback-list{display:grid;gap:12px}
        .af-feedback-card{background:white;border:1px solid var(--line);border-radius:13px;padding:20px}
        .af-feedback-head{display:flex;justify-content:space-between;align-items:flex-start;gap:15px}
        .af-feedback-category{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
        .af-category-tag{padding:6px 9px;border-radius:7px;background:#f0eeff;color:#6659dd;font-size:10px;font-weight:800}
        .af-feedback-date{font-size:11px;color:var(--muted)}
        .af-feedback-stars{color:#f2ae32;letter-spacing:2px;font-size:13px;margin-top:12px}
        .af-feedback-message{font-size:13px;line-height:1.9;color:#555b70;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0 0}
        .af-delete{background:white;border:1px solid var(--line);border-radius:8px;color:#a1a5b4;padding:8px 10px}
        .af-delete:hover{background:#fff0f1;color:#d8485d}
        .af-empty{text-align:center;padding:48px 20px;color:var(--muted);background:white;border:1px dashed #ddddeb;border-radius:13px}
        .af-empty-icon{font-size:35px;color:#a59df6;margin-bottom:14px}
        .af-empty h3{color:var(--ink);font-size:15px;margin:0 0 8px}
        .af-empty p{font-size:12px;line-height:1.8}
        .af-alert{
          position:fixed;bottom:22px;right:22px;z-index:20;
          padding:15px 20px;background:#242346;color:white;
          border-radius:10px;box-shadow:0 10px 35px #0002;
          max-width:calc(100vw - 44px);font-size:12px;
          animation:af-in .2s ease-out;
        }
        @keyframes af-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .af-footer{border-top:1px solid var(--line);padding-top:22px;margin-top:38px;display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;color:#969aae;font-size:11px}
        .af-footer b{color:#686d83}
        .af-mobile-menu{display:none}
        @media(max-width:1100px){
          .af-sidebar{width:220px}
          .af-content{padding:28px 24px}
          .af-topbar{padding:0 24px}
          .af-toolbar{grid-template-columns:repeat(3,minmax(0,1fr))}
        }
        @media(max-width:760px){
          .af-layout{display:block}
          .af-sidebar{position:fixed;left:0;top:0;bottom:0;height:100dvh;width:260px;transform:translateX(-105%);transition:transform .25s;box-shadow:none}
          .af-sidebar.open{transform:translateX(0);box-shadow:20px 0 60px #171a2d20}
          .af-mobile-menu{display:inline-flex;border:1px solid var(--line);background:white;border-radius:9px;width:38px;height:38px;align-items:center;justify-content:center;color:var(--ink);font-size:19px}
          .af-topbar{height:65px;padding:0 17px}
          .af-content{padding:25px 16px 38px}
          .af-hero{padding:26px 22px;min-height:220px}
          .af-hero-art{width:80px;height:80px;border-radius:22px}
          .af-hero-art span{font-size:40px}
          .af-grid{grid-template-columns:1fr}
          .af-stat{padding:17px}
          .af-stat-value{margin:9px 0 4px}
          .af-form-layout{grid-template-columns:1fr}
          .af-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}
          .af-toolbar .af-search-wrap{grid-column:1/-1}
          .af-categories{grid-template-columns:1fr}
          .af-heading{flex-direction:column}
          .af-panel{padding:17px}
        }
        @media(max-width:420px){
          .af-hero-art{display:none}
          .af-hero{padding:23px 18px}
          .af-toolbar{grid-template-columns:1fr}
          .af-toolbar .af-search-wrap{grid-column:auto}
          .af-feedback-card{padding:15px}
          .af-top-right .af-live{display:none}
          .af-content{padding-left:12px;padding-right:12px}
        }
      `}</style>

      <div className="af-layout">
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "#171a2d45",
              zIndex: 4,
            }}
          />
        )}

        <aside className={`af-sidebar ${menuOpen ? "open" : ""}`}>
          <div className="af-brand">
            <div className="af-logo">{icon("message")}</div>
            <div>
              <div className="af-brand-name">Vox<span style={{ color: "#7568ed" }}>ly</span></div>
              <div className="af-brand-sub">Anonymous feedback</div>
            </div>
          </div>

          <div className="af-label">WORKSPACE</div>

          <nav className="af-nav">
            <button className={page === "home" ? "active" : ""} onClick={() => go("home")}>
              <span className="nav-icon">{icon("home")}</span> Home
            </button>

            <button className={page === "submit" ? "active" : ""} onClick={() => go("submit")}>
              <span className="nav-icon">{icon("send")}</span> Submit feedback
            </button>

            <button className={page === "dashboard" || page === "login" ? "active" : ""} onClick={() => go("dashboard")}>
              <span className="nav-icon">{icon("dashboard")}</span> Admin dashboard
            </button>
          </nav>

          <div className="af-side-bottom">
            <div className="af-privacy">
              <div className="af-privacy-icon">{icon("shield")}</div>
              <strong>Your voice matters.</strong>
              <p>Share honest opinions without creating an account.</p>
            </div>
            <button onClick={() => go(admin ? "dashboard" : "login")}>
              {icon("shield")} &nbsp; {admin ? "Administrator" : "Admin access"}
            </button>
          </div>
        </aside>

        <div className="af-main">
          <header className="af-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="af-mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
                {icon("menu")}
              </button>
              <div className="af-breadcrumb">
                Workspace &nbsp;/&nbsp; <b>
                  {page === "home" ? "Home" :
                   page === "submit" ? "Submit feedback" :
                   page === "login" ? "Administrator login" : "Dashboard"}
                </b>
              </div>
            </div>
            <div className="af-top-right">
              <div className="af-live"><span className="af-dot" /> Feedback portal</div>
              <div className="af-avatar">{admin ? "A" : "V"}</div>
            </div>
          </header>

          <main className="af-content">

            {page === "home" && (
              <>
                <div className="af-heading">
                  <div>
                    <div className="af-eyebrow">YOUR VOICE. YOUR IMPACT.</div>
                    <h1>Welcome to Voxly.</h1>
                    <p>A better place to share ideas, feedback and make a difference.</p>
                  </div>
                  <span className="af-pill">{icon("shield")} Anonymous feedback</span>
                </div>

                <section className="af-hero">
                  <div className="af-hero-copy">
                    <span className="af-hero-tag">{icon("star")} YOUR OPINION COUNTS</span>
                    <h2>Speak freely.<br />Help us grow together.</h2>
                    <p>Your honest feedback helps identify problems, improve experiences and build a better community. Every voice deserves to be heard.</p>
                    <button className="af-btn" style={{ marginTop: 22, background: "white", color: "#5147a7", borderColor: "white" }} onClick={() => go("submit")}>
                      Share your feedback &nbsp; →
                    </button>
                  </div>
                  <div className="af-hero-art"><span>✉</span></div>
                </section>

                <div className="af-grid">
                  {[
                    { label: "Feedback received", value: stats.total, foot: "Total submissions", ico: "✉", bg: "#efedff", color: "#6b5ce7" },
                    { label: "Today's submissions", value: stats.today, foot: "Submitted today", ico: "◷", bg: "#e7f9f1", color: "#1da477" },
                    { label: "Average rating", value: stats.total ? `${stats.avg}/5` : "—", foot: stats.total ? "Across all feedback" : "Awaiting first rating", ico: "★", bg: "#fff5df", color: "#df9d27" },
                  ].map(s => (
                    <div className="af-stat" key={s.label}>
                      <div className="af-stat-top">
                        <span className="af-stat-label">{s.label}</span>
                        <div className="af-stat-icon" style={{ background: s.bg, color: s.color }}>{s.ico}</div>
                      </div>
                      <div className="af-stat-value">{s.value}</div>
                      <div className="af-stat-foot">{s.foot}</div>
                    </div>
                  ))}
                </div>

                <section className="af-section">
                  <div className="af-section-title">
                    <div><h2>Feedback by category</h2><p>Understand which areas receive the most feedback.</p></div>
                    {admin && <button className="af-text-btn" onClick={() => go("dashboard")}>View all →</button>}
                  </div>
                  <div className="af-panel">
                    <div className="af-categories">
                      {stats.categories.map(c => (
                        <div key={c.name}>
                          <div className="af-category-head">
                            <b>{c.name}</b><span>{c.count} submissions · {percent(c.count)}%</span>
                          </div>
                          <div className="af-bar">
                            <div className="af-bar-fill" style={{ width: `${percent(c.count)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="af-section">
                  <div className="af-section-title">
                    <div><h2>How it works</h2><p>Three simple steps to make your voice count.</p></div>
                  </div>
                  <div className="af-grid">
                    {[
                      ["01", "Choose a category", "Select the topic that best matches your feedback."],
                      ["02", "Share your thoughts", "Write your feedback and rate your experience."],
                      ["03", "Make an impact", "Your feedback helps decision-makers identify improvements."],
                    ].map(s => (
                      <div className="af-stat" key={s[0]}>
                        <div className="af-eyebrow">{s[0]}</div>
                        <h3 style={{ fontSize: 15, margin: "12px 0 8px" }}>{s[1]}</h3>
                        <p className="af-muted">{s[2]}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {page === "submit" && (
              <>
                <div className="af-heading">
                  <div>
                    <div className="af-eyebrow">WE'RE LISTENING</div>
                    <h1>Share your feedback.</h1>
                    <p>Your thoughts can help create meaningful improvements.</p>
                  </div>
                  <span className="af-pill">{icon("shield")} No account required</span>
                </div>

                {submitted && (
                  <div className="af-success">
                    <strong>✓ Thank you for speaking up!</strong>
                    <p>Your feedback has been saved. Your opinion helps us identify what is working and what needs improvement.</p>
                    <button className="af-text-btn" style={{ marginTop: 8 }} onClick={() => setSubmitted(false)}>Dismiss</button>
                  </div>
                )}

                <div className="af-form-layout">
                  <form className="af-panel" onSubmit={submitFeedback}>
                    <div className="af-field">
                      <label htmlFor="af-category">1. Choose a category</label>
                      <select id="af-category" className="af-select" value={category} onChange={e => setCategory(e.target.value)}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="af-field">
                      <label>2. Rate your experience</label>
                      <div className="af-rating">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            type="button"
                            key={n}
                            aria-label={`Rate ${n} out of 5`}
                            className={`af-star ${(hoverRating || rating) >= n ? "selected" : ""}`}
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(n)}
                          >★</button>
                        ))}
                      </div>
                      <p className="af-muted" style={{ marginTop: 8 }}>
                        {["", "Needs significant improvement", "Needs improvement", "It's okay", "Very good", "Excellent experience"][hoverRating || rating]}
                      </p>
                    </div>

                    <div className="af-field">
                      <label htmlFor="af-message">3. Tell us what you think</label>
                      <textarea
                        id="af-message"
                        className="af-textarea"
                        placeholder="Share your experience, suggestions or concerns. Be honest and constructive..."
                        value={message}
                        onChange={e => setMessage(e.target.value.slice(0, 1000))}
                        maxLength={1000}
                        required
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <span className="af-muted">Please avoid sharing personal information.</span>
                        <span className="af-muted">{message.length}/1000</span>
                      </div>
                    </div>

                    <button className="af-btn af-btn-full" type="submit" disabled={!message.trim()}>
                      {icon("send")} Submit anonymously
                    </button>
                    <p className="af-muted" style={{ textAlign: "center", marginTop: 13 }}>
                      By submitting, you agree to keep feedback respectful and constructive.
                    </p>
                  </form>

                  <aside className="af-info-card">
                    <div style={{ fontSize: 27, color: "#695ce8" }}>{icon("shield")}</div>
                    <h3>Your voice matters.</h3>
                    <p>Honest feedback helps us understand experiences, identify challenges and discover opportunities for improvement.</p>

                    {[
                      ["Anonymous submission", "No name or account field is requested."],
                      ["Respectful feedback", "Clear, constructive suggestions are most helpful."],
                      ["Meaningful change", "Feedback can highlight areas that deserve attention."],
                    ].map(s => (
                      <div className="af-info-row" key={s[0]}>
                        <div className="af-info-check">{icon("check")}</div>
                        <div><strong>{s[0]}</strong><span>{s[1]}</span></div>
                      </div>
                    ))}
                  </aside>
                </div>
              </>
            )}

            {page === "login" && (
              <div className="af-login-wrap af-panel">
                <div className="af-login-icon">{icon("shield")}</div>
                <div className="af-eyebrow">RESTRICTED ACCESS</div>
                <h2>Administrator login</h2>
                <p>Sign in to review submissions, explore analytics and manage feedback.</p>

                <form onSubmit={login}>
                  <div className="af-field" style={{ marginTop: 24 }}>
                    <label htmlFor="af-password">Admin password</label>
                    <input
                      id="af-password"
                      className="af-input"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter administrator password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {loginError && <p role="alert" style={{ color: "#df5266", fontSize: 12 }}>{loginError}</p>}

                  <button className="af-btn af-btn-full" type="submit">Sign in to dashboard →</button>
                </form>

                <div className="af-demo">
                  <b>College demonstration credentials</b><br />
                  Password: <b>admin123</b>
                </div>
                <p className="af-muted">Demo authentication only. A production application must authenticate administrators on the server.</p>
              </div>
            )}

            {page === "dashboard" && admin && (
              <>
                <div className="af-heading">
                  <div>
                    <div className="af-eyebrow">MANAGEMENT CENTER</div>
                    <h1>Admin dashboard.</h1>
                    <p>Review submissions, identify trends and manage feedback.</p>
                  </div>
                  <button className="af-btn af-btn-outline" onClick={exportCSV}>
                    {icon("download")} Export CSV
                  </button>
                </div>

                <div className="af-grid">
                  {[
                    ["Total submissions", stats.total, "All received feedback", "#efedff", "#6b5ce7"],
                    ["Today's submissions", stats.today, "Received today", "#e7f9f1", "#1da477"],
                    ["Average rating", stats.total ? `${stats.avg}/5` : "—", "Across all submissions", "#fff5df", "#df9d27"],
                  ].map(s => (
                    <div className="af-stat" key={s[0]}>
                      <div className="af-stat-top">
                        <span className="af-stat-label">{s[0]}</span>
                        <div className="af-stat-icon" style={{ background: s[3], color: s[4] }}>▦</div>
                      </div>
                      <div className="af-stat-value">{s[1]}</div>
                      <div className="af-stat-foot">{s[2]}</div>
                    </div>
                  ))}
                </div>

                <section className="af-section">
                  <div className="af-section-title">
                    <div><h2>Category analytics</h2><p>Distribution of all feedback submissions.</p></div>
                  </div>
                  <div className="af-panel">
                    <div className="af-categories">
                      {stats.categories.map(c => (
                        <div key={c.name}>
                          <div className="af-category-head">
                            <b>{c.name}</b><span>{c.count} ({percent(c.count)}%)</span>
                          </div>
                          <div className="af-bar">
                            <div className="af-bar-fill" style={{ width: `${percent(c.count)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="af-section">
                  <div className="af-section-title">
                    <div><h2>Feedback submissions</h2><p>Search, filter and review received feedback.</p></div>
                    <span className="af-pill">{filtered.length} results</span>
                  </div>

                  <div className="af-toolbar">
                    <div className="af-search-wrap">
                      <span className="af-search-icon">{icon("search")}</span>
                      <input className="af-input" placeholder="Search feedback..." value={query} onChange={e => setQuery(e.target.value)} />
                    </div>

                    <select className="af-select" aria-label="Filter by category" value={filter} onChange={e => setFilter(e.target.value)}>
                      <option value="All">All categories</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>

                    <select className="af-select" aria-label="Filter by rating" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                      <option value="All">All ratings</option>
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} stars</option>)}
                    </select>

                    <input className="af-input" aria-label="Filter by date" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />

                    <select className="af-select" aria-label="Sort feedback" value={sort} onChange={e => setSort(e.target.value)}>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  </div>

                  <div className="af-results">
                    <span>Showing <b>{filtered.length}</b> of {feedback.length} submissions</span>
                    <button className="af-text-btn" onClick={resetFilters}>Reset filters</button>
                  </div>

                  <div className="af-feedback-list">
                    {!filtered.length ? (
                      <div className="af-empty">
                        <div className="af-empty-icon">{icon("search")}</div>
                        <h3>No feedback found</h3>
                        <p>Try changing your filters or search terms.<br />New submissions will appear here.</p>
                        <button className="af-btn af-btn-outline" onClick={resetFilters}>Clear filters</button>
                      </div>
                    ) : filtered.map(f => (
                      <article className="af-feedback-card" key={f.id}>
                        <div className="af-feedback-head">
                          <div>
                            <div className="af-feedback-category">
                              <span className="af-category-tag">{f.category}</span>
                              <span className="af-feedback-date">{f.date}</span>
                            </div>
                            <div className="af-feedback-stars" aria-label={`${f.rating} out of 5 stars`}>
                              {"★".repeat(f.rating)}<span style={{ color: "#e4e4ed" }}>{"★".repeat(5 - f.rating)}</span>
                            </div>
                          </div>
                          <button className="af-delete" title="Delete feedback" aria-label="Delete feedback" onClick={() => removeFeedback(f.id)}>
                            {icon("trash")}
                          </button>
                        </div>
                        <p className="af-feedback-message">{f.message}</p>
                      </article>
                    ))}
                  </div>

                  {feedback.length > 0 && (
                    <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <button className="af-btn af-btn-outline" onClick={exportCSV}>{icon("download")} Download filtered CSV</button>
                      <button className="af-btn af-btn-danger" onClick={() => {
                        if (window.confirm("Delete ALL feedback stored in this browser? This cannot be undone.")) {
                          setFeedback([]);
                          setNotice("All feedback deleted.");
                        }
                      }}>{icon("trash")} Clear all feedback</button>
                    </div>
                  )}
                </section>
              </>
            )}

            {page === "dashboard" && !admin && (
              <div className="af-panel">
                <h2>Administrator access required</h2>
                <p className="af-muted">Please sign in before accessing feedback submissions.</p>
                <button className="af-btn" onClick={() => go("login")}>Admin login →</button>
              </div>
            )}

            <footer className="af-footer">
              <span><b>Voxly</b> · Anonymous Feedback System</span>
              <span>Built to listen. Designed to improve.</span>
            </footer>
          </main>
        </div>
      </div>

      {notice && <div className="af-alert" role="status">{notice}</div>}
    </div>
  );
}