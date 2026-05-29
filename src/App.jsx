import { useState, useRef, useEffect } from "react";

/* ─── Local Storage Helper Hook ──────────────────────────────── */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn("Error setting localStorage key:", key, error);
    }
  };

  return [storedValue, setValue];
}

/* ─── Initial Mock Data ─────────────────────────────────────── */
const INITIAL_GROUPS = [
  { id: 1, name: "Database Warriors", subject: "Database Systems", members: 8, icon: "🗄️", accent: "#f97316", soft: "#fff7ed", ring: "#fed7aa", desc: "SQL, normalization, ER diagrams and query optimisation.", schedule: "Evenings" },
  { id: 2, name: "Java Masters", subject: "Java Programming", members: 5, icon: "☕", accent: "#8b5cf6", soft: "#f5f3ff", ring: "#ddd6fe", desc: "OOP, design patterns, data structures and clean code.", schedule: "Weekends" },
  { id: 3, name: "SE Study Circle", subject: "Software Engineering", members: 11, icon: "⚙️", accent: "#0ea5e9", soft: "#f0f9ff", ring: "#bae6fd", desc: "SDLC, agile sprints, system design and UML modelling.", schedule: "Fri evenings" },
  { id: 4, name: "Algo Aces", subject: "Data Structures", members: 7, icon: "🔢", accent: "#10b981", soft: "#ecfdf5", ring: "#a7f3d0", desc: "Sorting, graphs, trees and dynamic programming mastery.", schedule: "Mon/Wed" },
  { id: 5, name: "Web Wizards", subject: "Web Development", members: 9, icon: "🌐", accent: "#ec4899", soft: "#fdf2f8", ring: "#fbcfe8", desc: "HTML, CSS, JS, React and modern frontend tooling.", schedule: "Tue/Thu" },
];

/* ─── AI Matching Engine Helper ──────────────────────────────── */
function getMatchedGroups(groupsList, userPrefs, userProgram) {
  const prefs = userPrefs
    ? userPrefs.split(",").map(p => p.trim().toLowerCase()).filter(Boolean)
    : [];

  const program = userProgram ? userProgram.toLowerCase() : "";

  return groupsList.map(g => {
    let score = 50;
    const subject = g.subject.toLowerCase();
    const name = g.name.toLowerCase();

    // Direct check for preferred course tags
    const hasPrefMatch = prefs.some(pref => subject.includes(pref) || name.includes(pref));
    
    if (hasPrefMatch) {
      score = 98;
    } else {
      const isCS = program.includes("computer") || program.includes("software") || program.includes("cs");
      if (isCS) {
        if (subject.includes("java") || subject.includes("database") || subject.includes("structure") || subject.includes("software")) {
          score = 85;
        } else {
          score = 70;
        }
      } else {
        if (subject.includes("web") || subject.includes("software")) {
          score = 80;
        } else {
          score = 65;
        }
      }
    }

    return { ...g, match: score };
  }).sort((a, b) => b.match - a.match);
}

const INITIAL_RESOURCES = [
  { id: 1, title: "SQL Normalization Notes", subject: "Database Systems", author: "Aisyah", type: "PDF", dl: 23, rating: 4.8, date: "2 days ago", accent: "#f97316", userRatings: {}, fileName: "sql_normalization.pdf" },
  { id: 2, title: "Java OOP Chapter 5 Slides", subject: "Java Programming", author: "Kumar", type: "PPTX", dl: 17, rating: 4.5, date: "3 days ago", accent: "#8b5cf6", userRatings: {}, fileName: "java_oop_ch5.pptx" },
  { id: 3, title: "ER Diagram Templates", subject: "Database Systems", author: "Rania", type: "PDF", dl: 31, rating: 4.9, date: "1 week ago", accent: "#f97316", userRatings: {}, fileName: "er_templates.pdf" },
  { id: 4, title: "Design Patterns Cheatsheet", subject: "Software Engineering", author: "Lim", type: "PDF", dl: 44, rating: 4.7, date: "1 week ago", accent: "#0ea5e9", userRatings: {}, fileName: "design_patterns_cheatsheet.pdf" },
  { id: 5, title: "Past Year Questions 2023", subject: "Database Systems", author: "Ali", type: "PDF", dl: 56, rating: 4.6, date: "2 weeks ago", accent: "#f97316", userRatings: {}, fileName: "past_questions_2023.pdf" },
];

const INITIAL_DISCS = [
  {
    id: 1, group: "Database Warriors", author: "Kumar", av: "KM", avatarBg: "#fff7ed", avatarFg: "#f97316", text: "Can someone explain normalization? I keep confusing 2NF and 3NF.", time: "12 min ago",
    replies: [{ author: "Aisyah", av: "AS", avatarBg: "#f0f9ff", avatarFg: "#0ea5e9", text: "2NF removes partial dependencies; 3NF removes transitive ones. Uploaded notes!", time: "8 min ago" }]
  },
  { id: 2, group: "Java Masters", author: "Rania", av: "RN", avatarBg: "#f5f3ff", avatarFg: "#8b5cf6", text: "When should I use abstract classes vs interfaces in Java?", time: "1 hr ago", replies: [] },
  {
    id: 3, group: "SE Study Circle", author: "Lim Soo", av: "LS", avatarBg: "#f0f9ff", avatarFg: "#0ea5e9", text: "Study session tonight at 8 PM — who's joining? Covering sprint planning.", time: "2 hr ago",
    replies: [{ author: "Ali", av: "AL", avatarBg: "#ecfdf5", avatarFg: "#10b981", text: "I'll be there! Can we also cover user stories?", time: "1.5 hr ago" }]
  },
];

const INITIAL_NOTIFS = [
  { id: 1, icon: "💬", color: "#fff7ed", text: "Ali replied to your post", sub: "Database Warriors · 5m", read: false },
  { id: 2, icon: "📄", color: "#ecfdf5", text: "New SQL notes uploaded", sub: "by Kumar · 20m", read: false },
  { id: 3, icon: "📅", color: "#f0f9ff", text: "Session starts in 1 hour", sub: "Database Warriors · 55m", read: false },
  { id: 4, icon: "🏆", color: "#fdf4ff", text: "You earned the Helpful Learner badge!", sub: "2h ago", read: true },
];

/* ─── CSS Theme Setup ───────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Spline+Sans+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
p, span, div, h1, h2, h3, h4, h5, h6 { word-break: break-word; overflow-wrap: break-word; }

:root {
  --bg: #FFC0CB;
  --surface: #ffffff;
  --surface2: #fff0f3;
  --border: #fbcfe8;
  --border2: #f472b6;
  --text: #3d0016;
  --text2: #5c0625;
  --text3: #8a0c3b;
  --purple: #be185d;
  --purple-soft: #ffeef2;
  --purple-ring: #f472b6;
  --orange: #e11d48;
  --orange-soft: #ffe4e6;
  --teal: #be185d;
  --teal-soft: #ffeef2;
  --green: #059669;
  --green-soft: #ecfdf5;
  --pink: #be185d;
  --pink-soft: #ffeef2;
  --r: 16px;
  --r-lg: 20px;
  --r-xl: 28px;
  --shadow-sm: 0 2px 8px rgba(190, 24, 93, 0.04);
  --shadow: 0 8px 24px rgba(190, 24, 93, 0.08);
  --shadow-lg: 0 20px 48px rgba(190, 24, 93, 0.12);
}

.dark-mode {
  --bg: #090d16;
  --surface: #131b2e;
  --surface2: #1e293b;
  --border: #334155;
  --border2: #475569;
  --text: #f8fafc;
  --text2: #cbd5e1;
  --text3: #64748b;
  --purple: #a78bfa;
  --purple-soft: #2e1f4d;
  --purple-ring: #6d28d9;
  --orange: #fb923c;
  --orange-soft: #431a04;
  --teal: #38bdf8;
  --teal-soft: #083344;
  --green: #34d399;
  --green-soft: #064e3b;
  --pink: #f472b6;
  --pink-soft: #500730;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.3);
  --shadow: 0 4px 12px rgba(0,0,0,.3);
  --shadow-lg: 0 16px 48px rgba(0,0,0,.5);
}

body {
  font-family: 'Sora', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
  line-height: 1.5;
  transition: background-color 0.3s ease, color 0.3s ease;
}
input, textarea, select, button { font-family: inherit; }
button { cursor: pointer; border: none; outline: none; background: transparent; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
::-webkit-scrollbar-track { background: transparent; }

/* ── SHELL ── */
.shell { display: flex; height: 100vh; overflow: hidden; width: 100%; max-width: 100vw; position: relative; }

/* ── AUTH ── */
.auth { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
@media (max-width: 768px) { .auth { grid-template-columns: 1fr; } .auth-panel { display: none !important; } }
.auth-panel {
  background: linear-gradient(145deg, #1e1b4b 0%, #31105e 35%, #0f3057 70%, #081c30 100%);
  display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 3rem;
  position: relative; overflow: hidden; gap: 2.5rem;
}
.auth-panel::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 40% at 50% 50%, rgba(124, 58, 237, .35) 0%, transparent 60%),
              radial-gradient(ellipse 40% 60% at 80% 20%, rgba(14, 165, 233, .2) 0%, transparent 60%);
}
.auth-brand { font-size: 36px; font-weight: 800; color: #fff; letter-spacing: -1px; position: relative; z-index: 1; text-align: center; }
.auth-brand em { font-style: normal; color: #a78bfa; text-shadow: 0 0 15px rgba(167, 139, 250, 0.4); }
.auth-tagline { font-size: 15px; color: rgba(255, 255, 255, .7); line-height: 1.75; max-width: 360px; margin-top: .75rem; position: relative; z-index: 1; text-align: center; }
.auth-feats { display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; width: 100%; max-width: 400px; }
.auth-feat { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .1); border-radius: 14px; backdrop-filter: blur(8px); }
.auth-feat-icon { font-size: 20px; flex-shrink: 0; }
.auth-feat-text { font-size: 13.5px; color: rgba(255, 255, 255, .9); font-weight: 500; }
.auth-form-side { background: var(--surface); display: flex; align-items: center; justify-content: center; padding: 3rem; }
.auth-form-box { width: 100%; max-width: 380px; }
.auth-title { font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -.5px; margin-bottom: 6px; }
.auth-subtitle { font-size: 13.5px; color: var(--text2); margin-bottom: 2rem; }
.field-group { margin-bottom: 16px; }
.field-label { display: block; font-size: 11px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px; }
.field-input { width: 100%; padding: 12px 14px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--r); color: var(--text); font-size: 14px; outline: none; transition: all .2s; }
.field-input:focus { border-color: var(--purple); background: var(--surface); box-shadow: 0 0 0 3px rgba(124, 58, 237, .15); }
.btn-auth { width: 100%; padding: 12px; background: linear-gradient(135deg, #7c3aed, #6d28d9); border: none; border-radius: var(--r); color: #fff; font-size: 14.5px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: all .2s; box-shadow: 0 4px 14px rgba(124, 58, 237, .35); }
.btn-auth:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124, 58, 237, .45); }
.auth-swap { text-align: center; margin-top: 18px; font-size: 13px; color: var(--text2); }
.auth-swap span { color: var(--purple); font-weight: 600; cursor: pointer; }

