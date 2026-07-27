const utils = require('./dev-utils');

const PORTS = [3000, 3001];
const APPS = { 3000: 'main-site', 3001: 'property-site' };

console.log('\n🔍 Home4Stay Dev Status\n' + '='.repeat(50));

const trackedPids = utils.getTrackedPids();

const trackedMap = {};
trackedPids.forEach(p => {
  trackedMap[p.name] = p;
});

PORTS.forEach(port => {
  const appName = APPS[port];
  const trackedProc = trackedMap[appName];
  const occupyingPids = utils.getPidsUsingPort(port);
  
  let isTrackedAlive = false;
  if (trackedProc) {
    isTrackedAlive = utils.isProcessAlive(trackedProc.pid);
  }
  
  let state = '';
  
  if (trackedProc && isTrackedAlive) {
    if (occupyingPids.length > 0) {
      state = `✅ Running (Tracked PID: ${trackedProc.pid}, Port PID: ${occupyingPids.join(', ')})`;
    } else {
      state = `⚠ PID Alive but Port Closed (Tracked PID: ${trackedProc.pid})`;
    }
  } else if (trackedProc && !isTrackedAlive) {
    if (occupyingPids.length > 0) {
      state = `⚠ Stale PID (${trackedProc.pid} DEAD) | ⚠ Port Occupied without tracked PID (${occupyingPids.join(', ')})`;
    } else {
      state = `⚠ Stale PID (Tracked PID: ${trackedProc.pid}, DEAD)`;
    }
  } else {
    // No tracked process for this app
    if (occupyingPids.length > 0) {
      state = `⚠ Port Occupied without tracked PID (PID: ${occupyingPids.join(', ')})`;
    } else {
      state = `🛑 Stopped`;
    }
  }
  
  console.log(`- ${appName.padEnd(15)} [Port ${port}]:\n  ${state}\n`);
});

// Check if any tracked process is not associated with our main ports
trackedPids.forEach(p => {
  if (!Object.values(APPS).includes(p.name)) {
    const alive = utils.isProcessAlive(p.pid);
    if (alive) {
      console.log(`- ${p.name.padEnd(15)} [Unknown Port]:\n  ✅ Running (Tracked PID: ${p.pid})\n`);
    } else {
      console.log(`- ${p.name.padEnd(15)} [Unknown Port]:\n  ⚠ Stale PID (DEAD)\n`);
    }
  }
});

console.log('='.repeat(50) + '\n');
