"use strict";
/* ============ CONFIG: edit here ============ */
const WHATSAPP = "918506067537";                       // sales WhatsApp (country code + number)
const EMAIL_TO = "simsonfootwearsdelhi@gmail.com";     // main order email
const QTY_STEP = 12;                                    // + / - buttons change quantity by this many pairs
const EMAIL_CC = "ruhansales3079@gmail.com";           // second order email

/* Google Sheets: paste link in url. For password, put the SHA-256 hash of it in hash.
   Get a hash: open browser console on any https page and run:
   crypto.subtle.digest("SHA-256",new TextEncoder().encode("PASSWORD")).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")))  */
const SHEETS = [
  { name: "Price List / Sheet 1", url: "", hash: "" },
  { name: "Catalogue / Sheet 2",  url: "", hash: "" }
];

/* Products: price = number (₹ per pair) or null for "Price on request". img = image file path or "" */
const PRODUCTS = {
  eva: { name: "EVA", title: "EVA footwear",
    desc: "Ultra-light, soft and water-resistant. Ideal for slippers, flip-flops and daily-wear footwear.",
    tags: ["Lightweight", "Water resistant", "Soft cushioning"],
    items: [{ id: "EVA-1", name: "EVA Slipper – Men", price: null, img: "" },
            { id: "EVA-2", name: "EVA Slipper – Women", price: null, img: "" },
            { id: "EVA-3", name: "EVA Slipper – Kids", price: null, img: "" }] },
  pu: { name: "PU", title: "PU footwear",
    desc: "Durable polyurethane soles with strong grip and comfort. Suited to formal, casual and work footwear.",
    tags: ["Durable", "Anti-slip", "Comfortable"],
    items: [{ id: "PU-1", name: "PU Sole Shoe – Men", price: null, img: "" },
            { id: "PU-2", name: "PU Sandal – Women", price: null, img: "" },
            { id: "PU-3", name: "PU Work Shoe", price: null, img: "" }] },
  air: { name: "AIR", title: "AIR footwear",
    desc: "Air-cushioned soles that cut weight and add bounce. Popular in sports and casual ranges.",
    tags: ["Air cushion", "Lightweight", "Sporty look"],
    items: [{ id: "AIR-1", name: "AIR Sports Shoe – Men", price: null, img: "" },
            { id: "AIR-2", name: "AIR Casual – Women", price: null, img: "" },
            { id: "AIR-3", name: "AIR Kids Shoe", price: null, img: "" }] },
  injection: { name: "Injection", title: "Injection moulded footwear",
    desc: "Material is injected into a mould, so every pair comes out with the same shape and finish. It suits large, repeat orders.",
    tags: ["Bulk orders", "Uniform finish", "Moulded footwear"],
    items: [{ id: "INJ-1", name: "Injection Chappal – Men", price: null, img: "" },
            { id: "INJ-2", name: "Injection Sandal – Women", price: null, img: "" },
            { id: "INJ-3", name: "Injection Shoe – Kids", price: null, img: "" }] }
};
/* ============================================ */

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const wa = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const money = n => "₹" + n.toLocaleString("en-IN");

/* ---------- order list (cart) ---------- */
let view = "home", cart = [];
const updateBar = () => $("#cartbar").classList.toggle("show", cart.length > 0 && view !== "order");
try { cart = JSON.parse(localStorage.getItem("skp_cart")) || []; } catch (e) {}
const save = () => { try { localStorage.setItem("skp_cart", JSON.stringify(cart)); } catch (e) {} };

