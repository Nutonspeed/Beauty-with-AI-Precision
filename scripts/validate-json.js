const fs = require('fs');
let content = '';
try {
  content = fs.readFileSync('i18n/messages/th.json', 'utf8');
  JSON.parse(content);
  console.log('JSON is valid');
} catch (e) {
  console.error('JSON is invalid:', e.message);
  const match = e.message.match(/at position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    const lines = content.substring(0, pos).split('\n');
    console.error(`Error at line ${lines.length}, column ${lines[lines.length - 1].length + 1}`);
    
    const start = Math.max(0, pos - 20);
    const end = Math.min(content.length, pos + 20);
    const context = content.substring(start, end);
    console.error('Context (around error):');
    console.error(context);
    
    console.error('Hex codes of context:');
    let hex = '';
    for (let i = 0; i < context.length; i++) {
      hex += context.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
    }
    console.error(hex);
  }
}
