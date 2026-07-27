const { spawn } = require('child_process');
const utils = require('./dev-utils');

const appName = process.argv[2] || 'main-site';
const targetPort = appName === 'property-site' ? 3001 : 3000;

function startDev() {
  const occupyingPids = utils.getPidsUsingPort(targetPort);

  if (occupyingPids.length > 0) {
    const trackedPids = utils.getTrackedPids();
    const trackedApp = trackedPids.find(p => p.name === appName);
    const isTrackedAppAlive = trackedApp ? utils.isProcessAlive(trackedApp.pid) : false;

    if (isTrackedAppAlive) {
      console.log(`ℹ️ ${appName} is already running.`);
      return; 
    } else {
      console.error(`⚠ Port ${targetPort} is occupied by unknown PID(s): ${occupyingPids.join(', ')}.`);
      console.error(`Please free the port manually and try again.`);
      process.exitCode = 1;
      return;
    }
  }

  const command = utils.isWin ? 'cmd.exe' : 'npm';
  const args = utils.isWin 
    ? ['/c', 'npm', 'run', 'dev', `--workspace=apps/${appName}`] 
    : ['run', 'dev', `--workspace=apps/${appName}`];

  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false
  });

  utils.addTrackedPid({
    name: appName,
    pid: child.pid,
    startTime: new Date().toISOString()
  });

  console.log(`✅ Started ${appName} (PID: ${child.pid})`);

  let isCleaningUp = false;
  const cleanup = () => {
    if (isCleaningUp) return;
    isCleaningUp = true;
    console.log(`\n🛑 Cleaning up ${appName}...`);
    
    if (utils.isProcessAlive(child.pid)) {
      utils.killProcess(child.pid);
    }
    
    utils.removeTrackedPid(child.pid);
  };

  process.on('SIGINT', () => { cleanup(); process.exit(); });
  process.on('SIGTERM', () => { cleanup(); process.exit(); });

  child.on('exit', (code) => {
    if (!isCleaningUp) {
      isCleaningUp = true;
      utils.removeTrackedPid(child.pid);
    }
    process.exitCode = code || 0;
  });
}

startDev();
