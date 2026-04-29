const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pidFile = path.join(__dirname, '../.dev-pids.json');
const PORTS = [3000, 3001];

console.log('🛑 Shutting down dev environment safely...');

if (fs.existsSync(pidFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(pidFile));
    const processes = data.processes || [];

    if (processes.length > 0) {
      processes.forEach(proc => {
        try {
          // Check if alive
          process.kill(proc.pid, 0);
          console.log(`🎯 Killing ${proc.name} (PID: ${proc.pid})`);
          execSync(`taskkill /F /PID ${proc.pid} /T`, { stdio: 'ignore' });
        } catch (e) {
          if (e.code === 'EPERM') {
            console.log(`⚠️ Permission denied to kill PID ${proc.pid}`);
          } else {
            console.log(`🧹 Cleaning stale PID: ${proc.pid} (${proc.name})`);
          }
        }
      });
    } else {
      console.log('ℹ️ No active dev processes found in tracking file.');
    }
    
    // Reset file
    fs.writeFileSync(pidFile, JSON.stringify({ processes: [] }, null, 2));
  } catch (e) {
    console.error('❌ Error processing PID file:', e.message);
  }
}

// Port-based cleanup (final sweep)
console.log('🧹 Clearing target ports...');
PORTS.forEach(port => {
  try {
    const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
    const lines = stdout.split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid) && pid !== '0') {
        try {
          execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
          console.log(`🔓 Freed port ${port} (PID: ${pid})`);
        } catch (e) {}
      }
    });
  } catch (e) {}
});

console.log('✨ All clear!');
