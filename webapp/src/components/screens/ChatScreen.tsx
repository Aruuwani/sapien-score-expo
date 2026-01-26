import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Heart, Send, AlignLeft, Flag, Edit, Trash2, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { GetMessages, SendMessage, ReactMessages } from '@/api/messageApi';
import { getUserProfile } from '@/api/userApi';
import { makeFavChatrooms, deleteFavChatrooms, UpdateChatroomsName, deleteChatrooms } from '@/api/chatRoomApi';
import { formatTime } from '@/utils/date';
import ChatReportDialog from '../ui/ChatReportDialog';
import SuccessMessageModal from '../ui/SuccessMessageModal';
import ConfirmationModal from '../ui/ConfirmationModal';
import './ChatScreen.css';

// Socket server URL - using the production API base
const SOCKET_URL = 'https://sapio.one';

interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isOwnMessage: boolean;
  likes: number;
  laughs: number;
  plusOnes: number;
  replies?: Message[];
  isReply?: boolean;
  parentMessageId?: string;
  reactions?: any[];
}

interface ChatScreenProps {
  roomName: string;
  roomId: string;
  onBack: () => void;
  isFav: boolean;
  creatorId: string | null;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ roomName, roomId, onBack, isFav, creatorId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [replyingMessage, setReplyingMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favRoom, setFavRoom] = useState(isFav);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentUserIdRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReply = (messageId: string, replyMessage: string) => {
    console.log('🔵 handleReply called:', { messageId, replyMessage });
    inputRef.current?.focus();
    setReplyingTo(messageId);
    setReplyingMessage(replyMessage);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyingMessage('');
  };

  const handleReact = async (messageId: string, emoji: string) => {
    console.log('🟠 handleReact called:', { messageId, emoji });
    try {
      const result = await ReactMessages(messageId, emoji);
      console.log('✅ Reaction result:', result);
      // Socket.io will broadcast the update to all clients including this one
    } catch (error) {
      console.error('❌ Error reacting to message:', error);
    }
  };


  const handleSend = async () => {
    if (inputMessage.trim()) {
      const tempId = `temp-${Date.now()}`;
      const messageContent = inputMessage;

      // Save replyingTo before clearing it
      const currentReplyingTo = replyingTo;

      // Clear input immediately for responsiveness
      setInputMessage('');
      setReplyingTo(null);
      setReplyingMessage('');

      try {
        if (currentReplyingTo) {
          // Send as a reply
          await SendMessage(roomId, messageContent, true, currentReplyingTo);
        } else {
          // Send as a regular message
          await SendMessage(roomId, messageContent);
        }
        // Socket.io will broadcast the message to all clients including this one
      } catch (error) {
        console.error('Error sending message:', error);
        // Show error to user - message failed to send
      }
    }
  };


  const handleHeartPress = async () => {
    await makeFavChatrooms(roomId);
    setFavRoom(true);
  };

  const handleDeleteFav = async () => {
    await deleteFavChatrooms(roomId);
    setFavRoom(false);
  };

  const handleRenameRoom = () => {
    setRenameModalVisible(true);
    setIsMenuOpen(false);
  };

  const handleUpdateRoomName = async () => {
    await UpdateChatroomsName(roomId, newRoomName);
    setRenameModalVisible(false);
  };

  const handleDeleteRoom = async () => {
    await deleteChatrooms(roomId);
    setShowDeleteModal(false);
    onBack();
  };

  const handleReportClick = () => {
    setShowReportModal(true);
    setIsMenuOpen(false);
  };

  const handleReportSuccess = () => {
    setShowReportSuccessModal(true);
    setTimeout(() => {
      setShowReportSuccessModal(false);
    }, 3000);
  };

