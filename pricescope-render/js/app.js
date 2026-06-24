// ─── App Logic ───

// ── Tab switching ──
function showTab(name, btn) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  if (btn) btn.classList.add("active");

  if (name === "products") renderProducts("all");
  if (name === "compare")  renderCompare();
  if (name === "history")  renderHistory();
  if (name === "cloud")    setTimeout(renderCloudCharts, 80);
  if (name === "alerts")   renderAlerts();
}

// ── Products Tab ──
function renderProducts(filter) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";
  const list = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  list.forEach(p => {
    const best = bestPrice(p);
    const plat = bestPlatformName(p);
    const save = savings(p);

    const card = document.createElement("div");
    card.className = "product-card";

    const pills = PLATFORM_KEYS.map((k, i) => {
      const v = p[k];
      if (v == null) return "";
      const isBest = (v === best);
      return `<span class="pill${isBest ? " best" : ""}">${PLATFORM_NAMES[i]} ${fmtINR(v)}</span>`;
    }).join("");

    card.innerHTML = `
      <div class="prod-header">
        <div style="display:flex;align-items:center">
          <span class="prod-emoji">${p.img}</span>
          <div>
            <div class="prod-name">${p.name}</div>
            <div class="prod-cat">${p.cat}</div>
          </div>
        </div>
        <span class="badge badge-${p.badge}">${p.badgeText}</span>
      </div>
      <div class="price-row">
        <span class="price-best">${fmtINR(best)}</span>
        <span class="price-orig">${fmtINR(p.orig)}</span>
        <span class="price-save">Save ₹${save.toLocaleString("en-IN")}</span>
      </div>
      <div class="platform-pills">${pills}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
        <span class="ai-badge"><i class="ti ti-sparkles"></i> Best on ${plat}</span>
        <span style="font-size:11px;color:#999">Updated 2 min ago</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterProd(btn, cat) {
  document.querySelectorAll("#prod-filters .filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderProducts(cat);
}

// ── Compare Tab ──
function renderCompare() {
  const sort = document.getElementById("sort-sel").value;
  let list = [...PRODUCTS];
  if (sort === "savings")    list.sort((a, b) => savings(b) - savings(a));
  else if (sort === "price_asc")  list.sort((a, b) => bestPrice(a) - bestPrice(b));
  else if (sort === "price_desc") list.sort((a, b) => bestPrice(b) - bestPrice(a));
  else list.sort((a, b) => a.name.localeCompare(b.name));

  const body = document.getElementById("compare-body");
  body.innerHTML = "";
  list.forEach(p => {
    const best = bestPrice(p);
    const plat = bestPlatformName(p);
    const save = savings(p);
    const vals = PLATFORM_KEYS.map(k => p[k]).filter(v => v != null);
    const highest = Math.max(...vals);
    const pct = Math.round(save / highest * 100);

    const tds = PLATFORM_KEYS.map(k => {
      const v = p[k];
      const isBest = v === best;
      return `<td${isBest ? ' class="best-price"' : ''}>${fmtINR(v)}</td>`;
    }).join("");

    body.innerHTML += `<tr>
      <td><strong>${p.img} ${p.name}</strong></td>
      ${tds}
      <td class="best-price"><strong>${fmtINR(best)}</strong></td>
      <td style="color:#0F6E56">₹${save.toLocaleString("en-IN")} (${pct}%)</td>
      <td><span class="platform-badge">${plat}</span></td>
    </tr>`;
  });
}

// ── History Tab ──
let histChartInst = null;

function renderHistory() {
  const filter = document.getElementById("hist-filter");
  filter.innerHTML = PRODUCTS.map((p, i) =>
    `<button class="filter-btn${i === 0 ? " active" : ""}" onclick="selectProdHist(this,${i})">${p.img} ${p.name}</button>`
  ).join("");
  renderHistChart(0);
  renderHistCards();
}

function renderHistChart(idx) {
  const p = PRODUCTS[idx];
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
  const base = bestPrice(p);

  // Simulate realistic 12-month price curve
  const amazonData  = months.map((_, i) => Math.round(base * (0.95 + Math.sin(i * 0.8) * 0.07 + (i < 3 ? 0.06 : 0))));
  const flipData    = months.map((_, i) => Math.round(base * (0.93 + Math.cos(i * 0.9) * 0.06 + (i > 9 ? -0.03 : 0))));
  const bestData    = months.map((_, i) => Math.min(amazonData[i], flipData[i]) - Math.round(base * 0.01));

  if (histChartInst) histChartInst.destroy();
  histChartInst = new Chart(document.getElementById("histChart"), {
    type: "line",
    data: {
      labels: months,
      datasets: [
        { label: "Amazon",    data: amazonData, borderColor: "#185FA5", tension: 0.4, fill: false, borderDash: [0],  pointRadius: 3 },
        { label: "Flipkart",  data: flipData,   borderColor: "#BA7517", tension: 0.4, fill: false, borderDash: [5,3], pointRadius: 3 },
        { label: "Best price",data: bestData,   borderColor: "#0F6E56", tension: 0.4, fill: true, backgroundColor: "rgba(15,110,86,0.07)", borderWidth: 2, pointRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "top", labels: { font: { size: 12 }, boxWidth: 12, boxHeight: 12 } } },
      scales: {
        y: { ticks: { callback: v => "₹" + Math.round(v / 1000) + "K" } },
        x: { ticks: { maxRotation: 45 } }
      }
    }
  });
}

function selectProdHist(btn, idx) {
  document.querySelectorAll("#hist-filter .filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderHistChart(idx);
}

function renderHistCards() {
  const cards = [
    { name: 'iPhone 15 Pro',       low: 79999,  high: 94999,  today: 84999,  ai: '₹82,000 predicted in 14 days', aiClass: 'purple' },
    { name: 'Sony WH-1000XM5',    low: 19999,  high: 29990,  today: 22999,  ai: 'Stable at ₹22–23K', aiClass: 'purple' },
    { name: 'Samsung 55" 4K TV',  low: 39999,  high: 62990,  today: 43500,  ai: '→ Buy now. Near 1-year low.', aiClass: 'green' },
    { name: 'PS5 Console',         low: 49990,  high: 59990,  today: 54500,  ai: '↑ Rising. Act soon.', aiClass: 'red' },
  ];
  const grid = document.getElementById("history-grid");
  grid.innerHTML = cards.map(c => `
    <div class="history-card">
      <div class="hcard-title">${c.name}</div>
      <div class="hcard-sub">12-month price range</div>
      <div class="hcard-stats">
        <div><div class="hcard-stat-label">Low</div><div class="hcard-stat-val green">${fmtINR(c.low)}</div></div>
        <div><div class="hcard-stat-label">High</div><div class="hcard-stat-val red">${fmtINR(c.high)}</div></div>
        <div><div class="hcard-stat-label">Today</div><div class="hcard-stat-val">${fmtINR(c.today)}</div></div>
      </div>
      <div class="hcard-ai ${c.aiClass}">${c.ai}</div>
    </div>
  `).join("");
}

// ── Cloud Charts ──
let cloudChartsRendered = false;
function renderCloudCharts() {
  if (cloudChartsRendered) return;
  cloudChartsRendered = true;

  new Chart(document.getElementById("storageChart"), {
    type: "doughnut",
    data: {
      labels: ["Price data 55%","Images 20%","Logs 15%","AI models 10%"],
      datasets: [{ data: [55, 20, 15, 10], backgroundColor: ["#185FA5","#1D9E75","#EF9F27","#534AB7"], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 10 } } } }
  });

  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
  new Chart(document.getElementById("ingestChart"), {
    type: "bar",
    data: {
      labels: months,
      datasets: [{ label: "MB ingested", data: [82,88,91,95,98,102,105,108,112,115,118,121], backgroundColor: "#B5D4F4", borderRadius: 4 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => v + " MB" } }, x: { ticks: { maxRotation: 45 } } }
    }
  });
}

// ── Alerts Tab ──
function renderAlerts() {
  const ALERTS = [
    { icon:"🔥", bg:"#FAECE7", title:'Samsung 55" 4K TV hit a 6-month low',      sub:"₹43,500 on JioMart · 23% below average · AI confidence: 96%" },
    { icon:"📉", bg:"#EAF3DE", title:"Sony WH-1000XM5 dropped ₹2,000 on Flipkart",sub:"₹22,999 → was ₹24,999 · Predicted to recover next week" },
    { icon:"🔮", bg:"#EEEDFE", title:"iPhone 15 Pro sale predicted in 7 days",    sub:"AI detects pre-festival pattern · Likely to drop 5–8% on Amazon" },
    { icon:"⚠️", bg:"#FAEEDA", title:"PS5 Console price rising across all platforms",sub:"Up ₹1,500 avg in last 3 days · Supply signal detected" },
    { icon:"✅", bg:"#EAF3DE", title:"MacBook Air M3 price stable — good window",  sub:"₹114,900 on Amazon · No sale predicted for 30+ days" },
    { icon:"🔔", bg:"#E6F1FB", title:"JBL Flip 6 all-time low on Flipkart",       sub:"₹7,999 · Never been lower · 33% below original price" }
  ];
  const list = document.getElementById("alerts-list");
  list.innerHTML = ALERTS.map(a => `
    <div class="alert-item">
      <div class="alert-icon" style="background:${a.bg}">${a.icon}</div>
      <div>
        <div class="alert-info">${a.title}</div>
        <div class="alert-sub">${a.sub}</div>
      </div>
    </div>
  `).join("");
}

// ── Dashboard Trend Chart ──
let trendChartInst = null;
function renderTrendChart() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  });
  const avg = days.map((_, i) => Math.round(45000 + Math.sin(i * 0.4) * 3000 + i * 100));
  const low = avg.map(v => Math.round(v * 0.88));

  if (trendChartInst) trendChartInst.destroy();
  trendChartInst = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: days,
      datasets: [
        { label: "Avg market price", data: avg, borderColor: "#185FA5", tension: 0.4, fill: false, borderDash: [], pointRadius: 2 },
        { label: "Best available",   data: low, borderColor: "#0F6E56", tension: 0.4, fill: true, backgroundColor: "rgba(15,110,86,0.07)", borderWidth: 2, pointRadius: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "top", labels: { font: { size: 12 }, boxWidth: 12 } } },
      scales: {
        x: { ticks: { maxTicksLimit: 10, maxRotation: 45, autoSkip: true } },
        y: { ticks: { callback: v => "₹" + Math.round(v / 1000) + "K" } }
      }
    }
  });
}

// ── Live timestamp ──
function updateTimestamp() {
  const el = document.getElementById("last-updated");
  if (el) el.textContent = "Updated " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  renderProducts("all");
  setTimeout(renderTrendChart, 100);
  updateTimestamp();
  setInterval(updateTimestamp, 60000);
});
