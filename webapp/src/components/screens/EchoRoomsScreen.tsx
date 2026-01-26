import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, PlusCircle } from 'lucide-react';
import { getChatrooms, createChatrooms, getFavChatrooms } from '@/api/chatRoomApi';
import { toast } from 'react-toastify';
import ChatScreen from './ChatScreen';
import Navigation from '../ui/Navigation';
import './EchoRoomsScreen.css';

interface RoomItem {
  id: string;
  name: string;
  messageCount: number;
  isHighlighted: boolean;
  creatorId: string;
}

const EchoRoomsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [echoRooms, setEchoRooms] = useState<any[]>([]);
  const [favRoomIDs, setFavRoomIds] = useState<string[]>([]);

  const handleCreateRoom = async () => {
    if (roomName.trim()) {
      try {
        const res = await createChatrooms(roomName);
        setMessage(`'${res.name}' echoroom created`);
        setShowUpdateModal(true);

        setRoomName('');
        setModalVisible(false);

        setTimeout(() => {
          setShowUpdateModal(false);
          setMessage('');
        }, 3000);
      } catch (error: any) {
        console.log('Error creating room:', error.message);
        setMessage('You can only create up to 3 EchoRooms');
        setShowUpdateModal(true);
        setTimeout(() => {
          setShowUpdateModal(false);
          setMessage('');
        }, 3000);
      }
    }
  };

  const rooms = useCallback((): RoomItem[] => {
    return echoRooms.map((room: any, index: number) => ({
      id: room._id,
      name: room.name,
      messageCount: room.messageCount,
      isHighlighted: index % 2 === 0,
      creatorId: room.creatorId,
    }));
  }, [echoRooms]);

  const handleRoomPress = (roomName: string, roomId: string, creatorId: string) => {
    console.log('creatorId', creatorId);
    setCreatorId(creatorId);
    setSelectedRoom(roomName);
    setSelectedRoomId(roomId);
  };

  const handleBackFromChat = async () => {
    setSelectedRoom(null);
    setLoading(true);

    await getChatrooms().then((rooms) => {
      setLoading(false);
      setEchoRooms(rooms.map((room: any) => room));
    });
    setLoading(false);

    FavChatrooms();
  };

  const getRooms = useCallback(async () => {
    try {
      setLoading(true);

      const rooms = await getChatrooms();
      setEchoRooms(rooms.map((room: any) => room));
      setLoading(false);
    } catch (error) {
      setLoading(false);

      console.error('Error fetching rooms:', error);
    }
  }, []);

  useEffect(() => {
    getRooms();
  }, [getRooms, showUpdateModal]);

  const FavChatrooms = async () => {
    await getFavChatrooms().then((rooms) => {
      setFavRoomIds(rooms.map((room: any) => room?.roomId?._id));
      console.log('rrr', rooms);
    });
  };

  useEffect(() => {
    FavChatrooms();
  }, []);

  // If a room is selected, show the chat screen
  if (selectedRoom) {
    return (
      <ChatScreen
        roomName={selectedRoom}
        roomId={selectedRoomId || ''}
        onBack={handleBackFromChat}
        isFav={favRoomIDs.some(id => id === selectedRoomId)}
        creatorId={creatorId}
      />
    );
  }

  return (
    <div className="echoroom-container">
      {/* Header */}
      <div className="echoroom-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={24} color="#000" />
        </button>
        <h1 className="header-title">Echo Rooms</h1>
      </div>

      {/* Room List */}
      <div className="room-list">
        {loading && rooms().length === 0 ? (
          <div className="empty-container">
            <div className="loading-indicator">
              <div className="loading-spinner" />
            </div>
            <p className="empty-text">Loading Rooms...</p>
          </div>
        ) : rooms().length === 0 ? (
          <div className="empty-container">
            <p className="empty-text">No Echo Rooms yet</p>
          </div>
        ) : (
          rooms().map((item) => (
            <button
              key={item.id}
              className={`room-item ${item.isHighlighted ? 'room-item-highlighted' : ''}`}
              onClick={() => handleRoomPress(item.name, item.id, item.creatorId)}
            >
              <div className="room-content">
                <div className="room-left">
                  {favRoomIDs.includes(item.id) && (
                    <div className="heart-icon">
                      <Heart size={24} color="#ff6b35" fill="#ff6b35" />
                    </div>
                  )}
                  <p className="room-name">{item.name}</p>
                </div>
                <div className="room-right">
                  <p className="message-count">{item.messageCount} new messages</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Create Button */}
      <button className="create-button" onClick={() => setModalVisible(true)}>
        <div className="create-button-inner">
          {/* <PlusCircle size={56} color="#ff6b35" fill="#ff6b35" /> */}
          <img src='../../../assets/images/plus-circle.svg' alt="Plus" />
        </div>
        <p className="create-text">create</p>
      </button>

      {/* Create Room Modal */}
      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-background">
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              {/* Info Message */}
              <div className="info-message">
                <p className="info-text">You can create up to 3 echorooms</p>
              </div>

              {/* Input Container */}
              <div className="input-container">
                <div className="input-row">
                  <div className="avatar-placeholder" />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Name your Echo room"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    autoFocus={true}
                  />
                </div>

                <button className="create-modal-button" onClick={handleCreateRoom}>
                  <span className="create-modal-button-text">create</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message Modal */}
      {showUpdateModal && (
        <>
          <div className="toast-overlay" />
          <div className="toast-container">
            <p className="toast-message">{message}</p>
          </div>
        </>
      )}

      {/* Navigation */}
      <Navigation initialTab="Echoroom" />
    </div>
  );
};

export default EchoRoomsScreen;
