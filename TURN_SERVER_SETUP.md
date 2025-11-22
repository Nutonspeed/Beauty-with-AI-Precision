# 📹 TURN Server Setup for WebRTC Video Calls

## 🎯 Why TURN Server?

WebRTC video calls ต้องการ TURN server เพื่อ:
- ✅ ทะลุ firewall/NAT
- ✅ ให้ video call ทำงานในทุกสถานการณ์ (corporate networks, mobile data)
- ✅ Fallback เมื่อ P2P connection ไม่สำเร็จ

**Without TURN**: Video calls fail ~10-20% of the time  
**With TURN**: Video calls work ~99% of the time

## ⚡ Quick Setup (3 options)

### Option 1: Metered.ca (Free Tier - แนะนำ)

**Benefits**:
- ✅ 50 GB free monthly bandwidth
- ✅ No credit card required
- ✅ TURN + STUN servers included
- ✅ Global CDN

#### Step 1: Create Account

1. Visit: https://www.metered.ca/tools/openrelay/
2. Click **"Get Free API Keys"**
3. Sign up (email only, no payment)
4. Copy your credentials:
   ```
   TURN URLs: 
   - turn:a.relay.metered.ca:80
   - turn:a.relay.metered.ca:443
   - turn:a.relay.metered.ca:80?transport=tcp
   - turn:a.relay.metered.ca:443?transport=tcp
   
   Username: your-username
   Credential: your-credential
   ```

#### Step 2: Add to .env.local

```bash
# TURN Server Configuration (Metered.ca)
NEXT_PUBLIC_TURN_URLS=turn:a.relay.metered.ca:80,turn:a.relay.metered.ca:443
NEXT_PUBLIC_TURN_USERNAME=your-username
NEXT_PUBLIC_TURN_CREDENTIAL=your-credential

# Or use this format:
NEXT_PUBLIC_TURN_SERVER_URL=turn:a.relay.metered.ca:80
NEXT_PUBLIC_TURN_USERNAME=your-metered-username
NEXT_PUBLIC_TURN_PASSWORD=your-metered-credential
```

---

### Option 2: Twilio (Paid - Professional)

**Benefits**:
- ✅ Enterprise-grade
- ✅ 99.99% uptime
- ✅ Global infrastructure
- ⚠️ Requires credit card

#### Step 1: Create Twilio Account

1. Visit: https://www.twilio.com/console
2. Sign up and verify phone
3. Get API credentials:
   - Account SID
   - Auth Token

#### Step 2: Install Twilio SDK

```bash
pnpm add twilio
```

#### Step 3: Add to .env.local

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
```

#### Step 4: Create API Endpoint

Create `app/api/video/token/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const client = twilio(accountSid, authToken);
    
    // Get TURN credentials
    const token = await client.tokens.create();
    
    return NextResponse.json({
      iceServers: token.iceServers,
      // Format: [
      //   { urls: 'stun:global.stun.twilio.com:3478' },
      //   {
      //     urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      //     username: 'username',
      //     credential: 'password'
      //   }
      // ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get TURN credentials' },
      { status: 500 }
    );
  }
}
```

---

### Option 3: coturn (Self-Hosted - Advanced)

**Benefits**:
- ✅ Full control
- ✅ No bandwidth limits
- ✅ Best for high volume
- ⚠️ Requires VPS/server

(See separate guide: COTURN_SETUP.md)

---

## 📝 Create WebRTC Configuration File

Create `lib/webrtc/config.ts`:

```typescript
/**
 * WebRTC Configuration
 * Provides STUN/TURN server configuration for video calls
 */

