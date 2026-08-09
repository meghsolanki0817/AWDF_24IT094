const path = require('path');
const { spawn } = require('child_process');

const serverPath = path.resolve(__dirname, 'server', 'index.js');
const nodeProcess = spawn('node', [serverPath], {
  stdio: 'inherit',
  shell: true
});

nodeProcess.on('close', code => {
  console.log(`Backend process exited with code ${code}`);
});
