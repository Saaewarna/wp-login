// pages/api/sso.js
import crypto from "crypto";


function b64url(buf) {
return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}


export default function handler(req, res) {
const { site, login, redirect = "/wp-admin" } = req.query; // e.g. site=ice.crystaltech.so, login=admin


if (!site || !login) return res.status(400).send("Missing site or login");
const secret = process.env.SSO_SHARED_SECRET;
if (!secret) return res.status(500).send("Server not configured");


const payload = {
login,
iat: Math.floor(Date.now() / 1000),
exp: Math.floor(Date.now() / 1000) + 60, // token valid 60s
nonce: crypto.randomBytes(8).toString("hex"),
aud: site, // audience binding
};


const payloadStr = JSON.stringify(payload);
const sig = crypto.createHmac("sha256", secret).update(payloadStr).digest();
const token = `${b64url(payloadStr)}.${b64url(sig)}`;


// Force https and your fixed endpoint path on WP
const target = `https://${site}/?sso-login=1&token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(redirect)}`;


// Simple allowlist: only your domains
const allowed = [site];
if (!allowed.includes(site)) return res.status(400).send("Domain not allowed");


res.redirect(target);
}
