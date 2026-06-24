// ─── Product Data ───
const PRODUCTS = [
  { id:1,  name:"iPhone 15 Pro",         cat:"electronics", badge:"watch", badgeText:"Watch",     amazon:84999,  flipkart:86499,  meesho:87200,  croma:89999,  jiomart:85500,  orig:94999,  img:"📱" },
  { id:2,  name:"Sony WH-1000XM5",       cat:"audio",       badge:"deal",  badgeText:"Best Deal", amazon:24990,  flipkart:22999,  meesho:23500,  croma:26990,  jiomart:24500,  orig:29990,  img:"🎧" },
  { id:3,  name:'Samsung 55" 4K TV',     cat:"electronics", badge:"deal",  badgeText:"Best Deal", amazon:44999,  flipkart:46999,  meesho:48000,  croma:52000,  jiomart:43500,  orig:62990,  img:"📺" },
  { id:4,  name:"PS5 Console",           cat:"gaming",      badge:"hot",   badgeText:"Rising",    amazon:54990,  flipkart:55499,  meesho:57000,  croma:56990,  jiomart:54500,  orig:54490,  img:"🎮" },
  { id:5,  name:"MacBook Air M3",        cat:"electronics", badge:"new",   badgeText:"New",       amazon:114900, flipkart:116000, meesho:null,   croma:119900, jiomart:115500, orig:124900, img:"💻" },
  { id:6,  name:"OnePlus Nord CE4",      cat:"electronics", badge:"deal",  badgeText:"Hot Deal",  amazon:19999,  flipkart:18999,  meesho:19500,  croma:21999,  jiomart:20499,  orig:25999,  img:"📱" },
  { id:7,  name:"Dyson V15 Detect",      cat:"appliances",  badge:"watch", badgeText:"Watch",     amazon:52900,  flipkart:54900,  meesho:null,   croma:58900,  jiomart:53500,  orig:62900,  img:"🌀" },
  { id:8,  name:"Apple Watch Series 9",  cat:"wear",        badge:"deal",  badgeText:"Deal",      amazon:38900,  flipkart:39900,  meesho:null,   croma:41900,  jiomart:39500,  orig:45900,  img:"⌚" },
  { id:9,  name:"JBL Flip 6",           cat:"audio",       badge:"deal",  badgeText:"Best Value",amazon:8499,   flipkart:7999,   meesho:8200,   croma:9499,   jiomart:8299,   orig:11999,  img:"🔊" },
  { id:10, name:"Logitech MX Master 3", cat:"electronics", badge:"new",   badgeText:"New",       amazon:8495,   flipkart:8999,   meesho:9200,   croma:9999,   jiomart:8795,   orig:10995,  img:"🖱️" }
];

const PLATFORM_KEYS  = ["amazon","flipkart","meesho","croma","jiomart"];
const PLATFORM_NAMES = ["Amazon","Flipkart","Meesho","Croma","JioMart"];

function bestPrice(p) {
  return Math.min(...PLATFORM_KEYS.map(k => p[k]).filter(v => v != null));
}
function bestPlatformName(p) {
  const best = bestPrice(p);
  const idx  = PLATFORM_KEYS.findIndex(k => p[k] === best);
  return PLATFORM_NAMES[idx] || "";
}
function savings(p) {
  const vals    = PLATFORM_KEYS.map(k => p[k]).filter(v => v != null);
  const highest = Math.max(...vals);
  return highest - bestPrice(p);
}
function fmtINR(v) {
  if (v == null) return "N/A";
  return "₹" + v.toLocaleString("en-IN");
}
