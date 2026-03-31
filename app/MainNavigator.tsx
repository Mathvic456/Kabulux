import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import AddFundsScreen from "./addFunds/AddFundsScreen";
import CryptoDepositScreenOne from "./addFunds/CryptoDepositScreenOne";
import CryptoDepositScreenTwo from "./addFunds/CryptoDepositScreenTwo";
import DynamicPayStackWebViewScreen from "./addFunds/DynamicPayStackWebViewScreen";
import PaymentMethodScreen from "./addFunds/PaymentMethodScreen";
import RedeemPointsScreen from "./addFunds/RedeemPointsScreen";
import AnalyticsScreen from "./AnalyticsScreen";
import AccountSuccessScreen from "./authentication/AccountSuccessScreen";
import LoginScreen from "./authentication/LoginScreen";
import LogoutScreen from "./authentication/LogoutScreen";
import PasswordChangeSuccessScreen from "./authentication/PasswordChangeSuccessScreen";
import PasswordResetSuccessScreen from "./authentication/PasswordResetSuccessScreen";
import PasswordSetScreen from "./authentication/PasswordSetScreen";
import RegisterScreen from "./authentication/RegisterScreen";
import ResetCredentialsScreen from "./authentication/ResetCredentialsScreen";
import ResetPasswordScreen from "./authentication/ResetPasswordScreen";
import VerifyEmailScreen from "./authentication/VerifyEmailScreen";
import LoyaltyPointsScreen from "./LoyaltyPointsScreen";
import { registerSetScreen } from "./navigationRef";
import RiderOffersScreen from "./offer/RidersOfferScreen";
import StandardScreen from "./offer/StandardScreen";
import OnboardingScreen1 from "./onboarding/OnboardingScreen1";
import OnboardingScreen2 from "./onboarding/OnboardingScreen2";
import BookingScreen from "./Order/BookingScreen";
import PickUpScreen from "./Order/PickUpScreen";
import PlanRideScreen from "./Order/PlanRideScreen";
import AboutUs from "./profile/AboutUs";
import { RateAppScreen } from "./profile/ExtraScreens";
import HelpAndSupportScreen from "./profile/HelpAndSupportScreen";
import LanguageScreen from "./profile/Language";
import LegalScreen from "./profile/LegalScreen";
import LoginAndSecurityScreen from "./profile/LoginAndSecurityScreen";
import PersonalInfoScreen from "./profile/PersonalInfoScreen";
import ReferAndEarnScreen from "./profile/ReferAndEarnScreen";
import ReportIssue from "./profile/ReportIssue";
import RideReceipts from "./profile/RideReceipts";
import SavedPlacesScreen from "./profile/SavePlacesScreen";
import SettingsScreen from "./profile/SettingsScreen";
import { TermsOfServiceScreen } from "./profile/TermsOfService";
import AdditionalInformationScreen from "./rides/business/AdditionalInformationScreen";
import BusinessCodeScreen from "./rides/business/BusinessCodeScreen";
import BusinessRideSelectScreen from "./rides/business/BusinessRideSelectScreen";
import ChatScreen from "./rides/ChatScreen";
import OriginalDriverDetailScreen from "./rides/original/OriginalDriverDetailScreen";
import OriginalPriceDetailsScreen from "./rides/original/OriginalPriceDetailsScreen";
import ModifyRideScreen from "./rides/premium/ModifyRideScreen";
import PremiumCarSelectScreen from "./rides/premium/PremiumCarSelectScreen";
import SpecialServicesScreen from "./rides/SpecialServicesScreen";
import BookingsScreen from "./tabs/BookingsScreen";
import ProfileScreen from "./tabs/ProfileScreen";
import RideDetailsScreen from "./tabs/RideDetailsScreen";
import RideTrackingScreen from "./tabs/RideTrackingScreen";
import TabNavigator from "./tabs/TabNavigator";
import WalletScreen from "./tabs/WalletScreen";

