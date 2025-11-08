/**
 * Wait for dev server to be ready before running tests
 */

async function waitForServer(url: string, timeout = 30000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  
  console.error('\n❌ Server did not start within timeout');
  return false;
}

console.log('⏳ Waiting for server at http://localhost:3000...');
waitForServer('http://localhost:3000').then(ready => {
  process.exit(ready ? 0 : 1);
});