export interface RTCConfigurationOptions {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

/**
 * Get WebRTC configuration with TURN server
 * 
 * @returns RTCConfiguration object for PeerConnection
 */
export function getRTCConfiguration(): RTCConfigurationOptions {
  // Free STUN servers (always available)
  const stunServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  // TURN servers from environment variables
  const turnServers: RTCIceServer[] = [];

  // Option 1: Single TURN server
  if (process.env.NEXT_PUBLIC_TURN_SERVER_URL) {
    turnServers.push({
      urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || '',
    });
  }

  // Option 2: Multiple TURN URLs (Metered.ca format)
  if (process.env.NEXT_PUBLIC_TURN_URLS) {
    const urls = process.env.NEXT_PUBLIC_TURN_URLS.split(',').map(url => url.trim());
    turnServers.push({
      urls,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '',
    });
  }

  // Combine STUN + TURN
  const iceServers = [...stunServers, ...turnServers];

  return {
    iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };
}

/**
 * Check if TURN server is configured
 */
export function isTURNConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_TURN_SERVER_URL ||
    process.env.NEXT_PUBLIC_TURN_URLS
  );
}

/**
 * Get configuration for testing
 */
export function getTestConfiguration(): RTCConfigurationOptions {
  return {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };
}
```

## 🔌 Update Video Call Components

### Update Video Call Manager

Update `lib/webrtc/video-call-manager.ts`:

```typescript
import { getRTCConfiguration, isTURNConfigured } from './config';

export class VideoCallManager {
  private peerConnection: RTCPeerConnection | null = null;
  
  async createPeerConnection() {
    // Get configuration with TURN server
    const config = getRTCConfiguration();
    
    console.log('🌐 Creating peer connection with config:', {
      hasSTUN: config.iceServers.some(s => s.urls.toString().includes('stun:')),
      hasTURN: config.iceServers.some(s => s.urls.toString().includes('turn:')),
      turnConfigured: isTURNConfigured(),
    });
    
    this.peerConnection = new RTCPeerConnection(config);
    
    // Monitor ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection?.iceConnectionState);
      
      if (this.peerConnection?.iceConnectionState === 'failed') {
        console.error('❌ ICE connection failed - TURN server may be needed');
      }
    };
    
    return this.peerConnection;
  }
}
```

### Update Video Call Component

Update any component that creates RTCPeerConnection:

```typescript
import { getRTCConfiguration } from '@/lib/webrtc/config';

// Instead of:
// const pc = new RTCPeerConnection({ iceServers: [...] });

// Use:
const config = getRTCConfiguration();
const pc = new RTCPeerConnection(config);
```

## ✅ Test TURN Server

### Test 1: Browser Test Page

Create `app/test-turn/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { getRTCConfiguration, isTURNConfigured } from '@/lib/webrtc/config';

export default function TestTURNPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function testTURN() {
    setLoading(true);
    setResult('Testing TURN server...\n\n');

    try {
      const config = getRTCConfiguration();
      const pc = new RTCPeerConnection(config);

      // Log configuration
      setResult(prev => prev + 'Configuration:\n' + JSON.stringify(config, null, 2) + '\n\n');

      // Collect ICE candidates
      const candidates: RTCIceCandidate[] = [];
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          candidates.push(event.candidate);
          setResult(prev => prev + `Found candidate: ${event.candidate.type} - ${event.candidate.protocol}\n`);
        } else {
          // All candidates gathered
          const hasRelay = candidates.some(c => c.type === 'relay');
          const hasSrflx = candidates.some(c => c.type === 'srflx');
          const hasHost = candidates.some(c => c.type === 'host');

          setResult(prev => prev + '\n✅ ICE Gathering Complete!\n\n');
          setResult(prev => prev + `Host candidates: ${hasHost ? '✅' : '❌'}\n`);
          setResult(prev => prev + `Server reflexive (STUN): ${hasSrflx ? '✅' : '❌'}\n`);
          setResult(prev => prev + `Relay (TURN): ${hasRelay ? '✅' : '❌'}\n\n`);

          if (hasRelay) {
            setResult(prev => prev + '🎉 TURN server is working!\n');
          } else {
            setResult(prev => prev + '⚠️  No TURN candidates found. Video calls may fail in restricted networks.\n');
          }

          pc.close();
          setLoading(false);
        }
      };

      // Create offer to trigger ICE gathering
      await pc.createOffer();
      
    } catch (error) {
      setResult(prev => prev + `\n❌ Error: ${error}\n`);
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">TURN Server Test</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          TURN Configured: {isTURNConfigured() ? '✅ Yes' : '❌ No'}
        </p>
      </div>

      <button
        onClick={testTURN}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test TURN Server'}
      </button>

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-x-auto text-sm">
          {result}
        </pre>
      )}
    </div>
  );
}
```

**Visit**: http://localhost:3004/test-turn

**Expected Results**:
- ✅ Host candidates: ✅
- ✅ Server reflexive (STUN): ✅
- ✅ Relay (TURN): ✅ ← Most important!

### Test 2: Manual Console Test

```javascript
// In browser console
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:a.relay.metered.ca:443',
      username: 'your-username',
      credential: 'your-credential'
    }
  ]
};

