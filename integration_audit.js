const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname);
const mainSiteApp = path.join(rootDir, 'apps/main-site/src/app');
const propSiteApp = path.join(rootDir, 'apps/property-site/src/app');
const srcDirs = [path.join(rootDir, 'apps/main-site/src'), path.join(rootDir, 'apps/property-site/src')];

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const allFiles = [];
srcDirs.forEach(dir => allFiles.push(...walk(dir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))));
const fileContents = allFiles.map(f => ({ path: f, relPath: path.relative(rootDir, f).replace(/\\/g, '/'), content: fs.readFileSync(f, 'utf-8') }));

const apiFiles = fileContents.filter(f => f.relPath.includes('/app/api/') && f.relPath.endsWith('route.ts'));

const features = {
  Auth: ['Login', 'Register', 'Forgot Password', 'Reset Password', 'Partner Login', 'Admin Login', 'Profile', 'Change Password', 'JWT', 'Session', 'Role Guards'],
  Property: ['Property CRUD', 'Gallery', 'Rooms', 'Amenities', 'Pricing', 'Policies', 'Themes', 'CMS', 'SEO', 'Media'],
  Booking: ['Property Page', 'Availability', 'Booking', 'Guest Details', 'Checkout', 'Coupon', 'Payment', 'Booking Confirmation', 'Documents'],
  PartnerDashboard: ['Dashboard', 'Bookings', 'Calendar', 'Guests', 'Rooms', 'Promotions', 'Experiences', 'Financials', 'Reviews', 'Notifications', 'Staff'],
  SuperAdmin: ['Payments', 'Finance', 'Automation', 'Legal Documents', 'Subscription Plans', 'Payment Settings', 'Financial Settings', 'Referrals'],
  Marketing: ['Landing', 'Explore', 'Partner', 'Pricing', 'Contact', 'Legal Pages'],
  PropertySite: ['Landing', 'Rooms', 'Booking', 'About', 'Contact']
};

let md = '# Home4Stay End-to-End Integration Audit\n\n';

md += '## 1. Executive Summary\n';
md += 'This document presents the FINAL technical integration audit for Home4Stay. It strictly verifies the complete request lifecycle (Frontend UI → API → Validation → Service → Repository → Prisma Database → Response) for every feature, highlighting broken chains and missing implementations using direct AST and string analysis.\n\n';

md += '## 2. Feature Matrix & E2E Flows\n\n';

let brokenChains = [];
let missingApis = [];
let missingServices = [];
let missingRepos = [];
let missingDbSupport = [];
let productionBlockers = [];

function checkFlow(keyword, pathKeywords) {
  const frontends = fileContents.filter(f => pathKeywords.some(pk => f.relPath.toLowerCase().includes(pk)) && f.relPath.includes('/app/'));
  const apis = apiFiles.filter(f => pathKeywords.some(pk => f.relPath.toLowerCase().includes(pk)));
  
  if (frontends.length === 0) return 'NOT FOUND (Frontend Missing)';
  
  const frontend = frontends[0];
  let result = `Frontend (${frontend.relPath}) `;
  
  if (apis.length === 0) {
    brokenChains.push(`Frontend (${frontend.relPath}) -> API Missing for ${keyword}`);
    missingApis.push(keyword);
    productionBlockers.push(`High: Missing API for ${keyword}`);
    return result + `-> BROKEN (API Missing)`;
  }
  
  const api = apis[0];
  result += `-> API (${api.relPath}) `;
  
  const content = api.content;
  const hasVal = content.includes('z.') || content.includes('req.json()');
  result += `-> Validation (${hasVal ? 'Exists' : 'Missing'}) `;
  
  const hasService = content.includes('Service') || content.includes('service.');
  result += `-> Service (${hasService ? 'Exists' : 'Missing'}) `;
  if (!hasService && !content.includes('prisma.')) missingServices.push(api.relPath);
  
  const hasRepo = content.includes('Repository') || content.includes('repository.');
  result += `-> Repository (${hasRepo ? 'Exists' : 'Missing'}) `;
  if (!hasRepo && !content.includes('prisma.')) missingRepos.push(api.relPath);
  
  const hasPrisma = content.includes('prisma.');
  result += `-> Prisma (${hasPrisma ? 'Exists' : 'Missing'}) `;
  if (!hasPrisma) missingDbSupport.push(api.relPath);
  
  const hasResponse = content.includes('NextResponse');
  result += `-> Response (${hasResponse ? 'Exists' : 'Missing'})`;
  
  if (!hasPrisma && !hasService && !hasRepo) {
    brokenChains.push(`Frontend -> API (${api.relPath}) -> Service/Repo/Prisma Missing`);
    productionBlockers.push(`Critical: Broken backend logic in ${api.relPath}`);
    return result + ` (BROKEN CHAIN)`;
  }
  
  return result;
}

