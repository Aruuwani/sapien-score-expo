import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { use, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, BackHandler, Modal, KeyboardAvoidingView, TextInput, Platform, Image, ActivityIndicator } from 'react-native';
import Navigation from '../ui/Navigation';
import { useFocusEffect } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import ChatScreen from './ChatScreen';
import { createChatrooms, getChatrooms, getFavChatrooms } from '@/api/chatRoomApi';
import ToastMessageModal from '../ui/toastModal';
import { GetMessages } from '@/api/messageApi';
import { getUserProfile } from '@/api/userApi';
import { Home } from '@/app';


// export type Home = 'home' | 'login' | 'registration' | 'userSelection' | 'relationSelection' | 'scoring' | 'dashboard' | 'sapienScore' | 'shareScreen'
//   | 'scoresReceived' | 'sapiensScored' | 'sapiensrequests' | 'sapiensblocked' | 'echoroom';;
type RoomItem = {
  id: string;
  name: string;
  newMessages: number;
};

type EchoRoomsScreenProps = {
  onBack: () => void
  navigationScreen: (screen: Home) => void

}
const EchoRoomsScreen: React.FC<EchoRoomsScreenProps> = ({ onBack, navigationScreen }) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    console.log('fonts not loaded');
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roomName, setRoomName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [echoRooms, setEchoRooms] = useState<string[]>([]);
  const [favRoomIDs, setFavRoomIds] = useState<string[]>([]);
  // console.log('echoRooms', echoRooms)
  // console.log('favRoomIDs', favRoomIDs)
  const handleCreateRoom = async () => {
    // console.log('roomName', roomName);
    if (roomName.trim()) {
      try {
        const res = await createChatrooms(roomName);
        // console.log('Cre', res);
        setMessage(`'${res.name}' echoroom created`);
        setShowUpdateModal(true); // Show the toast modal

        // Hide the create room modal and reset the room name
        setRoomName('');
        setModalVisible(false);

        // Automatically hide the toast after some time (e.g., 3 seconds)
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

  const rooms = useCallback(() => {

    return echoRooms.map((room: any) => ({
      id: room._id,
      name: room.name,
      messageCount: room.messageCount,
      isHighlighted: echoRooms.indexOf(room) % 2 === 0,
      creatorId: room.creatorId,
    }));

  }, [echoRooms]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        onBack();
        return true;
      };

      // Add event listener (modern way)
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      // Cleanup function - use remove() instead of removeEventListener
      return () => backHandler.remove();
    }, [])
  );

  const handleRoomPress = (roomName: string, roomId: string, creatorId: string) => {
    console.log('creatorId', creatorId)
    setCreatorId(creatorId)
    setSelectedRoom(roomName);
    setSelectedRoomId(roomId);
  };

  const handleBackFromChat = async () => {
    setSelectedRoom(null);
    setLoading(true);

    await getChatrooms().then((rooms) => {
      setLoading(false)
      setEchoRooms(rooms.map((room: any) => room));
      // console.log('rooms', rooms[0].name)
    })
    setLoading(false)

    FavChatrooms();
    // await getRooms()
  };

  const getRooms = useCallback(async () => {
    try {
      setLoading(true)

      const rooms = await getChatrooms();
      setEchoRooms(rooms.map((room: any) => room));
      setLoading(false)

      // console.log('rooms', rooms[0].name)
    } catch (error) {
      setLoading(false)

      console.error('Error fetching rooms:', error);
    }
  }, []);

  useEffect(() => {
    getRooms();
  }, [getRooms, showUpdateModal]);

  const FavChatrooms = async () => {
    await getFavChatrooms().then((rooms) => {
      setFavRoomIds(rooms.map((room: any) => room?.roomId?._id));
      console.log('rrr', rooms)
    })
  }
  useEffect(() => {
    FavChatrooms();
  }, []);



  // If a room is selected, show the chat screen
  if (selectedRoom) {
    return (
      <ChatScreen
        roomName={selectedRoom}
        roomId={selectedRoomId || ""}
        onBack={handleBackFromChat}
        isFav={favRoomIDs.some(id => id === selectedRoomId)}
        creatorId={creatorId}

      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Echo Rooms</Text>
      </View>

      {/* Room List */}
      {/* <View style={styles.roomList}>
        {rooms.map((room) => (
          <FlatList
            data={rooms}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.roomItem,
                  item.isHighlighted && styles.roomItemHighlighted,
                ]}
                onPress={() => handleRoomPress(item.name)}
              >
                <View style={styles.roomContent}>
                  <View style={styles.roomLeft}>
                    {room.name === 'The midnight Club' && (
                      <View style={styles.heartIcon}>
                        <Text style={styles.heartEmoji}>🧡</Text>
                      </View>
                    )}
                    <Text style={styles.roomName}>{room.name}</Text>
                  </View>
                  <View style={styles.roomRight}>
                    <Text style={styles.messageCount}>
                      {room.messageCount} new messages
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            scrollEventThrottle={16}
          ))}
          />
      </View> */}
      <View style={styles.roomList}>
        <FlatList
          data={rooms()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {
                loading && (
                  <View style={styles.indicator}>
                    <ActivityIndicator size="large" color="#FF8541" />
                  </View>
                )

              }
              <Text style={styles.emptyText}>{rooms().length === 0 ? 'No Echo Rooms yet' : 'Loading Rooms...'}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.roomItem,
                item.isHighlighted && styles.roomItemHighlighted,
              ]}
              onPress={() => handleRoomPress(item.name, item.id, item.creatorId)}
            >
              <View style={styles.roomContent}>
                <View style={styles.roomLeft}>
                  {favRoomIDs.includes(item.id) && (
                    <View style={styles.heartIcon}>
                      <FontAwesome name="heart" size={24} color="#ff6b35" />
                      {/* <Image source={require('../../assets/images/orangeHeart.png')} /> */}
                    </View>
                  )}
                  <Text style={styles.roomName}>{item.name}</Text>
                </View>
                <View style={styles.roomRight}>
                  <Text style={styles.messageCount}>
                    {item.messageCount} new messages
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          scrollEventThrottle={16}
        />
      </View>

      {/* Create Button */}
      <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
        <View style={styles.createButtonInner}>
          {/* <Image name="add" size={24} color="#fff" /> */}
          <Image source={require('../../assets/images/plus-circle.png')} />
        </View>
        <Text style={styles.createText}>create</Text>
      </TouchableOpacity>

      {/* Create Room Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}

          >
            <View style={styles.modalContainer}>
              <TouchableOpacity activeOpacity={1}>
                {/* Info Message */}
                <View style={styles.infoMessage}>
                  <Text style={styles.infoText}>
                    You can create up to 3 echorooms
                  </Text>
                </View>

                {/* Input Container */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputRow}>
                    <View style={styles.avatarPlaceholder} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Name your Echo room"
                      placeholderTextColor="#999"
                      value={roomName}
                      onChangeText={setRoomName}
                      autoFocus={true}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.createModalButton}
                    onPress={handleCreateRoom}
                  >
                    <Text style={styles.createModalButtonText}>create</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
      {showUpdateModal && (
        <ToastMessageModal visible={showUpdateModal} onClose={() => setShowUpdateModal(false)} message={message} />
      )}


      <Navigation initialTab="Echoroom" setScreen={(screen: any) => navigationScreen(screen)} />

    </SafeAreaView>
  );
}
export default EchoRoomsScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',

  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 25,
    fontWeight: '400',
    color: '#000000',
  },
  roomList: {
    flex: 1,
    paddingTop: 8,
  },
  roomItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roomItemHighlighted: {
    backgroundColor: '#CFCFCF',
  },
  indicator: {
    alignContent: "center",
    justifyContent: "center",
    flex: 1,

  },
  roomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heartIcon: {
    marginRight: 12,
  },
  heartEmoji: {
    fontSize: 20,
  },
  roomName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.2
  },
  roomRight: {
    marginLeft: 16,
  },
  messageCount: {
    fontFamily: 'Poppins-Light',
    fontSize: 10,
    color: '#000',
    fontWeight: '300',
  },
  createButton: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    alignItems: 'center',
  },
  createButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createText: {
    fontFamily: 'Poppins-Light',
    marginTop: 4,
    fontSize: 12,
    color: '#000',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  infoMessage: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    // borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d0d0d0',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
  },
  createModalButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: 'flex-end',
  },
  createModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
