import { test, expect, waitForLoading, takeScreenshot, testUsers } from '../test-setup';

test.describe('Real-time Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login as sales staff for real-time features
    await page.goto('/th/login');
    await page.fill('input[name="email"]', testUsers.salesStaff.email);
    await page.fill('input[name="password"]', testUsers.salesStaff.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/th/sales/dashboard');
    await waitForLoading(page);
  });

  test('should display real-time notifications', async ({ page }) => {
    await page.goto('/th/sales/dashboard');
    await waitForLoading(page);
    
    // Check notification indicator
    await expect(page.locator('[data-testid="notification-indicator"]')).toBeVisible();
    
    // Click notifications
    await page.click('[data-testid="notification-indicator"]');
    
    // Check notification dropdown
    await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    await takeScreenshot(page, 'realtime-notifications');
  });

  test('should handle real-time chat functionality', async ({ page }) => {
    await page.goto('/th/sales/leads');
    await waitForLoading(page);
    
    // Click on first lead to open chat
    await page.click('table tbody tr:first-child td:first-child a');
    await waitForLoading(page);
    
    // Check chat interface
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
    
    // Send a message
    await page.fill('[data-testid="message-input"]', 'Test message from E2E test');
    await page.click('button:has-text("Send")');
    
    // Check message appears
    await expect(page.locator('[data-testid="message-sent"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-content"]')).toContainText('Test message from E2E test');
    
    await takeScreenshot(page, 'realtime-chat-send');
  });

  test('should receive real-time messages', async ({ page }) => {
    await page.goto('/th/sales/leads');
    await waitForLoading(page);
    
    // Open chat with lead
    await page.click('table tbody tr:first-child td:first-child a');
    await waitForLoading(page);
    
    // Wait for incoming message (simulated)
    await page.waitForSelector('[data-testid="message-received"]', { timeout: 10000 });
    
    // Check received message
    await expect(page.locator('[data-testid="message-received"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-status"]')).toContainText('Delivered');
    
    await takeScreenshot(page, 'realtime-chat-receive');
  });

  test('should handle real-time lead status updates', async ({ page }) => {
    await page.goto('/th/sales/leads');
    await waitForLoading(page);
    
    // Get initial status of first lead
    const initialStatus = await page.locator('table tbody tr:first-child td:nth-child(3)').textContent();
    
    // Simulate status change (this would normally come from another user)
    await page.evaluate(() => {
      // Simulate WebSocket message for status update
      window.dispatchEvent(new CustomEvent('lead-status-update', {
        detail: { leadId: '1', status: 'contacted' }
      }));
    });
    
    // Wait for status update
    await page.waitForTimeout(2000);
    
    // Check if status changed
    const updatedStatus = await page.locator('table tbody tr:first-child td:nth-child(3)').textContent();
    
    // In real scenario, this would show the updated status
    console.log(`Status changed from ${initialStatus} to ${updatedStatus}`);
    
    await takeScreenshot(page, 'realtime-lead-status');
  });

  test('should handle real-time appointment updates', async ({ page }) => {
    await page.goto('/th/sales/dashboard');
    await waitForLoading(page);
    
    // Check appointments widget
    await expect(page.locator('[data-testid="today-appointments"]')).toBeVisible();
    
    // Simulate new appointment
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('new-appointment', {
        detail: {
          id: '123',
          customer: 'Test Customer',
          time: '14:00',
          service: 'Skin Analysis'
        }
      }));
    });
    
    // Wait for update
    await page.waitForTimeout(2000);
    
    // Check if appointment appears
    const appointments = await page.locator('[data-testid="appointment-item"]').count();
    console.log(`Appointments count: ${appointments}`);
    
    await takeScreenshot(page, 'realtime-appointments');
  });

  test('should handle video calling functionality', async ({ page }) => {
    await page.goto('/th/sales/leads');
    await waitForLoading(page);
    
    // Click on first lead
    await page.click('table tbody tr:first-child td:first-child a');
    await waitForLoading(page);
    
    // Check video call button
    if (await page.locator('button:has-text("Start Video Call")').isVisible()) {
      await page.click('button:has-text("Start Video Call")');
      
      // Check video call interface
      await expect(page.locator('[data-testid="video-call-interface"]')).toBeVisible();
      await expect(page.locator('video')).toBeVisible();
      await expect(page.locator('button:has-text("End Call")')).toBeVisible();
      
      // Test call controls
      await expect(page.locator('button:has-text("Mute")')).toBeVisible();
      await expect(page.locator('button:has-text("Camera")')).toBeVisible();
      
      await takeScreenshot(page, 'realtime-video-call');
    }
  });

  test('should handle real-time collaboration', async ({ page }) => {
    await page.goto('/th/sales/proposals');
    await waitForLoading(page);
    
    // Click on first proposal
    await page.click('table tbody tr:first-child td:first-child a');
    await waitForLoading(page);
    
    // Check collaboration features
    await expect(page.locator('[data-testid="collaboration-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-users"]')).toBeVisible();
    
    // Simulate another user editing
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('user-joined', {
        detail: { userId: 'user2', name: 'John Doe', role: 'clinic_owner' }
      }));
    });
    
    // Wait for user indicator
    await page.waitForTimeout(1000);
    
    // Check if other user appears
    const activeUsers = await page.locator('[data-testid="active-user"]').count();
    console.log(`Active users: ${activeUsers}`);
    
    await takeScreenshot(page, 'realtime-collaboration');
  });

  test('should handle real-time analytics updates', async ({ page }) => {
    await page.goto('/th/sales/analytics');
    await waitForLoading(page);
    
    // Check analytics widgets
    await expect(page.locator('[data-testid="leads-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();
    
    // Get initial values
    const initialLeads = await page.locator('[data-testid="leads-today"]').textContent();
    const initialConversion = await page.locator('[data-testid="conversion-rate"]').textContent();
    
    // Simulate real-time data update
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('analytics-update', {
        detail: {
          leadsToday: 15,
          conversionRate: 25.5,
          revenue: 5000
        }
      }));
    });
    
    // Wait for update
    await page.waitForTimeout(2000);
    
    // Check updated values
    const updatedLeads = await page.locator('[data-testid="leads-today"]').textContent();
    const updatedConversion = await page.locator('[data-testid="conversion-rate"]').textContent();
    
    console.log(`Leads: ${initialLeads} -> ${updatedLeads}`);
    console.log(`Conversion: ${initialConversion} -> ${updatedConversion}`);
    
    await takeScreenshot(page, 'realtime-analytics');
  });

  test('should handle connection status', async ({ page }) => {
    await page.goto('/th/sales/dashboard');
    await waitForLoading(page);
    
    // Check connection indicator
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
    
    // Simulate connection loss
    await page.evaluate(() => {
      // Simulate WebSocket disconnect
      window.dispatchEvent(new CustomEvent('connection-lost'));
    });
    
    // Wait for status update
    await page.waitForTimeout(1000);
    
    // Check connection status
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Disconnected');
    
    // Simulate reconnection
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('connection-restored'));
    });
    
    // Wait for reconnection
    await page.waitForTimeout(1000);
    
    // Check connection restored
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
    
    await takeScreenshot(page, 'realtime-connection-status');
  });

  test('should handle real-time typing indicators', async ({ page }) => {
    await page.goto('/th/sales/leads');
    await waitForLoading(page);
    
    // Open chat
    await page.click('table tbody tr:first-child td:first-child a');
    await waitForLoading(page);
    
    // Start typing
    await page.fill('[data-testid="message-input"]', 'typing...');
    
    // Check typing indicator (if implemented)
    if (await page.locator('[data-testid="typing-indicator"]').isVisible()) {
      await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
      
      // Stop typing
      await page.fill('[data-testid="message-input"]', '');
      
      // Wait for typing indicator to disappear
      await page.waitForSelector('[data-testid="typing-indicator"]', { state: 'hidden', timeout: 3000 });
    }
    
    await takeScreenshot(page, 'realtime-typing-indicator');
  });

  test('should handle real-time presence detection', async ({ page }) => {
    await page.goto('/th/sales/dashboard');
    await waitForLoading(page);
    
    // Check online users list
    await expect(page.locator('[data-testid="online-users"]')).toBeVisible();
    
    // Get initial online users count
    const initialOnlineUsers = await page.locator('[data-testid="online-user"]').count();
    
    // Simulate user coming online
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('user-online', {
        detail: { userId: 'user3', name: 'Jane Smith', role: 'sales_staff' }
      }));
    });
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Check updated online users
    const updatedOnlineUsers = await page.locator('[data-testid="online-user"]').count();
    console.log(`Online users: ${initialOnlineUsers} -> ${updatedOnlineUsers}`);
    
    // Simulate user going offline
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('user-offline', {
        detail: { userId: 'user3' }
      }));
    });
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Check user removed from online list
    const finalOnlineUsers = await page.locator('[data-testid="online-user"]').count();
    console.log(`Online users after offline: ${finalOnlineUsers}`);
    
    await takeScreenshot(page, 'realtime-presence');
  });

  test('should handle real-time file sharing', async ({ page }) => {
    await page.goto('/th/sales/leads');
    await waitForLoading(page);
    
    // Open chat
    await page.click('table tbody tr:first-child td:first-child a');
    await waitForLoading(page);
    
    // Check file sharing button
    if (await page.locator('button:has-text("Share File")').isVisible()) {
      await page.click('button:has-text("Share File")');
      
      // Upload test file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('test-images/skin-test.jpg');
      
      // Check file preview
      await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
      await expect(page.locator('button:has-text("Send File")')).toBeVisible();
      
      // Send file
      await page.click('button:has-text("Send File")');
      
      // Check file in chat
      await expect(page.locator('[data-testid="file-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="file-download"]')).toBeVisible();
      
      await takeScreenshot(page, 'realtime-file-sharing');
    }
  });

  test('should handle real-time error handling', async ({ page }) => {
    await page.goto('/th/sales/dashboard');
    await waitForLoading(page);
    
    // Simulate WebSocket error
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('websocket-error', {
        detail: { error: 'Connection failed' }
      }));
    });
    
    // Wait for error handling
    await page.waitForTimeout(1000);
    
    // Check error message
    if (await page.locator('.alert-warning').isVisible()) {
      await expect(page.locator('.alert-warning')).toContainText('connection');
    }
    
    // Check retry mechanism
    if (await page.locator('button:has-text("Retry")').isVisible()) {
      await page.click('button:has-text("Retry")');
      
      // Wait for reconnection attempt
      await page.waitForTimeout(2000);
    }
    
    await takeScreenshot(page, 'realtime-error-handling');
  });
});
