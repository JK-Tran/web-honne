const fs = require('fs');

// 1. Run patch on AdminExecutiveDashboardTab, AdminCustomersTab, AdminDashboardScreen
require('./patch_all_tabs_real_data.cjs');

// 2. Patch AdminRevenueTab.tsx
const revPath = 'c:/Users/lenovo/OneDrive/Desktop/web_honne/src/presentation/screens/admin/tabs/AdminRevenueTab.tsx';
let revCode = fs.readFileSync(revPath, 'utf8');
const revCrlf = revCode.includes('\r\n');
if (revCrlf) revCode = revCode.replace(/\r\n/g, '\n');

revCode = revCode.replace(
  `interface AdminRevenueTabProps {
  metrics?: any;
  selectedBranch: string;
}`,
  `interface AdminRevenueTabProps {
  metrics?: any;
  selectedBranch: string;
  orders?: any[];
}`
);

revCode = revCode.replace(
  `export const AdminRevenueTab: React.FC<AdminRevenueTabProps> = ({
  metrics,
  selectedBranch
}) => {`,
  `export const AdminRevenueTab: React.FC<AdminRevenueTabProps> = ({
  metrics,
  selectedBranch,
  orders = []
}) => {`
);

const oldBranchDataLine = `  // Lấy dữ liệu chi nhánh từ selectedBranch của Topbar
  const branchData = REVENUE_DATA[selectedBranch] || REVENUE_DATA['all'];
  const activeYearData = branchData.yearlyData[selectedYear] || branchData.yearlyData[2026];`;

const newBranchDataLine = `  // Lấy dữ liệu chi nhánh từ selectedBranch của Topbar
  const branchData = REVENUE_DATA[selectedBranch] || REVENUE_DATA['all'];
  const activeYearData = branchData.yearlyData[selectedYear] || branchData.yearlyData[2026];

  // Dynamic Real Financials calculated directly from Cloudflare D1 Orders
  const branchFilteredOrders = selectedBranch === 'all'
    ? orders
    : orders.filter((o: any) => o.branchId === selectedBranch || (o.branchName && o.branchName.toLowerCase().includes(selectedBranch.toLowerCase())));

  const completedOrders = branchFilteredOrders.filter((o: any) => o.status === 'completed' || o.status === 'delivered');
  const dailyCompletedOrders = completedOrders.filter((o: any) => (o.createdAt || '').startsWith(selectedDate));
  
  const realDailyRevenue = dailyCompletedOrders.reduce((sum: number, o: any) => sum + (Number(o.finalTotal) || Number(o.total_amount) || 0), 0);
  const realDailyOrdersCount = dailyCompletedOrders.length;
  const realDailyCupsCount = dailyCompletedOrders.reduce((acc: number, o: any) => acc + (o.items || []).reduce((s: number, it: any) => s + (it.quantity || 1), 0), 0);`;

if (revCode.includes(oldBranchDataLine)) {
  revCode = revCode.replace(oldBranchDataLine, newBranchDataLine);
  console.log('Added dynamic D1 revenue calculations to AdminRevenueTab.tsx');
}

// Bind Daily cards
revCode = revCode.replace(
  `{formatCurrencyVND(branchData.daily.revenue)}`,
  `{formatCurrencyVND(realDailyRevenue || metrics?.todayRevenue || branchData.daily.revenue)}`
);

revCode = revCode.replace(
  `{branchData.daily.completedOrders} đơn`,
  `{realDailyOrdersCount || branchData.daily.completedOrders} đơn`
);

revCode = revCode.replace(
  `{branchData.daily.totalCups} ly`,
  `{realDailyCupsCount || branchData.daily.totalCups} ly`
);

// Bind Monthly card
revCode = revCode.replace(
  `{formatCurrencyVND(branchData.monthly.totalRevenue)}`,
  `{formatCurrencyVND(metrics?.monthRevenue || branchData.monthly.totalRevenue)}`
);

if (revCrlf) revCode = revCode.replace(/\n/g, '\r\n');
fs.writeFileSync(revPath, revCode, 'utf8');
console.log('Successfully patched AdminRevenueTab.tsx');
