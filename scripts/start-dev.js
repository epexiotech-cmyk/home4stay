const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const pidFile = path.join(__dirname, '../.dev-pids.json');
const appName = process.argv[2] || 'main-site';

// Initialize PID file if missing
if (!fs.existsSync(pidFile)) {
  fs.writeFileSync(pidFile, JSON.stringify({ processes: [] }));
}

// Start the process
const isWin = process.platform === 'win32';
const command = isWin ? 'cmd.exe' : 'npm';
const args = isWin 
  ? ['/c', 'npm', 'run', 'dev', `--workspace=${appName}`] 
  : ['run', 'dev', `--workspace=${appName}`];

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: false
});

// Update PID file
try {
  const data = JSON.parse(fs.readFileSync(pidFile));
  
  // Prevent duplicates for the same app name
  data.processes = data.processes.filter(p => p.name !== appName);
  
  data.processes.push({
    name: appName,
    pid: child.pid,
    startTime: new Date().toISOString()
  });

  fs.writeFileSync(pidFile, JSON.stringify(data, null, 2));
  console.log(`✅ Started ${appName} (PID: ${child.pid})`);
} catch (e) {
  console.error('❌ Error updating PID file:', e.message);
}

// Process will persist in file; stop/status will check liveness
