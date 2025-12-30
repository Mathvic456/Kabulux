import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
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
import RateAppScreen from "./profile/ExtraScreens";
import HelpAndSupportScreen from "./profile/HelpAndSupportScreen";
import Language from "./profile/Language";
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

export default function MainNavigator() {
  const [screen, setScreen] = useState<Screen>("onboard1");



  // Keep track of the selected ride
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [rideOptions, setRideOptions] = useState<any>(null);
  const [pickupLocationData, setPickupLocationData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [rideData, setRideData] = useState<any>(null);
  const [url, setUrl] = useState("");

  const [registeredEmail, setRegisteredEmail] = useState("");
  const [ forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  

  useEffect(() => {
    registerSetScreen((scr: string) => {
  setScreen(scr as Screen);
});
  }, []);

    useMemo(() => {
    console.log("📱 [MainNavigator] Registering navigation ref");
    registerSetScreen((scr: string) => {
      console.log(`📱 [Navigation] Navigating to: ${scr}`);
      setScreen(scr as Screen);
    });
  }, []);

  const handleSetScreen = (newScreen: Screen, params?: any) => {
    if (newScreen === "planRide" && params) {
      console.log("📍 Setting pickup location data:", params);
      setPickupLocationData(params);
    }
    if (newScreen === "bookingScreen" && params) {
      console.log("📅 Setting booking data:", params);
      setBookingData(params);
    }
    if (newScreen === "standardScreen" && params) {
      console.log("🚗 Setting ride data:", params);
      setRideData(params);
    }

    console.log(`🔄 Updating screen state to: ${newScreen}`);
    setScreen(newScreen);
  };

 const checkIfRemembered = async () => {
  const rememberedEmail = await AsyncStorage.getItem("rememberedEmail");
  const token = await AsyncStorage.getItem("token");

  if (token || rememberedEmail) {

    setScreen("dashboard");
  } else {

    setScreen("login");
  }
};








  switch (screen) {
    case "onboard1":
        return <OnboardingScreen1 next={() => checkIfRemembered()} />;
      
    case "onboard2":
    return <OnboardingScreen2 next={() => {}}/>;
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
          next={(email) => {
            setRegisteredEmail(email);
            setScreen("verify");
          }}
          goLogin={() => setScreen("login")}
        />
      );


    case "reset":
      return (
        <ResetPasswordScreen
          goLogin={() => setScreen("login")}
          next={(email) => {
            setForgotPasswordEmail(email);
            setScreen("resetCredentials")
          }}
        />
      );
    case "verify":
      return (
      <VerifyEmailScreen
      goBack={() => setScreen("register")}
      next={() => setScreen("accountSuccess")}
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
      case "trackRide":
        return <RideTrackingScreen goBack={() => setScreen("dashboard")} />
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

      case "offerScreen":
        return (
          <RiderOffersScreen
            goBack={() => setScreen('dashboard')}
            next={() => setScreen('dashboard')}
          />
        )
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
          goCryptoDeposit={() => setScreen("cryptoDepositOne")}
          goBack={() => setScreen("wallet")}
        />
      );

    
    case "paymentMethod":
      return (
        <PaymentMethodScreen
          next={() => setScreen("dashboard")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
          goCryptoDeposit={() => setScreen("cryptoDepositOne")}
          goBack={() => setScreen("settings")}
        />
      );
    case "cryptoDepositOne":
      return (
        <CryptoDepositScreenOne
          next={() => setScreen("cryptoDepositTwo")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
          goCryptoDeposit={() => setScreen("cryptoDepositOne")}
          goBack={() => setScreen("paymentMethod")}
        />
      );
    case "cryptoDepositTwo":
      return (
        <CryptoDepositScreenTwo
          next={() => setScreen("paymentMethod")}
          goRegister={() => setScreen("register")}
          goForgot={() => setScreen("reset")}
          goCryptoDeposit={() => setScreen("cryptoDepositOne")}
          goBack={() => setScreen("cryptoDepositOne")}
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

    case "paystack":
      return (
        <DynamicPayStackWebViewScreen
          goBack={() => setScreen("wallet")}
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
      case "aboutus":
        return (
          <AboutUs 
            goBack={() => setScreen("settings")}
          />
        )
        case "language":
        return (
          <Language
            goBack={() => setScreen("settings")}
          />
        )
        case "terms":
          return (
            <TermsOfServiceScreen 
              goBack={() => setScreen("settings")}
            />
          )
        case "rateapscreen":
        return (
          <RateAppScreen 
            goBack={() => setScreen("settings")}
          />
        )

        case "report":
        return (
          <ReportIssue
            goBack={() => setScreen("settings")}
          />
        )
      case "ridereceipts":
        return (
          <RideReceipts 
            goBack={() => setScreen("settings")}
          />
        )
    case "redeemPoints":
      return (
        <RedeemPointsScreen
          goBack={() => setScreen('wallet')}
        />
      );
    case "resetCredentials":
      return (
        <ResetCredentialsScreen
          back={() => setScreen('reset')}
          next={() => setScreen("login")}
        />
      );

    case "analyticsScreen":
      return (
        <AnalyticsScreen
          setScreen={handleSetScreen}
          next={() => setScreen("loyalty")}
          goBack={()=> setScreen('dashboard')}
        />);

    case "wallet":
      return (
        <WalletScreen
          setScreen={handleSetScreen}
        />);

 /*   case "paystack":
      return <PaystackWebView 
        setScreen={setScreen}
      />*/

    case "loyalty":
      return (
        <LoyaltyPointsScreen
        next={() => setScreen("aboutus")}
        back={() => setScreen("analyticsScreen")}
        />);

    case "orderScreen":
      return (
        <PickUpScreen setScreen={handleSetScreen}
        goBack={() => setScreen("dashboard")}
        />);

    case "planRide":
      return (
        <PlanRideScreen setScreen={handleSetScreen}
        goBack={() => setScreen("orderScreen")} 
        locationData={pickupLocationData}
        />);

// MainNavigator.tsx

case "bookingScreen":
  return (
    <BookingScreen 
      setScreen={handleSetScreen} 
      goBack={() => setScreen("planRide")}
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
      goBack={() => setScreen("bookingScreen")}
      next={() => setScreen("offerScreen")}
      rideData={rideData}
    />
  );


    case "originalPriceDetails":
      return (
        <OriginalPriceDetailsScreen
          setScreen={setScreen}
          goBack={() => setScreen("planRide")}
        />
      );

    case "originalDriverDetails":
      return (
        <OriginalDriverDetailScreen
          setScreen={setScreen}
          goBack={() => setScreen("bookingScreen")}
        />
      );

    case "chatScreen":
      return (
        <ChatScreen
          goBack={() => setScreen("dashboard")}
        />
      );

    case "businessRideSelect":
      return (
        <BusinessRideSelectScreen
          setScreen={setScreen}
          goBack={() => setScreen("bookingScreen")}
        />
      );

      case "bookings": 
      return (
        <BookingsScreen 
          setScreen={setScreen}
          next={() => {setScreen("orderScreen")}}
          setSelectedRide={setSelectedRide} 
        />
      )

    case "additionalInformation":
     return (
        <AdditionalInformationScreen
          setScreen={setScreen}
          goBack={() => setScreen("bookingScreen")}
           rideOptions={rideOptions}
          setRideOptions={setRideOptions}
        />
      );

    case "premiumCarSelect":
      return (
        <PremiumCarSelectScreen
          setScreen={setScreen}
          goBack={() => setScreen("bookingScreen")}
        />
      );

    case "specialServices":
      return (
        <SpecialServicesScreen
        setScreen={setScreen}
        goBack={() => setScreen("premiumCarSelect")}
        rideOptions={rideOptions} 
        goNext={() => setScreen("modifyRide")}

        />
      );

    case "modifyRide":
      return ( 
        <ModifyRideScreen
        setScreen={setScreen}
        goBack={() => setScreen("premiumCarSelect")}
        />
      );

    case "businessCodeScreen":
      return (
        <BusinessCodeScreen
        setScreen={setScreen}
        goBack={() => setScreen("modifyRide")}
        goNext={() => setScreen("bookingScreen")}
        />
      );

    default:
      return null;
  }
}
