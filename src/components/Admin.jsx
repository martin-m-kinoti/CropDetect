import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import "./Admin.css";

const API_BASE    =  "https://kinoti-raven025-cropdetect.hf.space"; {/*for dev: http://localhost:5000*/}

const RISK_COLORS  = { High: "#c45c3a", Moderate: "#d4a843", Low: "#62a050", Healthy: "#8cc63f" };
const CROP_COLORS  = { Tomato: "#e05a3a", Maize: "#d4a843", Potato: "#8cc63f" };
const ADMIN_EMAILS = ["admin@cropdetect.ai"];

function DiseaseMapPanel({ cells }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || cells.length === 0) return;

    const init = () => {
      const L = window.L;
      if (!L) return;

      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }

      const avgLat = cells.reduce((s, c) => s + c.lat, 0) / cells.length;
      const avgLon = cells.reduce((s, c) => s + c.lon, 0) / cells.length;

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true });
      leafletRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      map.setView([avgLat, avgLon], 6);

      const maxScans = Math.max(...cells.map(c => c.total_scans), 1);

      cells.forEach(cell => {
        const radius  = 12000 + (cell.total_scans / maxScans) * 38000;
        const color   = RISK_COLORS[cell.dominant_risk] || RISK_COLORS.Low;
        const circle  = L.circle([cell.lat, cell.lon], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.35,
          weight: 2,
          opacity: 0.8,
        }).addTo(map);

        const breakdown = cell.disease_breakdown
          .map(d => `<div style="display:flex;justify-content:space-between;gap:1rem;font-size:0.78rem;padding:0.2rem 0;border-bottom:1px solid rgba(0,0,0,0.06)">
            <span>${d.disease}</span><strong>${d.count} scan${d.count !== 1 ? "s" : ""}</strong></div>`)
          .join("");

        circle.bindPopup(`
          <div style="min-width:220px;font-family:sans-serif">
            <div style="font-weight:700;font-size:1rem;margin-bottom:0.3rem">${cell.dominant_disease}</div>
            <div style="font-size:0.75rem;color:#666;margin-bottom:0.75rem">${cell.lat.toFixed(2)}°, ${cell.lon.toFixed(2)}° · ${cell.total_scans} scan${cell.total_scans !== 1 ? "s" : ""}</div>
            ${breakdown}
          </div>
        `, { maxWidth: 280 });
      });
    };

    if (window.L) {
      init();
    } else {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, [cells]);

  return <div ref={mapRef} className="adm-leaflet-map" />;
} // ← keep in sync with Signin.jsx

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="adm-stat-card" style={{ "--accent": accent || "var(--sprout)" }}>
      <div className="adm-stat-icon">{icon}</div>
      <div className="adm-stat-body">
        <div className="adm-stat-value">{value ?? "—"}</div>
        <div className="adm-stat-label">{label}</div>
        {sub && <div className="adm-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function BarChart({ data, colorMap }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div className="adm-bar-chart">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="adm-bar-row">
          <span className="adm-bar-label">{key}</span>
          <div className="adm-bar-track">
            <div className="adm-bar-fill" style={{ width: `${(val / max) * 100}%`, background: colorMap?.[key] || "var(--sprout)" }} />
          </div>
          <span className="adm-bar-val">{val}</span>
        </div>
      ))}
    </div>
  );
}

