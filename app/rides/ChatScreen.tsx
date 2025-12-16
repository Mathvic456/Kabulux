import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const initialMessages = [
    {
        text: 'Hello I\'m here',
        sender: 'driver',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
        text: 'Okay am coming',
        sender: 'user',
        timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    },
];

export default function ChatScreen({goBack}: {goBack: () => void}) {
    const [messages, setMessages] = useState(initialMessages);
    const [messageText, setMessageText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (messageText.trim() === '') return;
        
        const newMessage = {
            text: messageText,
            sender: 'user',
            timestamp: new Date(),
        };
        
        setMessages([...messages, newMessage]);
        setMessageText('');
        
        // Simulate driver response after a delay
        setTimeout(() => {
            const driverResponse = {
                text: 'Got it. See you soon!',
                sender: 'driver',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, driverResponse]);
        }, 2000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateHeader = (date: Date) => {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const day = days[date.getDay()];
        const dayNum = date.getDate();
        const hours = date.getHours();
        const period = hours >= 12 ? 'PM' : 'AM';
        
        return `${day} ${dayNum} ${hours % 12 || 12} ${period}`;
    };

    // Check if we need to show a date header for a message
    const shouldShowDateHeader = (index: number) => {
        if (index === 0) return true;
        
        const currentDate = messages[index].timestamp.getDate();
        const previousDate = messages[index - 1].timestamp.getDate();
        
        return currentDate !== previousDate;
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header with back button and driver info */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.driverName}>Azzezz omolalomi</Text>
                    <Text style={styles.carInfo}>MUSTIBUSHI DJ345JJ</Text>
                </View>
            </View>

            {/* Chat messages area */}
            <ScrollView 
                ref={scrollViewRef}
                style={styles.messagesContainer}
                onContentSizeChange={() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollToEnd({ animated: true });
                    }
                }}
            >
                {messages.map((message, index) => (
                    <View key={index}>
                        {/* Date header when date changes */}
                        {shouldShowDateHeader(index) && (
                            <Text style={styles.timestamp}>
                                {formatDateHeader(message.timestamp)}
                            </Text>
                        )}
                        
                        {/* Message bubble */}
                        <View
                            style={[
                                styles.messageBubble,
                                message.sender === 'user'
                                    ? styles.userMessage
                                    : styles.driverMessage,
                            ]}
                        >
                            <Text style={styles.messageText}>{message.text}</Text>
                            <Text style={styles.timeText}>
                                {formatTime(message.timestamp)}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Message input area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type a message"
                    placeholderTextColor="#999"
                    value={messageText}
                    onChangeText={setMessageText}
                    onSubmitEditing={handleSendMessage}
                />
                <TouchableOpacity 
                    style={[styles.sendButton, !messageText && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={!messageText}
                >
                    <Feather name="send" size={24} color={messageText ? "#000" : "#555"} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1c1c1c',
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTextContainer: {
        flex: 1,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    carInfo: {
        fontSize: 12,
        color: '#999',
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    timestamp: {
        textAlign: 'center',
        color: '#777',
        fontSize: 12,
        marginVertical: 15,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 15,
        maxWidth: '75%',
        marginVertical: 5,
    },
    userMessage: {
        backgroundColor: '#f6a623',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 5,
    },
    driverMessage: {
        backgroundColor: '#1c1c1c',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        color: '#fff',
        marginBottom: 4,
    },
    timeText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#1c1c1c',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#2b2b2b',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: 'white',
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#f6a623',
        borderRadius: 25,
        padding: 10,
    },
    sendButtonDisabled: {
        backgroundColor: '#555',
    },
});