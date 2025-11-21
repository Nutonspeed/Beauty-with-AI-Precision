import { WebSocketServer, type WebSocket as WebSocketType, type RawData } from 'ws';
import { createServer, type IncomingMessage, type Server as HttpServer, type ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { type JwtPayload } from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ประกาศ type สำหรับ WebSocket message
interface WebSocketMessage {
  type: string;
  data?: unknown;
  channels?: string[];
  [key: string]: unknown;
}

// ประกาศ interface สำหรับ client information
interface ClientInfo {
  socket: WebSocketType;
  clientId: string;
  userId: string;
  role: string;
  clinicId: string;
  subscribedChannels: Set<string>;
}

// ประกาศ interface สำหรับ JWT payload
interface WsJwtPayload extends JwtPayload {
  userId: string;
  role: string;
  clinicId: string;
}

// ประกาศ type สำหรับ filter ในการ broadcast
interface BroadcastFilter {
  userIds?: string[];
  clinicIds?: string[];
  roles?: string[];
  channels?: string[];
}

// ประกาศ type สำหรับ user role
type UserRole = 'admin' | 'doctor' | 'staff' | 'free_user' | 'premium_user';

// ฟังก์ชันสำหรับตรวจสอบสิทธิ์การเข้าถึง channel
function canSubscribeToChannel(channel: string, role: UserRole, userId: string, clinicId: string): boolean {
  // ตัวอย่างการตรวจสอบสิทธิ์พื้นฐาน
  if (channel.startsWith('user:') && channel !== `user:${userId}`) {
    return false;
  }
  if (channel.startsWith('clinic:') && channel !== `clinic:${clinicId}`) {
    return false;
  }
  return true;
}

// ฟังก์ชันสำหรับกรอง channel ที่อนุญาต
function filterAllowedChannels(
  channels: string[], 
  role: UserRole, 
  userId: string, 
  clinicId: string
): { allowed: string[]; denied: Array<{ channel: string; reason: string }> } {
  const allowed: string[] = [];
  const denied: Array<{ channel: string; reason: string }> = [];

  for (const channel of channels) {
    if (canSubscribeToChannel(channel, role, userId, clinicId)) {
      allowed.push(channel);
    } else {
      denied.push({ channel, reason: 'permission_denied' });
    }
  }

  return { allowed, denied };
}

export class WSServer {
  private readonly wss: WebSocketServer;
  private readonly httpServer: HttpServer;
  private readonly clients: Map<string, ClientInfo> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 30000; // 30 seconds
  private readonly startTime = Date.now(); // Server start timestamp
  private isRunning = false;

  constructor(private readonly port: number = 3001) {
    this.httpServer = createServer();
    this.wss = new WebSocketServer({ 
      server: this.httpServer,
      clientTracking: true
    });

    this.setupEventHandlers();
    this.setupHttpHandlers();
  }

  private log(level: 'info' | 'warn' | 'error', event: string, data?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...data
    };
    console.log(JSON.stringify(logEntry));
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocketType, req: IncomingMessage) => {
      const clientId = uuidv4();
      
      // กำหนดค่าเริ่มต้นให้กับ WebSocket
      (ws as any).isAlive = true;
      (ws as any).clientId = clientId;
      (ws as any).subscribedChannels = new Set<string>();

      const url = req.url ? new URL(req.url, `http://${req.headers.host}`) : null;
      const token = url?.searchParams.get('token');

      if (!token) {
        ws.close(4000, 'Authentication token is required');
        return;
      }

      // ตรวจสอบ token และยืนยันตัวตน
      this.authenticateClient(ws, clientId, token).catch((error: Error) => {
        console.error('Authentication error:', error);
        ws.close(4001, 'Authentication failed');
      });
    });

    // ตั้งค่า interval สำหรับการตรวจสอบการเชื่อมต่อ
    this.pingInterval = setInterval((): void => {
      this.wss.clients.forEach((ws: WebSocketType) => {
        const wsAny = ws as any;
        if (wsAny.isAlive === false) {
          console.log(`Terminating dead connection`);
          this.handleClose(wsAny.clientId);
          return ws.terminate();
        }
        wsAny.isAlive = false;
        ws.ping();
      });
    }, this.PING_INTERVAL);
  }

  private async handleBroadcastRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const adminSecret = process.env.WS_ADMIN_SECRET || '';
    const provided = Array.isArray(req.headers['x-ws-admin-secret'])
      ? req.headers['x-ws-admin-secret'][0]
      : req.headers['x-ws-admin-secret'];
      
    if (!adminSecret || provided !== adminSecret) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let bodyStr = '';
    try {
      for await (const chunk of req) {
        bodyStr += chunk.toString('utf8');
      }
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error reading request body' }));
      return;
    }

    let body: Record<string, unknown>;
    try {
      body = bodyStr ? JSON.parse(bodyStr) : {};
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const message = body.message as WebSocketMessage | undefined;
    const filter = body.filter as BroadcastFilter | undefined;

    if (!message || typeof message !== 'object') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid message payload' }));
      return;
    }

    this.broadcast(message, filter);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  }

  private async authenticateClient(ws: WebSocketType, clientId: string, token: string): Promise<void> {
    try {
      const payload = this.verifyWsToken(token);
      if (!payload) {
        this.log('warn', 'auth_failed', { clientId, reason: 'invalid_token' });
        throw new Error('Invalid or expired token');
      }
      
      // ตรวจสอบว่ามี userId หรือไม่
      if (!payload.userId) {
        throw new Error('Missing user ID in token');
      }

      // ตรวจสอบข้อมูลผู้ใช้จากฐานข้อมูล
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, role, clinic_id')
        .eq('id', payload.userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      const clientInfo: ClientInfo = {
        socket: ws,
        clientId,
        userId: user.id,
        role: (user as any).role || 'free_user',
        clinicId: (user as any).clinic_id || 'default',
        subscribedChannels: new Set()
      };

      this.clients.set(clientId, clientInfo);
      this.log('info', 'client_connected', {
        clientId,
        userId: clientInfo.userId,
        role: clientInfo.role,
        clinicId: clientInfo.clinicId
      });

      // ตั้งค่า event handlers สำหรับ WebSocket
      ws.on('message', (data) => this.handleMessage(clientId, data));
      ws.on('pong', () => { (ws as any).isAlive = true; });
      ws.on('close', () => this.handleClose(clientId));
      ws.on('error', (error) => this.handleError(clientId, error));

      // ส่งข้อความยืนยันการเชื่อมต่อ
      this.sendToClient(ws, {
        type: 'CONNECTED',
        data: { clientId, userId: clientInfo.userId }
      });
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  private verifyWsToken(token: string): WsJwtPayload | null {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const obj = JSON.parse(decoded) as { userId: string; timestamp: number; signature: string };
      if (!obj?.userId || !obj?.timestamp || !obj?.signature) {
        return null;
      }

      const secret = process.env.WS_TOKEN_SECRET || 'your-secret-key';
      const data = `${obj.userId}:${obj.timestamp}`;
      const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');

      if (expected !== obj.signature) {
        return null;
      }

      const ttlMs = Number.parseInt(process.env.WS_TOKEN_TTL_MS || `${10 * 60 * 1000}`, 10);
      const ageMs = Date.now() - Number(obj.timestamp);
      if (Number.isNaN(ageMs) || ageMs > ttlMs) {
        return null;
      }

      // ควรดึงข้อมูล role และ clinicId จากฐานข้อมูลแทนการตั้งค่าเริ่มต้น
      return { 
        userId: obj.userId, 
        timestamp: obj.timestamp,
        role: 'free_user',
        clinicId: 'default'
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  private handleMessage(clientId: string, data: RawData): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      // แปลงข้อมูลเป็น string
      const messageStr = typeof data === 'string' ? data : data.toString('utf8');
      const messageObj = JSON.parse(messageStr) as WebSocketMessage;
      
      // ตรวจสอบว่า message มี type หรือไม่
      if (!messageObj || typeof messageObj !== 'object' || !messageObj.type) {
        this.log('warn', 'invalid_message_format', { clientId });
        return;
      }

      switch (messageObj.type) {
        case 'PING':
          this.sendToClient(client.socket, { type: 'PONG' });
          break;

        case 'SUBSCRIBE':
          if ((messageObj as any).data?.channels?.length) {
            const requestedChannels = (messageObj as any).data.channels as string[];
            const { allowed, denied } = filterAllowedChannels(
              requestedChannels,
              client.role as UserRole,
              client.userId,
              client.clinicId
            );

            // เพิ่มช่องทางที่อนุญาต
            for (const channel of allowed) {
              client.subscribedChannels.add(channel);
            }

            this.log('info', 'channels_subscribed', {
              clientId,
              userId: client.userId,
              allowed,
              denied: denied.map(d => d.channel)
            });

            // ส่งการตอบกลับ
            this.sendToClient(client.socket, {
              type: 'SUBSCRIBE_RESULT',
              data: { allowed, denied }
            });
          }
          break;

        case 'UNSUBSCRIBE':
          if ((messageObj as any).data?.channels?.length) {
            const channels = (messageObj as any).data.channels as string[];
            for (const channel of channels) {
              client.subscribedChannels.delete(channel);
            }
            this.log('info', 'channels_unsubscribed', {
              clientId,
              userId: client.userId,
              channels
            });
          }
          break;

        default:
          this.log('warn', 'unhandled_message_type', {
            clientId,
            userId: client.userId,
            messageType: messageObj.type
          });
      }
    } catch (error) {
      this.log('error', 'message_processing_error', {
        clientId,
        userId: client.userId,
        error: String(error)
      });
    }
  }

  private handleClose(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.log('info', 'client_disconnected', {
        clientId,
        userId: client.userId,
        role: client.role,
        clinicId: client.clinicId
      });
      this.clients.delete(clientId);
    }
  }

  private handleError(clientId: string, error: Error): void {
    const client = this.clients.get(clientId);
    this.log('error', 'client_error', {
      clientId,
      userId: client?.userId,
      error: String(error)
    });
    this.clients.delete(clientId);
  }

  private sendToClient(ws: WebSocketType, message: WebSocketMessage): void {
    if (ws.readyState === 1) { // 1 = OPEN
      ws.send(JSON.stringify(message));
    }
  }

  public broadcast(message: WebSocketMessage, filter?: BroadcastFilter): void {
    let sentCount = 0;
    for (const [, client] of this.clients) {
      if (this.clientMatchesFilter(client, filter)) {
        this.sendToClient(client.socket, message);
        sentCount++;
      }
    }
    
    this.log('info', 'message_broadcast', {
      messageType: message.type,
      filter,
      recipients: sentCount,
      totalClients: this.clients.size
    });
  }

  private clientMatchesFilter(client: ClientInfo, filter?: BroadcastFilter): boolean {
    if (!filter) return true;
    
    // ตรวจสอบ user ID
    if (filter.userIds && filter.userIds.length > 0 && !filter.userIds.includes(client.userId)) {
      return false;
    }
    
    // ตรวจสอบ clinic ID
    if (filter.clinicIds && filter.clinicIds.length > 0 && !filter.clinicIds.includes(client.clinicId)) {
      return false;
    }
    
    // ตรวจสอบ role
    if (filter.roles && filter.roles.length > 0 && !filter.roles.includes(client.role)) {
      return false;
    }
    
    // ตรวจสอบ channel
    if (filter.channels && filter.channels.length > 0) {
      const hasMatchingChannel = filter.channels.some(channel => 
        client.subscribedChannels.has(channel)
      );
      if (!hasMatchingChannel) return false;
    }
    
    return true;
  }

  public start(callback?: () => void): void {
    if (this.isRunning) {
      console.warn('WebSocket server is already running');
      return;
    }

    this.httpServer.listen(this.port, () => {
      this.isRunning = true;
      this.log('info', 'server_started', { port: this.port });
      callback?.();
    });
  }

  public async gracefulShutdown(): Promise<void> {
    if (!this.isRunning) return;
    
    this.log('info', 'server_shutdown_initiated', { clientCount: this.clients.size });
    
    // หยุดการเชื่อมต่อใหม่
    this.wss.close();
    
    // ปิดการเชื่อมต่อ client ทั้งหมด
    const closePromises = Array.from(this.clients.values()).map(client => 
      new Promise<void>((resolve) => {
        const socket = client.socket;
        socket.once('close', () => resolve());
        socket.close(1001, 'Server shutting down');
      })
    );
    
    // รอให้ client ทั้งหมดตัดการเชื่อมต่อหรือหมดเวลา 5 วินาที
    await Promise.race([
      Promise.all(closePromises),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);
    
    // ล้าง interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // ปิด HTTP server
    await new Promise<void>((resolve) => {
      this.httpServer.close(() => resolve());
    });
    
    this.isRunning = false;
    this.log('info', 'server_stopped');
  }

  private setupHttpHandlers(): void {
    this.httpServer.on('request', async (req, res) => {
      try {
        const url = req.url ? new URL(req.url, `http://${req.headers.host}`) : null;
        const method = req.method || 'GET';
        const pathname = url?.pathname || '/';

        if (method === 'GET' && pathname === '/health') {
          this.handleHealthCheck(res);
          return;
        }

        if (method === 'POST' && pathname === '/broadcast') {
          await this.handleBroadcastRequest(req, res);
          return;
        }

        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not found' }));
      } catch (error) {
        console.error('HTTP request error:', error);
        try {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal server error' }));
        } catch {
          // Ignore errors when sending error response
        }
      }
    });
  }

  private handleHealthCheck(res: ServerResponse): void {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const mem = process.memoryUsage();
    
    const byRole: Record<string, number> = {};
    const byClinic: Record<string, number> = {};
    
    for (const client of this.clients.values()) {
      byRole[client.role] = (byRole[client.role] || 0) + 1;
      byClinic[client.clinicId] = (byClinic[client.clinicId] || 0) + 1;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'ok',
      uptime,
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external
      },
      clients: {
        total: this.clients.size,
        byRole,
        byClinic
      }
    }));
  }
}

export default WSServer;
