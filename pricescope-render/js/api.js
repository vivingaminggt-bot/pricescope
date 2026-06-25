// ─── Live API Connector ───
// Fetches real (simulated) data from your deployed backend instead of
// using static hardcoded numbers.

const API_BASE = "https://pricescope-backend-72e1.onrender.com/api";

const CATEGORY_MAP = {
  "Electronics": "electronics",
  "Audio": "audio",
  "Gaming": "gaming",
  "Appliances": "appliances",
  "Wearables": "wear",
};

const EMOJI_MAP = {
  "Electronics": "📱",
  "Audio": "🎧",
  "Gaming": "🎮",
  "Appliances": "🌀",
  "Wearables": "⌚",
};

function pickBadge(savePct) {
  if (savePct >= 25) return { badge: "deal", badgeText: "Best Deal" };
  if (savePct >= 10) return { badge: "watch", badgeText: "Watch" };
  return { badge: "new", badgeText: "New" };
}

// Converts one backend product (with platform_prices) into the flat shape
// the existing renderProducts()/renderCompare() code expects.
function mapBackendProduct(item) {
  const flat = { id: item.id, name: item.name, cat: CATEGORY_MAP[item.category] || "electronics", img: EMOJI_MAP[item.category] || "🛒" };

  item.platform_prices.forEach(pp => {
    flat[pp.platform.toLowerCase()] = pp.price;
  });

  const vals = item.platform_prices.map(p => p.price);
  const highest = Math.max(...vals);
  const lowest = Math.min(...vals);
  flat.orig = Math.round(highest * 1.08); // approximate "original" price for display

  const savePct = Math.round(((highest - lowest) / highest) * 100);
  Object.assign(flat, pickBadge(savePct));

  return flat;
}

// Loads products+prices from the live backend and overwrites the global
// PRODUCTS array used throughout app.js. Falls back to the existing static
// PRODUCTS (from data.js) if the API call fails or times out.
async function loadLiveProducts() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_BASE}/prices/`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("Bad response from API");
    const data = await res.json();

    if (Array.isArray(data.products) && data.products.length > 0) {
      const mapped = data.products.map(mapBackendProduct);
      PRODUCTS.splice(0, PRODUCTS.length, ...mapped);
      return true;
    }
    throw new Error("Empty product list from API");
  } catch (err) {
    console.warn("Live API unavailable, using fallback static data:", err);
    return false;
  }
}

// Loads AI alerts from the backend and maps them into the shape
// renderAlerts() expects (icon/bg/title/sub).
const ALERT_STYLE = {
  price_drop:    { icon: "📉", bg: "#EAF3DE" },
  rising:        { icon: "⚠️", bg: "#FAEEDA" },
  stable:        { icon: "✅", bg: "#EAF3DE" },
  all_time_low:  { icon: "🔥", bg: "#FAECE7" },
  predicted_sale:{ icon: "🔮", bg: "#EEEDFE" },
};

async function loadLiveAlerts() {
  try {
    const res = await fetch(`${API_BASE}/alerts/`);
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return data.alerts.map(a => {
      const style = ALERT_STYLE[a.type] || { icon: "🔔", bg: "#E6F1FB" };
      return {
        icon: style.icon,
        bg: style.bg,
        title: `${a.product_name}: ${a.message}`,
        sub: a.platform ? `${a.platform}${a.price ? " · ₹" + a.price.toLocaleString("en-IN") : ""}` : "",
      };
    });
  } catch (err) {
    console.warn("Live alerts unavailable, using fallback static alerts:", err);
    return null;
  }
}

// Sends a proposed price for one product to the backend and returns the
// AI verdict comparing it to that product's seasonal pricing pattern.
async function evaluateOwnerPrice(productId, price) {
  try {
    const res = await fetch(`${API_BASE}/seasonal/${productId}/evaluate?price=${encodeURIComponent(price)}`);
    if (!res.ok) throw new Error("Bad response");
    return await res.json();
  } catch (err) {
    console.warn("Price evaluation failed:", err);
    return null;
  }
}
async function loadSeasonalAnalysis() {
  try {
    const res = await fetch(`${API_BASE}/seasonal/`);
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return data.analysis; // [{product_name, monthly_avg_best_price, cheapest_month, ...}]
  } catch (err) {
    console.warn("Seasonal analysis unavailable:", err);
    return null;
  }
}
async function loadLiveHistory(productId) {
  try {
    const res = await fetch(`${API_BASE}/history/${productId}`);
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    return data.history; // [{date, platform, price}, ...]
  } catch (err) {
    console.warn("Live history unavailable for", productId, err);
    return null;
  }
}