function findItem(id) {
  for (const k in PRODUCTS) { const it = PRODUCTS[k].items.find(i => i.id === id); if (it) return { ...it, group: PRODUCTS[k].name }; }
}
function addToCart(id, qty) {
  qty = Math.max(1, parseInt(qty) || 1);
  const line = cart.find(l => l.id === id);
  line ? line.qty += qty : cart.push({ id, qty });
  save(); renderCart();
}
function orderText() {
  let total = 0, unknown = false;
  const lines = cart.map((l, i) => {
    const it = findItem(l.id); if (!it) return "";
    it.price == null ? unknown = true : total += it.price * l.qty;
    return `${i + 1}. ${it.name} (${it.group}) x ${l.qty} pairs` + (it.price != null ? ` = ${money(it.price * l.qty)}` : "");
  }).filter(Boolean);
  return { lines, total, unknown };
}
function renderCart() {
  const n = cart.reduce((a, l) => a + l.qty, 0);
  $("#count").textContent = $("#cb").textContent = n; updateBar();
  const box = $("#orderList");
  if (!cart.length) {
    box.innerHTML = `<div class="empty">Your cart is empty.<br>Add products from the EVA, PU, AIR or Injection pages.</div>`;
  } else {
    const rows = cart.map(l => { const it = findItem(l.id); if (!it) return "";
      return `<tr><td>${esc(it.name)}<br><small class="muted">${esc(it.group)}</small></td>
        <td>${it.price == null ? "On request" : money(it.price)}</td>
        <td><input type="number" min="1" value="${l.qty}" data-qty="${l.id}" aria-label="Quantity"></td>
        <td><button data-del="${l.id}" aria-label="Remove">✕</button></td></tr>`; }).join("");
    const { total, unknown } = orderText();
    box.innerHTML = `<table><thead><tr><th>Product</th><th>Price/pair</th><th>Qty (pairs)</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      <p><b>Total: ${unknown ? "Price on request" : money(total)}</b></p>`;
  }
}
$("#orderList").addEventListener("click", e => {
  const id = e.target.dataset.del; if (!id) return;
  cart = cart.filter(l => l.id !== id); save(); renderCart();
});
$("#orderList").addEventListener("change", e => {
  const id = e.target.dataset.qty; if (!id) return;
  const l = cart.find(x => x.id === id); l.qty = Math.max(1, parseInt(e.target.value) || 1); save(); renderCart();
});
$("#clearBtn").onclick = () => { cart = []; save(); renderCart(); };

/* ---------- build pages ---------- */
$("#homeCards").innerHTML = Object.entries(PRODUCTS).map(([k, p]) =>
  `<a class="tile" href="#${k}"><b>${esc(p.name)}</b><span>${esc(p.title)}</span></a>`).join("");

for (const [k, p] of Object.entries(PRODUCTS)) {
  $(`[data-view="${k}"]`).innerHTML = `
    <span class="badge">${esc(p.name)}</span><h2>${esc(p.title)}</h2>
    <p class="muted">${esc(p.desc)}</p>
    <div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>
    <div class="items">${p.items.map(i => `
      <div class="item">
        <div class="img">${i.img ? `<img src="${esc(i.img)}" alt="${esc(i.name)}" loading="lazy">` : esc(p.name)}</div>
        <h3>${esc(i.name)}</h3>
        <span class="price">${i.price == null ? "Price on request" : money(i.price) + " / pair"}</span>
        <div class="qty"><small>Order quantity (pairs)</small>
          <div class="row"><button type="button" class="st" data-st="-1" data-for="${i.id}" aria-label="Decrease">−</button><input type="number" min="1" value="${QTY_STEP}" id="q-${i.id}" inputmode="numeric" aria-label="Quantity in pairs"><button type="button" class="st" data-st="1" data-for="${i.id}" aria-label="Increase">+</button></div>
          <button class="btn full" data-add="${i.id}">Add to cart</button></div>
      </div>`).join("")}</div>
    <p><a class="btn ghost" href="#order">Go to cart</a></p>`;
}
document.addEventListener("click", e => {
  const st = e.target.dataset.st;
  if (st) { const q = $("#q-" + e.target.dataset.for); q.value = Math.max(1, (parseInt(q.value) || 1) + st * QTY_STEP); return; }
  const id = e.target.dataset.add; if (!id) return;
  addToCart(id, $("#q-" + id).value);
  e.target.textContent = "Added ✓"; setTimeout(() => e.target.textContent = "Add to cart", 1200);
});

