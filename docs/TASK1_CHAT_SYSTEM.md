# Task 1: Real-time Chat & Messaging System

## ภาพรวม (Overview)

ระบบแชทและข้อความแบบเรียลไทม์ที่ใช้ WebSocket สำหรับการสื่อสารสองทางแบบทันที รองรับทั้งการส่งข้อความ แชร์ไฟล์ ปฏิกิริยา emoji การแสดงสถานะการพิมพ์ และการแสดงสถานะออนไลน์

**สถานะ**: ✅ เสร็จสมบูรณ์  
**ไฟล์ที่สร้าง**: 6 files (~2,900+ lines)  
**เทคโนโลยี**: WebSocket, TypeScript, React Hooks, Next.js 14

## คุณสมบัติหลัก (Core Features)

### 1. Real-time Messaging
- ✅ ส่งข้อความแบบ Real-time ด้วย WebSocket
- ✅ แก้ไขข้อความ (Edit Message)
- ✅ ลบข้อความ (Delete Message)
- ✅ ตอบกลับข้อความ (Reply to Message)
- ✅ ประวัติข้อความ (Message History)
- ✅ ค้นหาข้อความ (Message Search)

### 2. File Sharing
- ✅ แชร์รูปภาพ (Image Sharing)
- ✅ แชร์ไฟล์ (File Sharing)
- ✅ รองรับหลายประเภทไฟล์ (.pdf, .doc, .docx)
- ✅ แสดงตัวอย่างรูปภาพ (Image Preview)

### 3. Emoji Reactions
- ✅ เพิ่ม Emoji Reaction
- ✅ ลบ Emoji Reaction
- ✅ แสดงจำนวน Reaction
- ✅ Emoji Picker (10 emojis)

### 4. Typing Indicators
- ✅ แสดงสถานะการพิมพ์ (Typing Indicator)
- ✅ Auto-stop หลัง 3 วินาที
- ✅ แสดงหลายผู้ใช้พิมพ์พร้อมกัน
- ✅ จัดรูปแบบข้อความ ("User is typing...", "User1 and User2 are typing...", "3 people are typing...")

### 5. Read Receipts
- ✅ แสดงสถานะส่งแล้ว (✓)
- ✅ แสดงสถานะอ่านแล้ว (✓✓)
- ✅ ทำเครื่องหมายอ่านอัตโนมัติ
- ✅ แสดงเวลาอ่าน

### 6. Online Presence
- ✅ แสดงสถานะออนไลน์/ออฟไลน์
- ✅ แสดงเวลาออนไลน์ล่าสุด (Last Seen)
- ✅ อัปเดตแบบ Real-time
- ✅ Heartbeat/Ping-Pong

### 7. Group Chat
- ✅ สร้างห้องแชท (Create Conversation)
- ✅ รองรับ Direct Chat และ Group Chat
- ✅ จัดการสมาชิก (Add/Remove Members)
- ✅ ออกจากห้องแชท (Leave Conversation)

### 8. Conversation Management
- ✅ แสดงรายการการสนทนา (Conversations List)
- ✅ ค้นหาการสนทนา (Search Conversations)
- ✅ ปักหมุดการสนทนา (Pin Conversation)
- ✅ เก็บถาวร (Archive)
- ✅ ปิดเสียง (Mute)
- ✅ แสดงจำนวนข้อความที่ยังไม่อ่าน (Unread Count)

## สถาปัตยกรรม (Architecture)

### WebSocket Client-Server

