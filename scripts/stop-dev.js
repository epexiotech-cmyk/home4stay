const utils = require('./dev-utils');

const PORTS = [3000, 3001];

async function stopDev() {
  console.log('🛑 Shutting down dev environment safely...');

  const processes = utils.getTrackedPids();
  if (processes.length === 0) {
    console.log('✓ Nothing running.');
  } else {
    for (const proc of processes) {
      if (utils.isProcessAlive(proc.pid)) {
        utils.killProcess(proc.pid);
      }
    }

    let allDead = false;
    for (let i = 0; i < 5; i++) {
      allDead = true;
      for (const proc of processes) {
        if (utils.isProcessAlive(proc.pid)) {
          allDead = false;
        }
      }
      if (allDead) break;
      await utils.sleep(1000);
    }
    
    processes.forEach(proc => {
      if (!utils.isProcessAlive(proc.pid)) {
        console.log(`✓ ${proc.name} stopped.`);
      } else {
        console.log(`✗ Failed to terminate ${proc.name} (PID: ${proc.pid}).`);
      }
    });
  }

  for (const port of PORTS) {
    let occupyingPids = utils.getPidsUsingPort(port);
    if (occupyingPids.length > 0) {
      console.log(`⚠ Port ${port} occupied by PID(s): ${occupyingPids.join(', ')}. Terminating...`);
      for (const pid of occupyingPids) {
        if (utils.isProcessAlive(pid)) utils.killProcess(pid);
      }
    }
  }

  await utils.sleep(1000);
  let anyPortOccupied = false;
  for (const port of PORTS) {
    const occupying = utils.getPidsUsingPort(port);
    if (occupying.length > 0) {
      console.log(`✗ Failed to free port ${port}. Still occupied by PID(s): ${occupying.join(', ')}`);
      anyPortOccupied = true;
    }
  }

  utils.clearTrackedPids();
  
  if (!anyPortOccupied && processes.every(p => !utils.isProcessAlive(p.pid))) {
    if (processes.length > 0) {
      console.log('✨ All clear!');
    }
  } else {
    process.exitCode = 1;
    console.log('⚠ Shutdown completed with warnings.');
  }
}

stopDev().catch(err => {
  console.error('✗ Error during shutdown:', err);
  process.exitCode = 1;
});
