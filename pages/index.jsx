// pages/index.jsx
import Link from "next/link";


const SITES = [
{ label: "Ice WP", host: "ice.crystaltech.so", login: "admin_wvwyck10" },
// Add more sites here
];


export default function Home() {
return (
<main style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
<h1>WP Launcher</h1>
<p>Click a site to auto‑login to /wp-admin</p>
<ul style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
{SITES.map((s) => (
<li key={s.host} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
<h3 style={{ margin: 0 }}>{s.label}</h3>
<p style={{ margin: "6px 0 12px", color: "#666" }}>{s.host}</p>
<Link href={`/api/sso?site=${encodeURIComponent(s.host)}&login=${encodeURIComponent(s.login)}&redirect=/wp-admin`}>
Login →
</Link>
</li>
))}
</ul>
</main>
);
}
