const fs = require('fs');

// =========================================================================
// 1. PATCH AdminExecutiveDashboardTab.tsx
// =========================================================================
const execPath = 'c:/Users/lenovo/OneDrive/Desktop/web_honne/src/presentation/screens/admin/tabs/AdminExecutiveDashboardTab.tsx';
let execCode = fs.readFileSync(execPath, 'utf8');
const execCrlf = execCode.includes('\r\n');
if (execCrlf) execCode = execCode.replace(/\r\n/g, '\n');

// Replace interface metrics with totalStaff
execCode = execCode.replace(
  'totalCustomers?: number;',
  'totalCustomers?: number;\n    totalStaff?: number;'
);

// Helper for item name
const oldDefaultRecent = `  // Recent orders list (combines mockup defaults with live customer orders)
  const defaultRecentOrders = [
    {
      id: 'HN2487',
      customerName: 'Nguyễn Văn A',
      productName: 'Trà Sữa Ô Long',
      total: 320000,
      status: 'completed',
      time: '30/11/2026 14:32'
    },
    {
      id: 'HN2486',
      customerName: 'Trần Thị B',
      productName: 'Cà Phê Americano',
      total: 180000,
      status: 'brewing',
      time: '30/11/2026 13:20'
    },
    {
      id: 'HN2485',
      customerName: 'Lê Văn C',
      productName: 'Matcha Latte',
      total: 240000,
      status: 'completed',
      time: '30/11/2026 11:45'
    }
  ];

  // Map live orders if available
  const displayOrders = orders.length > 0
    ? orders.slice(0, 5).map((o, idx) => ({
        id: o.id?.replace('ORD_', 'HN') || \`HN\${2487 - idx}\`,
        customerName: o.customer?.name || (idx === 0 ? 'Nguyễn Văn A' : idx === 1 ? 'Trần Thị B' : 'Lê Văn C'),
        productName: o.items?.[0]?.productName || (idx === 0 ? 'Trà Sữa Ô Long' : idx === 1 ? 'Cà Phê Americano' : 'Matcha Latte'),
        total: o.finalTotal || (idx === 0 ? 320000 : idx === 1 ? 180000 : 240000),
        status: o.status === 'completed' || o.status === 'delivered' ? 'completed' : o.status === 'brewing' || o.status === 'shipping' ? 'brewing' : o.status === 'cancelled' ? 'cancelled' : 'brewing',
        time: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '30/11/2026 14:32'
      }))
    : defaultRecentOrders;`;

const newDefaultRecent = `  // Helper to extract item name
  const getItemName = (it: any) => it?.name || it?.productName || it?.title || it?.product_name || 'Đồ uống HONNE';

  // Map live orders directly from Cloudflare D1
  const displayOrders = orders.slice(0, 5).map((o) => ({
    id: o.id,
    customerName: o.customer?.name || 'Khách vãng lai',
    productName: (o.items && o.items.length > 0)
      ? o.items.map((it: any) => \`\${getItemName(it)}\${it.quantity > 1 ? \` (x\${it.quantity})\` : ''}\`).join(', ')
      : 'Đồ uống HONNE',
    total: o.finalTotal || o.total_amount || o.subtotal || 0,
    status: o.status === 'completed' || o.status === 'delivered' ? 'completed' : o.status === 'cancelled' ? 'cancelled' : 'brewing',
    time: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Hôm nay'
  }));

  // Dynamic Donut Calculations
  const completedDonutCount = orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length;
  const processingDonutCount = orders.filter((o) => o.status === 'brewing' || o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipping').length;
  const cancelledDonutCount = orders.filter((o) => o.status === 'cancelled').length;
  const totalDonutCount = orders.length || 1;
  const completedDonutPct = Math.round((completedDonutCount / totalDonutCount) * 100);
  const processingDonutPct = Math.round((processingDonutCount / totalDonutCount) * 100);
  const cancelledDonutPct = 100 - completedDonutPct - processingDonutPct;`;

if (execCode.includes(oldDefaultRecent)) {
  execCode = execCode.replace(oldDefaultRecent, newDefaultRecent);
  console.log('Replaced defaultRecentOrders in AdminExecutiveDashboardTab.tsx');
}

// Replace Card 1: ₫425,680,000 -> {formatCurrencyVND(metrics.monthRevenue || metrics.todayRevenue || 0)}
execCode = execCode.replace(
  '<div className="text-2xl sm:text-[26px] font-black text-[#103B27] mt-2 tracking-tight">\n            ₫425,680,000\n          </div>',
  '<div className="text-2xl sm:text-[26px] font-black text-[#103B27] mt-2 tracking-tight font-mono">\n            {formatCurrencyVND(metrics.monthRevenue || metrics.todayRevenue || 0)}\n          </div>'
);