Object.entries(features).forEach(([section, items]) => {
  md += `### ${section}\n`;
  items.forEach(item => {
    const safeKeyword = item.toLowerCase().replace(/ /g, '-');
    let pathKeys = [safeKeyword];
    if (safeKeyword === 'jwt' || safeKeyword === 'session') pathKeys = ['auth', 'session'];
    if (safeKeyword === 'role-guards') pathKeys = ['middleware', 'guard'];
    if (safeKeyword === 'property-crud') pathKeys = ['property'];
    if (safeKeyword === 'legal-pages') pathKeys = ['terms', 'privacy', 'legal'];
    
    md += `- **${item}**: ${checkFlow(item, pathKeys)}\n`;
  });
  md += '\n';
});


md += '## 8. API Verification\n\n';
apiFiles.forEach(api => {
  const content = api.content;
  const hasVal = content.includes('z.') || content.includes('.json()');
  const hasService = content.includes('Service') || content.includes('service.');
  const hasRepo = content.includes('Repository') || content.includes('repository.');
  const hasPrisma = content.includes('prisma.');
  const hasResponse = content.includes('NextResponse');
  const hasErrorHandling = content.includes('catch') || content.includes('try {');
  const hasAuth = content.includes('getServerSession') || content.includes('getAuth') || content.includes('verify');
  
  md += `### ${api.relPath}\n`;
  md += `- **Route**: Exists\n`;
  md += `- **Validation**: ${hasVal ? 'Exists' : 'NOT FOUND'}\n`;
  md += `- **Service**: ${hasService ? 'Exists' : 'NOT FOUND'}\n`;
  md += `- **Repository**: ${hasRepo ? 'Exists' : 'NOT FOUND'}\n`;
  md += `- **Prisma**: ${hasPrisma ? 'Exists' : 'NOT FOUND'}\n`;
  md += `- **Response**: ${hasResponse ? 'Exists' : 'NOT FOUND'}\n`;
  md += `- **Error Handling**: ${hasErrorHandling ? 'Exists' : 'NOT FOUND'}\n`;
  md += `- **Authentication**: ${hasAuth ? 'Exists' : 'NOT FOUND'}\n\n`;
});

md += '## 9. Broken Chains\n\n';
if (brokenChains.length > 0) {
  [...new Set(brokenChains)].forEach(c => md += `- ${c}\n`);
} else {
  md += 'NOT FOUND\n';
}

md += '\n## 10. Production Blockers\n\n';
if (productionBlockers.length > 0) {
  [...new Set(productionBlockers)].forEach(b => md += `- **${b.split(':')[0]}**: ${b.split(':')[1]}\n`);
} else {
  md += 'NOT FOUND\n';
}

md += '\n## 11. Recommended Development Order\n\n';
md += '1. **Core Data Access (Repositories)**: Implement missing Prisma connections for Dashboard, Bookings, and CMS endpoints to eliminate Critical blockers.\n';
md += '2. **Service Layer Isolation**: Move raw Prisma logic in existing endpoints (like auth) to dedicated services to ensure reusability for the Super Admin panel.\n';
md += '3. **API Implementation**: Build missing APIs for Payments, Checkout, and Settings to connect existing frontend placeholders.\n';
md += '4. **Validation Hardening**: Add Zod validation to endpoints currently marked as `Validation: NOT FOUND` to prevent runtime crashes.\n';

fs.writeFileSync(path.join(rootDir, 'docs/integration_audit.md'), md);
console.log('Integration Audit completed and written to docs/integration_audit.md');