  const getMessages = useCallback(async () => {
    if (roomId) {
      const response = await getUserProfile();
      const userId = response?.user?._id || '';
      setCurrentUserId(userId);
      currentUserIdRef.current = userId;
      setIsCreator(creatorId === userId);

      const messagesData = await GetMessages(roomId);
      const transformed = transformApiMessages(messagesData, userId);
      setMessages(transformed);
      setLoading(false);
    }
  }, [roomId, creatorId]);

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  // Socket.io connection for real-time messaging
  // Polling fallback for real-time messages (works until Socket.io backend is deployed)
  // Will try Socket.io first, falls back to polling if connection fails
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    let isSocketConnected = false;
    let pollingInterval: ReturnType<typeof setInterval> | null = null;

    // Try to connect to socket server
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected:', socketRef.current?.id);
      isSocketConnected = true;
      // Clear polling if socket connects
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      // Join the chat room
      socketRef.current?.emit('joinRoom', roomId);
    });

    socketRef.current.on('connect_error', (error) => {
      console.log('🔌 Socket connection error, using polling fallback:', error.message);
      isSocketConnected = false;

      // Start polling fallback if socket fails
      if (!pollingInterval) {
        console.log('🔄 Starting polling fallback (every 3 seconds)');
        pollingInterval = setInterval(async () => {
          try {
            const messagesData = await GetMessages(roomId);
            const transformed = transformApiMessages(messagesData, currentUserIdRef.current);
            setMessages(transformed);
          } catch (err) {
            console.error('Polling error:', err);
          }
        }, 3000); // Poll every 3 seconds
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      isSocketConnected = false;
    });

    // Listen for new messages (when socket is available)
    socketRef.current.on('newMessage', (message: any) => {
      console.log('📨 New message received:', message);

      // Transform the incoming message to match our Message interface
      const newMessage: Message = {
        id: message._id,
        username: message.senderName,
        message: message.content,
        timestamp: formatTime(message.timestamp),
        isOwnMessage: message.senderId === currentUserIdRef.current,
        reactions: message.reactions || [],
        likes: message.reactions?.filter((r: any) => r.emoji === 'heart').length || 0,
        laughs: message.reactions?.filter((r: any) => r.emoji === 'smile').length || 0,
        plusOnes: message.reactions?.filter((r: any) => r.emoji === 'plusOne').length || 0,
        replies: [],
        isReply: message.isReply,
        parentMessageId: message.parentMessageId,
      };

      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) return prev;

        // If it's a reply, add to parent's replies
        if (newMessage.isReply && newMessage.parentMessageId) {
          return prev.map(m => {
            if (m.id === newMessage.parentMessageId) {
              return {
                ...m,
                replies: [...(m.replies || []), newMessage]
              };
            }
            return m;
          });
        }

        // Otherwise add as new message
        return [...prev, newMessage];
      });
    });

    // Listen for reaction updates (when socket is available)
    socketRef.current.on('messageReaction', (data: { messageId: string; reactions: any[] }) => {
      console.log('💬 Reaction update received:', data);

      setMessages(prev => prev.map(msg => {
        if (msg.id === data.messageId) {
          return {
            ...msg,
            reactions: data.reactions,
            likes: data.reactions?.filter((r: any) => r.emoji === 'heart').length || 0,
            laughs: data.reactions?.filter((r: any) => r.emoji === 'smile').length || 0,
            plusOnes: data.reactions?.filter((r: any) => r.emoji === 'plusOne').length || 0,
          };
        }
        // Also check replies
        if (msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply => {
              if (reply.id === data.messageId) {
                return {
                  ...reply,
                  reactions: data.reactions,
                  likes: data.reactions?.filter((r: any) => r.emoji === 'heart').length || 0,
                  laughs: data.reactions?.filter((r: any) => r.emoji === 'smile').length || 0,
                  plusOnes: data.reactions?.filter((r: any) => r.emoji === 'plusOne').length || 0,
                };
              }
              return reply;
            })
          };
        }
        return msg;
      }));
    });

    // Cleanup on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', roomId);
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);



  const transformApiMessages = (apiMessages: any[], currentUserId: string): Message[] => {
    const messageMap = new Map<string, Message>();

    apiMessages.forEach(msg => {
      messageMap.set(msg._id, {
        id: msg._id,
        username: msg.senderName,
        message: msg.content,
        timestamp: formatTime(msg.timestamp),
        isOwnMessage: msg.senderId === currentUserId,
        reactions: msg.reactions,
        likes: msg.reactions?.filter((r: any) => r.emoji === 'heart').length || 0,
        laughs: msg.reactions?.filter((r: any) => r.emoji === 'smile').length || 0,
        plusOnes: msg.reactions?.filter((r: any) => r.emoji === 'plusOne').length || 0,
        replies: [],
      });
    });

    const result: Message[] = [];

    apiMessages.forEach(msg => {
      if (msg.parentMessageId) {
        const parent = messageMap.get(msg.parentMessageId);
        if (parent) {
          parent.replies!.push(messageMap.get(msg._id)!);
        }
      } else {
        result.push(messageMap.get(msg._id)!);
      }
    });

    return result;
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-top">
          <p className="header-subtext">all the messages disappear after 24 hours of viewing</p>
        </div>
        <div className="header-main">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={24} color="#000" />
          </button>
          <h1 className="header-title">{newRoomName || roomName}</h1>
          <div className="header-right">
            <button className="heart-button" onClick={favRoom ? handleDeleteFav : handleHeartPress}>
              <Heart size={24} color={favRoom ? "#ff6b35" : "#000"} fill={favRoom ? "#ff6b35" : "none"} />
            </button>
            <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <AlignLeft size={24} color="#000" />
            </button>
          </div>
        </div>

        {/* Menu Dropdown */}
        {isMenuOpen && (
          <>
            <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
            <div className="menu-container">
              <button className="menu-item" onClick={handleReportClick}>
                <Flag size={20} />
                <span>report room</span>
              </button>
              {isCreator && (
                <>
                  <button className="menu-item" onClick={handleRenameRoom}>
                    <Edit size={20} />
                    <span>rename room</span>
                  </button>
                  <button className="menu-item" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 size={20} />
                    <span>delete room</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages List */}
      <div className="messages-list">
        {loading && messages.length === 0 ? (
          <div className="empty-container">
            <div className="loading-spinner" />
            <p className="empty-text">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-container">
            <p className="empty-text">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="message-group">
              {/* Main Message */}
              <div className={`message-container ${message.isOwnMessage ? 'own-message' : 'other-message'}`}>
                <div className={`message-bubble ${message.isOwnMessage ? 'own-bubble' : 'other-bubble'}`}>
                  <div className="message-header">
                    <span className="message-username">{message.username}</span>
                    <span className="message-timestamp">{message.timestamp.toUpperCase()}</span>
                  </div>
                  <div className="message-text-container">
                    {message.isOwnMessage && (
                      <button className="reply-icon" onClick={() => handleReply(message.id, message.message)}>
                        ↩
                      </button>
                    )}
                    <p className="message-text">{message.message}</p>
                    {!message.isOwnMessage && (
                      <button className="reply-icon" onClick={() => handleReply(message.id, message.message)}>
                        ↩
                      </button>
                    )}
                  </div>
                  <div className="reactions-container">
                    <button className="reaction" onClick={() => handleReact(message.id, 'heart')}>
                      <Heart
                        size={20}
                        color={message.reactions?.some(r => r.userId === currentUserId && r.emoji === 'heart') ? "#ff6b35" : message.isOwnMessage ? "#fff" : "#000"}
                        fill={message.reactions?.some(r => r.userId === currentUserId && r.emoji === 'heart') ? "#ff6b35" : "none"}
                      />
                      <span className={message.isOwnMessage ? 'own-reaction-text' : 'other-reaction-text'}>{message.likes}</span>
                    </button>
                    <button className="reaction" onClick={() => handleReact(message.id, 'smile')}>
                      <span className="emoji-reaction">😊</span>
                      <span className={message.isOwnMessage ? 'own-reaction-text' : 'other-reaction-text'}>{message.laughs}</span>
                    </button>
                    <button className="reaction" onClick={() => handleReact(message.id, 'plusOne')}>
                      <span className="plus-one-text">+1</span>
                      <span className={message.isOwnMessage ? 'own-reaction-text' : 'other-reaction-text'}>{message.plusOnes}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {message.replies && message.replies.map((reply, index) => (
                <div key={reply.id} className={`reply-wrapper ${message.isOwnMessage ? 'own-reply' : 'other-reply'}`}>
                  <div className={`connecting-line ${message.isOwnMessage ? 'own-line' : 'other-line'} ${index === message.replies!.length - 1 ? 'last-line' : ''}`} />
                  <div className={`reply-container ${message.isOwnMessage ? 'own-reply-container' : 'other-reply-container'}`}>
                    <div className={`reply-bubble ${message.isOwnMessage ? 'own-reply-bubble' : 'other-reply-bubble'}`}>
                      <div className="reply-header">
                        <span className="reply-username">{reply.username}</span>
                        <span className="reply-timestamp">{reply.timestamp.toUpperCase()}</span>
                      </div>
                      <div className="reply-content">
                        <p className="reply-text">{reply.message}</p>
                      </div>
                      <div className="reply-reactions">
                        <button className="reaction" onClick={() => handleReact(reply.id, 'heart')}>
                          <Heart size={20} color={reply.reactions?.some(r => r.userId === currentUserId && r.emoji === 'heart') ? "#ff6b35" : message.isOwnMessage ? "#fff" : "#000"} fill={reply.reactions?.some(r => r.userId === currentUserId && r.emoji === 'heart') ? "#ff6b35" : "none"} />
                          <span className={message.isOwnMessage ? 'own-reaction-text' : 'other-reaction-text'}>{reply.likes}</span>
                        </button>
                        <button className="reaction" onClick={() => handleReact(reply.id, 'smile')}>
                          <span className="emoji-reaction">😊</span>
                          <span className={message.isOwnMessage ? 'own-reaction-text' : 'other-reaction-text'}>{reply.laughs}</span>
                        </button>
                        <button className="reaction" onClick={() => handleReact(reply.id, 'plusOne')}>
                          <span className="plus-one-text">+1</span>
                          <span className={message.isOwnMessage ? 'own-reaction-text' : 'other-reaction-text'}>{reply.plusOnes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {replyingTo ? (
        <div className="reply-input-wrapper">
          <div className="reply-indicator">
            <p className="reply-indicator-text">{replyingMessage}</p>
            <button className="cancel-reply" onClick={cancelReply}>
              <X size={15} color="#666" />
            </button>
          </div>
          <div className="input-container">
            <div className="input-row">
              <div className="avatar-placeholder" />
              <input
                ref={inputRef}
                type="text"
                className="text-input"
                placeholder="type your reply"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button className="send-button-modal" onClick={handleSend}>
              reply
            </button>
          </div>
        </div>
      ) : (
        <div className="input-container">
          <div className="input-row">
            <input
              ref={inputRef}
              type="text"
              className="text-input"
              placeholder="type your message here"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-button" onClick={handleSend}>
              <Send size={24} color="#ff6b35" />
            </button>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalVisible && (
        <div className="modal-overlay" onClick={() => setRenameModalVisible(false)}>
          <div className="modal-background">
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="info-message">
                <p className="info-text">Rename your echoroom</p>
              </div>
              <div className="input-container">
                <div className="input-row">
                  <div className="avatar-placeholder" />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="New room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    autoFocus
                  />
                </div>
                <button className="create-modal-button" onClick={handleUpdateRoomName}>
                  <span className="create-modal-button-text">rename</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        message="Are you sure you want to delete the room ?"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRoom}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Report Room Modal */}
      <ChatReportDialog
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        roomId={roomId}
        onReportSuccess={handleReportSuccess}
      />

      {/* Report Success Modal */}
      <SuccessMessageModal
        visible={showReportSuccessModal}
        message="successfully reported"
        onClose={() => setShowReportSuccessModal(false)}
      />
    </div>
  );
};

export default ChatScreen;
