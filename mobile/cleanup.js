const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const criticalFiles = [
  'sos-alert', 'alert-verified-hook', 'storage.ts', 'usePushNotifications.ts', 'useAlerts.ts', 'supabase.ts', 'alertQueue.ts', 'geocoding.ts', 'routing.ts'
];

function processFile(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;
    
    // Remove // ─── comments
    content = content.replace(/^[ \t]*\/\/\s*───[^\n]*\n?/gm, '');
    
    // Remove // TODO comments
    content = content.replace(/^[ \t]*\/\/\s*TODO[^\n]*\n?/gim, '');
    
    // Remove specific obvious comments
    const obvious = [
      'incrementa tentativas',
      'retorna o array',
      'fecha o modal',
      'código antigo'
    ];
    for (const obv of obvious) {
      let regex = new RegExp(`^[ \\t]*\\/\\/\\s*${obv}[^\\n]*\\n?`, 'gmi');
      content = content.replace(regex, '');
    }
    
    // Strip multi-line block comments (non-JSDoc): /* ... */ 
    // Uses lazy matcher [\s\S]*?
    content = content.replace(/\/\*(?!\*)[\s\S]*?\*\//g, '');
    
    // Remove console.log / error EXCEPT for critical files
    const isCritical = criticalFiles.some(cf => filePath.includes(cf));
    if (!isCritical) {
      // Matches console.log/error optionally followed by multiline arguments, but naively matching to matching parens is hard in regex.
      // We will remove standard single-line consoles or lines that start with console.
      content = content.replace(/^[ \t]*console\.(log|error|warn)\(.*\);?[ \t]*\n?/gm, '');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Cleaned:', filePath);
    }
  }
}

walk('./src', processFile);
walk('./supabase/functions', processFile);
