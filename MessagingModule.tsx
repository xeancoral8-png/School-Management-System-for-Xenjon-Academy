import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Plus, Search, Send, MessageSquare, Eye, Reply, Trash2, Smile, Image, Paperclip } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  senderName: string;
  recipientName: string;
  hasEmoji?: boolean;
  attachments?: string[];
};

type MessagingModuleProps = {
  user: any;
  onUpdateNotifications: () => void;
};

// Common emojis for quick access
const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗',
  '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '✊',
  '📚', '📖', '📝', '✏️', '🖊️', '🖋️', '📎', '📐', '📏', '📌',
  '💯', '🔥', '⭐', '🌟', '✨', '🎉', '🎊', '👏', '🙌', '🤝'
];

// Sample GIF URLs (in a real app, these would come from a GIF API like GIPHY)
const sampleGifs = [
  'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif',
  'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
  'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
  'https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif',
  'https://media.giphy.com/media/3o7aCSPqXE5C6T8tBC/giphy.gif'
];

export function MessagingModule({ user, onUpdateNotifications }: MessagingModuleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [users, setUsers] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  
  const [composeForm, setComposeForm] = useState({
    recipientId: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    loadMessages();
    loadUsers();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, activeTab]);

  const loadMessages = () => {
    const allMessages = JSON.parse(localStorage.getItem('xenjonMessages') || '[]');
    setMessages(allMessages);
  };

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
    // For students, show only faculty. For faculty, show only students. For admin, show all.
    let availableUsers = [];
    
    if (user.role === 'student') {
      availableUsers = allUsers.filter((u: any) => u.role === 'faculty');
    } else if (user.role === 'faculty') {
      availableUsers = allUsers.filter((u: any) => u.role === 'student');
    } else {
      availableUsers = allUsers.filter((u: any) => u.id !== user.id);
    }
    
    setUsers(availableUsers);
  };

  const filterMessages = () => {
    let filtered = messages;

    if (activeTab === 'inbox') {
      filtered = filtered.filter(msg => msg.recipientId === user.id);
    } else {
      filtered = filtered.filter(msg => msg.senderId === user.id);
    }

    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by timestamp, newest first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredMessages(filtered);
  };

  const generateMessageId = () => {
    const existingIds = messages.map(m => parseInt(m.id.slice(3))).filter(id => !isNaN(id));
    const nextId = Math.max(0, ...existingIds) + 1;
    return `MSG${nextId.toString().padStart(3, '0')}`;
  };

  const insertEmoji = (emoji: string) => {
    setComposeForm(prev => ({
      ...prev,
      message: prev.message + emoji
    }));
    setShowEmojiPicker(false);
  };

  const insertGif = (gifUrl: string) => {
    setComposeForm(prev => ({
      ...prev,
      message: prev.message + ` [GIF: ${gifUrl}] `
    }));
    setShowGifPicker(false);
  };

  const renderMessageContent = (message: string) => {
    // Replace GIF placeholders with actual images
    const gifRegex = /\[GIF: (.*?)\]/g;
    
    if (gifRegex.test(message)) {
      const parts = message.split(gifRegex);
      return (
        <div className="space-y-2">
          {parts.map((part, index) => {
            if (part.startsWith('http') && (part.includes('giphy.gif') || part.includes('.gif'))) {
              return (
                <img 
                  key={index}
                  src={part} 
                  alt="GIF" 
                  className="max-w-xs rounded-lg"
                  style={{ maxHeight: '200px' }}
                />
              );
            }
            return part ? <p key={index}>{part}</p> : null;
          })}
        </div>
      );
    }

    return <div className="whitespace-pre-wrap">{message}</div>;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!composeForm.recipientId || !composeForm.subject || !composeForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    const recipient = users.find(u => u.id === composeForm.recipientId);
    if (!recipient) {
      toast.error('Invalid recipient');
      return;
    }

    // Check if message contains emojis or GIFs
    const hasEmoji = /[\p{Emoji}]/u.test(composeForm.message) || composeForm.message.includes('[GIF:');

    const newMessage: Message = {
      id: generateMessageId(),
      senderId: user.id,
      recipientId: composeForm.recipientId,
      subject: composeForm.subject,
      message: composeForm.message,
      timestamp: new Date().toISOString(),
      read: false,
      senderName: `${user.firstName} ${user.lastName}`,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      hasEmoji
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('xenjonMessages', JSON.stringify(updatedMessages));

    // Create notification for recipient
    const notifications = JSON.parse(localStorage.getItem('xenjonNotifications') || '[]');
    const newNotification = {
      id: `NOT${Date.now()}`,
      userId: composeForm.recipientId,
      type: 'message',
      title: `New Message from ${user.firstName} ${user.lastName}`,
      message: `Subject: ${composeForm.subject}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    notifications.push(newNotification);
    localStorage.setItem('xenjonNotifications', JSON.stringify(notifications));

    toast.success('Message sent successfully! 📨');
    setComposeForm({ recipientId: '', subject: '', message: '' });
    setIsComposeOpen(false);
  };

  const handleMarkAsRead = (messageId: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
    localStorage.setItem('xenjonMessages', JSON.stringify(updatedMessages));
    onUpdateNotifications();
  };

  const handleReply = (originalMessage: Message) => {
    setComposeForm({
      recipientId: originalMessage.senderId,
      subject: originalMessage.subject.startsWith('Re: ') ? originalMessage.subject : `Re: ${originalMessage.subject}`,
      message: `\n\n--- Original Message ---\nFrom: ${originalMessage.senderName}\nSubject: ${originalMessage.subject}\n\n${originalMessage.message}`
    });
    setIsComposeOpen(true);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    localStorage.setItem('xenjonMessages', JSON.stringify(updatedMessages));
    setSelectedMessage(null);
    toast.success('Message deleted');
  };

  const unreadCount = messages.filter(msg => msg.recipientId === user.id && !msg.read).length;

  return (
    <div className="min-h-full" style={{ backgroundColor: '#E8F4FD' }}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Messages 💬</h1>
            <p className="text-muted-foreground">Communicate with faculty and students</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose New Message ✉️</DialogTitle>
                <DialogDescription>
                  Send a message with emojis and GIFs to faculty or students in the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select value={composeForm.recipientId} onValueChange={(value) => setComposeForm({ ...composeForm, recipientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    placeholder="Enter message subject"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <div className="space-y-2">
                    <Textarea
                      id="message"
                      value={composeForm.message}
                      onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                      placeholder="Type your message here... You can use emojis! 😊"
                      rows={6}
                      required
                    />
                    
                    {/* Message Tools */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="w-4 h-4 mr-1" />
                        Emoji
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGifPicker(!showGifPicker)}
                      >
                        <Image className="w-4 h-4 mr-1" />
                        GIF
                      </Button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="p-3 border rounded-lg bg-background">
                        <div className="grid grid-cols-10 gap-2">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              className="p-1 hover:bg-muted rounded text-lg"
                              onClick={() => insertEmoji(emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* GIF Picker */}
                    {showGifPicker && (
                      <div className="p-3 border rounded-lg bg-background">
                        <div className="grid grid-cols-3 gap-2">
                          {sampleGifs.map((gif, index) => (
                            <img
                              key={index}
                              src={gif}
                              alt={`GIF ${index + 1}`}
                              className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                              onClick={() => insertGif(gif)}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Click on a GIF to add it to your message
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Messages
                  </CardTitle>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
                
                {/* Tabs */}
                <div className="flex space-x-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={activeTab === 'inbox' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setActiveTab('inbox')}
                  >
                    📥 Inbox
                  </Button>
                  <Button
                    variant={activeTab === 'sent' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setActiveTab('sent')}
                  >
                    📤 Sent
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {filteredMessages.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No messages found</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${
                            selectedMessage?.id === msg.id ? 'bg-muted' : ''
                          } ${!msg.read && activeTab === 'inbox' ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (!msg.read && msg.recipientId === user.id) {
                              handleMarkAsRead(msg.id);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">
                                  {activeTab === 'inbox' ? msg.senderName : msg.recipientName}
                                </p>
                                {!msg.read && activeTab === 'inbox' && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                {msg.hasEmoji && (
                                  <Badge variant="outline" className="text-xs">✨</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{msg.subject}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMessage ? selectedMessage.subject : 'Select a message to read'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          From: {selectedMessage.senderName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          To: {selectedMessage.recipientName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedMessage.timestamp).toLocaleString()}
                        </p>
                        {selectedMessage.hasEmoji && (
                          <Badge variant="outline" className="mt-1">
                            ✨ Contains media
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {selectedMessage.senderId !== user.id && (
                          <Button variant="outline" size="sm" onClick={() => handleReply(selectedMessage)}>
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteMessage(selectedMessage.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="prose max-w-none">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {renderMessageContent(selectedMessage.message)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Select a message from the list to read its content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}