//NEW MAPBOX SCREENS GODSWILL AG
import Terms from "./authentication/Terms";
import SetLocation from "./Order/map/SetLocation";
import TrackDriver from "./Order/map/TrackDriver";

// Define screen names
type Screen =
  | "onboard1"
  | "onboard2"
  | "login"
  | "register"
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
  | "loginAndSecurity"
  | "helpAndSupport"
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
  | "originalPriceDetails"
  | "originalDriverDetails"
  | "chatScreen"
  | "businessRideSelect"
  | "additionalInformation"
  | "premiumCarSelect"
  | "specialServices"
  | "modifyRide"
  | "resetCredentials"
  | "businessCodeScreen"
  | "paystack"
  | "standardScreen"
  | "offerScreen"
  | "bookings"
  | "aboutus"
  | "language"
  | "report"
  | "ridereceipts"
  | "rateapp"
  | "rateapscreen"
  | "terms"
  | "trackRide"
  | "setLocation"
  | "trackDriver"
  | "termsOfService";


const STACK_RESET_SCREENS: Screen[] = ["dashboard", "login"];

export default function MainNavigator() {
  const [screen, setScreen] = useState<Screen>("onboard1");
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);

  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [rideOptions, setRideOptions] = useState<any>(null);
  const [pickupLocationData, setPickupLocationData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [rideData, setRideData] = useState<any>(null);
  const [url, setUrl] = useState("");

  const [registeredEmail, setRegisteredEmail] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  useEffect(() => {
    console.log("[MainNavigator] Registering navigation ref");
    registerSetScreen((scr: string, data?: any) => {
      console.log(`[Navigation] Navigating to: ${scr}`, data);
      handleSetScreen(scr as Screen, data);
    });
  }, []);

  const handleSetScreen = (newScreen: Screen, params?: any) => {
    if (newScreen === "planRide" && params) {
      console.log("Setting pickup location data:", params);
      setPickupLocationData(params);
    }
    if (newScreen === "bookingScreen" && params) {
      console.log("📅 Setting booking data:", params);
      setBookingData(params);
    }
    if (newScreen === "standardScreen" && params) {
      console.log("Setting ride data:", params);
      setRideData(params);
    }

    console.log(`🔄 Updating screen state to: ${newScreen}`);

    if (STACK_RESET_SCREENS.includes(newScreen)) {
      setScreenHistory([]);
    } else {
      setScreenHistory((h) => [...h, screen]);
    }

    setScreen(newScreen);
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory((h) => h.slice(0, -1));
      setScreen(prev);
    }
  };

  useEffect(() => {
    const handleHardwareBack = () => {
      if (screenHistory.length > 0) {
        goBack();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", handleHardwareBack);
    return () => subscription.remove();
  }, [screenHistory]);

  const checkIfRemembered = async () => {
    const rememberedEmail = await AsyncStorage.getItem("rememberedEmail");
    const token = await AsyncStorage.getItem("token");

    if (token || rememberedEmail) {
      handleSetScreen("dashboard");
    } else {
      handleSetScreen("login");
    }
  };

  switch (screen) {
    case "onboard1":
      return <OnboardingScreen1 next={() => checkIfRemembered()} />;

    //NEW MAPBOX SCREENS GODSWILL AG
    case "setLocation":
      return <SetLocation goBack={goBack} setScreen={handleSetScreen} />;
    case "trackDriver":
      return <TrackDriver goBack={() => handleSetScreen("dashboard")} setScreen={handleSetScreen} />;

    case "onboard2":
      return <OnboardingScreen2 next={() => { }} />;

    case "login":
      return (
        <LoginScreen
          next={() => handleSetScreen("dashboard")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
        />
      );

    case "register":
      return (
        <RegisterScreen
          next={(email) => {
            setRegisteredEmail(email);
            handleSetScreen("termsOfService");
          }}
          goLogin={() => handleSetScreen("login")}
        />
      );

    case "reset":
      return (
        <ResetPasswordScreen
          goLogin={() => handleSetScreen("login")}
          next={(email) => {
            setForgotPasswordEmail(email);
            handleSetScreen("resetCredentials");
          }}
        />
      );

    case "verify":
      return (
        <VerifyEmailScreen
          goBack={goBack}
          next={() => handleSetScreen("accountSuccess")}
          goRegister={() => handleSetScreen("termsOfService")}
        />
      );

    case "passwordSet":
      return (
        <PasswordSetScreen
          next={() => handleSetScreen("accountSuccess")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
        />
      );

    case "trackRide":
      return <RideTrackingScreen goBack={() => handleSetScreen("dashboard")} setScreen={handleSetScreen} />;

    case "profile":
      return <ProfileScreen setScreen={handleSetScreen} />;

    case "accountSuccess":
      return (
        <AccountSuccessScreen
          next={() => handleSetScreen("dashboard")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
        />
      );
    case "termsOfService":
      return (
        <Terms
          next={() => handleSetScreen("verify")}
        />
      );

    case "passwordResetSuccess":
      return (
        <PasswordResetSuccessScreen
          next={() => handleSetScreen("login")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
        />
      );

    case "offerScreen":
      return (
        <RiderOffersScreen
          goBack={goBack}
          next={() => handleSetScreen("trackRide")}
          home={() => handleSetScreen("dashboard")}
          rideData={rideData}
        />
      );

    case "passwordChangeSuccess":
      return (
        <PasswordChangeSuccessScreen
          next={() => handleSetScreen("login")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
        />
      );

    case "logout":
      return <LogoutScreen next={() => handleSetScreen("login")} />;

    case "dashboard":
      return (
        <TabNavigator
          setScreen={handleSetScreen}
          setSelectedRide={setSelectedRide}
        />
      );

    case "rideDetails":
      return (
        <RideDetailsScreen
          ride={selectedRide}
          goBack={goBack}
        />
      );

    case "addFunds":
      return (
        <AddFundsScreen
          next={() => handleSetScreen("paymentMethod")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
          goCryptoDeposit={() => handleSetScreen("cryptoDepositOne")}
          goBack={goBack}
        />
      );

    case "paymentMethod":
      return (
        <PaymentMethodScreen
          next={() => handleSetScreen("dashboard")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
          goCryptoDeposit={() => handleSetScreen("cryptoDepositOne")}
          goBack={goBack}
        />
      );

    case "cryptoDepositOne":
      return (
        <CryptoDepositScreenOne
          next={() => handleSetScreen("cryptoDepositTwo")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
          goCryptoDeposit={() => handleSetScreen("cryptoDepositOne")}
          goBack={goBack}
        />
      );

    case "cryptoDepositTwo":
      return (
        <CryptoDepositScreenTwo
          next={() => handleSetScreen("paymentMethod")}
          goRegister={() => handleSetScreen("register")}
          goForgot={() => handleSetScreen("reset")}
          goCryptoDeposit={() => handleSetScreen("cryptoDepositOne")}
          goBack={goBack}
        />
      );

    case "personalInfo":
      return (
        <PersonalInfoScreen
          goBack={goBack}
        />
      );

    case "loginAndSecurity":
      return (
        <LoginAndSecurityScreen
          goBack={goBack}
          next={() => handleSetScreen("dashboard")}
        />
      );

    case "helpAndSupport":
      return (
        <HelpAndSupportScreen
          goBack={goBack}
          next={() => handleSetScreen("dashboard")}
        />
      );

    case "savedPlaces":
      return (
        <SavedPlacesScreen
          goBack={goBack}
          next={() => handleSetScreen("dashboard")}
        />
      );

    case "referAndEarn":
      return (
        <ReferAndEarnScreen
          goBack={goBack}
          next={() => handleSetScreen("dashboard")}
        />
      );

    case "paystack":
      return (
        <DynamicPayStackWebViewScreen
          goBack={goBack}
        />
      );

    case "settings":
      return (
        <SettingsScreen
          setScreen={handleSetScreen}
          goBack={goBack}
        />
      );

    case "legal":
      return (
        <LegalScreen
          goBack={goBack}
          next={() => handleSetScreen("dashboard")}
        />
      );

    case "aboutus":
      return (
        <AboutUs
          goBack={goBack}
        />
      );

    case "language":
      return (
        <LanguageScreen
          goBack={goBack}
        />
      );

    case "terms":
      return (
        <TermsOfServiceScreen
          goBack={goBack}
        />
      );

    case "rateapscreen":
      return (
        <RateAppScreen
          goBack={goBack}
        />
      );

    case "report":
      return (
        <ReportIssue
          goBack={goBack}
        />
      );

    case "ridereceipts":
      return (
        <RideReceipts
          goBack={goBack}
        />
      );

    case "redeemPoints":
      return (
        <RedeemPointsScreen
          goBack={goBack}
        />
      );

    case "resetCredentials":
      return (
        <ResetCredentialsScreen
          back={goBack}
          next={() => handleSetScreen("login")}
        />
      );

    case "analyticsScreen":
      return (
        <AnalyticsScreen
          setScreen={handleSetScreen}
          next={() => handleSetScreen("loyalty")}
          goBack={goBack}
        />
      );

    case "wallet":
      return (
        <WalletScreen
          setScreen={handleSetScreen}
        />
      );

    case "loyalty":
      return (
        <LoyaltyPointsScreen
          back={goBack}
        />
      );

    case "orderScreen":
      return (
        <PickUpScreen
          setScreen={handleSetScreen}
          goBack={goBack}
        />
      );

    case "planRide":
      return (
        <PlanRideScreen
          setScreen={handleSetScreen}
          goBack={goBack}
          locationData={pickupLocationData}
        />
      );

    case "bookingScreen":
      return (
        <BookingScreen
          setScreen={handleSetScreen}
          goBack={goBack}
          pickupLat={bookingData?.pickupLocation?.latitude}
          pickupLong={bookingData?.pickupLocation?.longitude}
          pickupAddress={bookingData?.pickupLocation?.address}
          dropoffLat={bookingData?.destination?.latitude}
          dropoffLong={bookingData?.destination?.longitude}
          dropoffAddress={bookingData?.destination?.address}
        />
      );

    case "standardScreen":
      return (
        <StandardScreen
          goBack={goBack}
          next={() => handleSetScreen("offerScreen")}
          rideData={rideData}
        />
      );

    case "originalPriceDetails":
      return (
        <OriginalPriceDetailsScreen
          setScreen={handleSetScreen}
          goBack={goBack}
        />
      );

    case "originalDriverDetails":
      return (
        <OriginalDriverDetailScreen
          setScreen={handleSetScreen}
          goBack={goBack}
        />
      );

    case "chatScreen":
      return (
        <ChatScreen
          goBack={goBack}
        />
      );

    case "businessRideSelect":
      return (
        <BusinessRideSelectScreen
          setScreen={handleSetScreen}
          goBack={goBack}
        />
      );

    case "bookings":
      return (
        <BookingsScreen
          setScreen={handleSetScreen}
          next={() => handleSetScreen("orderScreen")}
          setSelectedRide={setSelectedRide}
        />
      );

    case "additionalInformation":
      return (
        <AdditionalInformationScreen
          setScreen={handleSetScreen}
          goBack={goBack}
          rideOptions={rideOptions}
          setRideOptions={setRideOptions}
        />
      );

    case "premiumCarSelect":
      return (
        <PremiumCarSelectScreen
          setScreen={handleSetScreen}
          goBack={goBack}
        />
      );

    case "specialServices":
      return (
        <SpecialServicesScreen
          setScreen={handleSetScreen}
          goBack={goBack}
          rideOptions={rideOptions}
          goNext={() => handleSetScreen("modifyRide")}
        />
      );

    case "modifyRide":
      return (
        <ModifyRideScreen
          setScreen={handleSetScreen}
          goBack={goBack}
        />
      );

    case "businessCodeScreen":
      return (
        <BusinessCodeScreen
          setScreen={handleSetScreen}
          goBack={goBack}
        />
      );

    default:
      return null;
  }
}
