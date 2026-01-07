#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ค้นหาเฉพาะปัญหาที่ user ระบุ
const SPECIFIC_SEARCHES = [
  {
    name: '฿฿ (บาทซ้ำ)',
    pattern: /฿{2,}/g,
    files: ['**/*.{tsx,ts,jsx,js}']
  },
  {
    name: 'คำว่าซ้ำ (ว่าว่า)',
    pattern: /ว่า\s+ว่า/g,
    files: ['**/*.{tsx,ts,jsx,js}']
  },
  {
    name: 'คำทำซ้ำ (ทำทำ)',
    pattern: /ทำ\s+ทำ/g,
    files: ['**/*.{tsx,ts,jsx,js}']
  },
  {
    name: 'คำได้ซ้ำ (ได้ได้)',
    pattern: /ได้\s+ได้/g,
    files: ['**/*.{tsx,ts,jsx,js}']
  },
  {
    name: 'ช่องว่างเกิน',
    pattern: / {3,}/g,
    files: ['**/*.{tsx,ts,jsx,js}']
  },
  {
    name: 'จุดทศนิยมผิด',
    pattern: /\d+\.\d+\./g,
    files: ['**/*.{tsx,ts,jsx,js}']
  },
  {
    name: 'คอมม่าผิด',
    pattern: /,,+/g,
    files: ['**/*.{tsx,ts,jsx,js}']
  }
];

function searchInFiles(search) {
  const files = glob.sync(search.files[0], { cwd: process.cwd() });
  const results = [];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(search.pattern);
      
      if (matches) {
        // หาบรรทัดที่เจอ
        const lines = content.split('\n');
        const lineNumbers = [];
        
        lines.forEach((line, index) => {
          if (search.pattern.test(line)) {
            lineNumbers.push(index + 1);
          }
        });
        
        results.push({
          file,
          matches: matches.slice(0, 3), // แสดงแค่ 3 อัน
          count: matches.length,
          lines: lineNumbers.slice(0, 5)
        });
      }
    } catch (error) {
      // ข้ามไฟล์ที่อ่านไม่ได้
    }
  });
  
  return results;
}

function main() {
  console.log('🔍 ค้นหาข้อผิดพลาดเฉพาะจุด...\n');
  
  SPECIFIC_SEARCHES.forEach(search => {
    console.log(`\n🔎 ค้นหา: ${search.name}`);
    const results = searchInFiles(search);
    
    if (results.length === 0) {
      console.log('   ✅ ไม่พบ');
    } else {
      console.log(`   ❌ พบ ${results.length} ไฟล์`);
      
      results.forEach(result => {
        console.log(`\n   📄 ${result.file}`);
        console.log(`      - จำนวน: ${result.count} จุด`);
        console.log(`      - บรรทัด: ${result.lines.join(', ')}`);
        
        result.matches.forEach((match, i) => {
          if (i < 2) console.log(`      - "${match}"`);
        });
      });
    }
  });
  
  console.log('\n💡 วิธีแก้ไข:');
  console.log('1. ใช้ VS Code: Ctrl+Shift+F ค้นหา');
  console.log('2. ใช้ VS Code: Ctrl+H แทนที่');
  console.log('3. รัน: node scripts/fix-common-errors.js');
}

main();