/* ---------- password-protected sheets ---------- */
const sha = async s => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, "0")).join("");
$("#sheets").innerHTML = SHEETS.map((s, i) => `
  <div class="card sheet"><h3>${esc(s.name)}</h3>
    ${s.url && s.hash ? `<input type="password" placeholder="Enter password" id="pw${i}" autocomplete="off">
      <button class="btn small" data-sheet="${i}">Open sheet</button><p class="msg" id="sm${i}"></p>`
    : `<p class="muted">Coming soon.</p>`}</div>`).join("");
$("#sheets").addEventListener("click", async e => {
  const i = e.target.dataset.sheet; if (i === undefined) return;
  const m = $("#sm" + i), ok = (await sha($("#pw" + i).value.trim())) === SHEETS[i].hash;
  m.className = "msg " + (ok ? "ok" : "err");
  m.textContent = ok ? "Access granted. Opening…" : "Wrong password.";
  if (ok) window.open(SHEETS[i].url, "_blank", "noopener");
});

/* ---------- order form: WhatsApp + email ---------- */
$("#orderForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, btn = f.querySelector("[type=submit]"), msg = $("#formMsg"), d = Object.fromEntries(new FormData(f));
  const fail = t => { msg.className = "msg err"; msg.textContent = t; };
  if (d.website) return;                                           // spam trap
  if (!cart.length) return fail("Your cart is empty. Please add at least one product.");
  if (d.name.trim().length < 2) return fail("Please enter your name.");
  if (!/^[6-9]\d{9}$/.test(d.phone.trim())) return fail("Enter a valid 10-digit mobile number.");
  if (d.address.trim().length < 5) return fail("Please enter your delivery address.");

  const { lines, total, unknown } = orderText();
  const body = `NEW ORDER\nName: ${d.name}\nPhone: ${d.phone}\nAddress: ${d.address}\n\nItems:\n${lines.join("\n")}\n\nTotal: ${unknown ? "Price on request" : money(total)}\nNotes: ${d.notes || "-"}`;

  btn.disabled = true;
  const win = window.open(wa(body), "_blank"); if (win) win.opener = null;        // opened on click so popups aren't blocked
  msg.className = "msg"; msg.textContent = "Sending email…";
  try {
    const r = await fetch("https://formsubmit.co/ajax/" + EMAIL_TO, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: "New website order – " + d.name, _cc: EMAIL_CC, _template: "table", _captcha: "false",
        Name: d.name, Phone: d.phone, Address: d.address, Order: lines.join("\n"), Total: unknown ? "Price on request" : money(total), Notes: d.notes || "-" })
    });
    const j = await r.json();
    if (!r.ok || j.success === "false") throw new Error(j.message || r.status);
    msg.className = "msg ok"; msg.textContent = "Order emailed. Please press Send in WhatsApp to complete it.";
    cart = []; save(); renderCart(); f.reset();
  } catch (err) {
    console.warn("Email failed:", err.message);
    msg.className = "msg err";
    msg.textContent = win ? "Your order is open in WhatsApp. Please tap Send there to complete it." : "WhatsApp was blocked. Please WhatsApp us on 8506067537.";
  } finally { btn.disabled = false; }
});

/* ---------- routing ---------- */
const views = [...document.querySelectorAll("[data-view]")];
function route() {
  const h = location.hash.slice(1) || "home", v = views.some(x => x.dataset.view === h) ? h : "home";
  view = v; updateBar();
  $("#burger").setAttribute("aria-expanded", "false");
  views.forEach(x => x.classList.toggle("show", x.dataset.view === v));
  document.querySelectorAll("nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + v));
  $("#nav").classList.remove("open"); window.scrollTo(0, 0);
}
addEventListener("hashchange", route);
$("#burger").onclick = () => $("#burger").setAttribute("aria-expanded", $("#nav").classList.toggle("open"));
$("#waGeneral").href = $("#waFloat").href = wa("Hello Shri Krishna Plastic, I want to enquire about your footwear.");
renderCart(); route();
