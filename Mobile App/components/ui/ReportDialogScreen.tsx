import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
    StatusBar,
    Image
}

    from 'react-native';
import { ReportRoom } from '@/api/reportRoomApi';
import { updateRatingStatus } from '@/api/ratingApi';

const { width, height } = Dimensions.get('window');

interface ReportDialogScreenModalProps {
    visible: boolean;
    onClose: () => void;
    roomId: string,
    reportScore?: boolean,
    reportedSuccess: (value: boolean) => void


}

const ReportDialogScreen: React.FC<ReportDialogScreenModalProps> = ({
    visible,
    onClose,
    roomId,
    reportScore,
    reportedSuccess
}) => {
    const [selectedOption, setSelectedOption] = useState('');

    const reportOptions = [
        'Profanity',
        'Abusive language',
        'Hate speech',
        'Explicit wording',
    ];

    const handleOptionPress = (option: string) => {
        setSelectedOption(option);
    };

    const handleReport = async () => {
        console.log('Reporting for:', selectedOption);
        console.log('reportScore', reportScore)
        console.log('roomId', roomId)
        if (reportScore) {
            await updateRatingStatus(roomId, 'reported').then((response) => {
                console.log('response', response)
                reportedSuccess(true)
                onClose(); // Close the modal after reporting
                setSelectedOption('');


            })
        } else {
            await ReportRoom(selectedOption, roomId).then((response) => {
                reportedSuccess(true)
                onClose(); // Close the modal after reporting
                setSelectedOption('');
            })


        };
    }

        const handleCancel = () => {
            onClose();
        };

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>




                    <View style={styles.modalContent}>
                        <Image source={require('../../assets/images/pathshape.png')} />


                        <View style={styles.container}>
                            <Text style={styles.modalTitle}>report for</Text>



                            <View style={styles.optionsContainer}>
                                {reportOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.optionItem,
                                            selectedOption === option && styles.selectedOption,
                                        ]}
                                        onPress={() => handleOptionPress(option)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                option === selectedOption && styles.highlightedText,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.reportButton}
                                    onPress={handleReport}
                                >
                                    <Text style={styles.reportButtonText}>report</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* <View style={styles.bubbleTailsContainer}>
             <View style={styles.bubbleTailSmall} />
          <View style={styles.bubbleTailLarge} />
          </View> */}

                    </View>
                </View>
            </Modal>
        );
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(51, 53, 58, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
            position: 'relative',
        },
        container: {

            position: 'absolute',
            top: '26%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 20,

        },
        bubbleTailsContainer: {
            position: 'absolute',
            bottom: '25%',
            left: '25%',
        },
        bubbleTailLarge: {
            width: 39,
            height: 39,
            backgroundColor: '#FFF',
            borderRadius: 50,
        },
        bubbleTailSmall: {
            position: 'absolute',
            bottom: 5,
            left: -5,
            width: 18,
            height: 18,
            backgroundColor: '#FFF',
            borderRadius: 50,
            top: "90%"
        },
        modalContent: {
            //   backgroundColor: '#FFF',
            //   borderTopLeftRadius: 130,   
            //   borderTopRightRadius: 70,   
            //   borderBottomLeftRadius: 80, 
            //   borderBottomRightRadius: 80, 
            //   padding: 20,                
            //   width: '90%',
            //   maxWidth: 340,         
            //   alignItems: 'center',
            //   justifyContent: 'space-between',
            //   shadowColor: '#000',
            //   shadowOffset: { width: 0, height: 4 },
            //   shadowOpacity: 0.3,
            //   shadowRadius: 10,
            //   elevation: 10,
            //   borderWidth: 0,
            //   borderColor: 'transparent',
            //       paddingVertical: 60,
            //     paddingHorizontal: 40,
        },
        modalTitle: {
            fontSize: 12,
            color: '#fff',
            marginBottom: 0,
            fontWeight: '600',
            textAlign: 'left',
            maxWidth: 180,
            width: '100%',
            position: 'absolute',
            top: '-49%',
            left: '45%',
            fontFamily: 'Poppins-SemiBold',

        },
        optionsContainer: {
            width: '100%',
            marginBottom: 20,
            maxWidth: 350,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            margin: 'auto',


        },
        optionItem: {
            paddingVertical: 10,
            paddingLeft: 120,
            borderRadius: 8,
            textAlign: 'left',
            fontFamily: 'Poppins-Light',
            fontWeight: '300',



        },
        selectedOption: {
            // backgroundColor: '#E8E8E8', 
            fontFamily: 'Poppins-Light',
            fontWeight: '300',
            // lineHeight: 10,

        },
        optionText: {
            fontSize: 20,
            color: '#000',
            textAlign: 'left',
            fontWeight: '300',
            width: '100%',
            lineHeight: 22,
            fontFamily: 'Poppins-Light',
        },
        highlightedText: {
            color: '#000',
            fontWeight: '700',
            lineHeight: 25,
            fontFamily: 'Poppins-Bold',


        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '60%',
            gap: 20,
            position: 'relative',
            left: 35,
        },
        cancelButton: {
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        cancelButtonText: {
            fontSize: 15,
            color: '#000',
            textAlign: 'center',
            fontWeight: '500',
            fontFamily: 'Poppins-Medium',
        },
        reportButton: {
            backgroundColor: '#FF7F50',
            paddingTop: 8,
            paddingHorizontal: 10,
            borderRadius: 10,
            alignItems: 'center',
        },
        reportButtonText: {
            color: '#FFF',
            fontSize: 15,
            fontWeight: '600',
            fontFamily: 'Poppins-Medium',

        },
    });

    export default ReportDialogScreen;