/* ── SIDEBAR ── */
.sb { width: 250px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }
.sb-head { padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid var(--border); }
.sb-logo { font-size: 21px; font-weight: 800; color: var(--text); letter-spacing: -.5px; }
.sb-logo em { font-style: normal; background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.sb-sub { font-size: 10.5px; color: var(--text3); text-transform: uppercase; letter-spacing: .08em; margin-top: 2px; }
.sb-nav { flex: 1; overflow-y: auto; padding: 1rem; }
.sb-group-label { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .1em; padding: 0 8px; margin: 12px 0 6px; }
.sb-item { display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 12px; font-size: 13.5px; font-weight: 500; color: var(--text2); cursor: pointer; margin-bottom: 4px; transition: all .15s; position: relative; }
.sb-item:hover { background: var(--surface2); color: var(--text); }
.sb-item.on { background: var(--purple-soft); color: var(--purple); font-weight: 600; }
.sb-item.on::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: var(--purple); border-radius: 0 4px 4px 0; }
.sb-item-ic { width: 32px; height: 32px; border-radius: 9px; background: var(--surface2); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; transition: background .15s; }
.sb-item.on .sb-item-ic { background: rgba(124, 58, 237, .15); }
.sb-badge { margin-left: auto; background: #ef4444; color: #fff; font-size: 9.5px; font-weight: 700; padding: 2px 7px; border-radius: 99px; min-width: 18px; text-align: center; }
.sb-foot { padding: 1rem 1.25rem; border-top: 1px solid var(--border); }
.sb-user { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 12px; cursor: pointer; transition: background .15s; }
.sb-user:hover { background: var(--surface2); }
.av { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; box-shadow: var(--shadow-sm); }

/* ── MAIN ── */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.topbar { height: 60px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 1.75rem; flex-shrink: 0; }
.tb-title-row { display: flex; align-items: center; gap: 12px; }
.tb-page-pill { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: var(--shadow-sm); }
.tb-title { font-size: 18px; font-weight: 800; color: var(--text); letter-spacing: -.4px; }
.tb-right { display: flex; align-items: center; gap: 10px; position: relative; }
.ic-btn { width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 15px; cursor: pointer; transition: all .15s; position: relative; color: var(--text2); }
.ic-btn:hover { border-color: var(--purple-ring); background: var(--purple-soft); color: var(--purple); }
.notif-pip { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; border: 2px solid var(--surface); }
.page { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 1.75rem; position: relative; min-width: 0; }

/* ── NOTIF PANEL ── */
.notif-panel { position: absolute; right: 0; top: calc(100% + 8px); width: 320px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); z-index: 300; box-shadow: var(--shadow-lg); overflow: hidden; animation: fadeUp .2s ease forwards; }
.notif-head { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.notif-hd-txt { font-size: 14px; font-weight: 700; color: var(--text); }
.notif-clr { font-size: 11.5px; color: var(--purple); font-weight: 600; cursor: pointer; background: none; }
.notif-scroll { max-height: 320px; overflow-y: auto; }
.notif-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background .1s; position: relative; }
.notif-row:hover { background: var(--surface2); }
.notif-row:last-child { border-bottom: none; }
.notif-ic { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.notif-read-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--purple); flex-shrink: 0; margin-top: 5px; }

/* ── STAT STRIP ── */
.stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 20px; }
.stat-tile { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 1.25rem; display: flex; align-items: center; gap: 14px; transition: all .2s; cursor: default; }
.stat-tile:hover { border-color: var(--border2); box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.stat-tile-ic { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
.stat-val { font-size: 28px; font-weight: 800; line-height: 1; letter-spacing: -.5px; }
.stat-lbl { font-size: 11.5px; margin-top: 4px; font-weight: 600; text-transform: uppercase; opacity: 0.85; }

/* ── CARD ── */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); }
.card-hd { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text3); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
.card-hd-title { display: flex; align-items: center; gap: 6px; }

/* ── ROW-ITEMS ── */
.row-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.row-item:last-child { border-bottom: none; padding-bottom: 0; }
.row-item:first-child { padding-top: 0; }
.ic-box { border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: var(--shadow-sm); }

/* ── CHIP ── */
.chip { display: inline-flex; align-items: center; font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 99px; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.02em; }

/* ── GROUPS ── */
.grp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.grp-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-lg); padding: 1.5rem; display: flex; flex-direction: column; transition: all .25s; cursor: pointer; box-shadow: var(--shadow-sm); }
.grp-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); border-color: var(--border2); }
.grp-card.joined { border-color: var(--purple); background: var(--purple-soft); }

/* ── DISC ── */
.disc-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 20px; }
@media (max-width: 1024px) { .disc-layout { grid-template-columns: minmax(0, 1fr); } }
.disc-post { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 1.5rem; margin-bottom: 12px; transition: border-color .15s; box-shadow: var(--shadow-sm); }
.disc-post:hover { border-color: var(--border2); }
.disc-reply { background: var(--surface2); padding: 12px 14px; margin-top: 10px; border-radius: var(--r); border-left: 4px solid var(--purple-ring); }

