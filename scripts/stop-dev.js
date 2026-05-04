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
      console.log(`📡 Found ${processes.length} tracked processes.`);
      for (const proc of processes) {
        try {
          // Check if alive
          process.kill(proc.pid, 0);
          console.log(`🎯 Killing ${proc.name} (PID: ${proc.pid})`);
          
          // Force kill tree
          execSync(`taskkill /F /PID ${proc.pid} /T`, { stdio: 'ignore' });
          
          // Verify death with retry
          let retries = 5;
          while (retries > 0) {
            try {
              process.kill(proc.pid, 0);
              retries--;
              execSync('timeout /t 1', { stdio: 'ignore' }); // Wait 1s
            } catch (e) {
              console.log(`✅ ${proc.name} (PID: ${proc.pid}) stopped.`);
              break;
            }
          }
        } catch (e) {
          console.log(`🧹 ${proc.name} (PID: ${proc.pid}) already stopped.`);
        }
      }
    } else {
      console.log('ℹ️ No active dev processes found in tracking file.');
    }
    
    // Reset file ONLY AFTER ATTEMPTING ALL KILLS
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
    const lines = stdout.split('\n').filter(l => l.trim().length > 0);
    
    if (lines.length > 0) {
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
    }
  } catch (e) {}
});

console.log('✨ All clear!');
