#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// รายการการแก้ไขอัตโนมัติ
const FIXES = [
  // แก้สัญลักษณ์ซ้ำ
  { 
    find: /฿{2,}/g, 
    replace: '฿', 
    desc: 'แก้ ฿฿ -> ฿' 
  },
  { 
    find: /\${2,}/g, 
    replace: '$', 
    desc: 'แก้ $$ -> $' 
  },
  { 
    find: /%{2,}/g, 
    replace: '%', 
    desc: 'แก้ %% -> %' 
  },
  { 
    find: /#{2,}/g, 
    replace: '#', 
    desc: 'แก้ ## -> #' 
  },
  { 
    find: /\*{3,}/g, 
    replace: '**', 
    desc: 'แก้ *** -> **' 
  },
  { 
    find: /!{2,}/g, 
    replace: '!', 
    desc: 'แก้ !! -> !' 
  },
  { 
    find: /\?{2,}/g, 
    replace: '?', 
    desc: 'แก้ ?? -> ?' 
  },
  
  // แก้คำซ้ำ (กรณีที่ปลอดภัย)
  { 
    find: /\b(ว่า|ทำ|ได้|มี|จะ|ไป|มา|ให้|ได้รับ|ต้อง|สามารถ|ควร|เพื่อ|ซึ่ง|แล้ว|อย่าง|อีก|ต่าง|ทั้ง|เอง|ลง|เข้า|ออก|ขึ้น|ลงมา|ไปหา|มาหา)\s+\1\b/g, 
    replace: '$1', 
    desc: 'ลบคำซ้ำ' 
  },
  
  // แก้ spacing
  { 
    find: /\s{3,}/g, 
    replace: ' ', 
    desc: 'ลบช่องว่างเกิน' 
  },
  { 
    find: /\s+$/gm, 
    replace: '', 
    desc: 'ลบช่องว่างท้ายบรรทัด' 
  },
  { 
    find: /^\s*\n\s*\n\s*\n/gm, 
    replace: '\n\n', 
    desc: 'ลบบรรทัดว่างซ้ำ' 
  }
];

// ฟังก์ชันค้นหาไฟล์
function findFiles() {
  const patterns = [
    'app/**/*.{tsx,ts,jsx,js}',
    'components/**/*.{tsx,ts,jsx,js}',
    'pages/**/*.{tsx,ts,jsx,js}',
    'lib/**/*.{tsx,ts,jsx,js}',
    'hooks/**/*.{tsx,ts,jsx,js}',
    'utils/**/*.{tsx,ts,jsx,js}'
  ];
  
  const files = [];
  patterns.forEach(pattern => {
    const found = glob.sync(pattern, { cwd: process.cwd() });
    files.push(...found);
  });
  
  return [...new Set(files)];
}

// ฟังก์ชันสำรองไฟล์
function backupFile(filePath) {
  const backupPath = filePath + '.backup';
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// ฟังก์ชันแก้ไขไฟล์
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  const appliedFixes = [];
  
  FIXES.forEach(({ find, replace, desc }) => {
    const matches = content.match(find);
    if (matches) {
      content = content.replace(find, replace);
      appliedFixes.push({ desc, count: matches.length });
    }
  });
  
  if (content !== originalContent) {
    // สำรองไฟล์ก่อนแก้
    backupFile(filePath);
    // เขียนทับ
    fs.writeFileSync(filePath, content, 'utf8');
    return appliedFixes;
  }
  
  return [];
}

// ฟังก์ชันหลัก
function main() {
  console.log('🔧 เริ่มแก้ไขข้อผิดพลาดอัตโนมัติ...\n');
  
  const files = findFiles();
  console.log(`📁 พบไฟล์ทั้งหมด: ${files.length} ไฟล์\n`);
  
  let totalFixed = 0;
  const fixedFiles = [];
  
  files.forEach(file => {
    const fixes = fixFile(file);
    if (fixes.length > 0) {
      const fileTotal = fixes.reduce((sum, f) => sum + f.count, 0);
      totalFixed += fileTotal;
      fixedFiles.push({ file, fixes, total: fileTotal });
    }
  });
  
  // แสดงผล
  if (fixedFiles.length === 0) {
    console.log('✅ ไม่มีอะไรต้องแก้ไข!');
  } else {
    console.log(`✅ แก้ไขแล้ว: ${fixedFiles.length} ไฟล์, ${totalFixed} จุด\n`);
    
    fixedFiles.forEach(({ file, fixes, total }) => {
      console.log(`📄 ${file} (${total} จุด)`);
      fixes.forEach(fix => {
        console.log(`   ✓ ${fix.desc}: ${fix.count} จุด`);
      });
    });
    
    console.log('\n💡 ข้อควรรู้:');
    console.log('- สำรองไฟล์ไว้ที่ .backup');
    console.log('- ตรวจสอบผลลัพธ์หลังแก้ไข');
    console.log('- ลบ .backup หลังจากตรวจสอบแล้ว');
  }
}

// Run ถ้าพิมพ์ node fix-common-errors.js
if (require.main === module) {
  main();
}

module.exports = { fixFile, backupFile };
