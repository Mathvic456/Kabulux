// components/ui/GoogleSignInButton.tsx
import { FontAwesome } from "@expo/vector-icons";
import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { StyleSheet, Text, TouchableOpacity } from "react-native";


interface GoogleSignInButtonProps {
    onSuccess: (idToken: string) => void;
    onError?: (error: any) => void;
    disabled?: boolean;
}

export default function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {

    const handlePress = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (isSuccessResponse(response)) {
                const idToken = response.data?.idToken;
                if (idToken) {
                    onSuccess(idToken);
                } else {
                    onError?.('No ID token — check that webClientId is set and is of type Web');
                }
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        console.log('User cancelled sign in');
                        break;
                    case statusCodes.IN_PROGRESS:
                        console.log('Sign in already in progress');
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        console.log('Play services not available');
                        break;
                    default:
                        onError?.(error);
                }
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