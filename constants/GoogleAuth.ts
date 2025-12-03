import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const clientId = Constants.expoConfig?.extra?.googleAuthClientId;

  useEffect(() => {
    console.log(clientId);
    console.log(AuthSession.makeRedirectUri());
  }, [clientId])
  

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "kabulux",
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes: ["profile", "email"],
      responseType: "id_token",
    },
    {
      authorizationEndpoint:
        "https://accounts.google.com/o/oauth2/v2/auth",
    }
  );

  // Handle response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      console.log("Google ID Token:", id_token);

      // Use this id_token to authenticate with your backend
      // await api.post("/auth/google", { token: id_token });
    }
  }, [response]);

  return {
    signInWithGoogle: () => promptAsync(),
    loading: !request,
  };
};
