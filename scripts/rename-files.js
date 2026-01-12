const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'lib', 'hooks', 'types'];
const searchTerms = ['clinic', 'patient', 'treatment', 'cliniciq'];

function getRenames(dir, renames = []) {
  if (dir.includes('node_modules') || dir.includes('.next')) return renames;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    
    let newName = file;
    newName = newName.replace(/ClinicIQ/g, 'CenterIQ');
    newName = newName.replace(/cliniciq/g, 'centeriq');
    newName = newName.replace(/Clinic/g, 'Center');
    newName = newName.replace(/clinic/g, 'center');
    newName = newName.replace(/Patient/g, 'Client');
    newName = newName.replace(/patient/g, 'client');
    newName = newName.replace(/Treatment/g, 'Program');
    newName = newName.replace(/treatment/g, 'program');
    
    if (newName !== file) {
      renames.push({
        oldPath: fullPath,
        newPath: path.join(dir, newName),
        isDirectory
      });
    }
    
    if (isDirectory) {
      getRenames(fullPath, renames);
    }
  }
  return renames;
}

const allRenames = [];
targetDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    getRenames(fullPath, allRenames);
  }
});

// Sort by depth (deepest first) to avoid path issues when renaming directories
allRenames.sort((a, b) => b.oldPath.split(path.sep).length - a.oldPath.split(path.sep).length);

allRenames.forEach(rename => {
  try {
    if (fs.existsSync(rename.oldPath)) {
      fs.renameSync(rename.oldPath, rename.newPath);
      console.log(`Renamed: ${rename.oldPath} -> ${rename.newPath}`);
    }
  } catch (err) {
    console.error(`Error renaming ${rename.oldPath}: ${err.message}`);
  }
});
