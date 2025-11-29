#!/usr/bin/env node

/**
 * Website Analysis Script
 * ใช้ Node.js + Puppeteer ในการวิเคราะห์เว็บไซต์แบบลึกๆ
 * ตรวจสอบ CSS animations, JavaScript libraries, และ performance
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';

const ANALYSIS_URL = 'https://madarplatform.com/en';

async function analyzeWebsite() {
  console.log('🔍 Starting deep analysis of Madar Platform...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. เปิดเว็บและรอให้โหลดเสร็จ
    console.log('📡 Loading website...');
    await page.goto(ANALYSIS_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 2. วิเคราะห์ JavaScript Libraries
    console.log('📚 Analyzing JavaScript libraries...');
    const jsLibraries = await page.evaluate(() => {
      const libraries = [];
      
      // Check global objects
      const globalChecks = {
        'jQuery': () => typeof window.jQuery !== 'undefined',
        'React': () => typeof window.React !== 'undefined',
        'Vue': () => typeof window.Vue !== 'undefined',
        'Angular': () => typeof window.angular !== 'undefined',
        'GSAP': () => typeof window.gsap !== 'undefined',
        'Framer Motion': () => typeof window.framerMotion !== 'undefined',
        'Three.js': () => typeof window.THREE !== 'undefined',
        'AOS': () => typeof window.AOS !== 'undefined',
        'ScrollMagic': () => typeof window.ScrollMagic !== 'undefined',
        'Velocity': () => typeof window.Velocity !== 'undefined',
        'Anime.js': () => typeof window.anime !== 'undefined',
        'Lottie': () => typeof window.lottie !== 'undefined',
        'Swiper': () => typeof window.Swiper !== 'undefined',
        'AOS': () => typeof window.AOS !== 'undefined',
        'WOW': () => typeof window.WOW !== 'undefined'
      };

      for (const [name, check] of Object.entries(globalChecks)) {
        if (check()) {
          libraries.push(name);
        }
      }

      // Check script tags
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      scripts.forEach(script => {
        const src = script.src;
        if (src.includes('cdn') || src.includes('npm') || src.includes('unpkg')) {
          libraries.push(`External: ${src}`);
        }
      });

      return libraries;
    });

    // 3. วิเคราะห์ CSS Frameworks
    console.log('🎨 Analyzing CSS frameworks...');
    const cssFrameworks = await page.evaluate(() => {
      const frameworks = [];
      
      // Check for common CSS classes
      const bodyClasses = document.body.className;
      const htmlClasses = document.documentElement.className;
      
      const frameworkChecks = {
        'Tailwind CSS': () => bodyClasses.includes('tw-') || htmlClasses.includes('tw-'),
        'Bootstrap': () => bodyClasses.includes('container') || bodyClasses.includes('row'),
        'Bulma': () => bodyClasses.includes('column') || bodyClasses.includes('is-'),
        'Foundation': () => bodyClasses.includes('grid-x') || bodyClasses.includes('cell'),
        'Materialize': () => bodyClasses.includes('materialize') || bodyClasses.includes('col'),
        'Semantic UI': () => bodyClasses.includes('ui') || bodyClasses.includes('segment'),
        'Ant Design': () => bodyClasses.includes('ant-') || bodyClasses.includes('antd'),
        'Chakra UI': () => bodyClasses.includes('chakra-'),
        'MUI': () => bodyClasses.includes('Mui') || bodyClasses.includes('material-ui')
      };

      for (const [name, check] of Object.entries(frameworkChecks)) {
        if (check()) {
          frameworks.push(name);
        }
      }

      // Check link tags
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      links.forEach(link => {
        const href = link.href;
        if (href.includes('tailwind') || href.includes('bootstrap') || href.includes('bulma')) {
          frameworks.push(`External CSS: ${href}`);
        }
      });

      return frameworks;
    });

    // 4. วิเคราะห์ CSS Animations
    console.log('✨ Analyzing CSS animations...');
    const animations = await page.evaluate(() => {
      const animationData = {
        keyframes: [],
        animatedElements: [],
        transforms: [],
        gradients: []
      };

      // Get all stylesheets
      const styleSheets = Array.from(document.styleSheets);
      
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          rules.forEach(rule => {
            // Find keyframe animations
            if (rule.type === CSSRule.KEYFRAMES_RULE) {
              animationData.keyframes.push({
                name: rule.name,
                css: rule.cssText
              });
            }
          });
        } catch (e) {
          // Cross-origin stylesheets may throw errors
        }
      });

      // Find animated elements
      document.querySelectorAll('*').forEach(el => {
        const style = getComputedStyle(el);
        
        if (style.animation !== 'none') {
          animationData.animatedElements.push({
            element: el.tagName,
            animation: style.animation,
            classes: el.className
          });
        }
        
        if (style.transform !== 'none') {
          animationData.transforms.push({
            element: el.tagName,
            transform: style.transform,
            classes: el.className
          });
        }

        if (style.backgroundImage && style.backgroundImage.includes('gradient')) {
          animationData.gradients.push({
            element: el.tagName,
            background: style.backgroundImage,
            classes: el.className
          });
        }
      });

      return animationData;
    });

    // 5. วิเคราะห์ Performance
    console.log('⚡ Analyzing performance...');
    const performance = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Get performance metrics
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        resolve({
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          resourceCount: performance.getEntriesByType('resource').length
        });
      });
    });

    // 6. ดู HTML Structure
    console.log('🏗️ Analyzing HTML structure...');
    const htmlStructure = await page.evaluate(() => {
      return {
        doctype: document.doctype?.name,
        htmlLang: document.documentElement.lang,
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content,
        metaViewport: document.querySelector('meta[name="viewport"]')?.content,
        bodyClasses: document.body.className,
        mainSections: document.querySelectorAll('main, section').length,
        headingStructure: {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length
        }
      };
    });

    // 7. สร้างรายงาน
    const report = {
      url: ANALYSIS_URL,
      timestamp: new Date().toISOString(),
      analysis: {
        javascriptLibraries: jsLibraries,
        cssFrameworks: cssFrameworks,
        animations: animations,
        performance: performance,
        htmlStructure: htmlStructure
      }
    };

    // บันทึกรายงาน
    await fs.writeFile('./madar-analysis-report.json', JSON.stringify(report, null, 2));
    
    // แสดงสรุป
    console.log('\n📊 ANALYSIS REPORT:');
    console.log('='.repeat(50));
    console.log('📚 JavaScript Libraries:', jsLibraries.length);
    jsLibraries.forEach(lib => console.log(`   - ${lib}`));
    
    console.log('\n🎨 CSS Frameworks:', cssFrameworks.length);
    cssFrameworks.forEach(fw => console.log(`   - ${fw}`));
    
    console.log('\n✨ Animations Found:');
    console.log(`   - Keyframes: ${animations.keyframes.length}`);
    console.log(`   - Animated Elements: ${animations.animatedElements.length}`);
    console.log(`   - Transforms: ${animations.transforms.length}`);
    console.log(`   - Gradients: ${animations.gradients.length}`);
    
    console.log('\n⚡ Performance:');
    console.log(`   - Load Time: ${performance.loadTime}ms`);
    console.log(`   - First Contentful Paint: ${performance.firstContentfulPaint}ms`);
    
    console.log('\n🏗️ HTML Structure:');
    console.log(`   - Title: ${htmlStructure.title}`);
    console.log(`   - Main Sections: ${htmlStructure.mainSections}`);
    console.log(`   - H1: ${htmlStructure.headingStructure.h1}, H2: ${htmlStructure.headingStructure.h2}`);
    
    console.log('\n💾 Full report saved to: madar-analysis-report.json');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run analysis
analyzeWebsite().catch(console.error);
