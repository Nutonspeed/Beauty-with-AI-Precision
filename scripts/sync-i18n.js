const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(process.cwd(), 'i18n', 'messages');
const SOURCE_LANG = 'en';
const TARGET_LANGS = ['th', 'zh'];

function deepMerge(source, target) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(source[key], result[key] || {});
      } else if (!result.hasOwnProperty(key)) {
        result[key] = source[key];
      }
    }
  }
  return result;
}

function sync() {
  const sourcePath = path.join(MESSAGES_DIR, `${SOURCE_LANG}.json`);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    return;
  }

  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  TARGET_LANGS.forEach(lang => {
    const targetPath = path.join(MESSAGES_DIR, `${lang}.json`);
    let targetData = {};
    
    if (fs.existsSync(targetPath)) {
      try {
        targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch (e) {
        console.error(`Error parsing ${targetPath}:`, e.message);
      }
    }

    const mergedData = deepMerge(sourceData, targetData);
    
    // Sort keys alphabetically for consistency
    const sortedData = {};
    Object.keys(mergedData).sort().forEach(key => {
      sortedData[key] = mergedData[key];
    });

    fs.writeFileSync(targetPath, JSON.stringify(sortedData, null, 2), 'utf8');
    console.log(`Synced ${lang}.json with ${SOURCE_LANG}.json`);
  });
}

sync();
