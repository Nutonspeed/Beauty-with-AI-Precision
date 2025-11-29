# 🔍 คู่มือ Reverse-Engineer เว็บไซต์แบบลึกๆ
## วิเคราะห์ Madar Platform (https://madarplatform.com/en)

### 📋 ขั้นตอนที่ 1: Browser DevTools Analysis

#### 1.1 Elements Tab - CSS Inspection
```
1. Right-click → Inspect Element
2. Hover บน elements ดู CSS rules
3. Check:
   - Transforms: transform, perspective, rotate3d
   - Animations: @keyframes, animation properties
   - Gradients: background-gradient, linear-gradient
   - Effects: backdrop-filter, mix-blend-mode, filter
```

#### 1.2 Network Tab - Library Detection
```
1. F12 → Network tab
2. Refresh page (Ctrl+R)
3. Filter ดู:
   - JS files: ดู animation libraries (GSAP, Framer Motion, etc.)
   - CSS files: ดู framework (Tailwind, Bootstrap, custom)
   - Fonts: ดู typography system
   - Images: ดู optimization techniques
```

#### 1.3 Performance Tab - Animation Analysis
```
1. Performance tab → Record
2. Interact with page (scroll, hover, click)
3. Stop recording แล้วดู:
   - FPS rates during animations
   - Main thread activity
   - Paint & Composite layers
```

### 📋 ขั้นตอนที่ 2: Source Code Analysis

#### 2.1 View Page Source
```
1. Ctrl+U (View Source)
2. Check สิ่งเหล่านี้:
   - <meta name="generator"> - Framework detection
   - Script tags - External libraries
   - CSS links - Styling frameworks
   - JSON-LD - Structured data
```

#### 2.2 Console Commands
```javascript
// ดู global variables
Object.keys(window).filter(key => key.includes('react') || key.includes('vue'))

// ดู CSS animations
getComputedStyle(document.querySelector('.hero-element')).animation

// ดู loaded libraries
performance.getEntriesByType('resource').filter(r => r.name.includes('.js'))
```

### 📋 ขั้นตอนที่ 3: Online Tools

#### 3.1 BuiltWith & Wappalyzer
```
1. https://builtwith.com/madarplatform.com
2. https://www.wappalyzer.com/
3. ติดตั้ง Wappalyzer browser extension
```

#### 3.2 Lighthouse Analysis
```
1. DevTools → Lighthouse
2. Run analysis
3. Check:
   - Performance scores
   - Accessibility
   - Best practices
   - SEO
```

### 📋 ขั้นตอนที่ 4: Specific Animation Analysis

#### 4.1 CSS Animation Detection
```javascript
// หาทุก animation บน page
document.querySelectorAll('*').forEach(el => {
  const style = getComputedStyle(el);
  if (style.animation !== 'none') {
    console.log(el, style.animation);
  }
});

// หาทุก transform
document.querySelectorAll('*').forEach(el => {
  const style = getComputedStyle(el);
  if (style.transform !== 'none') {
    console.log(el, style.transform);
  }
});
```

#### 4.2 JavaScript Library Detection
```javascript
// ดูว่าใช้ animation library ไหน
if (window.gsap) console.log('GSAP detected');
if (window.FramerMotion) console.log('Framer Motion detected');
if (window.TweenMax) console.log('TweenMax detected');
```

### 📋 ขั้นตอนที่ 5: Mobile Analysis

#### 5.1 Responsive Testing
```
1. DevTools → Toggle device toolbar
2. Test ที่ขนาดต่างๆ:
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1920x1080)
3. Check:
   - Layout shifts
   - Touch interactions
   - Performance on mobile
```

### 🎯 สิ่งที่ต้องโฟกัสจาก Madar:

1. **Hero Section Animations**
   - Parallax scrolling effects
   - Floating blob animations
   - Text reveal animations

2. **Card Hover Effects**
   - 3D transforms
   - Perspective changes
   - Smooth transitions

3. **Background Effects**
   - Gradient animations
   - Particle systems
   - Blend modes

4. **Performance Optimizations**
   - GPU acceleration
   - Lazy loading
   - Code splitting

### 🚀 การนำไปใช้กับ Beauty Platform:

1. **เลือก effects ที่เหมาะกับ clinic**
2. **ทดสอบ performance บน mobile**
3. **เคารพ accessibility**
4. **ไม่ทำให้ user experience แย่ลง**

### ⚡ Quick Tips:

- **Right-click → Inspect** เป็นเครื่องมือแรกที่ต้องใช้
- **Network tab** บอกทุก library ที่โหลด
- **Performance tab** บอกว่า animations ทำงานเร็วแค่ไหน
- **Console** สามารถ run JavaScript ตรวจสอบ libraries
- **Mobile testing** สำคัญมากสำหรับ clinic platform
