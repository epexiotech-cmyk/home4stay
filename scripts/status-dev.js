const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pidFile = path.join(__dirname, '../.dev-pids.json');
const PORTS = [3000, 3001];

console.log('\n🔍 Home4Stay Dev Status\n' + '='.repeat(30));

// 1. Check Tracked Processes
if (fs.existsSync(pidFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(pidFile));
    const processes = data.processes || [];
    
    if (processes.length > 0) {
      console.log('📡 Tracked Processes:');
      processes.forEach(proc => {
        let status = '❌ DEAD';
        try {
          process.kill(proc.pid, 0);
          status = '✅ ALIVE';
        } catch (e) {}
        console.log(`- ${proc.name.padEnd(12)} [PID: ${proc.pid.toString().padEnd(6)}] Status: ${status}`);
      });
    } else {
      console.log('📡 No tracked processes running.');
    }
  } catch (e) {
    console.error('❌ Error reading PID file');
  }
}

// 2. Check Ports
console.log('\n🚪 Port Status:');
PORTS.forEach(port => {
  let inUse = '🟢 Free';
  try {
    execSync(`netstat -ano | findstr :${port}`, { stdio: 'ignore' });
    inUse = '🔴 IN USE';
  } catch (e) {}
  console.log(`- Port ${port}: ${inUse}`);
});

console.log('\n' + '='.repeat(30) + '\n');
