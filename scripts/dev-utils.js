const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pidFile = path.join(__dirname, '../.dev-pids.json');
const isWin = process.platform === 'win32';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getTrackedPids = () => {
  if (fs.existsSync(pidFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
      return data.processes || [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

const saveTrackedPids = (processes) => {
  try {
    fs.writeFileSync(pidFile, JSON.stringify({ processes }, null, 2), 'utf8');
  } catch (e) {
    console.error('❌ Error saving PID file:', e.message);
  }
};

const addTrackedPid = (processData) => {
  const processes = getTrackedPids().filter(p => p.name !== processData.name);
  processes.push(processData);
  saveTrackedPids(processes);
};

const removeTrackedPid = (pid) => {
  const processes = getTrackedPids().filter(p => p.pid !== pid);
  saveTrackedPids(processes);
};

const clearTrackedPids = () => saveTrackedPids([]);

const isProcessAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
};

const killProcess = (pid) => {
  if (!pid) return false;
  
  try {
    // 1. Try polite SIGTERM (Node API)
    process.kill(pid, 'SIGTERM');
  } catch (e) {}

  // 2. Forceful kill
  try {
    if (isWin) {
      execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
    } else {
      process.kill(pid, 'SIGKILL');
      // Fallback OS shell command just in case
      execSync(`kill -9 ${pid} 2>/dev/null || true`, { stdio: 'ignore' });
    }
  } catch(e) {}
  
  return !isProcessAlive(pid);
};

const getPidsUsingPort = (port) => {
  const pids = new Set();
  try {
    if (isWin) {
      const stdout = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = stdout.split('\n').filter(l => l.trim().length > 0);
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[parts.length - 1], 10);
        if (pid && !isNaN(pid) && pid !== 0) pids.add(pid);
      });
    } else {
      try {
        const stdout = execSync(`lsof -t -i:${port}`).toString();
        stdout.split('\n').forEach(line => {
          const pid = parseInt(line.trim(), 10);
          if (pid && !isNaN(pid)) pids.add(pid);
        });
      } catch (e) {
        // Fallback to fuser if lsof is not available
        try {
          const stdout = execSync(`fuser ${port}/tcp 2>/dev/null`).toString();
          stdout.split(/\s+/).forEach(str => {
            const pid = parseInt(str.trim(), 10);
            if (pid && !isNaN(pid)) pids.add(pid);
          });
        } catch(e2) {}
      }
    }
  } catch(e) {}
  return Array.from(pids);
};

module.exports = {
  isWin,
  sleep,
  getTrackedPids,
  saveTrackedPids,
  addTrackedPid,
  removeTrackedPid,
  clearTrackedPids,
  isProcessAlive,
  killProcess,
  getPidsUsingPort
};