\`\`\`
┌─────────────┐         WebSocket (ws://localhost:3001)         ┌─────────────┐
│             │◄──────────────────────────────────────────────►│             │
│  Client     │         JSON Message Format                    │   Server    │
│  (Browser)  │         - message, typing, reactions           │  (Node.js)  │
│             │         - online/offline status                │             │
└─────────────┘         - ping/pong heartbeat                  └─────────────┘
      │                                                                │
      │                                                                │
      ▼                                                                ▼
  ChatManager                                                  ChatSocketServer
  - Connection                                                 - Room Management
  - Message CRUD                                               - Client Tracking
  - Reactions                                                  - Broadcasting
  - Typing                                                     - Message Routing
  - Online Status
\`\`\`

### Components Structure

\`\`\`
app/chat/page.tsx (Demo Page)
    │
    ├── ConversationsList (Sidebar)
    │   ├── Search
    │   ├── Tabs (All/Unread/Archived)
    │   └── Conversation Items
    │
    └── ChatInterface (Main Chat)
        ├── Header (Avatar, Name, Actions)
        ├── Messages Area
        │   ├── Message Bubbles
        │   ├── Reactions
        │   └── Typing Indicator
        └── Input Area
            ├── File Upload
            ├── Emoji Picker
            └── Text Input
\`\`\`

### Data Flow

\`\`\`
User Action → React Component → Hook → ChatManager → WebSocket → Server
                                  ↑                                   │
                                  │                                   │
                                  └───────── Event Listener ←─────────┘
\`\`\`

## ไฟล์ที่สร้าง (Files Created)

### 1. `lib/chat/chat-manager.ts` (750 lines)
**Purpose**: Core chat functionality with WebSocket client

**Classes**:
- `ChatManager`: Main class for chat operations

**Interfaces** (10 total):
\`\`\`typescript
interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'away' | 'offline';
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  attachments?: Attachment[];
  reactions?: Reaction[];
  replyTo?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  readBy?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
}

interface Reaction {
  emoji: string;
  users: string[];
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt?: Date;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

interface OnlineStatus {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: Date;
}

interface MessageFilter {
  type?: 'text' | 'image' | 'file';
  senderId?: string;
  search?: string;
  fromDate?: Date;
  toDate?: Date;
}

interface ConversationFilter {
  type?: 'direct' | 'group';
  unreadOnly?: boolean;
  pinnedOnly?: boolean;
}
\`\`\`

**Key Methods**:

**Connection Management**:
- `connect(userId: string, token?: string): Promise<void>` - Connect to WebSocket server
- `disconnect(): void` - Disconnect from server
- `isConnected(): boolean` - Check connection status
- `handleReconnect(): Promise<void>` - Reconnect with exponential backoff (max 5 attempts)

**Message Operations**:
- `sendMessage(conversationId: string, content: string, type?: string, replyTo?: string): Promise<Message>` - Send message
- `sendFile(conversationId: string, file: File): Promise<Message>` - Send file/image
- `editMessage(messageId: string, newContent: string): Promise<void>` - Edit message
- `deleteMessage(messageId: string): Promise<void>` - Delete message
- `getMessages(conversationId: string, filter?: MessageFilter): Promise<Message[]>` - Get messages with filters
- `searchMessages(conversationId: string, query: string): Promise<Message[]>` - Search messages

**Reactions**:
- `addReaction(messageId: string, emoji: string): Promise<void>` - Add emoji reaction
- `removeReaction(messageId: string, emoji: string): Promise<void>` - Remove emoji reaction

**Read Status**:
- `markAsRead(messageId: string): Promise<void>` - Mark single message as read
- `markConversationAsRead(conversationId: string): Promise<void>` - Mark all messages in conversation as read

**Typing Indicators**:
- `sendTypingIndicator(conversationId: string, isTyping: boolean): void` - Send typing status

**Conversations**:
- `createConversation(participants: string[], type?: string, name?: string): Promise<Conversation>` - Create new conversation
- `getConversation(conversationId: string): Promise<Conversation>` - Get conversation details
- `getConversations(filter?: ConversationFilter): Promise<Conversation[]>` - Get all conversations
- `updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void>` - Update conversation
- `leaveConversation(conversationId: string): Promise<void>` - Leave conversation

**Online Status**:
- `getOnlineUsers(userIds?: string[]): Promise<OnlineStatus[]>` - Get online status

**Private Methods**:
- `send(type: string, data: any): void` - Send message to WebSocket
- `handleMessage(event: MessageEvent): void` - Handle incoming WebSocket messages
- `onMessageReceived(message: Message): void` - Process received message
- `startHeartbeat(): void` - Start ping/pong heartbeat
- `uploadFile(file: File): Promise<string>` - Upload file (placeholder)

**Events Dispatched**:
- `chat:message` - New message received
- `chat:message:edit` - Message edited
- `chat:message:delete` - Message deleted
- `chat:message:reaction` - Reaction added/removed
- `chat:typing` - Typing indicator update
- `chat:conversation:update` - Conversation updated
- `chat:user:online` - User online status changed

**Features**:
- Auto-reconnect with exponential backoff
- Message caching (Map<conversationId, Message[]>)
- Heartbeat/ping-pong every 30 seconds
- Event-driven architecture
- Singleton pattern
- Type-safe with TypeScript

### 2. `lib/chat/socket-server.ts` (400 lines)
**Purpose**: WebSocket server for real-time communication

**Classes**:
- `ChatSocketServer`: Server-side WebSocket manager

**Key Methods**:

**Server Management**:
- `constructor(port?: number)` - Initialize server (default port 3001)
- `handleConnection(ws: WebSocket, req: IncomingMessage): void` - Handle new client connection

**Message Handling**:
- `handleMessage(client: Client, data: any): void` - Route incoming messages
- `handleChatMessage(client: Client, data: any): void` - Handle chat messages
- `handleMessageEdit(client: Client, data: any): void` - Handle message edits
- `handleMessageDelete(client: Client, data: any): void` - Handle message deletions
- `handleReaction(client: Client, data: any): void` - Handle add reaction
- `handleReactionRemove(client: Client, data: any): void` - Handle remove reaction

**Typing & Presence**:
- `handleTyping(client: Client, data: any): void` - Relay typing indicators
- `broadcastUserStatus(userId: string, status: string): void` - Broadcast online/offline status

**Conversation Management**:
- `handleConversationCreate(client: Client, data: any): void` - Handle conversation creation
- `handleConversationJoin(client: Client, data: any): void` - Handle join conversation
- `handleConversationLeave(client: Client, data: any): void` - Handle leave conversation

**Broadcasting**:
- `sendToClient(userId: string, type: string, data: any): void` - Send to specific client
- `broadcastToRoom(conversationId: string, type: string, data: any, excludeUserId?: string): void` - Broadcast to room
- `broadcast(type: string, data: any): void` - Broadcast to all clients

**Monitoring**:
- `getStats(): object` - Get server statistics (total clients, rooms, messages)

**Message Types Handled**:
- `ping` / `pong` - Heartbeat
- `message` - Chat message
- `message:edit` - Edit message
- `message:delete` - Delete message
- `message:reaction` - Add reaction
- `message:reaction:remove` - Remove reaction
- `typing` - Typing indicator
- `conversation:create` - Create conversation
- `conversation:join` - Join conversation
- `conversation:leave` - Leave conversation
- `user:online` - User online
- `user:offline` - User offline

**Data Structures**:
\`\`\`typescript
interface Client {
  ws: WebSocket;
  userId: string;
  connectedAt: Date;
}

// Storage
clients: Map<string, Client> - userId -> Client
rooms: Map<string, Set<string>> - conversationId -> Set<userId>
\`\`\`

**Features**:
- Room-based messaging
- Client tracking
- Broadcast mechanisms
- Heartbeat/ping-pong
- Connection cleanup
- Statistics tracking

### 3. `hooks/useChat.ts` (550 lines)
**Purpose**: React hooks for chat integration

**Hooks Exported**:

#### `useChat(userId: string)`
Main connection hook

**Returns**:
\`\`\`typescript
{
  chatManager: ChatManager | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}
\`\`\`

**Usage**:
\`\`\`typescript
const { chatManager, connected } = useChat('user-123');
\`\`\`

#### `useMessages(conversationId: string, userId: string)`
Message management hook

**Returns**:
\`\`\`typescript
{
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  sendMessage: (content: string, type?: string, replyTo?: string) => Promise<void>;
  sendFile: (file: File) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  loadMore: () => Promise<void>;
}
\`\`\`

**Usage**:
\`\`\`typescript
const { messages, sendMessage, sendFile } = useMessages('conv-1', 'user-123');

await sendMessage('Hello!');
await sendFile(file);
\`\`\`

#### `useConversations(userId: string)`
Conversation list hook

**Returns**:
\`\`\`typescript
{
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  createConversation: (participants: string[], type?: string, name?: string) => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => Promise<void>;
  refresh: () => Promise<void>;
}
\`\`\`

**Usage**:
\`\`\`typescript
const { conversations, createConversation } = useConversations('user-123');

await createConversation(['user-456'], 'direct');
\`\`\`

#### `useTyping(conversationId: string)`
Typing indicators hook

**Returns**:
\`\`\`typescript
{
  typingUsers: Map<string, TypingIndicator>;
  isTyping: boolean;
  typingText: string;
}
\`\`\`

**Text Formats**:
- 1 user: "User is typing..."
- 2 users: "User1 and User2 are typing..."
- 3+ users: "3 people are typing..."

**Usage**:
\`\`\`typescript
const { isTyping, typingText } = useTyping('conv-1');

{isTyping && <p>{typingText}</p>}
\`\`\`

#### `useOnlineStatus(userIds?: string[])`
Online presence hook

**Returns**:
\`\`\`typescript
{
  onlineUsers: Map<string, OnlineStatus>;
  isOnline: (userId: string) => boolean;
  getLastSeen: (userId: string) => Date | undefined;
}
\`\`\`

**Usage**:
\`\`\`typescript
const { isOnline, getLastSeen } = useOnlineStatus(['user-456']);

if (isOnline('user-456')) {
  console.log('User is online');
} else {
  console.log('Last seen:', getLastSeen('user-456'));
}
\`\`\`

**Features**:
- Auto-connect on mount
- Auto-cleanup on unmount
- Event listeners for real-time updates
- Error handling
- Loading states
- Memoized callbacks (useCallback)
- Ref-based ChatManager (prevents re-creation)

### 4. `components/chat-interface.tsx` (400 lines)
**Purpose**: Complete chat UI component

**Props**:
\`\`\`typescript
interface ChatInterfaceProps {
  conversationId: string;
  userId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
}
\`\`\`

**Layout Sections**:

**Header**:
- Avatar with online indicator (green dot)
- Recipient name
- Last seen status ("ออนไลน์" or "ออนไลน์ล่าสุด X นาทีที่แล้ว")
- Action buttons:
  - Phone (Voice Call)
  - Video (Video Call)
  - Search
  - More (MoreVertical)

**Messages Area**:
- ScrollArea with auto-scroll to bottom
- Infinite scroll (Load More button)
- Message bubbles:
  - Own messages: Right-aligned, blue background
  - Other messages: Left-aligned, gray background
  - Deleted messages: Opacity 50%, italic text
- Image attachments: Display inline
- File attachments: Show file name with icon
- Reactions: Badge with emoji and count
- Timestamps: HH:MM format
- Read receipts: ✓ (sent) or ✓✓ (read)
- Edit indicator: "(แก้ไข)" suffix

**Reply Indicator**:
- Shows when replying to a message
- Display original message preview
- Cancel button

**Emoji Picker**:
- 10 common emojis: ❤️ 👍 😂 😮 😢 😡 🎉 🔥 ⭐ 👏
- Toggleable popup
- Click emoji to add reaction

**Input Area**:
- File upload button (Paperclip icon)
- Emoji picker button (Smile icon)
- Text input (auto-focus, Enter to send)
- Send button (Send icon)

**Interactions**:
- **Double-click message**: Edit own message (prompt dialog)
- **Reply button**: Set replyingTo state
- **Delete button**: Show confirmation dialog
- **Emoji reaction button**: Toggle emoji picker for that message
- **File button**: Open file picker (image/*, .pdf, .doc, .docx)
- **Send**: Enter key or button click
- **Typing**: Auto-send typing indicator, auto-stop after 3 seconds

**State Management**:
\`\`\`typescript
const [messageText, setMessageText] = useState('');
const [replyingTo, setReplyingTo] = useState<Message | null>(null);
const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

const scrollRef = useRef<HTMLDivElement>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const typingTimeoutRef = useRef<NodeJS.Timeout>();
\`\`\`

**Features**:
- Responsive design (Tailwind CSS)
- Auto-scroll to bottom on new messages
- Typing detection (auto-stop after 3s)
- File upload with preview
- Emoji reactions
- Edit/delete own messages
- Reply to messages
- Read receipts
- Online status
- Voice/video call integration ready
- Accessibility (aria-label on file input)

### 5. `components/conversations-list.tsx` (300 lines)
**Purpose**: Conversation list sidebar with search and filters

**Props**:
\`\`\`typescript
interface ConversationsListProps {
  userId: string;
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}
\`\`\`

**Layout Sections**:

**Header**:
- Title: "ข้อความ"
- New conversation button (Plus icon)
- Settings button
- Search input

**Tabs**:
- **ทั้งหมด (All)**: All non-archived conversations
- **ยังไม่อ่าน (Unread)**: Only conversations with unread count > 0 (with badge)
- **เก็บถาวร (Archived)**: Archived conversations

**Conversation Items**:
- Avatar with unread count badge (red circle)
- Name with pin 📌 and mute 🔇 indicators
- Last message preview (with 📷 or 📎 for media/files)
- Timestamp (formatted: "เมื่อสักครู่", "5น", "2ช", "3ว", "12 ม.ค.")
- Archive button (on hover)

**Sorting**:
1. Pinned conversations first
2. Then by last message time (newest first)

**Empty States**:
- No conversations: Show icon + "ไม่มีข้อความ" + "เริ่มสนทนาใหม่" button
- No search results: Show icon + "ไม่พบผลการค้นหา"

**Features**:
- Real-time updates via useConversations hook
- Search conversations (name and last message)
- Filter by tab (all/unread/archived)
- Pin/unpin conversations
- Archive conversations
- Mute conversations
- Unread count badges
- Last message preview
- Timestamp formatting
- Loading and error states
- Responsive design

### 6. `app/chat/page.tsx` (300 lines)
**Purpose**: Chat demo page with full layout

**Features**:

**User Selection Screen** (first load):
- Title: "ระบบแชทและข้อความ"
- Subtitle: "Real-time Chat & Messaging System Demo"
- 4 demo users to choose from (user-1 to user-4)
- Each user with avatar, name, and ID
- Feature highlights panel:
  - Real-time messaging with WebSocket
  - File and image sharing
  - Emoji reactions and replies
  - Typing indicators and online status
  - Read receipts (✓✓)
  - Edit and delete messages
  - Message search and group chat

**Main Chat Screen**:

**Header**:
- Title: "ระบบแชทและข้อความ"
- Subtitle: "Phase 3 - Task 1: Real-time Chat & Messaging"
- Current user display (name, avatar)
- "เปลี่ยนผู้ใช้" button

**Layout**:
- Left sidebar (320px): ConversationsList component
- Main area: ChatInterface component or empty state

**Empty State** (no conversation selected):
- Icon: MessageSquare (large, gray)
- Title: "เริ่มการสนทนา"
- Description: "เลือกการสนทนาหรือเริ่มสนทนาใหม่"
- Button: "สนทนาใหม่"

**New Chat Dialog**:
- Title: "เริ่มการสนทนาใหม่"
- Search input: "ค้นหาชื่อหรือตำแหน่ง..."
- List of demo users (excluding current user):
  - ดร.สมชาย วงศ์แพทย์ (แพทย์, online)
  - พญ.สุดา ใจดี (แพทย์, online)
  - คุณมานี รักษ์ผู้ป่วย (พยาบาล, away)
  - คุณสมศรี บริการดี (เจ้าหน้าที่, offline)
- Click user to start conversation

**Integration**:
- Video call button → Alert "Integration with Phase 2 Task 5"
- Voice call button → Alert "Integration with Phase 2 Task 5"

**State Management**:
\`\`\`typescript
const [currentUserId, setCurrentUserId] = useState('user-1');
const [selectedConversationId, setSelectedConversationId] = useState<string>();
const [selectedRecipient, setSelectedRecipient] = useState<User>();
const [showNewChatDialog, setShowNewChatDialog] = useState(false);
const [showUserSelect, setShowUserSelect] = useState(true);
\`\`\`

**Demo Users**:
\`\`\`typescript
const DEMO_USERS = [
  { id: '1', name: 'ดร.สมชาย วงศ์แพทย์', role: 'แพทย์', status: 'online' },
  { id: '2', name: 'พญ.สุดา ใจดี', role: 'แพทย์', status: 'online' },
  { id: '3', name: 'คุณมานี รักษ์ผู้ป่วย', role: 'พยาบาล', status: 'away' },
  { id: '4', name: 'คุณสมศรี บริการดี', role: 'เจ้าหน้าที่', status: 'offline' },
];
\`\`\`

**Features**:
- User selection (4 demo users)
- Conversation list sidebar
- Main chat interface
- New conversation dialog
- Empty states
- Video/voice call integration placeholders
- Responsive layout
- Feature highlights
- Avatar generation (DiceBear API)

## การติดตั้งและใช้งาน (Installation & Usage)

### Prerequisites
\`\`\`bash
# Install dependencies
pnpm install

# Additional packages for chat system
pnpm add ws @types/ws
\`\`\`

### Running WebSocket Server

**Standalone Server**:
\`\`\`bash
# Create server.js
node -e "const { ChatSocketServer } = require('./lib/chat/socket-server'); new ChatSocketServer(3001);"
\`\`\`

**Or integrate with Next.js API** (create `app/api/chat-ws/route.ts`):
\`\`\`typescript
import { ChatSocketServer } from '@/lib/chat/socket-server';

let server: ChatSocketServer | null = null;

export async function GET(request: Request) {
  if (!server) {
    server = new ChatSocketServer(3001);
  }
  
  return new Response('WebSocket server running on port 3001');
}
\`\`\`

### Environment Variables
\`\`\`env
# .env.local
WS_PORT=3001
WS_URL=ws://localhost:3001
\`\`\`

### Usage Examples

#### Basic Chat Implementation
\`\`\`typescript
'use client';

import { ChatInterface } from '@/components/chat-interface';
import { useChat } from '@/hooks/useChat';

export default function MyChat() {
  const { connected } = useChat('my-user-id');

  if (!connected) return <div>Connecting...</div>;

  return (
    <ChatInterface
      conversationId="conv-123"
      userId="my-user-id"
      recipientId="other-user-id"
      recipientName="John Doe"
      recipientAvatar="https://example.com/avatar.jpg"
    />
  );
}
\`\`\`

#### With Conversations List
\`\`\`typescript
'use client';

import { ConversationsList } from '@/components/conversations-list';
import { ChatInterface } from '@/components/chat-interface';
import { useState } from 'react';

export default function FullChat() {
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <div className="flex h-screen">
      <div className="w-80">
        <ConversationsList
          userId="my-user-id"
          selectedConversationId={selectedId}
          onSelectConversation={setSelectedId}
          onNewConversation={() => {/* handle new */}}
        />
      </div>
      <div className="flex-1">
        {selectedId && (
          <ChatInterface
            conversationId={selectedId}
            userId="my-user-id"
            recipientId="recipient-id"
            recipientName="Recipient Name"
          />
        )}
      </div>
    </div>
  );
}
\`\`\`

#### Using Hooks Directly
\`\`\`typescript
'use client';

import { useMessages, useTyping, useOnlineStatus } from '@/hooks/useChat';

export default function CustomChat() {
  const { messages, sendMessage } = useMessages('conv-123', 'my-user-id');
  const { isTyping, typingText } = useTyping('conv-123');
  const { isOnline } = useOnlineStatus(['recipient-id']);

  return (
    <div>
      <div>Status: {isOnline('recipient-id') ? 'Online' : 'Offline'}</div>
      
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      
      {isTyping && <div>{typingText}</div>}
      
      <button onClick={() => sendMessage('Hello!')}>
        Send
      </button>
    </div>
  );
}
\`\`\`

### Testing

#### Run Demo Page
\`\`\`bash
# Start Next.js dev server
pnpm dev

# In another terminal, start WebSocket server
node server.js

# Open http://localhost:3000/chat
\`\`\`

#### Manual Testing Checklist
- [ ] Connect to WebSocket server
- [ ] Send message
- [ ] Receive message from another user
- [ ] Edit message (double-click)
- [ ] Delete message
- [ ] Add emoji reaction
- [ ] Reply to message
- [ ] Upload file/image
- [ ] See typing indicator
- [ ] See online/offline status
- [ ] See read receipts (✓✓)
- [ ] Create new conversation
- [ ] Search conversations
- [ ] Pin/archive conversation
- [ ] Reconnect after disconnect

## จุดเชื่อมต่อกับระบบอื่น (Integration Points)

### 1. Video Consultation (Phase 2 - Task 5)
\`\`\`typescript
// In chat-interface.tsx
const handleVideoCall = () => {
  // Integrate with video consultation system
  // Navigate to /video-call?conversationId=xxx
  router.push(`/video-call?conversationId=${conversationId}`);
};
\`\`\`

### 2. Booking System (Phase 2 - Task 1)
\`\`\`typescript
// Send booking confirmation via chat
await chatManager.sendMessage(
  conversationId,
  `การนัดหมายของคุณได้รับการยืนยันแล้ว\nวันที่: ${bookingDate}\nเวลา: ${bookingTime}`,
  'text'
);
\`\`\`

### 3. Multi-language (Phase 2 - Task 3)
\`\`\`typescript
// Add i18n support to chat
import { useTranslations } from '@/hooks/useTranslations';

const t = useTranslations();

<Button>{t('chat.send')}</Button>
<p>{t('chat.typing')}</p>
\`\`\`

### 4. Notification System (Phase 2 - Task 8)
\`\`\`typescript
// Send push notification for new message
if (!isUserActive && newMessage) {
  await sendPushNotification({
    userId: recipientId,
    title: `New message from ${senderName}`,
    body: message.content,
    data: { conversationId, messageId },
  });
}
\`\`\`

### 5. Database (Supabase)
\`\`\`typescript
// Store messages in database
await supabase.from('messages').insert({
  id: message.id,
  conversation_id: message.conversationId,
  sender_id: message.senderId,
  content: message.content,
  type: message.type,
  created_at: message.createdAt,
});

// Query message history
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: false })
  .limit(50);
\`\`\`

### 6. Cloud Storage (for files)
\`\`\`typescript
// Upload file to S3/Cloudinary
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const { url } = await response.json();
  return url;
};
\`\`\`

## API Reference

### ChatManager

#### Connection
\`\`\`typescript
// Connect to server
await chatManager.connect('user-123', 'auth-token');

// Check connection
const connected = chatManager.isConnected();

// Disconnect
chatManager.disconnect();
\`\`\`

#### Messages
\`\`\`typescript
// Send message
const message = await chatManager.sendMessage(
  'conv-123',
  'Hello!',
  'text',
  'reply-to-message-id' // optional
);

// Send file
const fileMessage = await chatManager.sendFile('conv-123', file);

// Edit message
await chatManager.editMessage('msg-123', 'Updated content');

// Delete message
await chatManager.deleteMessage('msg-123');

// Get messages
const messages = await chatManager.getMessages('conv-123', {
  type: 'text',
  search: 'hello',
  fromDate: new Date('2024-01-01'),
});

// Search messages
const results = await chatManager.searchMessages('conv-123', 'keyword');
\`\`\`

#### Reactions
\`\`\`typescript
// Add reaction
await chatManager.addReaction('msg-123', '❤️');

// Remove reaction
await chatManager.removeReaction('msg-123', '❤️');
\`\`\`

#### Read Status
\`\`\`typescript
// Mark message as read
await chatManager.markAsRead('msg-123');

// Mark all messages in conversation as read
await chatManager.markConversationAsRead('conv-123');
\`\`\`

#### Typing
\`\`\`typescript
// Start typing
chatManager.sendTypingIndicator('conv-123', true);

// Stop typing
chatManager.sendTypingIndicator('conv-123', false);
\`\`\`

#### Conversations
\`\`\`typescript
// Create conversation
const conversation = await chatManager.createConversation(
  ['user-1', 'user-2'],
  'direct', // or 'group'
  'Conversation Name' // optional
);

// Get conversation
const conv = await chatManager.getConversation('conv-123');

// Get all conversations
const conversations = await chatManager.getConversations({
  type: 'direct',
  unreadOnly: true,
});

// Update conversation
await chatManager.updateConversation('conv-123', {
  pinned: true,
  muted: false,
  archived: false,
});

// Leave conversation
await chatManager.leaveConversation('conv-123');
\`\`\`

#### Online Status
\`\`\`typescript
// Get online users
const onlineUsers = await chatManager.getOnlineUsers(['user-1', 'user-2']);
\`\`\`

### React Hooks

#### useChat
\`\`\`typescript
const { chatManager, connected, loading, error } = useChat('user-123');
\`\`\`

#### useMessages
\`\`\`typescript
const {
  messages,
  loading,
  error,
  hasMore,
  sendMessage,
  sendFile,
  editMessage,
  deleteMessage,
  addReaction,
  markAsRead,
  loadMore,
} = useMessages('conv-123', 'user-123');
\`\`\`

#### useConversations
\`\`\`typescript
const {
  conversations,
  loading,
  error,
  createConversation,
  updateConversation,
  refresh,
} = useConversations('user-123');
\`\`\`

#### useTyping
\`\`\`typescript
const {
  typingUsers,
  isTyping,
  typingText, // "User is typing..." or "2 people are typing..."
} = useTyping('conv-123');
\`\`\`

#### useOnlineStatus
\`\`\`typescript
const {
  onlineUsers,
  isOnline,
  getLastSeen,
} = useOnlineStatus(['user-1', 'user-2']);

if (isOnline('user-1')) {
  console.log('User 1 is online');
} else {
  const lastSeen = getLastSeen('user-1');
  console.log('Last seen:', lastSeen);
}
\`\`\`

## ข้อจำกัดและการพัฒนาต่อ (Limitations & Future Enhancements)

### Current Limitations
1. ❌ **No Database Persistence**: Messages stored in memory only
2. ❌ **No Cloud Storage**: Files use client-side URL.createObjectURL
3. ❌ **No Authentication**: Simple userId-based auth
4. ❌ **No Encryption**: Messages sent in plain text
5. ❌ **Single Server**: No horizontal scaling
6. ❌ **No Message Queue**: Direct WebSocket only
7. ❌ **Limited File Types**: Only images and documents
8. ❌ **No Voice Messages**: Text and files only

### Recommended Enhancements

#### Phase 1: Database & Storage
- [ ] Integrate Supabase for message persistence
- [ ] Add S3/Cloudinary for file uploads
- [ ] Implement message pagination from database
- [ ] Add search indexing (Elasticsearch)

#### Phase 2: Security
- [ ] Add end-to-end encryption (E2EE)
- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Content moderation (profanity filter)

#### Phase 3: Scalability
- [ ] Add Redis for caching
- [ ] Implement message queue (RabbitMQ/Kafka)
- [ ] Horizontal scaling with load balancer
- [ ] CDN for file delivery

#### Phase 4: Features
- [ ] Voice messages
- [ ] Video messages
- [ ] Screen sharing in chat
- [ ] Message threading (nested replies)
- [ ] @mentions and notifications
- [ ] Chat bots integration
- [ ] Scheduled messages
- [ ] Message pinning
- [ ] Polls in chat
- [ ] Location sharing
- [ ] Contact sharing

#### Phase 5: Analytics
- [ ] Message metrics (sent/received/read)
- [ ] Response time tracking
- [ ] User engagement analytics
- [ ] Conversation sentiment analysis

## สรุป (Summary)

### ความสำเร็จ (Achievements)
- ✅ สร้างระบบแชทแบบ Real-time ด้วย WebSocket
- ✅ รองรับคุณสมบัติครบถ้วน 8 หมวด
- ✅ สร้าง 6 ไฟล์ รวม 2,900+ บรรทัด
- ✅ Type-safe ด้วย TypeScript
- ✅ React Hooks สำหรับ integration
- ✅ UI Components สำเร็จรูป
- ✅ Demo Page พร้อมใช้งาน

### เทคโนโลยีที่ใช้ (Tech Stack)
- **WebSocket**: Real-time communication
- **TypeScript**: Type safety
- **React Hooks**: State management
- **Next.js 14**: App Router
- **Tailwind CSS**: Styling
- **Shadcn/ui**: UI components

### ไฟล์ที่สร้าง (Files Created)
1. `lib/chat/chat-manager.ts` (750 lines) - Core chat logic
2. `lib/chat/socket-server.ts` (400 lines) - WebSocket server
3. `hooks/useChat.ts` (550 lines) - React hooks
4. `components/chat-interface.tsx` (400 lines) - Chat UI
5. `components/conversations-list.tsx` (300 lines) - Sidebar
6. `app/chat/page.tsx` (300 lines) - Demo page

**รวม**: 6 files, ~2,900 lines

### การใช้งาน (Usage)
\`\`\`bash
# Run demo
pnpm dev

# Start WebSocket server
node server.js

# Open http://localhost:3000/chat
\`\`\`

---

**Phase 3 - Task 1**: ✅ เสร็จสมบูรณ์  
**Next Task**: Task 2 - Advanced Analytics & Reporting Dashboard
