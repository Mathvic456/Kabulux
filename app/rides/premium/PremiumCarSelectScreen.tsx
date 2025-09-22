import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height } = Dimensions.get('window');

const rideOptions = [
    {
        id: 'original',
        name: 'Kablux Original',
        price: '#26,000',
        carType: 'SUV CAR',
        seats: '4 seater',
        details: 'Available in your area',
        premiumDetails: 'Premium experience grantee',
        image: 'https://placehold.co/100x60/d42a2a/fff?text=CAR',
        isBestOffer: true,
        rating: null,
    },
    {
        id: 'premium',
        name: 'Kablux Premium',
        price: '#26,000',
        carType: 'SUV CAR',
        seats: '4 seater',
        details: 'Available in your area',
        premiumDetails: null,
        image: 'https://placehold.co/100x60/000/fff?text=CAR',
        isBestOffer: false,
        rating: 3.2,
    },
    {
        id: 'business',
        name: 'Kablux Business',
        price: '#26,000',
        carType: 'SUV CAR',
        seats: '4 seater',
        details: '6.3km from you',
        premiumDetails: null,
        image: 'https://placehold.co/100x60/444/fff?text=CAR',
        isBestOffer: false,
        rating: 3.2,
    },
    {
        id: 'luxury',
        name: 'Kablux Luxury',
        price: '#26,000',
        carType: 'SUV CAR',
        seats: '4 seater',
        details: '1.8km from you',
        premiumDetails: null,
        image: 'https://placehold.co/100x60/fff/000?text=CAR',
        isBestOffer: false,
        rating: 3.2,
    },
    // Adding more options to demonstrate scrolling
    {
        id: 'executive',
        name: 'Kablux Executive',
        price: '#35,000',
        carType: 'Luxury Sedan',
        seats: '4 seater',
        details: '2.5km from you',
        premiumDetails: null,
        image: 'https://placehold.co/100x60/555/fff?text=CAR',
        isBestOffer: false,
        rating: 4.5,
    },
    {
        id: 'vip',
        name: 'Kablux VIP',
        price: '#45,000',
        carType: 'Premium SUV',
        seats: '6 seater',
        details: '3.1km from you',
        premiumDetails: null,
        image: 'https://placehold.co/100x60/777/fff?text=CAR',
        isBestOffer: false,
        rating: 4.8,
    },
];

export default function PremiumCarSelectScreen({ goBack, setScreen }: { goBack: () => void; setScreen: (screen: string) => void}) {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [selectedRide, setSelectedRide] = useState(rideOptions[0]);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [slideAnim]);

    const handleContinue = () => {
       setScreen('additionalInformation') 
    };

    // const handleGoBack = () => {
    //     // Handle go back action
    //     if (navigation) {
    //         navigation.goBack();
    //     } else {
    //         console.log('Go back pressed');
    //         // Add your fallback navigation logic here
    //     }
    // };

    return (
        <View style={styles.container}>
            {/* Map Placeholder */}
            <View style={styles.mapPlaceholder}>
                <Text style={styles.mapText}>[ Map Placeholder ]</Text>
            </View>

            {/* Sliding Bottom Overlay */}
            <Animated.View style={[styles.bottomPanel, { transform: [{ translateY: slideAnim }] }]}>
                {/* Header - Fixed at the top */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={goBack}>
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Kablux Premium</Text>
                </View>

                {/* Scrollable Content */}
                <ScrollView 
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.inputTitle}>Enter your KabLux business code</Text>

                    {rideOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.rideOptionItem,
                                option.id === selectedRide.id ? styles.selectedItem : styles.unselectedItem,
                                option.id === selectedRide.id && styles.selectedLayout,
                            ]}
                            onPress={() => setSelectedRide(option)}
                        >
                            {/* Best Offer badge, shown for best offer option */}
                            {option.isBestOffer && (
                                <View style={styles.bestOfferBadge}>
                                    <Text style={styles.bestOfferText}>BEST OFFER</Text>
                                </View>
                            )}
                            
                            {/* Conditional rendering for selected vs. unselected layout */}
                            {option.id === selectedRide.id ? (
                                <>
                                    <View style={styles.selectedPriceAndDetails}>
                                        <Text style={styles.selectedPrice}>{option.price}</Text>
                                        <Text style={styles.selectedCarType}>{option.carType}</Text>
                                        <Text style={styles.selectedDetails}>{option.details}</Text>
                                        <Text style={styles.selectedPremiumDetails}>{option.premiumDetails}</Text>
                                    </View>
                                    <Image source={{ uri: option.image }} style={styles.selectedImage} />
                                    <Text style={styles.selectedSeats}>{option.seats}</Text>
                                </>
                            ) : (
                                <>
                                    <Image source={{ uri: option.image }} style={styles.rideImage} />
                                    <View style={styles.rideDetailsContainer}>
                                        <Text style={styles.ridePrice}>{option.price}</Text>
                                        <Text style={styles.rideCarType}>{option.carType}</Text>
                                        <Text style={styles.rideSeats}>{option.seats}</Text>
                                        {option.isBestOffer && (
                                            <Text style={styles.rideDetails}>{option.details}</Text>
                                        )}
                                    </View>
                                    <View style={styles.rideRatingContainer}>
                                        <Text style={styles.rideDetails}>{option.details}</Text>
                                        {!option.isBestOffer && (
                                            <View style={styles.ratingBox}>
                                                <Feather name="star" size={16} color="#f6a623" />
                                                <Text style={styles.ratingText}>{option.rating}</Text>
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    ))}
                    
                    {/* Add some extra space at the bottom for better scrolling */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Continue Button - Fixed at the bottom */}
                <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#aaa',
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.7,
        backgroundColor: '#1c1c1c',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        flex: 1,
        marginRight: 40, // To balance the space on both sides
    },
    scrollContainer: {
        flex: 1,
        marginBottom: 70, // Space for the continue button
    },
    scrollContent: {
        paddingBottom: 20,
    },
    inputTitle: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    rideOptionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2b2b2b',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        minHeight: 100,
    },
    selectedItem: {
        borderWidth: 2,
        borderColor: '#f6a623',
    },
    unselectedItem: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    selectedLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    selectedPriceAndDetails: {
        position: 'absolute',
        top: 20,
        left: 20,
        alignItems: 'flex-start',
    },
    selectedPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    selectedCarType: {
        fontSize: 16,
        color: 'white',
    },
    selectedDetails: {
        fontSize: 12,
        color: '#fff',
        marginTop: 10,
    },
    selectedPremiumDetails: {
        fontSize: 12,
        color: '#fff',
    },
    selectedSeats: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        fontSize: 14,
        color: '#aaa',
    },
    selectedImage: {
        width: '100%',
        height: 120,
        resizeMode: 'contain',
        marginTop: 40,
    },
    bestOfferBadge: {
        position: 'absolute',
        top: -10,
        right: 10,
        backgroundColor: 'red',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        zIndex: 1,
    },
    bestOfferText: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold',
    },
    rideImage: {
        width: 120,
        height: 80,
        resizeMode: 'contain',
        marginRight: 10,
    },
    rideDetailsContainer: {
        flex: 1,
    },
    ridePrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    rideCarType: {
        fontSize: 16,
        color: 'white',
    },
    rideSeats: {
        fontSize: 14,
        color: '#aaa',
    },
    rideDetails: {
        fontSize: 12,
        color: '#fff',
    },
    rideRatingContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    ratingText: {
        fontSize: 14,
        color: '#f6a623',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    bottomSpacer: {
        height: 20,
    },
    continueButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#f6a623',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});