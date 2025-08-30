import React, { useState } from "react";
import AddFundsScreen from "./addFunds/AddFundsScreen";
import CryptoDepositScreenOne from "./addFunds/CryptoDepositScreenOne";
import CryptoDepositScreenTwo from "./addFunds/CryptoDepositScreenTwo";
import PaymentMethodScreen from "./addFunds/PaymentMethodScreen";
import RedeemPointsScreen from "./addFunds/RedeemPointsScreen";
import AnalyticsScreen from "./AnalyticsScreen";
import AccountSuccessScreen from "./authentication/AccountSuccessScreen";
import ForgotPasswordScreen from "./authentication/ForgotPasswordScreen";
import LoginScreen from "./authentication/LoginScreen";
import LogoutScreen from "./authentication/LogoutScreen";
import PasswordChangeSuccessScreen from "./authentication/PasswordChangeSuccessScreen";
import PasswordResetSuccessScreen from "./authentication/PasswordResetSuccessScreen";
import PasswordSetScreen from "./authentication/PasswordSetScreen";
import RegisterScreen from "./authentication/RegisterScreen";
import ResetPasswordScreen from "./authentication/ResetPasswordScreen";
import VerifyEmailScreen from "./authentication/VerifyEmailScreen";
import LoyaltyPointsScreen from "./LoyaltyPointsScreen";
import OnboardingScreen1 from "./onboarding/OnboardingScreen1";
import OnboardingScreen2 from "./onboarding/OnboardingScreen2";
import BookingScreen from "./Order/BookingScreen";
import PickUpScreen from "./Order/PickUpScreen";
import PlanRideScreen from "./Order/PlanRideScreen";
import HelpAndSupportScreen from "./profile/HelpAndSupportScreen";
import LegalScreen from "./profile/LegalScreen";
import LoginAndSecurityScreen from "./profile/LoginAndSecurityScreen";
import PersonalInfoScreen from "./profile/PersonalInfoScreen";
import ReferAndEarnScreen from "./profile/ReferAndEarnScreen";
import SavedPlacesScreen from "./profile/SavePlacesScreen";
import SettingsScreen from "./profile/SettingsScreen";
import OriginalPriceDetailsScreen from "./rides/original/OriginalPriceDetailsScreen";
import ProfileScreen from "./tabs/ProfileScreen";
import RideDetailsScreen from "./tabs/RideDetailsScreen";
import TabNavigator from "./tabs/TabNavigator";
import WalletScreen from "./tabs/WalletScreen";

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
  | "rideDetails"
  | "addFunds"
  | "paymentMethod"
  | "cryptoDepositOne"
  | "cryptoDepositTwo"
  | "personalInfo"
  | "loginAndSecurity" // <-- include loginAndSecurity
  | "helpAndSupport" // <-- include helpAndSupport
  | "savedPlaces"
  | "referAndEarn"
  | "settings"
  | "legal"
  | "redeemPoints"
  | "wallet"
  | "analyticsScreen"
  | "loyalty" 
  | "orderScreen"
  | "planRide"
  | "bookingScreen"
  | "originalPriceDetails";


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
      return <ProfileScreen setScreen={setScreen} />;
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
    case "addFunds":
      return (
        <AddFundsScreen
          next={() => setScreen("paymentMethod")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
          goCryptoDeposit={() => setScreen("cryptoDepositOne")} // 👈 new navigation option

        />
      );

    
    case "paymentMethod":
      return (
        <PaymentMethodScreen
          next={() => setScreen("dashboard")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
          goCryptoDeposit={() => setScreen("cryptoDepositOne")}
        />
      );
    case "cryptoDepositOne":
      return (
        <CryptoDepositScreenOne
          next={() => setScreen("cryptoDepositTwo")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
          goCryptoDeposit={() => setScreen("cryptoDepositOne")}
        />
      );
    case "cryptoDepositTwo":
      return (
        <CryptoDepositScreenTwo
          next={() => setScreen("paymentMethod")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
          goCryptoDeposit={() => setScreen("cryptoDepositOne")}
        />
      );

    case "personalInfo":
      return (
        <PersonalInfoScreen
          goBack={() => setScreen("profile")}
          next={() => setScreen("dashboard")}
        />
      );

    case "loginAndSecurity":
      return (
        <LoginAndSecurityScreen
          goBack={() => setScreen("profile")}
          next={() => setScreen("dashboard")}
        />
      );

    case "helpAndSupport":
      return (
        <HelpAndSupportScreen
          goBack={() => setScreen("profile")}
          next={() => setScreen("dashboard")}
        />
      );

    case "savedPlaces":
      return (
        <SavedPlacesScreen
          goBack={() => setScreen("profile")}
          next={() => setScreen("dashboard")}
        />
      );

    case "referAndEarn":
      return (
        <ReferAndEarnScreen
          goBack={() => setScreen("profile")}
          next={() => setScreen("dashboard")}
        />
      );

    case "settings":
      return (
        <SettingsScreen
          setScreen={setScreen}
        />
      );

    case "legal":
      return(
        <LegalScreen
          goBack={() => setScreen("profile")}
          next={() => setScreen("dashboard")}
        />
      );

    case "redeemPoints":
      return (
        <RedeemPointsScreen
          goBack={() => setScreen('wallet')}
          navigation={{
            navigate: (screenName: string) => setScreen(screenName as Screen),
            goBack: () => setScreen('wallet')
          }}
        />
      );

    case "analyticsScreen":
      return (
        <AnalyticsScreen
          // setScreen={setScreen}
          next={() => setScreen("loyalty")}
        />);

    case "wallet":
      return (
        <WalletScreen
          setScreen={setScreen}
        />);

    case "loyalty":
      return (
        <LoyaltyPointsScreen
        />);

    case "orderScreen":
      return (
        <PickUpScreen setScreen={setScreen}
        />);

    case "planRide":
      return (
        <PlanRideScreen setScreen={setScreen}
        />);

    case "bookingScreen":
      return (
        <BookingScreen setScreen={setScreen}
        />);  

    case "originalPriceDetails":
      return (
        <OriginalPriceDetailsScreen
          setScreen={setScreen}
        />
      );

    default:
      return null;
  }
}
