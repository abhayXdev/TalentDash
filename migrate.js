const { spawn } = require('child_process');
const child = spawn('npx.cmd', ['prisma', 'migrate', 'dev', '--name', 'init', '--skip-seed'], { stdio: ['pipe', 'inherit', 'inherit'] });
child.stdin.write('y\n');
child.stdin.write('y\n');
child.stdin.end();
