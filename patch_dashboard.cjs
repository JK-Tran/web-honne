const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'presentation', 'screens', 'admin', 'AdminDashboardScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line breaks
content = content.replace(/\r\n/g, '\n');

// 1. Replace imports
content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';\nimport { AdminLayout } from './AdminLayout';\nimport { AdminStaffTab } from './tabs/AdminStaffTab';"
);

// 2. Replace activeTab definition
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'finances' | 'announcements'>('overview');",
  "const navigate = useNavigate();\n  const [selectedBranch, setSelectedBranch] = useState<string>('all');\n  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'staff' | 'products' | 'finances' | 'announcements'>('overview');\n\n  // Redirect non-admin to admin login\n  useEffect(() => {\n    if (!isAdmin && user?.role !== 'manager' && user?.role !== 'staff') {\n      navigate('/admin/login');\n    }\n  }, [isAdmin, user, navigate]);"
);

// 3. Find start of `if (!isAdmin) {` and end of tabs header before `{activeTab === 'overview' && (`
const startMarker = "  // 1. IF NOT LOGGED IN AS ADMIN -> SHOW SECURE LOGIN";
const endMarker = "        {/* ========================================================= */}\n        {/* TAB 1: OVERVIEW & REVENUE DASHBOARD                       */}\n        {/* ========================================================= */}\n        {activeTab === 'overview' && (";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedBranch={selectedBranch}
      setSelectedBranch={setSelectedBranch}
    >
      {/* ========================================================= */}
      {/* TAB 0: STAFF & RBAC MANAGEMENT                            */}
      {/* ========================================================= */}
      {activeTab === 'staff' && <AdminStaffTab />}

      `;

  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  let newContent = before + replacement + after;
  
  // Close AdminLayout at the bottom
  const bottomMarker = "      </div>\n    </div>\n  );\n};";
  if (newContent.includes(bottomMarker)) {
    newContent = newContent.replace(bottomMarker, "    </AdminLayout>\n  );\n};");
  } else {
    // try alternative bottom pattern
    newContent = newContent.replace(/<\/div>\s*<\/div>\s*\);\s*};?\s*$/, "</AdminLayout>\n  );\n};");
  }
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('SUCCESS: AdminDashboardScreen.tsx updated with AdminLayout and Staff Tab!');
} else {
  console.error('Indices not found! Start:', startIndex, 'End:', endIndex);
}