/* ── AI CHAT ── */
.ai-msgs { display: flex; flex-direction: column; gap: 10px; height: 260px; overflow-y: auto; background: var(--surface2); border-radius: var(--r); padding: 14px; margin-bottom: 10px; border: 1px solid var(--border); }
.ai-bubble { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; border-top-left-radius: 3px; padding: 10px 14px; font-size: 13px; line-height: 1.6; max-width: 85%; color: var(--text); box-shadow: var(--shadow-sm); }
.ai-bubble pre { background: var(--surface2); color: var(--purple); font-family: 'Spline Sans Mono', monospace; font-size: 11.5px; padding: 8px; border-radius: 6px; margin-top: 6px; overflow-x: auto; border: 1px solid var(--border); }
.user-bubble { background: linear-gradient(135deg, #7c3aed, #6d28d9); border-radius: 14px; border-bottom-right-radius: 3px; padding: 10px 14px; font-size: 13px; color: #fff; line-height: 1.6; max-width: 85%; margin-left: auto; box-shadow: var(--shadow-sm); }
.ai-typing { font-style: italic; color: var(--text3); font-size: 12px; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

/* ── INPUTS ── */
.inp { width: 100%; padding: 11px 14px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--r); color: var(--text); font-size: 13.5px; outline: none; transition: all .15s; }
.inp:focus { border-color: var(--purple); background: var(--surface); box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.ta { width: 100%; padding: 12px 14px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--r); color: var(--text); font-size: 13.5px; outline: none; resize: none; min-height: 80px; line-height: 1.6; transition: all .15s; }
.ta:focus { border-color: var(--purple); background: var(--surface); }
.sel { width: 100%; padding: 11px 14px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--r); color: var(--text); font-size: 13.5px; outline: none; margin-bottom: 12px; transition: all .15s; }
.sel:focus { border-color: var(--purple); background: var(--surface); }

/* ── BUTTONS ── */
.btn { padding: 9px 18px; border-radius: var(--r); font-size: 13.5px; font-weight: 600; border: 1.5px solid var(--border); background: var(--surface); color: var(--text2); transition: all .15s; text-align: center; white-space: nowrap; }
.btn:hover { border-color: var(--border2); background: var(--surface2); color: var(--text); }
.btn-primary { background: linear-gradient(135deg, #7c3aed, #6d28d9); border-color: transparent; color: #fff; box-shadow: 0 3px 10px rgba(124,58,237,.25); }
.btn-primary:hover { box-shadow: 0 4px 16px rgba(124,58,237,.35); transform: translateY(-1px); color: #fff; border-color: transparent; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.btn-sm { padding: 7px 14px; font-size: 12.5px; }
.btn-xs { padding: 5px 11px; font-size: 11.5px; }
.w-full { width: 100%; }

/* ── PILLS ── */
.pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.pill { padding: 6px 14px; border-radius: 99px; font-size: 12.5px; font-weight: 600; border: 1.5px solid var(--border); background: var(--surface); color: var(--text2); cursor: pointer; transition: all .13s; }
.pill:hover { border-color: var(--purple-ring); color: var(--purple); }
.pill.on { background: var(--purple-soft); border-color: var(--purple-ring); color: var(--purple); }

/* ── RES TABLE ── */
.res-table-container { border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; background: var(--surface); box-shadow: var(--shadow-sm); }
.res-table { width: 100%; border-collapse: collapse; }
.res-table th { font-size: 10.5px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .08em; padding: 12px 16px; text-align: left; background: var(--surface2); border-bottom: 1px solid var(--border); }
.res-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.res-table tr:last-child td { border-bottom: none; }
.res-table tr:hover td { background: var(--surface2); }

/* ── PROFILE BANNER ── */
.prof-banner { height: 110px; border-radius: var(--r-lg); margin-bottom: -48px; background: linear-gradient(135deg, #1e1b4b 0%, #31105e 40%, #0f3057 70%, #081c30 100%); position: relative; overflow: hidden; }
.prof-banner::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 20% 50%, rgba(124,58,237,.4) 0%, transparent 55%), radial-gradient(ellipse 40% 60% at 80% 30%, rgba(14,165,233,.25) 0%, transparent 55%); }

/* ── PROGRESS ── */
.prog-track { height: 6px; background: var(--surface2); border-radius: 99px; margin-top: 6px; overflow: hidden; }
.prog-fill { height: 6px; border-radius: 99px; transition: width 0.3s ease; }

/* ── MODALS ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease forwards; }
.modal-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); width: 100%; max-width: 500px; padding: 1.75rem; box-shadow: var(--shadow-lg); position: relative; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.modal-title { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.4px; margin-bottom: 14px; }
.modal-close { position: absolute; top: 18px; right: 18px; width: 30px; height: 30px; border-radius: 50%; background: var(--surface2); display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; color: var(--text2); }
.modal-close:hover { background: var(--border); color: var(--text); }

/* ── ANIMS ── */
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade { animation: fadeUp .3s ease forwards; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
.pulsing { animation: blink 1.4s infinite; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* ── AI RECOMMENDATION LOADING OVERLAY ── */
.match-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; text-align: center; }
.match-loader { border: 4px solid var(--purple-soft); border-left-color: var(--purple); width: 44px; height: 44px; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

.room-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; }
@media (max-width: 1024px) { .room-grid { grid-template-columns: minmax(0, 1fr); } }
.room-timer-card { background: linear-gradient(135deg, #1e1b4b, #31105e); color: white; text-align: center; padding: 2.5rem; border-radius: var(--r-xl); display: flex; flex-direction: column; align-items: center; gap: 15px; position: relative; overflow: hidden; }
.room-timer-card::after { content:''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(167, 139, 250, 0.25), transparent); }
.room-timer-digits { font-family: 'Spline Sans Mono', monospace; font-size: 64px; font-weight: 700; line-height: 1; letter-spacing: -1px; text-shadow: 0 0 20px rgba(255, 255, 255, 0.2); }

/* ── VIDEO / VOICE CONFERENCE MEETING ROOM ── */
.room-meet-container { display: flex; flex-direction: column; gap: 16px; height: 620px; background: #0f172a; border-radius: var(--r-xl); overflow: hidden; border: 1px solid #334155; position: relative; }
.room-meet-grid { flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; padding: 16px; overflow-y: auto; background: #090d16; content-visibility: auto; }
.meet-card { background: #1e293b; border-radius: var(--r-lg); border: 2px solid transparent; overflow: hidden; position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; aspect-ratio: 16/9; box-shadow: var(--shadow); transition: all 0.2s; }
.meet-card.speaking { border-color: var(--purple); box-shadow: 0 0 15px rgba(124, 58, 237, 0.4); }
.meet-video { width: 100%; height: 100%; object-fit: cover; background: #090d16; transform: scaleX(-1); }
.meet-avatar-placeholder { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; height: 100%; justify-content: center; background: radial-gradient(circle, #334155, #1e293b); }
.meet-meta { position: absolute; bottom: 10px; left: 10px; display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.7); padding: 4px 10px; border-radius: 20px; color: white; font-size: 11.5px; z-index: 10; font-weight: 500; backdrop-filter: blur(4px); }
.meet-meta-mic { font-size: 11px; }
.meet-controls { height: 72px; background: #1e293b; border-top: 1px solid #334155; display: flex; justify-content: center; align-items: center; gap: 14px; padding: 0 20px; z-index: 20; }
.meet-btn { width: 44px; height: 44px; border-radius: 50%; background: #334155; color: white; font-size: 18px; display: flex; justify-content: center; align-items: center; transition: all 0.2s; cursor: pointer; }
.meet-btn:hover { background: #475569; transform: scale(1.05); }
.meet-btn.off { background: #ef4444; }
.meet-btn.off:hover { background: #dc2626; }
.meet-btn-leave { background: #ef4444; width: 54px; height: 44px; border-radius: 22px; font-size: 18px; }
.meet-btn-leave:hover { background: #dc2626; }

/* ── SIDEBAR PANEL FOR MEETING (PARTICIPANTS & CHAT) ── */
.room-meet-sidebar { width: 320px; background: #1e293b; border-left: 1px solid #334155; display: flex; flex-direction: column; height: 100%; }
.room-meet-sb-tabs { display: flex; border-bottom: 1px solid #334155; }
.room-meet-sb-tab { flex: 1; padding: 12px; text-align: center; color: #94a3b8; font-weight: 600; font-size: 12.5px; cursor: pointer; background: transparent; border-bottom: 2px solid transparent; }
.room-meet-sb-tab.on { color: white; border-bottom-color: var(--purple); background: rgba(255,255,255,0.02); }
.room-meet-sb-body { flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 16px; color: #e2e8f0; }

.meet-chat-msgs { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.meet-chat-msg { background: #334155; padding: 8px 12px; border-radius: 10px; font-size: 12px; }
.meet-chat-meta { display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; margin-bottom: 4px; }

.g2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
@media (max-width: 900px) { .g2 { grid-template-columns: minmax(0, 1fr); } }

/* Mobile and Tablet Sizing and Layout Adjustments */
.mob-hamburger { display: none; }
.mob-close-btn { display: none; }

@media (max-width: 768px) {
  .mob-hamburger { display: flex !important; }
  .mob-close-btn { display: flex !important; width: 30px; height: 30px; font-size: 11px; margin-left: auto; }
  
  /* Slide-over sidebar on mobile */
  .sb {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: var(--shadow-lg);
  }
  
  .sb.open {
    transform: translateX(0);
  }
  
  .sb-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
  }
  
  .page {
    padding: 1rem !important;
  }
  
  .topbar {
    padding: 0 1rem !important;
  }
}

@media (max-width: 480px) {
  .stat-strip { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
}
.flex { display: flex; }
.ic { align-items: center; }
.jb { justify-content: space-between; }
.fw { flex-wrap: wrap; }
.gap2 { gap: 8px; }
.gap3 { gap: 12px; }
.mt2 { margin-top: 8px; }
.mt3 { margin-top: 12px; }
.mt4 { margin-top: 18px; }
.mb2 { margin-bottom: 8px; }
.mb3 { margin-bottom: 12px; }
.muted { color: var(--text2); }
.dim { color: var(--text3); }
.trunc { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw5 { font-weight: 500; }
.fw6 { font-weight: 600; }
.fw7 { font-weight: 700; }
.fw8 { font-weight: 800; }
.fs18 { font-size: 18px; }
.fs14 { font-size: 14px; }
.fs13 { font-size: 13px; }
.fs12 { font-size: 12px; }
.fs11 { font-size: 11px; }
.fs10 { font-size: 10px; }

/* Star rating selector */
.star-selector { display: flex; gap: 6px; }
.star-btn { font-size: 24px; color: var(--border2); cursor: pointer; transition: color 0.15s; background: none; }
.star-btn.active { color: #eab308; }

/* Interactive inline row star sizing */
.row-star-container { display: flex; gap: 2px; }
.row-star { font-size: 15px; color: var(--border2); transition: color 0.12s; background: none; }
.row-star.active { color: #eab308; }

/* ── NEW PROFILE REDESIGN ── */
.prof-header-card {
  padding: 0;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  background: var(--surface);
  border-radius: var(--r-xl);
}

.prof-banner-area {
  height: 185px;
  background: linear-gradient(135deg, #ff007f 0%, #ff5e62 40%, #ff9966 80%, #7c3aed 100%);
  position: relative;
}

.prof-banner-area::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 70%);
}

.prof-avatar-wrap {
  position: absolute;
  bottom: -40px;
  left: 32px;
  border: 6px solid var(--surface);
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  background: var(--surface);
  z-index: 10;
  display: flex;
}

.prof-body-area {
  padding: 55px 32px 32px;
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 32px;
  align-items: center;
}

.prof-details-block {
  text-align: left;
}

.prof-metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.prof-bio-quote {
  line-height: 1.6;
  background: var(--surface2);
  padding: 16px 20px;
  border-radius: var(--r);
  border-left: 5px solid var(--purple);
  position: relative;
}

.timeline-point {
  display: flex;
  gap: 16px;
  align-items: center;
  transition: transform 0.2s;
}

.timeline-point:hover {
  transform: translateX(4px);
}

.timeline-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--purple);
  border: 2px solid var(--surface);
  box-shadow: 0 0 0 3px var(--purple-ring);
  flex-shrink: 0;
}

.credential-badge-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--surface2);
  border-radius: var(--r);
  border: 1px solid transparent;
  transition: all 0.2s;
}

.credential-badge-item:hover {
  transform: translateY(-2px);
  border-color: var(--border2);
  box-shadow: var(--shadow-sm);
  background: var(--surface);
}

@media (max-width: 768px) {
  .prof-avatar-wrap {
    left: 50%;
    transform: translateX(-50%);
    bottom: -45px;
  }
  .prof-body-area {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 65px 20px 24px;
  }
  .prof-details-block {
    text-align: center;
  }
  .prof-details-block .chip-row {
    justify-content: center;
  }
  .prof-metrics-grid {
    gap: 10px;
  }
}
`;

/* ─── Sub-components ──────────────────────────────────────── */
function Chip({ bg, color, children, style = {} }) {
  return <span className="chip" style={{ background: bg, color, ...style }}>{children}</span>;
}

function Av({ initials, size = 30, bg = "#f5f3ff", fg = "#7c3aed" }) {
  return (
    <div className="av" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.35, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ margin: "auto", display: "block", textAlign: "center", fontWeight: 700 }}>{initials}</span>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {title && <div className="modal-title">{title}</div>}
        <div style={{ marginTop: 10 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── AUTH ────────────────────────────────────────────────── */
function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", program: "", password: "", preferences: "" });
  const fld = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  function submit(e) {
    e.preventDefault();
    const nm = form.name || "Aisyah Nur";
    onLogin({
      name: nm,
      email: form.email || "aisyah@uni.edu",
      program: form.program || "Computer Science",
      preferences: form.preferences || "Database Systems",
      av: nm.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      bio: "Undergraduate student passionate about programming, query systems, and software architectures.",
      location: "Kuala Lumpur, MY"
    });
  }
  return (
    <div className="auth">
      <div className="auth-panel">
        <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "rgba(124,58,237,.18)", top: "50%", left: "50%", transform: "translate(-50%, -50%)", filter: "blur(70px)", pointerEvents: "none" }} />
        <div>
          <div className="auth-brand">Study<em>Sphere</em></div>
          <div className="auth-tagline">Your academic community for collaborative learning and peer support.</div>
        </div>
        <div className="auth-feats">
          {[
            ["👥", "Find study partners that match your schedule"],
            ["🤖", "AI-powered study assistant, 24/7 support"],
            ["📚", "Shared library of notes and past papers"],
            ["🏆", "Earn reputation by helping others learn"]
          ].map(([ic, tx]) => (
            <div key={tx} className="auth-feat"><span className="auth-feat-icon">{ic}</span><span className="auth-feat-text">{tx}</span></div>
          ))}
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-box fade">
          <div className="auth-title">{isLogin ? "Welcome back 👋" : "Join StudySphere"}</div>
          <div className="auth-subtitle">{isLogin ? "Sign in to continue your learning journey." : "Create your free account today."}</div>
          <form onSubmit={submit}>
            {!isLogin && <div className="field-group"><label className="field-label">Full name</label><input className="field-input" placeholder="Aisyah Nur" onChange={fld("name")} /></div>}
            <div className="field-group"><label className="field-label">Email / Student ID</label><input className="field-input" required placeholder="student@university.edu" onChange={fld("email")} /></div>
            {!isLogin && <div className="field-group"><label className="field-label">Program</label><input className="field-input" placeholder="Computer Science" onChange={fld("program")} /></div>}
            {!isLogin && <div className="field-group"><label className="field-label">Preferred Courses (comma separated)</label><input className="field-input" placeholder="e.g. Database Systems, Java Programming" onChange={fld("preferences")} /></div>}
            <div className="field-group"><label className="field-label">Password</label><input className="field-input" type="password" required placeholder="••••••••" onChange={fld("password")} /></div>
            <button className="btn-auth" type="submit">{isLogin ? "Sign in →" : "Create account →"}</button>
          </form>
          <div className="auth-swap">{isLogin ? <span>New here? <span onClick={() => setIsLogin(false)}>Create an account</span></span> : <span>Already have an account? <span onClick={() => setIsLogin(true)}>Sign in</span></span>}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── SIDEBAR ─────────────────────────────────────────────── */
function Sidebar({ page, setPage, user, notifs, onLogout, sidebarOpen, setSidebarOpen }) {
  const unread = notifs.filter(n => !n.read).length;
  const items = [
    { id: "dashboard", ic: "🏠", label: "Dashboard" },
    { id: "groups", ic: "👥", label: "Study Groups" },
    { id: "discussion", ic: "💬", label: "Discussions" },
    { id: "resources", ic: "📚", label: "Resources" },
    { id: "profile",   ic: "👤", label: "Profile" },
  ];
  return (
    <>
      {sidebarOpen && <div className="sb-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className={`sb ${sidebarOpen ? "open" : ""}`}>
        <div className="sb-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="sb-logo">Study<em>Sphere</em></div>
            <div className="sb-sub">Academic Community</div>
          </div>
          <button className="ic-btn mob-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="sb-nav">
          <div className="sb-group-label">Menu</div>
          {items.map(it => (
            <div key={it.id} className={`sb-item ${page === it.id ? "on" : ""}`} onClick={() => { setPage(it.id); setSidebarOpen(false); }}>
              <div className="sb-item-ic">{it.ic}</div>
              <span>{it.label}</span>
              {it.id === "discussion" && unread > 0 && <span className="sb-badge">{unread}</span>}
            </div>
          ))}
        </div>
        <div className="sb-foot">
          <div className="sb-user" onClick={() => { setPage("profile"); setSidebarOpen(false); }}>
            <Av initials={user.av} size={32} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="trunc" style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{user.name}</div>
              <div className="trunc dim" style={{ fontSize: 10 }}>{user.program}</div>
            </div>
            <button style={{ fontSize: 13, color: "var(--text3)", background: "none" }} onClick={(e) => { e.stopPropagation(); onLogout(); }} title="Sign Out">🚪</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── TOPBAR ──────────────────────────────────────────────── */
const PAGE_META = {
  dashboard: { title: "Dashboard", ic: "🏠", pill: "var(--orange-soft)", color: "var(--orange)" },
  groups: { title: "Study Groups", ic: "👥", pill: "var(--green-soft)", color: "var(--green)" },
  discussion: { title: "Discussions Circle", ic: "💬", pill: "var(--pink-soft)", color: "var(--pink)" },
  resources: { title: "Resource Library", ic: "📚", pill: "var(--teal-soft)", color: "var(--teal)" },
  profile: { title: "My Profile", ic: "👤", pill: "var(--purple-soft)", color: "var(--purple)" },
  studyroom: { title: "Live Study Session", ic: "⏱️", pill: "var(--purple-soft)", color: "var(--purple)" }
};

function Topbar({ page, setPage, notifs, setNotifs, darkMode, setDarkMode, setSidebarOpen }) {
  const [show, setShow] = useState(false);
  const unread = notifs.filter(n => !n.read).length;
  const meta = PAGE_META[page] || PAGE_META["dashboard"];

  function markRead(id) {
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function clearAll() {
    setNotifs(p => p.map(n => ({ ...n, read: true })));
    setShow(false);
  }

  return (
    <div className="topbar">
      <div className="tb-title-row">
        <button className="ic-btn mob-hamburger" onClick={() => setSidebarOpen(true)} style={{ marginRight: 8 }} title="Open Menu">☰</button>
        <div className="tb-page-pill" style={{ background: meta.pill, color: meta.color }}>{meta.ic}</div>
        <div className="tb-title">{meta.title}</div>
      </div>
      <div className="tb-right">
        {/* Dark Mode Toggle */}
        <button className="ic-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button className="ic-btn" onClick={() => setShow(s => !s)} title="Notifications">
            🔔{unread > 0 && <div className="notif-pip" />}
          </button>
          {show && (
            <div className="notif-panel">
              <div className="notif-head">
                <span className="notif-hd-txt">Notifications</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {unread > 0 && <Chip bg="var(--purple-soft)" color="var(--purple)">{unread} new</Chip>}
                  <button className="notif-clr" onClick={clearAll}>Mark all read</button>
                </div>
              </div>
              <div className="notif-scroll">
                {notifs.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text3)", fontSize: 12 }}>No notifications yet</div>
                ) : (
                  notifs.map(n => (
                    <div key={n.id} className="notif-row" style={{ opacity: n.read ? 0.6 : 1 }} onClick={() => markRead(n.id)}>
                      <div className="notif-ic" style={{ background: n.color }}>{n.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: "var(--text)", lineHeight: 1.4 }}>{n.text}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{n.sub}</div>
                      </div>
                      {!n.read && <div className="notif-read-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button className="ic-btn" onClick={() => setPage("profile")} title="View Profile">👤</button>
      </div>
    </div>
  );
}

/* ─── MOCK VIDEO AND VOICE CLASSROOM ───────────────────────── */
function StudyRoom({ session, user, onLeave }) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("people"); // "people" or "chat"
  
  // Real webcam feed handles
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);

  // Call members list simulation
  const [peers, setPeers] = useState([]);
  const [meetMessages, setMeetMessages] = useState([
    { id: 1, author: "System", text: `Welcome to ${session.name} virtual class.`, time: "8:00 PM" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Speech indicator simulation
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  // Attempt local camera capture
  useEffect(() => {
    if (cameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(str => {
          setLocalStream(str);
          if (localVideoRef.current) localVideoRef.current.srcObject = str;
        })
        .catch(err => {
          console.warn("Real Camera stream not available (using animated placeholder):", err);
          setLocalStream(null);
        });
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn]);

  // Peer join simulations over time
  useEffect(() => {
    const list = [
      { id: 101, name: "Kumar ID", initials: "KM", bg: "radial-gradient(circle, #f97316, #431407)", accent: "#f97316", mic: true, cam: true, delay: 1000 },
      { id: 102, name: "Rania MD", initials: "RN", bg: "radial-gradient(circle, #8b5cf6, #2d0654)", accent: "#8b5cf6", mic: true, cam: false, delay: 3500 },
      { id: 103, name: "Ali TR", initials: "AL", bg: "radial-gradient(circle, #10b981, #063c27)", accent: "#10b981", mic: false, cam: true, delay: 6000 }
    ];

    const timeouts = list.map(p => {
      return setTimeout(() => {
        setPeers(prev => {
          if (prev.some(x => x.id === p.id)) return prev;
          return [...prev, p];
        });
        setMeetMessages(msgs => [
          ...msgs,
          { id: Date.now(), author: "System", text: `${p.name.split(" ")[0]} joined the meeting.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }, p.delay);
    });

    // Speak indicator loop
    const talkInterval = setInterval(() => {
      const speakers = [null, "Kumar ID", "Ali TR", null];
      const selected = speakers[Math.floor(Math.random() * speakers.length)];
      setActiveSpeaker(selected);
    }, 4000);

    // Dynamic Peer chats in meeting
    const chatTimeouts = [
      setTimeout(() => {
        setMeetMessages(msgs => [
          ...msgs,
          { id: Date.now() + 10, author: "Kumar ID", text: "Hey guys! Happy to join the study call.", time: "8:01 PM" }
        ]);
      }, 5000),
      setTimeout(() => {
        setMeetMessages(msgs => [
          ...msgs,
          { id: Date.now() + 11, author: "Ali TR", text: "Hey! Did we cover normal forms yet?", time: "8:03 PM" }
        ]);
      }, 9000),
    ];

    return () => {
      timeouts.forEach(clearTimeout);
      chatTimeouts.forEach(clearTimeout);
      clearInterval(talkInterval);
    };
  }, [session]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMeetMessages([
      ...meetMessages,
      {
        id: Date.now(),
        author: user.name,
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput("");
  };

  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{session.name} Room</h2>
          <div className="muted fs13 mt2">Classroom Session · Collaborative Video & Audio Room</div>
        </div>
        <button className="btn" onClick={() => {
          if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
          }
          onLeave();
        }}>🚪 Disconnect</button>
      </div>

      <div className="room-meet-container">
        <div style={{ display: "flex", flex: 1, height: "calc(100% - 72px)" }}>
          {/* Main Grid */}
          <div className="room-meet-grid">
            {/* Self feed */}
            <div className={`meet-card ${activeSpeaker === user.name ? "speaking" : ""}`}>
              {cameraOn && localStream ? (
                <video ref={localVideoRef} className="meet-video" autoPlay playsInline muted />
              ) : (
                <div className="meet-avatar-placeholder">
                  <Av initials={user.av} size={72} bg="var(--purple-soft)" fg="var(--purple)" />
                  <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{user.name} (You)</div>
                </div>
              )}
              <div className="meet-meta">
                <span className="meet-meta-mic">{micOn ? "🎙️" : "🔇"}</span>
                <span>{user.name} (You)</span>
              </div>
            </div>

            {/* Peer feeds */}
            {peers.map(p => (
              <div key={p.id} className={`meet-card ${activeSpeaker === p.name ? "speaking" : ""}`}>
                {p.cam ? (
                  <div className="meet-avatar-placeholder" style={{ background: p.bg }}>
                    <Av initials={p.initials} size={64} fg={p.accent} bg="rgba(255,255,255,0.08)" />
                    <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600 }}>[Video Stream]</div>
                  </div>
                ) : (
                  <div className="meet-avatar-placeholder" style={{ background: "#1e293b" }}>
                    <Av initials={p.initials} size={64} fg={p.accent} bg="rgba(255,255,255,0.04)" />
                  </div>
                )}
                <div className="meet-meta">
                  <span className="meet-meta-mic">{p.mic ? "🎙️" : "🔇"}</span>
                  <span>{p.name.split(" ")[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Meeting Sidebar */}
          <div className="room-meet-sidebar">
            <div className="room-meet-sb-tabs">
              <button className={`room-meet-sb-tab ${sidebarTab === "people" ? "on" : ""}`} onClick={() => setSidebarTab("people")}>
                Participants ({peers.length + 1})
              </button>
              <button className={`room-meet-sb-tab ${sidebarTab === "chat" ? "on" : ""}`} onClick={() => setSidebarTab("chat")}>
                Class Chat
              </button>
            </div>

            <div className="room-meet-sb-body">
              {sidebarTab === "people" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Self participant */}
                  <div className="flex jb ic" style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 10 }}>
                    <div className="flex ic gap2">
                      <Av initials={user.av} size={28} />
                      <span className="fw6 fs12" style={{ color: "white" }}>{user.name} (You)</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span>{micOn ? "🎙️" : "🔇"}</span>
                      <span>{cameraOn ? "📷" : "🚫"}</span>
                    </div>
                  </div>

                  {/* Peer participants */}
                  {peers.map(p => (
                    <div key={p.id} className="flex jb ic" style={{ padding: "6px 10px" }}>
                      <div className="flex ic gap2">
                        <Av initials={p.initials} size={28} fg={p.accent} bg="rgba(255,255,255,0.05)" />
                        <span className="fs12">{p.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span>{p.mic ? "🎙️" : "🔇"}</span>
                        <span>{p.cam ? "📷" : "🚫"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="meet-chat-msgs">
                    {meetMessages.map((m, idx) => (
                      <div key={idx} className="meet-chat-msg" style={m.author === "System" ? { background: "rgba(255,255,255,0.03)", color: "#94a3b8", textAlign: "center" } : {}}>
                        {m.author !== "System" && (
                          <div className="meet-chat-meta">
                            <span className="fw7">{m.author.split(" ")[0]}</span>
                            <span>{m.time}</span>
                          </div>
                        )}
                        <div>{m.text}</div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChat} className="flex gap2" style={{ marginTop: "auto" }}>
                    <input className="inp fs11" style={{ padding: "8px 12px", background: "#334155", color: "white", borderColor: "#475569" }} placeholder="Type meeting message..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
                    <button className="btn btn-xs btn-primary" type="submit">Send</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meeting Controls Bar */}
        <div className="meet-controls">
          <button className={`meet-btn ${!micOn ? "off" : ""}`} onClick={() => setMicOn(!micOn)} title={micOn ? "Mute Microphone" : "Unmute Microphone"}>
            {micOn ? "🎙️" : "🔇"}
          </button>
          <button className={`meet-btn ${!cameraOn ? "off" : ""}`} onClick={() => setCameraOn(!cameraOn)} title={cameraOn ? "Turn Camera Off" : "Turn Camera On"}>
            {cameraOn ? "📷" : "🚫"}
          </button>
          <button className={`meet-btn ${screenSharing ? "on" : ""}`} style={screenSharing ? { background: "var(--purple)" } : {}} onClick={() => setScreenSharing(!screenSharing)} title="Share Screen">
            🖥️
          </button>
          <button className="meet-btn meet-btn-leave" onClick={() => {
            if (localStream) localStream.getTracks().forEach(t => t.stop());
            onLeave();
          }} title="Leave Call">
            🔴
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ───────────────────────────────────────────── */
function Dashboard({ user, setPage, aiGrps, groups, loadAI, discs, joined, setJoined, setRoomSession }) {
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  // Group list count
  const myGroupsCount = joined.length;

  // Dynamically calculate matching recommendations based on user preferences and program!
  const recommendedGroups = getMatchedGroups(groups, user.preferences, user.program).slice(0, 3);

  return (
    <div className="fade">
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>{greet}, {user.name.split(" ")[0]} 👋</div>
        <div className="muted fs13 mt2">Welcome to StudySphere. Here is your dashboard overview.</div>
      </div>

      <div className="stat-strip">
        {[
          { l: "Groups joined", v: myGroupsCount, ic: "👥", bg: "var(--orange-soft)", tc: "var(--orange)" },
          { l: "Materials shared", v: user.sharedCount || "12", ic: "📚", bg: "var(--purple-soft)", tc: "var(--purple)" },
          { l: "Rep points", v: "47", ic: "⭐", bg: "var(--teal-soft)", tc: "var(--teal)" },
          { l: "Badges earned", v: "2", ic: "🏆", bg: "var(--green-soft)", tc: "var(--green)" },
        ].map(s => (
          <div key={s.l} className="stat-tile">
            <div className="stat-tile-ic" style={{ background: s.bg, color: s.tc }}>{s.ic}</div>
            <div>
              <div className="stat-val" style={{ color: s.tc }}>{s.v}</div>
              <div className="stat-lbl" style={{ color: s.tc }}>{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="g2" style={{ alignItems: "stretch", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%", flex: 1 }}>
          {/* AI Recommendations */}
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 14 }}>
            <div>
              <div className="card-hd" style={{ marginBottom: 8 }}>
                <span className="card-hd-title">🤖 AI Group Recommendations</span>
              </div>
              {loadAI ? (
                <div className="match-overlay">
                  <div className="match-loader"></div>
                  <div className="muted fs12 pulsing">Analyzing your curriculum and matching active groups...</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {(aiGrps.length ? aiGrps : recommendedGroups).map((g, i) => {
                    const isJ = joined.includes(g.id);
                    return (
                      <div key={i} className="row-item" style={{ cursor: "pointer" }} onClick={() => setPage("groups")}>
                        <div className="ic-box" style={{ width: 36, height: 36, background: g.soft || "var(--orange-soft)", fontSize: 16 }}>{g.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="fw6 trunc" style={{ fontSize: 13 }}>{g.name}</div>
                          <div className="dim fs11 mt2">{g.subject}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <Chip bg={g.soft || "var(--purple-soft)"} color={g.accent || "var(--purple)"}>{g.match ? g.match + "% Match" : "Recommended"}</Chip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {!loadAI && <button className="btn w-full" style={{ fontSize: 12, marginTop: "auto" }} onClick={() => setPage("groups")}>Browse all groups →</button>}
          </div>

          {/* Upcoming Sessions */}
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 14 }}>
            <div>
              <div className="card-hd" style={{ marginBottom: 8 }}>📅 Upcoming Sessions</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { id: 1, g: "Database Warriors", t: "Tonight · 8:00 PM", accent: "#f97316", soft: "#fff7ed" },
                  { id: 2, g: "Java Masters", t: "Friday · 7:00 PM", accent: "#8b5cf6", soft: "#f5f3ff" },
                  { id: 3, g: "SE Study Circle", t: "Saturday · 3:00 PM", accent: "#0ea5e9", soft: "#f0f9ff" },
                ].map((s, i) => (
                  <div key={i} className="row-item flex ic gap3">
                    <div style={{ width: 3, height: 34, borderRadius: 4, background: s.accent, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="fw6 fs13">{s.g}</div>
                      <div className="dim fs11 mt2">{s.t}</div>
                    </div>
                    <button
                      className="btn btn-xs btn-primary animate-pulse"
                      onClick={() => {
                        setRoomSession({ name: s.g, id: s.id });
                        setPage("studyroom");
                      }}
                    >
                      Join Meeting
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%", flex: 1 }}>
          {/* Recent Discussions */}
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 14 }}>
            <div>
              <div className="card-hd" style={{ marginBottom: 8 }}>💬 Recent Discussions</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {discs.slice(0, 3).map((d, i) => (
                  <div key={d.id} className="row-item" style={{ cursor: "pointer" }} onClick={() => setPage("discussion")}>
                    <Av initials={d.av} size={28} bg={d.avatarBg} fg={d.avatarFg} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="trunc fs13">{d.text}</div>
                      <div className="dim fs11 mt2">{d.author} · {d.group} · {d.time}</div>
                    </div>
                    {d.replies.length > 0 && <Chip bg="var(--surface2)" color="var(--text2)">{d.replies.length} replies</Chip>}
                  </div>
                ))}
              </div>
            </div>
            <button className="btn w-full" style={{ fontSize: 12, marginTop: "auto" }} onClick={() => setPage("discussion")}>View all discussions →</button>
          </div>

          {/* Badges and Progress */}
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 14 }}>
            <div>
              <div className="card-hd" style={{ marginBottom: 8 }}>🏅 Badges & Progress</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { ic: "🎓", n: "Helpful Learner", d: "Earned this week", done: true, bg: "#fef9c3", c: "#ca8a04" },
                  { ic: "⚡", n: "Active Learner", d: "3 sessions joined", done: true, bg: "#ecfdf5", c: "#059669" },
                  { ic: "🌟", n: "Top Mentor", d: "47 / 100 points", done: false, bg: "#fdf4ff", c: "#ec4899", p: 47 },
                ].map((b, i) => (
                  <div key={i} className="row-item">
                    <div className="ic-box" style={{ width: 36, height: 36, background: b.done ? b.bg : "var(--surface2)", opacity: b.done ? 1 : 0.6, fontSize: 16 }}>{b.ic}</div>
                    <div style={{ flex: 1 }}>
                      <div className="fw6 fs13">{b.n}</div>
                      <div className="dim fs11 mt2">{b.d}</div>
                      {b.p !== undefined && (
                        <div className="prog-track">
                          <div className="prog-fill" style={{ width: `${b.p}%`, background: b.c }} />
                        </div>
                      )}
                    </div>
                    {b.done && <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 14 }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── GROUPS ──────────────────────────────────────────────── */
function Groups({ groups, setGroups, joined, setJoined, aiGrps, setAiGrps, user }) {
  const [activeTab, setActiveTab] = useState("all");
  const [matchingStatus, setMatchingStatus] = useState("");
  const [loadMatch, setLoadMatch] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", subject: "", desc: "", schedule: "Evenings", icon: "📚" });
  const [detailGroup, setDetailGroup] = useState(null);

  const filtered = groups.filter(g => {
    if (activeTab === "joined") return joined.includes(g.id);
    return true;
  });

  const runLocalMatching = () => {
    if (loadMatch) return;
    setLoadMatch(true);
    setMatchingStatus("Reading profile details...");

    const steps = [
      { t: "Analyzing preferred courses...", d: 600 },
      { t: "Comparing schedules and times...", d: 1200 },
      { t: "Predicting peer compatibility scores...", d: 1800 },
      { t: "Formatting match matrices...", d: 2400 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setMatchingStatus(step.t);
      }, step.d);
    });

    setTimeout(() => {
      const matched = getMatchedGroups(groups, user.preferences, user.program);
      setAiGrps(matched);
      setLoadMatch(false);
      setMatchingStatus("");
      alert("AI matching complete! Best groups ranked on Dashboard.");
    }, 3000);
  };

  const handleGroupToggle = (id) => {
    if (joined.includes(id)) {
      setJoined(joined.filter(x => x !== id));
    } else {
      setJoined([...joined, id]);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.subject.trim()) return;

    const palettes = [
      { accent: "#f97316", soft: "#fff7ed", ring: "#fed7aa" },
      { accent: "#8b5cf6", soft: "#f5f3ff", ring: "#ddd6fe" },
      { accent: "#0ea5e9", soft: "#f0f9ff", ring: "#bae6fd" },
      { accent: "#10b981", soft: "#ecfdf5", ring: "#a7f3d0" },
      { accent: "#ec4899", soft: "#fdf2f8", ring: "#fbcfe8" },
    ];
    const design = palettes[groups.length % palettes.length];
    
    const newId = Date.now();
    const newGroup = {
      id: newId,
      name: createForm.name.trim(),
      subject: createForm.subject.trim(),
      members: 1,
      icon: createForm.icon || "📚",
      accent: design.accent,
      soft: design.soft,
      ring: design.ring,
      desc: createForm.desc.trim() || "Collaborative study community.",
      schedule: createForm.schedule || "Evenings"
    };

    setGroups([newGroup, ...groups]);
    setJoined([...joined, newId]);
    setIsCreateOpen(false);
    setCreateForm({ name: "", subject: "", desc: "", schedule: "Evenings", icon: "📚" });
    alert(`Success! "${newGroup.name}" group created. You have automatically joined it.`);
  };

  return (
    <div className="fade">
      <div className="flex jb ic mb3 fw gap2">
        <div className="pill-row" style={{ marginBottom: 0 }}>
          <button className={`pill ${activeTab === "all" ? "on" : ""}`} onClick={() => setActiveTab("all")}>All Groups ({groups.length})</button>
          <button className={`pill ${activeTab === "joined" ? "on" : ""}`} onClick={() => setActiveTab("joined")}>My Groups ({joined.length})</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-sm" onClick={() => setIsCreateOpen(true)}>＋ Create Group</button>
          <button className="btn btn-primary btn-sm" onClick={runLocalMatching} disabled={loadMatch}>
            {loadMatch ? "⌛ Analyzing..." : "⚡ AI Profile Match"}
          </button>
        </div>
      </div>

      {loadMatch && (
        <div className="card mb3 text-center" style={{ padding: "40px 20px" }}>
          <div className="match-loader" style={{ margin: "0 auto 15px" }}></div>
          <div className="fw6 fs14">{matchingStatus}</div>
        </div>
      )}

      <div className="grp-grid">
        {filtered.map(g => {
          const isJ = joined.includes(g.id);
          const matchScore = aiGrps.find(x => x.id === g.id)?.match;

          return (
            <div key={g.id} className={`grp-card ${isJ ? "joined" : ""}`} onClick={() => setDetailGroup(g)}>
              <div className="flex jb ic mb2">
                <div className="ic-box" style={{ width: 40, height: 40, background: g.soft, fontSize: 18 }}>{g.icon}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {matchScore && <Chip bg="var(--surface)" color={g.accent}>{matchScore}% Match</Chip>}
                  <Chip bg={isJ ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "var(--surface2)"} color={isJ ? "#fff" : "var(--text2)"}>
                    {isJ ? "Joined" : "View Info"}
                  </Chip>
                </div>
              </div>
              <div className="fw7 fs14 trunc" style={{ color: "var(--text)" }}>{g.name}</div>
              <div className="fs11 fw5 mt2" style={{ color: g.accent }}>{g.subject}</div>
              <p className="muted fs12 mt3" style={{ flex: 1, lineHeight: 1.5 }}>{g.desc}</p>
              <div className="flex jb ic mt4 pt3" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="dim fs11">👥 {g.members + (isJ && !groups.some(x => x.id === g.id && g.members === 1) && g.id !== 1 && g.id !== 3 ? 1 : 0)} members</span>
                <span className="dim fs11">📅 {g.schedule}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Group Details Modal (Shows description before joining) */}
      {detailGroup && (
        <Modal isOpen={!!detailGroup} onClose={() => setDetailGroup(null)} title="Study Circle Insights">
          <div style={{ textAlign: "center", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)", marginBottom: "1.25rem" }}>
            <div className="ic-box" style={{ width: 60, height: 60, background: detailGroup.soft, fontSize: 30, margin: "0 auto 12px", borderRadius: "14px" }}>{detailGroup.icon}</div>
            <h3 className="fw8 fs16" style={{ color: "var(--text)", margin: "8px 0 4px" }}>{detailGroup.name}</h3>
            <div className="fs12 fw6" style={{ color: detailGroup.accent }}>{detailGroup.subject}</div>
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="field-label" style={{ fontSize: 10, color: "var(--text3)" }}>About this Study Group</label>
            <p className="muted fs13" style={{ lineHeight: 1.6, padding: "12px", background: "var(--surface2)", borderRadius: "var(--r)", borderLeft: `4px solid ${detailGroup.accent}`, margin: "4px 0 16px" }}>
              {detailGroup.desc}
            </p>
            
            <div className="g2" style={{ gap: 10 }}>
              <div style={{ background: "var(--surface2)", padding: "12px", borderRadius: "12px" }}>
                <span className="field-label" style={{ fontSize: 9, marginBottom: 4 }}>Weekly Schedule</span>
                <span className="fw6 fs12" style={{ color: "var(--text)" }}>📅 {detailGroup.schedule}</span>
              </div>
              <div style={{ background: "var(--surface2)", padding: "12px", borderRadius: "12px" }}>
                <span className="field-label" style={{ fontSize: 9, marginBottom: 4 }}>Active Members</span>
                <span className="fw6 fs12" style={{ color: "var(--text)" }}>👥 {detailGroup.members + (joined.includes(detailGroup.id) && !groups.some(x => x.id === detailGroup.id && x.members === 1) && detailGroup.id !== 1 && detailGroup.id !== 3 ? 1 : 0)} joined</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDetailGroup(null)}>Close</button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 2, background: joined.includes(detailGroup.id) ? "linear-gradient(135deg, #ef4444, #dc2626)" : `linear-gradient(135deg, ${detailGroup.accent}, #7c3aed)` }} 
              onClick={() => {
                handleGroupToggle(detailGroup.id);
                setDetailGroup(null);
              }}
            >
              {joined.includes(detailGroup.id) ? "Leave Study Circle" : "Join Study Circle"}
            </button>
          </div>
        </Modal>
      )}

      {/* Create Group Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Study Circle">
        <form onSubmit={handleCreateGroup}>
          <div className="field-group">
            <label className="field-label">Group Name</label>
            <input className="field-input" required placeholder="e.g. Kotlin Specialists" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Subject / Course Focus</label>
            <input className="field-input" required placeholder="e.g. Kotlin Programming" value={createForm.subject} onChange={e => setCreateForm({ ...createForm, subject: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Group Icon (Emoji)</label>
            <select className="sel" value={createForm.icon} onChange={e => setCreateForm({ ...createForm, icon: e.target.value })}>
              <option value="📚">📚 Books</option>
              <option value="💻">💻 Code</option>
              <option value="🗄️">🗄️ Database</option>
              <option value="☕">☕ Java / Coffee</option>
              <option value="⚙️">⚙️ Engineering</option>
              <option value="🔢">🔢 Mathematics</option>
              <option value="🌐">🌐 Web</option>
              <option value="🎨">🎨 Design</option>
              <option value="🔬">🔬 Science</option>
              <option value="🐍">🐍 Python</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Schedule</label>
            <select className="sel" value={createForm.schedule} onChange={e => setCreateForm({ ...createForm, schedule: e.target.value })}>
              <option value="Evenings">Evenings</option>
              <option value="Weekends">Weekends</option>
              <option value="Mon/Wed">Mon/Wed</option>
              <option value="Tue/Thu">Tue/Thu</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Description</label>
            <textarea className="ta" placeholder="Describe your group goal, requirements, and topic focuses..." value={createForm.desc} onChange={e => setCreateForm({ ...createForm, desc: e.target.value })} />
          </div>
          <button className="btn-auth" type="submit">Create Circle</button>
        </form>
      </Modal>
    </div>
  );
}

/* ─── DISCUSSIONS ─────────────────────────────────────────── */
function Discussion({ discs, setDiscs, user, groups }) {
  const [txt, setTxt] = useState("");
  const [replyTxts, setReplyTxts] = useState({});
  const [selGrp, setSelGrp] = useState(() => groups[0] ? groups[0].name : "");

  // AI Chat Bot state
  const [aiChat, setAiChat] = useState([
    { id: 1, sender: "ai", text: "Hi Aisyah! Ask me anything about your current courses, coding issues, or study patterns." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const msgsEndRef = useRef(null);

  const scrollToBottom = () => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiChat, isTyping]);

  function addPost(e) {
    e.preventDefault();
    if (!txt.trim()) return;
    setDiscs([{
      id: Date.now(),
      group: selGrp,
      author: user.name,
      av: user.av,
      avatarBg: "var(--purple-soft)",
      avatarFg: "var(--purple)",
      text: txt.trim(),
      time: "Just now",
      replies: []
    }, ...discs]);
    setTxt("");
  }

  function addReply(id) {
    const rt = replyTxts[id];
    if (!rt || !rt.trim()) return;
    setDiscs(discs.map(x => x.id === id ? {
      ...x,
      replies: [...x.replies, {
        author: user.name,
        av: user.av,
        avatarBg: "var(--purple-soft)",
        avatarFg: "var(--purple)",
        text: rt.trim(),
        time: "Just now"
      }]
    } : x));
    setReplyTxts({ ...replyTxts, [id]: "" });
  }

  function sendAiMessage(e) {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setAiChat(p => [...p, { id: Date.now(), sender: "user", text: userMsg }]);
    setAiInput("");
    setIsTyping(true);

    // AI smart simulation responding
    setTimeout(() => {
      let reply = "";
      const text = userMsg.toLowerCase();

      if (text.includes("normalize") || text.includes("normalization") || text.includes("2nf") || text.includes("3nf")) {
        reply = `Normalization in database systems avoids redundancy and dependency issues. Here are the core levels:
- **1NF**: Ensure atomic values (no repeating groups/arrays).
- **2NF**: Meet 1NF & ensure no partial dependencies (all non-key attributes depend on the entire primary key).
- **3NF**: Meet 2NF & ensure no transitive dependencies (non-key fields cannot depend on other non-key fields).

*Example breakdown:*
If Primary Key is (StudentID, SubjectID) and column is TeacherLocation. If TeacherLocation depends on SubjectID, it is a partial dependency. Remove it to a separate table to satisfy 2NF!`;
      } else if (text.includes("oop") || text.includes("interface") || text.includes("abstract") || text.includes("java")) {
        reply = `In Java, both **Interfaces** and **Abstract Classes** enable polymorphism, but they have key design differences:

1. **Interface**: Defines a contract of actions.
- Multiple inheritance is supported.
- Cannot store instance states (only static final variables).
- Classes 'implement' it.

2. **Abstract Class**: Defines an identity/base template.
- Single inheritance only.
- Can have instance variables (fields) and constructors.
- Subclasses 'extend' it.

\`\`\`java
// Interface
interface Flyable {
    void fly(); 
}

// Abstract Class
abstract class Animal {
    String name;
    abstract void makeSound();
}
\`\`\``;
      } else if (text.includes("agile") || text.includes("sprint") || text.includes("scrum") || text.includes("se")) {
        reply = `Software Engineering Agile and Scrum models prioritize iterative workflows:
- **Product Backlog**: Ordered list of user requirements.
- **Sprint Planning**: Team selects work from backlog to complete in a 2-4 week Sprint.
- **Daily Scrum**: 15-minute sync focusing on progress and blockers.
- **Sprint Review**: Demonstration of the working increment.
- **Retrospective**: Reflection on team performance improvements.`;
      } else if (text.includes("sort") || text.includes("search") || text.includes("graph") || text.includes("algorithm") || text.includes("tree")) {
        reply = `Algorithms and data structures are fundamental to computing efficiency:
- **Sorting**: O(N log N) options like Merge Sort & Quick Sort are preferred for large datasets.
- **Graphs**: BFS (Breadth-First, uses Queue) is optimal for shortest paths, whereas DFS (Depth-First, uses Stack) explores deep trees.
- **Dynamic Programming (DP)**: Solves complex problems by breaking them into overlapping subproblems (e.g. Fibonacci, Knapsack) and memoizing results.`;
      } else {
        reply = `Hi! I am the StudySphere AI Assistant. I can help explain concepts in **Database Systems** (SQL, Normalization), **Java OOP** (abstract classes, inheritance), **Software Engineering** (Agile, Sprint Cycles), or **Algorithms** (Sorting, DP). 

What specific topic would you like to review or brainstorm today?`;
      }

      setAiChat(p => [...p, { id: Date.now() + 1, sender: "ai", text: reply }]);
      setIsTyping(false);
    }, 1500);
  }

  return (
    <div className="disc-layout fade">
      <div>
        <div className="card mb3">
          <div className="card-hd">✍️ Start a Discussion</div>
          <form onSubmit={addPost}>
            <div className="g2 mb2">
              <div>
                <label className="field-label" style={{ fontSize: 10 }}>Post to Group</label>
                <select className="sel" value={selGrp} onChange={e => setSelGrp(e.target.value)}>
                  {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>
            </div>
            <textarea className="ta" required placeholder="What's on your mind? Ask a question or share updates..." value={txt} onChange={e => setTxt(e.target.value)} />
            <div className="flex" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn btn-primary btn-sm" type="submit">Post to Circle</button>
            </div>
          </form>
        </div>

        {discs.map(p => (
          <div key={p.id} className="disc-post">
            <div className="flex ic gap3 mb3">
              <Av initials={p.av} size={32} bg={p.avatarBg} fg={p.avatarFg} />
              <div>
                <div className="fw6 fs13" style={{ color: "var(--text)" }}>{p.author}</div>
                <div className="dim fs11 mt2">{p.group} · {p.time}</div>
              </div>
            </div>
            <p className="fs13" style={{ color: "var(--text)", lineHeight: 1.6, paddingLeft: 2, whiteSpace: "pre-wrap" }}>{p.text}</p>

            {p.replies.map((r, i) => (
              <div key={i} className="disc-reply">
                <div className="flex ic gap2 mb2">
                  <Av initials={r.av} size={22} bg={r.avatarBg} fg={r.avatarFg} />
                  <span className="fw6 fs11">{r.author}</span>
                  <span className="dim fs10">· {r.time}</span>
                </div>
                <p className="fs12 muted" style={{ paddingLeft: 2 }}>{r.text}</p>
              </div>
            ))}

            <div className="flex mt3 gap2">
              <input className="inp fs12" placeholder="Write a reply..." value={replyTxts[p.id] || ""} onChange={e => setReplyTxts({ ...replyTxts, [p.id]: e.target.value })} onKeyDown={e => e.key === "Enter" && addReply(p.id)} />
              <button className="btn btn-sm" style={{ flexShrink: 0, whiteSpace: "nowrap" }} onClick={() => addReply(p.id)}>Reply</button>
            </div>
          </div>
        ))}
      </div>

      <div>
        {/* Study Assistant */}
        <div className="card mb3" style={{ position: "sticky", top: 16 }}>
          <div className="card-hd">🤖 Study Assistant</div>
          <div className="ai-msgs">
            {aiChat.map(m => (
              <div key={m.id} className={m.sender === "user" ? "user-bubble" : "ai-bubble"}>
                <span style={{ display: "block", whiteSpace: "pre-wrap" }}>{m.text}</span>
              </div>
            ))}
            {isTyping && (
              <div className="ai-bubble">
                <div className="ai-typing">
                  <span>AI is thinking</span>
                  <span className="pulsing">...</span>
                </div>
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>
          <form onSubmit={sendAiMessage} className="flex gap2">
            <input className="inp fs12" placeholder="Ask details (e.g. 3NF, OOP)..." value={aiInput} onChange={e => setAiInput(e.target.value)} disabled={isTyping} />
            <button className="btn btn-sm btn-primary" type="submit" disabled={isTyping}>→</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── RESOURCES ───────────────────────────────────────────── */
function Resources({ items, setItems, user, setUser, discs, setDiscs, groups }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", subject: groups[0] ? groups[0].subject : "", type: "PDF" });
  const [ratingVal, setRatingVal] = useState(5);
  const [selectedFile, setSelectedFile] = useState(null);

  // Rate modal state
  const [ratingDoc, setRatingDoc] = useState(null);
  const [userScore, setUserScore] = useState(5);

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.subject.toLowerCase().includes(search.toLowerCase())
  );

  // Fully working download file trigger!
  function handleDownload(r) {
    setItems(items.map(x => x.id === r.id ? { ...x, dl: x.dl + 1 } : x));
    
    // Generate text blob to trigger real file download!
    const element = document.createElement("a");
    const fileContent = `================================================
StudySphere Academic revision document
================================================
Document Title: ${r.title}
Course Subject: ${r.subject}
Shared Author : ${r.author}
File Format   : ${r.type}
Total Stars   : ${r.rating} / 5.0
Downloads     : ${r.dl + 1} times

================================================
STUDY REVISION NOTES NOTES OVERVIEW:
This document contains lecture summaries, past exams worksheets, 
and homework cheatsheets for "${r.subject}" revision.
Keep learning and collaborating!
================================================
Generated on StudySphere Collaborative Platform.`;
    
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${r.title.toLowerCase().replace(/\s+/g, "_")}_revision.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  // Handle rating a document created by others
  function handleDocumentRate(e) {
    e.preventDefault();
    if (!ratingDoc) return;

    setItems(items.map(x => {
      if (x.id === ratingDoc.id) {
        const ratingsMap = x.userRatings || {};
        ratingsMap[user.name] = userScore; // Store rating by this user
        
        // Calculate new average rating
        const allRatings = Object.values(ratingsMap);
        const average = parseFloat(
          ((allRatings.reduce((acc, curr) => acc + curr, 0) + 5.0) / (allRatings.length + 1)).toFixed(1)
        );

        return { ...x, rating: average, userRatings: ratingsMap };
      }
      return x;
    }));
    
    setRatingDoc(null);
    setUserScore(5);
    alert("Thank you! Your rating has been successfully registered.");
  }

  function handleUpload(e) {
    e.preventDefault();
    if (!uploadForm.title.trim()) return;

    const colors = ["#f97316", "#8b5cf6", "#0ea5e9", "#10b981", "#ec4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const filename = selectedFile ? selectedFile.name : `${uploadForm.title.trim()}.pdf`;

    const newRes = {
      id: Date.now(),
      title: uploadForm.title.trim(),
      subject: uploadForm.subject,
      author: user.name,
      type: uploadForm.type,
      dl: 0,
      rating: ratingVal,
      date: "Just now",
      accent: randomColor,
      fileName: filename,
      userRatings: {}
    };

    setItems([newRes, ...items]);
    setUser({ ...user, sharedCount: (user.sharedCount || 12) + 1 });
    
    // Automatically create a post on the Discussions Circle for this group!
    const targetGroup = groups.find(g => g.subject === uploadForm.subject) || groups[0] || { name: "General" };
    const newDiscussionPost = {
      id: Date.now() + 1,
      group: targetGroup.name,
      author: user.name,
      av: user.av,
      avatarBg: "var(--purple-soft)",
      avatarFg: "var(--purple)",
      text: `📚 I just uploaded a new study resource: "${uploadForm.title.trim()}" (${uploadForm.type}).\n📂 Attached File: ${filename}\n⭐ Initial Difficulty Rating: ${ratingVal}/5 Stars.\n\nDownload the notes directly from the Resources tab! Let me know if it helps!`,
      time: "Just now",
      replies: []
    };
    
    setDiscs([newDiscussionPost, ...discs]);

    setIsModalOpen(false);
    setUploadForm({ title: "", subject: groups[0] ? groups[0].subject : "", type: "PDF" });
    setRatingVal(5);
    setSelectedFile(null);
    alert(`Resource shared! An announcement has been automatically posted to the "${targetGroup.name}" discussions circle.`);
  }

  return (
    <div className="card fade" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)" }} className="flex jb ic fw gap2">
        <input className="inp" style={{ maxWidth: 240 }} placeholder="🔍 Search notes, papers..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>＋ Upload Document</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="res-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Shared By</th>
              <th>Downloads</th>
              <th>Rating</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 30 }}>No resources match your search.</td>
              </tr>
            ) : (
              filtered.map(r => {
                const isOwnFile = r.author === user.name;

                return (
                  <tr key={r.id}>
                    <td className="fw6 fs13" style={{ color: "var(--text)" }}>
                      <span style={{ marginRight: 8, fontSize: 13 }}>{r.type === "PDF" ? "📄" : "📊"}</span>{r.title}
                      {r.fileName && <div className="dim fs10" style={{ marginTop: 2, fontWeight: 400 }}>📁 {r.fileName}</div>}
                    </td>
                    <td><Chip bg="var(--surface2)" color="var(--text2)">{r.subject}</Chip></td>
                    <td className="muted fs12">{r.author} <span className="dim">· {r.date}</span></td>
                    <td className="muted fs12">⬇ {r.dl} times</td>
                    <td className="fw6 fs12" style={{ color: "#ca8a04" }}>⭐ {r.rating}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        {/* Dynamic Rate Button */}
                        {!isOwnFile && (
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => setRatingDoc(r)}
                            title="Give a star rating for this file"
                          >
                            ⭐ Rate
                          </button>
                        )}
                        <button className="btn btn-xs btn-primary" style={{ whiteSpace: "nowrap" }} onClick={() => handleDownload(r)}>Download</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal with File Select and Ratings */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Study Material">
        <form onSubmit={handleUpload}>
          <div className="field-group">
            <label className="field-label">Document Title</label>
            <input className="field-input" required placeholder="e.g. Database Normalization Guide" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Subject</label>
            <select className="sel" value={uploadForm.subject} onChange={e => setUploadForm({ ...uploadForm, subject: e.target.value })}>
              {groups.map(g => (
                <option key={g.id} value={g.subject}>{g.subject}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Document Type</label>
            <select className="sel" value={uploadForm.type} onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}>
              <option value="PDF">PDF Document</option>
              <option value="PPTX">Powerpoint Presentation</option>
              <option value="DOCX">Word Document</option>
            </select>
          </div>

          {/* Rating Field */}
          <div className="field-group">
            <label className="field-label" style={{ marginBottom: 8 }}>Initial Rating</label>
            <div className="star-selector">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  className={`star-btn ${ratingVal >= val ? "active" : ""}`}
                  onClick={() => setRatingVal(val)}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="muted fs11 mt2">Select a rating value to share your difficulty evaluation.</div>
          </div>

          {/* File Input Selection */}
          <div className="field-group">
            <label className="field-label">Select File Attachment</label>
            <input type="file" className="field-input" style={{ padding: "8px 10px" }} onChange={handleFileChange} />
          </div>

          <button className="btn-auth" type="submit">Submit Materials</button>
        </form>
      </Modal>

      {/* Explicit Rate Modal for Documents */}
      {ratingDoc && (
        <Modal isOpen={!!ratingDoc} onClose={() => setRatingDoc(null)} title={`Rate Document: "${ratingDoc.title}"`}>
          <form onSubmit={handleDocumentRate}>
            <div className="field-group" style={{ textAlign: "center", padding: "10px 0 20px" }}>
              <label className="field-label" style={{ fontSize: 12, marginBottom: 12 }}>Select Star Evaluation</label>
              <div className="star-selector" style={{ justifyContent: "center" }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`star-btn ${userScore >= val ? "active" : ""}`}
                    onClick={() => setUserScore(val)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="muted fs12 mt3">Rate this document shared by {ratingDoc.author}. Your rating improves peer feedback!</div>
            </div>
            <button className="btn-auth" type="submit">Submit My Rating</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ─── PROFILE ─────────────────────────────────────────────── */
function Profile({ user, setUser }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name, program: user.program, bio: user.bio, location: user.location, email: user.email, preferences: user.preferences || "" });

  function handleSave(e) {
    e.preventDefault();
    setUser({
      ...user,
      name: editForm.name,
      program: editForm.program,
      bio: editForm.bio,
      location: editForm.location,
      email: editForm.email,
      preferences: editForm.preferences,
      av: editForm.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    });
    setIsEditOpen(false);
  }

  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 1. Header Profile Banner Card */}
      <div className="prof-header-card">
        <div className="prof-banner-area">
          <div className="prof-avatar-wrap">
            <Av initials={user.av} size={92} bg="var(--purple-soft)" fg="var(--purple)" />
          </div>
          <button className="btn btn-sm" style={{ position: "absolute", top: 20, right: 20, background: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(12px)", color: "#fff", borderColor: "rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }} onClick={() => setIsEditOpen(true)}>✏️ Edit Profile</button>
        </div>

        <div className="prof-body-area">
          {/* Profile Name & Program Details */}
          <div className="prof-details-block">
            <div className="fw8 fs22" style={{ color: "var(--text)", letterSpacing: "-0.5px" }}>{user.name}</div>
            <div className="fw6 fs13 mt2" style={{ color: "var(--purple)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>🎓 Undergraduate Student</span>
              <span className="muted" style={{ opacity: 0.3 }}>•</span>
              <span className="muted">{user.program}</span>
            </div>
            <div className="dim fs12 mt2" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span>📍 {user.location || "University Campus"}</span>
              <span>•</span>
              <span>✉️ {user.email}</span>
            </div>
            
            {user.preferences && (
              <div className="chip-row mt3" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {user.preferences.split(",").map(pref => (
                  <span key={pref} className="chip" style={{ background: "linear-gradient(135deg, var(--purple-soft), #fff1f2)", border: "1.5px solid var(--border)", color: "var(--purple)", fontWeight: 700, padding: "5px 12px", borderRadius: 99, fontSize: 10.5, textTransform: "none", letterSpacing: "normal" }}>🎯 {pref.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* Spherics Metrics strip inside the header */}
          <div className="prof-metrics-grid">
            <div style={{ background: "linear-gradient(135deg, var(--surface2) 0%, rgba(255,255,255,0.4) 100%)", border: "1.5px solid var(--border)", padding: "16px", borderRadius: 16, textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
              <div className="fw8 fs26" style={{ color: "var(--purple)", lineHeight: 1.1 }}>47</div>
              <div className="dim fs10 mt2" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Reputation Points</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, var(--surface2) 0%, rgba(255,255,255,0.4) 100%)", border: "1.5px solid var(--border)", padding: "16px", borderRadius: 16, textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
              <div className="fw8 fs26" style={{ color: "var(--orange)", lineHeight: 1.1 }}>{user.sharedCount || 12}</div>
              <div className="dim fs10 mt2" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Materials Shared</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Symmetrical Two-Column Stretched Details Grid */}
      <div className="g2" style={{ gridTemplateColumns: "1fr 1.1fr", alignItems: "stretch", gap: "20px" }}>
        
        {/* Left Card: Biography & Timeline */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", gap: 20 }}>
          <div>
            <div className="card-hd" style={{ marginBottom: 12 }}>📝 Student Narrative</div>
            <div className="prof-bio-quote">
              <span style={{ position: "absolute", top: 4, left: 8, fontSize: 24, opacity: 0.15, fontWeight: 800, fontFamily: "serif" }}>“</span>
              <p className="muted fs13" style={{ fontStyle: "italic" }}>
                {user.bio || "No biography details shared yet. Click edit profile to add details about your goals!"}
              </p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, marginTop: "auto" }}>
            <div className="card-hd" style={{ marginBottom: 14 }}>⏳ Contribution Timeline</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { action: "Shared SQL Normalization Notes", sub: "Resources Circle · 2 days ago" },
                { action: "Replied to Database Warriors thread on 3NF", sub: "Discussion Board · 3 days ago" },
                { action: "Created Study Circle 'SE Study Circle'", sub: "Academic Groups · 1 week ago" },
              ].map((act, i) => (
                <div key={i} className="timeline-point">
                  <div className="timeline-marker" />
                  <div style={{ flex: 1 }}>
                    <div className="fw6 fs12" style={{ color: "var(--text)" }}>{act.action}</div>
                    <div className="dim fs10 mt1">{act.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Weekly Progress & Credentials */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", gap: 20 }}>
          
          <div>
            <div className="card-hd" style={{ marginBottom: 12 }}>📈 Weekly Goal Progress</div>
            <div style={{ background: "var(--surface2)", padding: 16, borderRadius: 14 }}>
              <div className="flex jb ic fs12 fw6 mb2">
                <span>Active Study Goal</span>
                <span style={{ color: "var(--purple)" }}>18h / 25h completed</span>
              </div>
              <div className="prog-track" style={{ height: 8, background: "rgba(190,24,93,.1)" }}>
                <div className="prog-fill" style={{ width: "72%", background: "linear-gradient(90deg, var(--purple), #db2777)", height: 8 }} />
              </div>
              <div className="dim fs10 mt3">You are in the top 8% of active learners in Computer Science this week!</div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18, flex: 1 }}>
            <div className="card-hd" style={{ marginBottom: 12 }}>🏅 Earned Credentials</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { ic: "🎓", n: "Helpful Learner", d: "Earned for quality replies", bg: "#fef9c3" },
                { ic: "⚡", n: "Active Learner", d: "Joined 3 call sessions", bg: "#ecfdf5" },
                { ic: "📚", n: "Resource Guru", d: "Shared 10+ documents", bg: "#f0f9ff" },
                { ic: "🌟", n: "Rising Star", d: "Highest weekly reputation", bg: "#fdf4ff" },
              ].map((b, i) => (
                <div key={i} className="credential-badge-item">
                  <div className="ic-box" style={{ width: 32, height: 32, background: b.bg, fontSize: 14, flexShrink: 0 }}>{b.ic}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw7 fs11 trunc" style={{ color: "var(--text)" }} title={b.n}>{b.n}</div>
                    <div className="dim fs9 mt1" style={{ lineHeight: 1.2 }}>{b.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Personal Information">
        <form onSubmit={handleSave}>
          <div className="field-group">
            <label className="field-label">Full Name</label>
            <input className="field-input" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Academic Program</label>
            <input className="field-input" required value={editForm.program} onChange={e => setEditForm({ ...editForm, program: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <input className="field-input" type="email" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Location</label>
            <input className="field-input" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Preferred Courses (comma separated)</label>
            <input className="field-input" placeholder="e.g. Database Systems, Java Programming" value={editForm.preferences} onChange={e => setEditForm({ ...editForm, preferences: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Biography Details</label>
            <textarea className="ta" value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
          </div>
          <button className="btn-auth" type="submit">Save Changes</button>
        </form>
      </Modal>
    </div>
  );
}

/* ─── APP SHELL ───────────────────────────────────────────── */
export default function App() {
  const [user, setUser] = useLocalStorage("studysphere_user", null);
  const [page, setPage] = useState("dashboard");
  const [groups, setGroups] = useLocalStorage("studysphere_groups", INITIAL_GROUPS);
  const [joined, setJoined] = useLocalStorage("studysphere_joined", [1, 3]);
  const [aiGrps, setAiGrps] = useLocalStorage("studysphere_aigrps", []);
  const [discs, setDiscs] = useLocalStorage("studysphere_discs", INITIAL_DISCS);
  const [resources, setResources] = useLocalStorage("studysphere_resources", INITIAL_RESOURCES);
  const [notifs, setNotifs] = useLocalStorage("studysphere_notifs", INITIAL_NOTIFS);
  const [roomSession, setRoomSession] = useState(null);
  const [darkMode, setDarkMode] = useLocalStorage("studysphere_darkmode", false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const el = document.getElementById("inj-css") || document.createElement("style");
    el.id = "inj-css";
    el.textContent = css;
    document.head.appendChild(el);
  }, []);

  // Update theme tag on dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleLogout = () => {
    setUser(null);
    setAiGrps([]);
    setPage("dashboard");
  };

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} user={user} notifs={notifs} onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main">
        <Topbar page={page} setPage={setPage} notifs={notifs} setNotifs={setNotifs} darkMode={darkMode} setDarkMode={setDarkMode} setSidebarOpen={setSidebarOpen} />
        <div className="page">
          {page === "dashboard" && <Dashboard user={user} setPage={setPage} aiGrps={aiGrps} groups={groups} discs={discs} joined={joined} setJoined={setJoined} setRoomSession={setRoomSession} />}
          {page === "groups" && <Groups groups={groups} setGroups={setGroups} joined={joined} setJoined={setJoined} aiGrps={aiGrps} setAiGrps={setAiGrps} user={user} />}
          {page === "discussion" && <Discussion discs={discs} setDiscs={setDiscs} user={user} groups={groups} />}
          {page === "resources" && <Resources items={resources} setItems={setResources} user={user} setUser={setUser} discs={discs} setDiscs={setDiscs} groups={groups} />}
          {page === "profile" && <Profile user={user} setUser={setUser} />}
          {page === "studyroom" && roomSession && <StudyRoom session={roomSession} user={user} onLeave={() => setPage("dashboard")} />}
        </div>
      </div>
    </div>
  );
}
