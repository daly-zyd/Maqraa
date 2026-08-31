import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const content = [
  '@echo off',
  'title Maqraa App',
  'cd /d "%~dp0"',
  '',
  'echo ========================================================',
  'echo   Lancement de la plateforme Maqraa (Bi-l-Quran Nahya)',
  'echo ========================================================',
  'echo.',
  '',
  'if not exist "node_modules" (',
  '    echo [INFO] Installation des dependances...',
  '    call npm install',
  ')',
  '',
  'echo [INFO] Demarrage du serveur de developpement Vite...',
  'echo.',
  'call npm run dev -- --open',
  '',
  'if %errorlevel% neq 0 (',
  '    echo.',
  '    echo [ERREUR] Une erreur est survenue lors du lancement.',
  '    pause',
  ')',
  ''
].join('\r\n');

const targetPath = path.resolve(__dirname, '..', 'start.bat');
fs.writeFileSync(targetPath, content, 'ascii');
console.log('start.bat written successfully in ASCII with CRLF.');