const pc = new RTCPeerConnection(config);
const candidates = [];

pc.onicecandidate = (e) => {
  if (e.candidate) {
    candidates.push(e.candidate);
    console.log(e.candidate.type, e.candidate.protocol);
  } else {
    console.log('Found relay?', candidates.some(c => c.type === 'relay'));
  }
};

pc.createOffer().then(offer => pc.setLocalDescription(offer));
```

✅ Look for `type: "relay"` candidates!

## 🔍 Debug TURN Issues

### Check 1: Test Connectivity

```bash
# Test if TURN server is reachable
curl -I https://a.relay.metered.ca

# Should return: HTTP 200 OK
```

### Check 2: Verify Credentials

```javascript
// Wrong credentials will still gather candidates
// But will fail during actual connection

// Test in browser:
const config = {
  iceServers: [{
    urls: 'turn:a.relay.metered.ca:443',
    username: 'WRONG_USERNAME',  // ❌ Wrong
    credential: 'WRONG_PASSWORD'  // ❌ Wrong
  }]
};

// Will show: iceConnectionState: "failed"
```

### Check 3: Monitor ICE State

```typescript
peerConnection.oniceconnectionstatechange = () => {
  console.log('ICE State:', peerConnection.iceConnectionState);
  
  switch (peerConnection.iceConnectionState) {
    case 'checking':
      console.log('🔍 Checking ICE candidates...');
      break;
    case 'connected':
      console.log('✅ ICE connected!');
      break;
    case 'completed':
      console.log('✅ ICE completed!');
      break;
    case 'failed':
      console.error('❌ ICE failed - check TURN configuration');
      break;
    case 'disconnected':
      console.warn('⚠️  ICE disconnected');
      break;
    case 'closed':
      console.log('🔒 ICE closed');
      break;
  }
};
```

## 📊 TURN Server Comparison

| Feature | Metered.ca | Twilio | Self-Hosted |
|---------|-----------|---------|------------|
| **Free Tier** | 50 GB/month | None | Unlimited |
| **Setup Time** | 2 minutes | 10 minutes | 1-2 hours |
| **Credit Card** | No | Yes | N/A |
| **Uptime SLA** | 99.9% | 99.99% | Your VPS |
| **Global CDN** | ✅ | ✅ | ❌ |
| **Best For** | Startups | Enterprise | High Volume |

## ✅ Success Checklist

- [ ] ใส่ TURN credentials ใน .env.local
- [ ] สร้าง lib/webrtc/config.ts
- [ ] Update video call manager ให้ใช้ getRTCConfiguration()
- [ ] Test with test-turn page
- [ ] เห็น "Relay (TURN): ✅"
- [ ] Video call test ระหว่าง 2 browsers
- [ ] Video call test ผ่าน mobile data (4G/5G)

## 🎉 Done!

TURN server พร้อมใช้งาน! Video calls จะทำงานในทุกสถานการณ์

**Benefits**:
- ✅ Video calls work 99% of the time
- ✅ Works behind corporate firewalls
- ✅ Works on mobile networks
- ✅ Professional video call experience

**Next**: Task 5 - Fix 50 Critical TypeScript Errors
