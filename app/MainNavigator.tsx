import React, { useState } from "react";
import AccountSuccessScreen from "./authentication/AccountSuccessScreen";
import ForgotPasswordScreen from "./authentication/ForgotPasswordScreen";
import LoginScreen from "./authentication/LoginScreen";
import LogoutScreen from "./authentication/LogoutScreen";
import PasswordChangeSuccessScreen from "./authentication/PasswordChangeSuccessScreen";
import PasswordResetSuccessScreen from "./authentication/PasswordResetSuccessScreen";
import PasswordSetScreen from "./authentication/PasswordSetScreen";
import ProfileScreen from "./authentication/ProfileScreen";
import RegisterScreen from "./authentication/RegisterScreen";
import ResetPasswordScreen from "./authentication/ResetPasswordScreen";
import VerifyEmailScreen from "./authentication/VerifyEmailScreen";
import OnboardingScreen1 from "./onboarding/OnboardingScreen1";
import OnboardingScreen2 from "./onboarding/OnboardingScreen2";
import RideDetailsScreen from "./tabs/RideDetailsScreen";
import TabNavigator from "./tabs/TabNavigator";

// Define screen names
type Screen =
  | "onboard1"
  | "onboard2"
  | "login"
  | "register"
  | "forgot"
  | "reset"
  | "verify"
  | "passwordSet"
  | "profile"
  | "logout"
  | "accountSuccess"
  | "passwordChangeSuccess"
  | "passwordResetSuccess"
  | "dashboard"
  | "rideDetails"; // <-- include rideDetails

export default function MainNavigator() {
  const [screen, setScreen] = useState<Screen>("onboard1");

  // Keep track of the selected ride
  const [selectedRide, setSelectedRide] = useState<any>(null);

  switch (screen) {
    case "onboard1":
      return <OnboardingScreen1 next={() => setScreen("login")} />;
    case "onboard2":
      return <OnboardingScreen2 next={() => setScreen("login")} />;
    case "login":
      return (
        <LoginScreen
          next={() => setScreen("dashboard")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
        />
      );
    case "register":
      return (
        <RegisterScreen
          next={() => setScreen("verify")}
          goLogin={() => setScreen("login")}
        />
      );
    case "forgot":
      return <ForgotPasswordScreen next={() => setScreen("reset")} />;
    case "reset":
      return (
        <ResetPasswordScreen
          next={() => setScreen("passwordResetSuccess")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
        />
      );
    case "verify":
      return (
        <VerifyEmailScreen
          next={() => setScreen("passwordSet")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
        />
      );
    case "passwordSet":
      return (
        <PasswordSetScreen
          next={() => setScreen("accountSuccess")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
        />
      );
    case "profile":
      return <ProfileScreen next={() => setScreen("logout")} />;
    case "accountSuccess":
      return (
        <AccountSuccessScreen
          next={() => setScreen("login")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
        />
      );
    case "passwordResetSuccess":
      return (
        <PasswordResetSuccessScreen
          next={() => setScreen("login")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
        />
      );
    case "passwordChangeSuccess":
      return (
        <PasswordChangeSuccessScreen
          next={() => setScreen("login")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
        />
      );
    case "logout":
      return <LogoutScreen next={() => setScreen("login")} />;
    case "dashboard":
      return (
        <TabNavigator
          setScreen={setScreen}
          setSelectedRide={setSelectedRide} // <-- pass this down
        />
      );
    case "rideDetails":
      return (
        <RideDetailsScreen
          ride={selectedRide} // <-- use ride stored in state
          goBack={() => setScreen("dashboard")}
        />
      );
    default:
      return null;
  }
}
