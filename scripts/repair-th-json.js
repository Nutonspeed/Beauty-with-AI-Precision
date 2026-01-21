const fs = require('fs');
const path = require('path');

const filePath = 'D:/127995803/Beauty-with-AI-Precision/i18n/messages/th.json';
const content = fs.readFileSync(filePath, 'utf8');

// The file has duplicate top-level keys. JSON.parse will only take the last one.
// We want to merge them or ensure the correct one is used.
// A safe way is to regex split by top-level keys and merge objects.

function safeParse() {
  try {
    // Attempt to fix some obvious syntax errors before parsing
    let fixedContent = content
      .replace(/}\s*\"lastVisit\"/g, '}, \"lastVisit\"') // Fix dangling keys
      .replace(/\"parameterHeading\": \"พารามิเตอร์\"\s*}\s*}/g, '\"parameterHeading\": \"พารามิเตอร์\" } }');
    
    // Roles mojibake fix
    const rolesFixed = {
      "super_admin": "ผู้ดูแลระบบสูงสุด",
      "admin": "ผู้ดูแลระบบ",
      "center_admin": "ผู้ดูแลศูนย์",
      "center_owner": "เจ้าของศูนย์",
      "center_staff": "เจ้าหน้าที่ศูนย์",
      "sales_staff": "เจ้าหน้าที่ฝ่ายขาย",
      "customer": "ลูกค้า"
    };

    // Use a custom parser to handle duplicates by merging
    const lines = content.split('\n');
    const result = {};
    let currentKey = null;
    let buffer = '';
    let braceCount = 0;

    // This is complex. Let's try a simpler approach: 
    // Use regex to find all top level objects and merge them.
    const topLevelRegex = /^  \"([^\"]+)\": \{/gm;
    const segments = [];
    let match;
    let lastIndex = 0;

    const keys = [];
    while ((match = topLevelRegex.exec(content)) !== null) {
      keys.push({ key: match[1], index: match.index });
    }

    for (let i = 0; i < keys.length; i++) {
      const start = keys[i].index;
      const end = (i + 1 < keys.length) ? keys[i + 1].index : content.lastIndexOf('}') + 1;
      const segmentStr = '{' + content.substring(start, end).trim().replace(/,$/, '') + '}';
      try {
        const obj = JSON.parse(segmentStr);
        const key = Object.keys(obj)[0];
        if (!result[key]) {
          result[key] = obj[key];
        } else {
          // Merge
          result[key] = { ...result[key], ...obj[key] };
        }
      } catch (e) {
        console.error(`Failed to parse segment ${keys[i].key}:`, e.message);
        // Try to fix braces in segment
        try {
           let fixedSegment = segmentStr;
           if ((fixedSegment.match(/{/g) || []).length > (fixedSegment.match(/}/g) || []).length) {
             fixedSegment += '}'.repeat((fixedSegment.match(/{/g) || []).length - (fixedSegment.match(/}/g) || []).length);
           }
           const obj = JSON.parse(fixedSegment);
           const key = Object.keys(obj)[0];
           if (!result[key]) {
             result[key] = obj[key];
           } else {
             result[key] = { ...result[key], ...obj[key] };
           }
        } catch (e2) {
           console.error(`Gave up on segment ${keys[i].key}`);
        }
      }
    }

    // Force fix roles
    result.roles = rolesFixed;

    // Ensure home namespace is what we expect for the homepage
    if (result.home) {
      // Ensure specific keys exist or are merged
      if (result.roi && !result.home.roi) result.home.roi = result.roi;
      if (result.solutions && !result.home.solutions) result.home.solutions = result.solutions;
      if (result.deployment && !result.home.deployment) result.home.deployment = result.deployment;
    }

    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
    console.log('Successfully repaired th.json');
  } catch (err) {
    console.error('Repair failed:', err.message);
  }
}

safeParse();
