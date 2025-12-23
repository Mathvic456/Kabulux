import { useRide } from '@/context/RideContext';
import { SocketContext } from "@/context/WebSocketProvider";
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useContext, useRef, useState } from 'react';

import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
    id: string; // Add this
    text: string;
    sender: 'user' | 'driver';
    timestamp: Date;
}

interface ChatScreenProps {
    goBack: () => void;
    driverName?: string;
    vehicleInfo?: string;
}

export default function ChatScreen({ 
    goBack, 
    driverName = "Driver", 
    vehicleInfo = "Vehicle Info" 
}: ChatScreenProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const { rideId } = useRide();
    const { chatMessages, sendChatMessage } = useContext(SocketContext);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    const currentMessages = rideId ? chatMessages[rideId] || [] : [];

    const handleSendMessage = async () => {
        if (!messageText.trim() || !rideId) return;
        
        const textToSend = messageText.trim();
        setMessageText('');
        
        try {
            await sendChatMessage(rideId, textToSend);
        } catch (err) {
            console.error("Failed to send chat:", err);

        }
    };



    const formatTime = (date: any) => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header stays the same */}
                <View style={styles.header}>
                   <TouchableOpacity onPress={goBack}><Feather name="chevron-left" size={28} color="white" /></TouchableOpacity>
                   <View style={styles.headerInfo}>
                        <Text style={styles.driverNameText}>{driverName || "Your Driver"}</Text>
                        <Text style={styles.vehicleText}>{vehicleInfo || "Active Ride"}</Text>
                   </View>
                </View>

                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {currentMessages.map((msg, index) => (
                        <View key={msg.id} style={[
                            styles.bubbleContainer,
                            msg.sender === 'user' ? styles.userContainer : styles.driverContainer
                        ]}>
                            <View style={[
                                styles.bubble,
                                msg.sender === 'user' ? styles.userBubble : styles.driverBubble
                            ]}>
                                <Text style={[
                                    styles.messageText,
                                    msg.sender === 'user' ? styles.userText : styles.driverText
                                ]}>{msg.text}</Text>
                                <Text style={styles.timeText}>{formatTime(msg.timestamp)}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputWrapper}>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message your driver..."
                            placeholderTextColor="#666"
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                        />
                        <TouchableOpacity 
                            style={[styles.sendCircle, !messageText.trim() && styles.sendDisabled]} 
                            onPress={handleSendMessage}
                        >
                            <Ionicons name="send" size={20} color={messageText.trim() ? "#000" : "#444"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
        backgroundColor: '#000',
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
    },
    driverNameText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    vehicleText: {
        color: '#FEB914',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    callButton: {
        backgroundColor: '#FEB914',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 30,
    },
    bubbleContainer: {
        width: '100%',
        marginVertical: 4,
        flexDirection: 'row',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    driverContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    userBubble: {
        backgroundColor: '#FEB914',
        borderBottomRightRadius: 4,
    },
    driverBubble: {
        backgroundColor: '#1a1a1a',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: '#000',
    },
    driverText: {
        color: '#fff',
    },
    timeText: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.5)',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    emptyState: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: '#444',
        fontSize: 14,
    },
    inputWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#111',
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#222',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        maxHeight: 100,
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 8,
    },
    sendCircle: {
        backgroundColor: '#FEB914',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendDisabled: {
        backgroundColor: '#222',
    },
});