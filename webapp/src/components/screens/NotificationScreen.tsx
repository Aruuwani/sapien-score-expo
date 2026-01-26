import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getNotifications } from '@/api/notificationApi';
import './NotificationScreen.css';

interface NotificationItem {
  _id: string;
  user_id: string;
  created_by: {
    _id: string;
    email: string | null;
    name: string;
  };
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface MessageItem {
  id: string;
  type: string;
  sender: string;
  content: string;
  isNew?: boolean;
  date: string;
  hasResponse?: boolean;
  response?: string;
}

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Placeholder message items (not implemented in mobile app yet)
  const messageItems: MessageItem[] = [
    {
      id: '5',
      type: 'message',
      sender: 'Bhanu Prakash',
      content: 'What do you think about my performance in the last 6 months?',
      isNew: true,
      date: '23-04-2024',
    },
    {
      id: '6',
      type: 'message',
      sender: 'Shubham',
      content: 'What do you think about my performance in the last 6 months?',
      isNew: true,
      date: '23-04-2024',
    },
    {
      id: '7',
      type: 'message',
      sender: 'Jithendar',
      content: 'What do you think about my performance in the last 6 months?',
      isNew: true,
      date: '23-04-2024',
    },
    {
      id: '8',
      type: 'message',
      sender: 'Sameer Saini',
      content: 'What do you think I need to learn to be a better guitar player?',
      date: '23-04-2024',
      hasResponse: true,
      response: 'I think he can bhanu can be better at playing guitar if he practices more on strumming and tuning. Watch and learn from performers',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data: NotificationItem[] = await getNotifications();
        const sorted = data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNotifications(sorted);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const items = activeTab === 'notifications' ? notifications : messageItems;

  const renderNotificationItem = (item: NotificationItem | MessageItem) => {
    if (activeTab === 'notifications') {
      const notif = item as NotificationItem;
      return (
        <div key={notif._id} className="notification-item">
          <p className="notification-text">{notif.message}</p>
        </div>
      );
    } else {
      const msg = item as MessageItem;
      return (
        <div key={msg.id} className="message-item">
          <div className="message-header">
            <div>
              <p className="message-sender">{msg.sender} asks</p>
            </div>
            <p className="message-date">{msg.date}</p>
          </div>
          <p className="message-content">{msg.content}</p>

          {!msg.hasResponse ? (
            <button className="respond-button">
              <span className="respond-button-text">respond</span>
            </button>
          ) : (
            <div className="response-container">
              <p className="response-label">your response</p>
              <p className="response-text">{msg.response}</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="notification-screen-container">
      {/* Header */}
      <div className="notification-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={24} color="#000" />
        </button>
        <h1 className="header-title">Messages & Alerts</h1>
      </div>

      {/* Tab Container */}
      <div className="tab-container">
        <button
          className={`tab ${activeTab === 'notifications' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <div className="tab-content-wrapper">
            <span className="tab-text">Notifications</span>
            {activeTab === 'messages' && <div className="red-dot" />}
          </div>
        </button>
        <button
          className={`tab ${activeTab === 'messages' ? 'active-tab' : ''}`}
          // onClick={() => setActiveTab('messages')} // Disabled in mobile app
        >
          <div className="tab-content-wrapper">
            {/* Messages tab is disabled in mobile app */}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className={`notification-content ${loading ? 'loading-content' : ''}`}>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-container">
            <p className="empty-text">No new Notification</p>
          </div>
        ) : (
          items.map(item => renderNotificationItem(item))
        )}
      </div>
    </div>
  );
};

export default NotificationScreen;
