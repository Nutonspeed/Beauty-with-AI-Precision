// Quick Website Inspection - Paste this in browser console on Madar platform
// Open https://madarplatform.com/en → F12 → Console → Paste this script

console.log('🔍 MADAR PLATFORM INSPECTION STARTED');
console.log('='.repeat(50));

// 1. Check JavaScript Libraries
console.log('\n📚 JAVASCRIPT LIBRARIES:');
const libraries = {
  'jQuery': typeof window.jQuery !== 'undefined',
  'React': typeof window.React !== 'undefined',
  'Vue': typeof window.Vue !== 'undefined',
  'Angular': typeof window.angular !== 'undefined',
  'GSAP': typeof window.gsap !== 'undefined',
  'Framer Motion': typeof window.framerMotion !== 'undefined',
  'Three.js': typeof window.THREE !== 'undefined',
  'AOS': typeof window.AOS !== 'undefined',
  'ScrollMagic': typeof window.ScrollMagic !== 'undefined',
  'Anime.js': typeof window.anime !== 'undefined',
  'Lottie': typeof window.lottie !== 'undefined',
  'Swiper': typeof window.Swiper !== 'undefined',
  'WOW': typeof window.WOW !== 'undefined'
};

Object.entries(libraries).forEach(([name, detected]) => {
  if (detected) console.log(`✅ ${name}`);
});

// 2. Check CSS Frameworks
console.log('\n🎨 CSS FRAMEWORKS:');
const bodyClasses = document.body.className;
const frameworkChecks = {
  'Tailwind CSS': bodyClasses.includes('tw-') || bodyClasses.includes('bg-'),
  'Bootstrap': bodyClasses.includes('container') || bodyClasses.includes('row'),
  'Bulma': bodyClasses.includes('column') || bodyClasses.includes('is-'),
  'Foundation': bodyClasses.includes('grid-x') || bodyClasses.includes('cell'),
  'Materialize': bodyClasses.includes('materialize'),
  'Semantic UI': bodyClasses.includes('ui') || bodyClasses.includes('segment'),
  'Ant Design': bodyClasses.includes('ant-'),
  'Chakra UI': bodyClasses.includes('chakra-'),
  'MUI': bodyClasses.includes('Mui')
};

Object.entries(frameworkChecks).forEach(([name, detected]) => {
  if (detected) console.log(`✅ ${name}`);
});

// 3. Find Animations
console.log('\n✨ CSS ANIMATIONS:');
const animatedElements = [];
const transforms = [];
const gradients = [];

document.querySelectorAll('*').forEach(el => {
  const style = getComputedStyle(el);
  
  if (style.animation !== 'none') {
    animatedElements.push({
      element: el.tagName,
      classes: el.className,
      animation: style.animation
    });
  }
  
  if (style.transform !== 'none') {
    transforms.push({
      element: el.tagName,
      classes: el.className,
      transform: style.transform
    });
  }

  if (style.backgroundImage && style.backgroundImage.includes('gradient')) {
    gradients.push({
      element: el.tagName,
      classes: el.className,
      gradient: style.backgroundImage
    });
  }
});

console.log(`Animated Elements: ${animatedElements.length}`);
animatedElements.slice(0, 5).forEach(el => {
  console.log(`  - ${el.element}.${el.classes}: ${el.animation}`);
});

console.log(`\nTransform Elements: ${transforms.length}`);
transforms.slice(0, 5).forEach(el => {
  console.log(`  - ${el.element}.${el.classes}: ${el.transform}`);
});

console.log(`\nGradient Elements: ${gradients.length}`);
gradients.slice(0, 3).forEach(el => {
  console.log(`  - ${el.element}.${el.classes}: ${el.gradient}`);
});

// 4. Check External Resources
console.log('\n📦 EXTERNAL RESOURCES:');
const scripts = Array.from(document.querySelectorAll('script[src]'));
const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

console.log(`Scripts: ${scripts.length}`);
scripts.slice(0, 5).forEach(script => {
  console.log(`  - ${script.src}`);
});

console.log(`\nStylesheets: ${stylesheets.length}`);
stylesheets.slice(0, 5).forEach(sheet => {
  console.log(`  - ${sheet.href}`);
});

// 5. Performance Check
console.log('\n⚡ PERFORMANCE:');
const navigation = performance.getEntriesByType('navigation')[0];
const paint = performance.getEntriesByType('paint');

console.log(`Load Time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
console.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
console.log(`First Paint: ${paint.find(p => p.name === 'first-paint')?.startTime}ms`);
console.log(`First Contentful Paint: ${paint.find(p => p.name === 'first-contentful-paint')?.startTime}ms`);

// 6. Find Most Impressive Elements
console.log('\n🎯 MOST IMPRESSIVE ELEMENTS:');

// Find hero section
const hero = document.querySelector('h1, .hero, .hero-section, main > section:first-child');
if (hero) {
  const heroStyle = getComputedStyle(hero);
  console.log('Hero Section:');
  console.log(`  - Font Size: ${heroStyle.fontSize}`);
  console.log(`  - Transform: ${heroStyle.transform}`);
  console.log(`  - Animation: ${heroStyle.animation}`);
  console.log(`  - Background: ${heroStyle.background}`);
}

// Find cards with hover effects
const cards = document.querySelectorAll('.card, .feature-card, [class*="card"]');
console.log(`\nCards with hover effects: ${cards.length}`);
Array.from(cards).slice(0, 3).forEach(card => {
  const cardStyle = getComputedStyle(card);
  console.log(`  - ${card.className}: ${cardStyle.transition}`);
});

// Find background effects
const backgrounds = document.querySelectorAll('[class*="bg"], [class*="background"]');
console.log(`\nBackground Effects: ${backgrounds.length}`);
Array.from(backgrounds).slice(0, 3).forEach(bg => {
  const bgStyle = getComputedStyle(bg);
  if (bgStyle.backgroundImage !== 'none') {
    console.log(`  - ${bg.className}: ${bgStyle.backgroundImage}`);
  }
});

console.log('\n🎉 INSPECTION COMPLETE!');
console.log('💡 Now you know exactly what Madar uses!');
