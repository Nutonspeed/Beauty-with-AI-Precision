const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /ClinicIQ/g, to: 'CenterIQ' },
  { from: /Cliniciq/g, to: 'Centeriq' },
  { from: /Clinic/g, to: 'Center' },
  { from: /clinic/g, to: 'center' },
  { from: /Patient/g, to: 'Client' },
  { from: /patient/g, to: 'client' },
  { from: /Treatment/g, to: 'Program' },
  { from: /treatment/g, to: 'program' }
];

function walkDir(dir, callback) {
  if (dir.includes('node_modules') || dir.includes('.next')) return;
  
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const targetDirs = ['app', 'components', 'lib', 'hooks', 'types'];

targetDirs.forEach(targetDir => {
  const fullPath = path.join(process.cwd(), targetDir);
  if (fs.existsSync(fullPath)) {
    walkDir(fullPath, (filePath) => {
      if (!targetExtensions.includes(path.extname(filePath))) return;
      
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        for (const replacement of replacements) {
          content = content.replace(replacement.from, replacement.to);
        }
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated: ${filePath}`);
        }
      } catch (err) {
        console.error(`Error processing ${filePath}: ${err.message}`);
      }
    });
  }
});