function AccuracyCard({ crop, stats }) {
  const avg = stats?.avg_confidence ?? 0;
  const circ = 100.53;
  return (
    <div className="adm-acc-card">
      <div className="adm-acc-ring">
        <svg viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="18" cy="18" r="16" fill="none" stroke={CROP_COLORS[crop] || "var(--sprout)"} strokeWidth="3"
            strokeDasharray={`${(avg / 100) * circ} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 18 18)" style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="adm-acc-ring-val">{avg.toFixed(1)}%</div>
      </div>
      <div className="adm-acc-info">
        <div className="adm-acc-crop">{crop}</div>
        <div className="adm-acc-rows">
          <div className="adm-acc-row"><span>Min confidence</span><strong>{stats?.min_confidence ?? "—"}%</strong></div>
          <div className="adm-acc-row"><span>Max confidence</span><strong>{stats?.max_confidence ?? "—"}%</strong></div>
          <div className="adm-acc-row"><span>Total scans</span><strong>{stats?.scan_count ?? 0}</strong></div>
        </div>
      </div>
    </div>
  );
}

function RiskPill({ level }) {
  const color = RISK_COLORS[level] || RISK_COLORS.Low;
  return (
    <span className="adm-risk-pill" style={{ background: `${color}22`, color, borderColor: `${color}55` }}>
      {level || "—"}
    </span>
  );
}

function Pagination({ page, total, perPage, onPage }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="adm-pagination">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
      <span>{page} / {pages}</span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
    </div>
  );
}

export default function Admin({ user }) {
  const navigate = useNavigate();

  const [activeTab,   setActiveTab]   = useState("overview");
  const [stats,       setStats]       = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [predTotal,   setPredTotal]   = useState(0);
  const [predPage,    setPredPage]    = useState(1);
  const [predCrop,    setPredCrop]    = useState("");
  const [users,       setUsers]       = useState([]);
  const [usersTotal,  setUsersTotal]  = useState(0);
  const [usersPage,   setUsersPage]   = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [confHistory, setConfHistory] = useState([]);
  const [exporting,   setExporting]   = useState(false);
  const [mapCells,    setMapCells]    = useState([]);
  const [mapLoading,  setMapLoading]  = useState(false);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const handleSignOut = async () => {
    try { await signOut(auth); navigate("/signin"); }
    catch (err) { console.error("Sign out error:", err); }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${API_BASE}/api/admin/stats`)
      .then(r => r.json()).then(setStats)
      .catch(() => setError("Could not load stats."));
  }, [isAdmin]);

  const loadPredictions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: predPage, limit: 20 });
    if (predCrop) params.set("crop", predCrop);
    fetch(`${API_BASE}/api/admin/predictions?${params}`)
      .then(r => r.json())
      .then(d => { setPredictions(d.results); setPredTotal(d.total); })
      .catch(() => setError("Could not load predictions."))
      .finally(() => setLoading(false));
  }, [predPage, predCrop]);

  const loadUsers = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/admin/users?page=${usersPage}&limit=20`)
      .then(r => r.json())
      .then(d => { setUsers(d.results); setUsersTotal(d.total); })
      .catch(() => setError("Could not load users."))
      .finally(() => setLoading(false));
  }, [usersPage]);

  const loadConfHistory = useCallback(() => {
    fetch(`${API_BASE}/api/admin/confidence-history`)
      .then(r => r.json()).then(d => setConfHistory(d.history || []))
      .catch(() => {});
  }, []);

  const loadDiseaseMap = useCallback(() => {
    setMapLoading(true);
    fetch(`${API_BASE}/api/admin/disease-map?precision=0.5`)
      .then(r => r.json())
      .then(d => setMapCells(d.cells || []))
      .catch(() => setError("Could not load disease map data."))
      .finally(() => setMapLoading(false));
  }, []);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (predCrop) params.set("crop", predCrop);
      const data = await fetch(`${API_BASE}/api/admin/predictions/export?${params}`).then(r => r.json());
      const rows = data.results;
      if (!rows.length) { alert("No predictions to export."); return; }
      const headers = ["timestamp","user_email","crop","disease","confidence_str","confidence_pct","risk_level","soil_type","raw_label"];
      const csv = [headers.join(","), ...rows.map(r => headers.map(h => { const v = r[h] ?? ""; return typeof v === "string" && v.includes(",") ? `"${v}"` : v; }).join(","))].join("\n");
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `cropdetect_predictions_${new Date().toISOString().slice(0,10)}.csv` });
      a.click();
    } catch { alert("Export failed."); }
    finally { setExporting(false); }
  };

  useEffect(() => { if (activeTab === "predictions") loadPredictions(); }, [activeTab, loadPredictions]);
  useEffect(() => { if (activeTab === "users")       loadUsers();       }, [activeTab, loadUsers]);
  useEffect(() => { if (activeTab === "models")      loadConfHistory(); }, [activeTab, loadConfHistory]);
  useEffect(() => { if (activeTab === "diseasemap")  loadDiseaseMap();  }, [activeTab, loadDiseaseMap]);

  if (!user) {
    return (
      <div className="adm-gate">
        <div className="adm-gate-icon">🔒</div>
        <h2>Admin Access</h2>
        <p>Sign in with your admin account to continue.</p>
        <button onClick={() => navigate("/signin")}>Go to Sign In</button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="adm-gate">
        <div className="adm-gate-icon">🔒</div>
        <h2>Admin Access Only</h2>
        <p>Your account does not have admin privileges.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const avatarLetter = (user.displayName?.[0] || user.email?.[0] || "A").toUpperCase();

  return (
    <div className="adm-page">

      <nav className="adm-nav">
        <button className="adm-nav-brand" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="CropDetect" className="adm-nav-logo" />
          <span className="adm-nav-wordmark">Crop<span>Detect</span></span>
          <span className="adm-nav-badge">Admin</span>
        </button>
        <div className="adm-nav-right">
          <div className="adm-nav-user">
            <div className="adm-nav-avatar">{avatarLetter}</div>
            <span className="adm-nav-email">{user.email}</span>
          </div>
          <button className="adm-nav-back" onClick={() => navigate("/")}>← Home</button>
          <button className="adm-nav-signout" onClick={handleSignOut}>Sign Out</button>
        </div>
      </nav>

      <div className="adm-tabs">
        {[
          { id: "overview",    label: "Overview"      },
          { id: "predictions", label: "Predictions"   },
          { id: "users",       label: "Users"         },
          { id: "models",      label: "Models"        },
          { id: "diseasemap",  label: "Disease Map"   },
        ].map(t => (
          <button key={t.id} className={`adm-tab ${activeTab === t.id ? "adm-tab--active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <main className="adm-main">

        {error && <div className="adm-error">{error}</div>}

        {activeTab === "overview" && stats && (
          <div className="adm-overview">
            <div className="adm-stat-grid">
              <StatCard label="Total Scans"      value={stats.total_scans}  accent="var(--sprout)" />
              <StatCard label="Registered Users" value={stats.total_users}  accent="#6ab3d4" />
              <StatCard label="Most Scanned Crop"
                value={Object.entries(stats.crop_counts || {}).sort((a,b) => b[1]-a[1])[0]?.[0] || "—"}
                accent="#e05a3a" />
              <StatCard label="High Risk Scans"
                value={stats.risk_dist?.["High"] || 0}
                sub={`of ${stats.total_scans} total`} accent="#c45c3a" />
            </div>

            <div className="adm-charts-row">
              <div className="adm-chart-card">
                <h3 className="adm-chart-title">Scans by Crop</h3>
                {Object.keys(stats.crop_counts || {}).length > 0
                  ? <BarChart data={stats.crop_counts} colorMap={CROP_COLORS} />
                  : <p className="adm-empty-note">No data yet.</p>}
              </div>
              <div className="adm-chart-card">
                <h3 className="adm-chart-title">Scans by Risk Level</h3>
                {Object.keys(stats.risk_dist || {}).length > 0
                  ? <BarChart data={stats.risk_dist} colorMap={RISK_COLORS} />
                  : <p className="adm-empty-note">No data yet.</p>}
              </div>
            </div>

            <div className="adm-chart-card adm-chart-card--full">
              <h3 className="adm-chart-title">Top 10 Detected Diseases</h3>
              {stats.top_diseases?.length > 0 ? (
                <table className="adm-table">
                  <thead><tr><th>#</th><th>Crop</th><th>Disease</th><th>Scans</th></tr></thead>
                  <tbody>
                    {stats.top_diseases.map((d, i) => (
                      <tr key={i}>
                        <td className="adm-td-num">{i + 1}</td>
                        <td>{d.crop}</td>
                        <td>{d.disease}</td>
                        <td><span className="adm-count-badge">{d.count}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="adm-empty-note">No predictions logged yet.</p>}
            </div>
          </div>
        )}

        {activeTab === "predictions" && (
          <div className="adm-predictions">
            <div className="adm-filter-row">
              <span className="adm-total-badge">{predTotal} total</span>
              <div className="adm-export-group">
                <button className="adm-export-btn" onClick={exportCSV} disabled={exporting || predictions.length === 0}>
                  {exporting ? "Exporting…" : "⬆ Export CSV"}
                </button>
              </div>
              <div className="adm-filter-group">
                <label>Filter by crop</label>
                <select value={predCrop} onChange={e => { setPredCrop(e.target.value); setPredPage(1); }} className="adm-select">
                  <option value="">All crops</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Maize">Maize</option>
                  <option value="Potato">Potato</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="adm-loading"><div className="adm-spinner" /> Loading…</div>
            ) : predictions.length > 0 ? (
              <>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr><th>Time</th><th>User</th><th>Crop</th><th>Disease</th><th>Confidence</th><th>Risk</th><th>Soil</th></tr>
                    </thead>
                    <tbody>
                      {predictions.map((p, i) => (
                        <tr key={i}>
                          <td className="adm-td-time">
                            {p.timestamp ? new Date(p.timestamp).toLocaleString("en-KE", { dateStyle: "short", timeStyle: "short" }) : "—"}
                          </td>
                          <td className="adm-td-email">{p.user_email || <span className="adm-anon">anonymous</span>}</td>
                          <td>{p.crop}</td>
                          <td className="adm-td-disease">{p.disease}</td>
                          <td>
                            <span className="adm-conf-bar">
                              <span className="adm-conf-fill" style={{ width: `${p.confidence_pct || 0}%` }} />
                              <span className="adm-conf-label">{p.confidence_str || "—"}</span>
                            </span>
                          </td>
                          <td><RiskPill level={p.risk_level} /></td>
                          <td>{p.soil_type || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={predPage} total={predTotal} perPage={20} onPage={setPredPage} />
              </>
            ) : (
              <div className="adm-empty"><p>No predictions logged yet.</p></div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="adm-users">
            <div className="adm-filter-row">
              <span className="adm-total-badge">{usersTotal} registered users</span>
            </div>
            {loading ? (
              <div className="adm-loading"><div className="adm-spinner" /> Loading…</div>
            ) : users.length > 0 ? (
              <>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th>User</th><th>Total Scans</th><th>First Seen</th><th>Last Active</th></tr></thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={i}>
                          <td>
                            <div className="adm-user-cell">
                              <div className="adm-user-avatar">{(u.email?.[0] || "?").toUpperCase()}</div>
                              <span className="adm-td-email">{u.email || u.uid}</span>
                            </div>
                          </td>
                          <td><span className="adm-count-badge">{u.scan_count || 0}</span></td>
                          <td className="adm-td-time">{u.first_seen ? new Date(u.first_seen).toLocaleDateString("en-KE") : "—"}</td>
                          <td className="adm-td-time">{u.last_seen ? new Date(u.last_seen).toLocaleString("en-KE", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={usersPage} total={usersTotal} perPage={20} onPage={setUsersPage} />
              </>
            ) : (
              <div className="adm-empty"><div className="adm-empty-icon">👥</div><p>No users registered yet.</p></div>
            )}
          </div>
        )}

        {activeTab === "models" && (
          <div className="adm-models">
            {stats?.model_accuracy && Object.keys(stats.model_accuracy).length > 0 ? (
              <div className="adm-acc-grid">
                {["Tomato", "Maize", "Potato"].map(crop => (
                  stats.model_accuracy[crop] ? (
                    <AccuracyCard key={crop} crop={crop} stats={stats.model_accuracy[crop]} />
                  ) : (
                    <div key={crop} className="adm-acc-card adm-acc-card--empty">
                      <div className="adm-acc-crop">{crop}</div>
                      <p>No scans yet for this crop.</p>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="adm-empty">
                <div className="adm-empty-icon">🤖</div>
                <p>Run some detections first — model stats will appear here.</p>
              </div>
            )}

            <div className="adm-chart-card adm-chart-card--full" style={{ marginTop: "1.5rem" }}>
              <h3 className="adm-chart-title">Average Model Confidence Over Time</h3>
              {confHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={confHistory} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(226,237,224,0.45)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
                    <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: "rgba(226,237,224,0.45)", fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
                    <Tooltip
                      contentStyle={{ background: "#1e2a21", border: "1px solid rgba(140,198,63,0.2)", borderRadius: "10px", fontSize: "0.82rem", color: "#e2ede0" }}
                      formatter={(val, name) => [`${val}%`, name]}
                      labelStyle={{ color: "rgba(226,237,224,0.6)", marginBottom: "4px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.82rem", paddingTop: "12px" }} />
                    <Line type="monotone" dataKey="Tomato" stroke="#e05a3a" strokeWidth={2.5} dot={{ r: 4, fill: "#e05a3a" }} activeDot={{ r: 6 }} connectNulls />
                    <Line type="monotone" dataKey="Maize"  stroke="#d4a843" strokeWidth={2.5} dot={{ r: 4, fill: "#d4a843" }} activeDot={{ r: 6 }} connectNulls />
                    <Line type="monotone" dataKey="Potato" stroke="#8cc63f" strokeWidth={2.5} dot={{ r: 4, fill: "#8cc63f" }} activeDot={{ r: 6 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="adm-empty" style={{ padding: "2rem 0" }}>
                  <p>No prediction history yet — run some detections to see the trend.</p>
                </div>
              )}
            </div>

            <div className="adm-chart-card adm-chart-card--full" style={{ marginTop: "1rem" }}>
              <h3 className="adm-chart-title">Validation Accuracies (from training)</h3>
              <BarChart data={{ Tomato: 94, Maize: 95, Potato: 96 }} colorMap={CROP_COLORS} />
            </div>

          </div>
        )}

        {activeTab === "diseasemap" && (
          <div className="adm-diseasemap">
            <div className="adm-diseasemap-header">
              <div>
                <h3 className="adm-chart-title">Disease Prevalence by Region</h3>
                
              </div>
              <button className="adm-refresh-btn" onClick={loadDiseaseMap} disabled={mapLoading}>
                {mapLoading ? "Loading…" : "↻ Refresh"}
              </button>
            </div>

            {mapLoading ? (
              <div className="adm-loading"><div className="adm-spinner" /> Loading map data…</div>
            ) : mapCells.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon">🗺️</div>
                <p>No location data yet. Farmers need to share their location when scanning for this map to populate.</p>
              </div>
            ) : (
              <>
                <DiseaseMapPanel cells={mapCells} />
                <div className="adm-map-table-wrap">
                  <h4 className="adm-map-table-title">Regional Breakdown</h4>
                  <table className="adm-table">
                    <thead>
                      <tr><th>Coordinates</th><th>Dominant Disease</th><th>Crop</th><th>Risk</th><th>Total Scans</th></tr>
                    </thead>
                    <tbody>
                      {mapCells.map((cell, i) => (
                        <tr key={i}>
                          <td className="adm-td-coords">{cell.lat.toFixed(2)}°, {cell.lon.toFixed(2)}°</td>
                          <td className="adm-td-disease">{cell.dominant_disease}</td>
                          <td>{cell.dominant_crop}</td>
                          <td><RiskPill level={cell.dominant_risk} /></td>
                          <td><span className="adm-count-badge">{cell.total_scans}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}