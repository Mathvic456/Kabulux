// components/ui/GoogleSignInButton.tsx
import { FontAwesome } from "@expo/vector-icons";
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { StyleSheet, Text, TouchableOpacity } from "react-native";

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

interface GoogleSignInButtonProps {
    onSuccess: (idToken: string) => void;
    onError?: (error: any) => void;
    disabled?: boolean;
}

export default function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {

    const handlePress = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;
            if (idToken) {
                onSuccess(idToken);
            } else {
                onError?.('No ID token returned');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled sign in');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available');
            } else {
                onError?.(error);
            }
        }
    };

    return (
        <TouchableOpacity
            style={[styles.googleBtn, disabled && styles.googleBtnDisabled]}
            onPress={handlePress}
            disabled={disabled}
        >
            <FontAwesome name="google" size={20} color="#fff" style={styles.googleIcon} />
            <Text style={styles.googleText}>Sign in with Google</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    googleBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderColor: "#fcbf24",
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 12,
    },
    googleBtnDisabled: { opacity: 0.7 },
    googleIcon: { marginRight: 10 },
    googleText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});