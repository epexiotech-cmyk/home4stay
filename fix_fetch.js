const fs = require("fs");
const dbPath = "apps/main-site/src/app/(portal)/admin/database/page.tsx";
let c = fs.readFileSync(dbPath, "utf8");

c = c.replace(
  'const res = await fetch("/api/admin/database");',
  'const res = await fetch("/api/admin/database", { credentials: "include" });'
);

c = c.replace(
  'const res = await fetch(`/api/admin/database?model=${modelName}&page=${page}`);',
  'const res = await fetch(`/api/admin/database?model=${modelName}&page=${page}`, { credentials: "include" });'
);

fs.writeFileSync(dbPath, c);
console.log("Fixed fetch calls!");
