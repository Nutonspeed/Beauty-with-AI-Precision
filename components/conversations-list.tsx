'use client';

/**
 * Conversations List Component
 * Shows all chat conversations with search and filters
 */

import { useState } from 'react';
import { Search, Plus, MessageSquare, Archive, Settings } from 'lucide-react';
import { useConversations } from '@/hooks/useChat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ConversationsListProps {
  userId: string;
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ConversationsList({
  userId,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  const { conversations, loading, error, createConversation: _createConversation, updateConversation, refresh: _refresh } =
    useConversations(userId);

  const formatTime = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes}น`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}ช`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}ว`;
    
    return messageDate.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
  };

  const filteredConversations = conversations.filter(conv => {
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!conv.name?.toLowerCase().includes(query) &&
          !conv.lastMessage?.content.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Filter by tab
    if (activeTab === 'unread' && conv.unreadCount === 0) return false;
    if (activeTab === 'archived' && !conv.archived) return false;
    if (activeTab === 'all' && conv.archived) return false;

    return true;
  });

  const handleArchive = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    await updateConversation(conversationId, { archived: true });
  };

  const _handlePin = async (e: React.MouseEvent, conversationId: string, pinned: boolean) => {
    e.stopPropagation();
    await updateConversation(conversationId, { pinned: !pinned });
  };

  const _handleMute = async (e: React.MouseEvent, conversationId: string, muted: boolean) => {
    e.stopPropagation();
    await updateConversation(conversationId, { muted: !muted });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">ข้อความ</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onNewConversation}>
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาข้อความ..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 px-4">
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="unread">
            ยังไม่อ่าน
            {conversations.filter(c => c.unreadCount > 0 && !c.archived).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {conversations.filter(c => c.unreadCount > 0 && !c.archived).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived">เก็บถาวร</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1 m-0">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">กำลังโหลด...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-red-500">เกิดข้อผิดพลาด: {error}</div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p>ไม่มีข้อความ</p>
                {activeTab === 'all' && (
                  <Button
                    variant="link"
                    onClick={onNewConversation}
                    className="mt-2"
                  >
                    เริ่มสนทนาใหม่
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations
                  .sort((a, b) => {
                    // Pinned first
                    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                    // Then by last message time
                    const aTime = a.lastMessage?.createdAt?.getTime() || 0;
                    const bTime = b.lastMessage?.createdAt?.getTime() || 0;
                    return bTime - aTime;
                  })
                  .map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversationId === conversation.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar>
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>
                            {conversation.name?.[0] || conversation.type[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {conversation.name || `${conversation.type} chat`}
                            {conversation.pinned && (
                              <span className="ml-2 text-xs text-blue-500">📌</span>
                            )}
                            {conversation.muted && (
                              <span className="ml-2 text-xs text-gray-400">🔇</span>
                            )}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(conversation.lastMessage?.createdAt)}
                          </span>
                        </div>

                        {conversation.lastMessage && (
                          <p
                            className={`text-sm truncate ${
                              conversation.unreadCount > 0
                                ? 'font-semibold text-gray-900'
                                : 'text-gray-500'
                            }`}
                          >
                            {conversation.lastMessage.type === 'image' && '📷 '}
                            {conversation.lastMessage.type === 'file' && '📎 '}
                            {conversation.lastMessage.content || 'ไฟล์แนบ'}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleArchive(e, conversation.id)}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