// Replace Card 2: 1,248 -> {(metrics.totalOrders || orders.length || 0).toLocaleString()}
execCode = execCode.replace(
  '<div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight">\n            1,248\n          </div>',
  '<div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight font-mono">\n            {(metrics.totalOrders || orders.length || 0).toLocaleString()} đơn\n          </div>'
);

// Replace Card 3: 8,720 -> {(metrics.totalCustomers || 12).toLocaleString()}
execCode = execCode.replace(
  '<div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight">\n            8,720\n          </div>',
  '<div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight font-mono">\n            {(metrics.totalCustomers || 12).toLocaleString()} khách\n          </div>'
);

// Replace Card 4: 48 -> {(metrics.totalStaff || 11).toLocaleString()}
execCode = execCode.replace(
  '<div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight">\n            48\n          </div>',
  '<div className="text-2xl sm:text-[26px] font-black text-stone-900 mt-2 tracking-tight font-mono">\n            {(metrics.totalStaff || 11).toLocaleString()} nhân sự\n          </div>'
);

// Replace Donut Center text
execCode = execCode.replace(
  '<div className="text-xl font-black text-stone-900 tracking-tight">\n                    1,248\n                  </div>',
  '<div className="text-xl font-black text-stone-900 tracking-tight font-mono">\n                    {orders.length || metrics.totalOrders || 0}\n                  </div>'
);

// Replace Donut legend percentages
execCode = execCode.replace(
  '<span className="font-mono font-black text-[#103B27] ml-auto">72%</span>',
  '<span className="font-mono font-black text-[#103B27] ml-auto">{completedDonutPct}%</span>'
);
execCode = execCode.replace(
  '<span className="font-mono font-black text-amber-700 ml-auto">18%</span>',
  '<span className="font-mono font-black text-amber-700 ml-auto">{processingDonutPct}%</span>'
);
execCode = execCode.replace(
  '<span className="font-mono font-black text-rose-700 ml-auto">10%</span>',
  '<span className="font-mono font-black text-rose-700 ml-auto">{cancelledDonutPct}%</span>'
);

if (execCrlf) execCode = execCode.replace(/\n/g, '\r\n');
fs.writeFileSync(execPath, execCode, 'utf8');
console.log('Successfully patched AdminExecutiveDashboardTab.tsx');

// =========================================================================
// 2. PATCH AdminCustomersTab.tsx
// =========================================================================
const custPath = 'c:/Users/lenovo/OneDrive/Desktop/web_honne/src/presentation/screens/admin/tabs/AdminCustomersTab.tsx';
let custCode = fs.readFileSync(custPath, 'utf8');
const custCrlf = custCode.includes('\r\n');
if (custCrlf) custCode = custCode.replace(/\r\n/g, '\n');

const oldCustCounts = `  const totalMembers = customers.length || 8720;
  const vipGoldCount = customers.filter((c) => c.tier === 'VIP Gold').length || 2450;
  const totalCoinsIssued = customers.reduce((acc, c) => acc + c.coins, 0) || 542000;`;

const newCustCounts = `  const totalMembers = customers.length;
  const vipGoldCount = customers.filter((c) => c.tier === 'VIP Gold').length;
  const totalCoinsIssued = customers.reduce((acc, c) => acc + (c.coins || 0), 0);`;

if (custCode.includes(oldCustCounts)) {
  custCode = custCode.replace(oldCustCounts, newCustCounts);
  console.log('Replaced fallback mock counts in AdminCustomersTab.tsx');
}

if (custCrlf) custCode = custCode.replace(/\n/g, '\r\n');
fs.writeFileSync(custPath, custCode, 'utf8');
console.log('Successfully patched AdminCustomersTab.tsx');

// =========================================================================
// 3. PATCH AdminDashboardScreen.tsx to pass orders to AdminRevenueTab
// =========================================================================
const screenPath = 'c:/Users/lenovo/OneDrive/Desktop/web_honne/src/presentation/screens/admin/AdminDashboardScreen.tsx';
let screenCode = fs.readFileSync(screenPath, 'utf8');
const screenCrlf = screenCode.includes('\r\n');
if (screenCrlf) screenCode = screenCode.replace(/\r\n/g, '\n');

screenCode = screenCode.replace(
  `<AdminRevenueTab
          metrics={metrics}
          selectedBranch={selectedBranch}
        />`,
  `<AdminRevenueTab
          metrics={metrics}
          selectedBranch={selectedBranch}
          orders={orders}
        />`
);

if (screenCrlf) screenCode = screenCode.replace(/\n/g, '\r\n');
fs.writeFileSync(screenPath, screenCode, 'utf8');
console.log('Successfully patched AdminDashboardScreen.tsx');
