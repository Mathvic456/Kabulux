import { Feather, FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Car from '../../../assets/images/car.png';
import CarT from '../../../assets/images/car2.png';

const driverBids = [

    {
        name: 'Azeez',
        price: 8000,
        rating: 4.2,
        eta: '8 min',
        distance: '3.7 KM',
        id: 'G21D49SL',
        image: Car,
        carType: 'Toyota Camry',
        carColor: 'Black',
        licensePlate: 'ABC123',
        reviews: 42,
        trips: 156,
    },

    {
        name: 'John',
        price: 8500,
        rating: 3.2,
        eta: '9 min',
        distance: '3.7 KM',
        id: 'F3D4567T',
        image: Car,
        carType: 'Honda Accord',
        carColor: 'White',
        licensePlate: 'XYZ789',
        reviews: 28,
        trips: 89,
    },

    {
        name: 'Ade',
        price: 8700,
        rating: 4.2,
        eta: '5 min',
        distance: '3.7 KM',
        id: 'FW6514RA',
        image: Car,
        carType: 'Nissan Altima',
        carColor: 'Blue',
        licensePlate: 'DEF456',
        reviews: 67,
        trips: 203,
    },
];

const driverImages = [Car,CarT];

export default function OriginalPriceDetailsScreen({ setScreen, goBack }: { setScreen: (screen: string, params?: any) => void; goBack: () => void }) {
    const [baseOffer, setBaseOffer] = useState(6700);
    const [selectedBid, setSelectedBid] = useState(null);

    const increaseOffer = () => {
        setBaseOffer(prev => prev + 100);
    };

    const decreaseOffer = () => {
        if (baseOffer > 1000) { // Prevent going below minimum offer
            setBaseOffer(prev => prev - 100);
        }
    };

    const formatPrice = (price) => {
        return `NGN ${price.toLocaleString()}`;
    };

    const handleBidPress = (bid) => {
        setSelectedBid(bid);
        // Navigate to driver details screen with the selected bid data
        setScreen('originalDriverDetails', { 
            driver: bid,
            baseOffer: baseOffer 
        });
    };

    // const handleBackPress = () => {
    //     setScreen('PreviousScreen'); // Replace with your actual previous screen
    // };

    return (
        <View style={styles.container}>
            {/* Top Navigation and Header - Fixed */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Price Details</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Price Offer Section */}
                <View style={styles.priceOfferContainer}>
                    <Text style={styles.sectionTitle}>Based Offer</Text>
                    <View style={styles.priceRow}>
                        <TouchableOpacity 
                            style={styles.plusMinusButton} 
                            onPress={decreaseOffer}
                            disabled={baseOffer <= 1000}
                        >
                            <Feather 
                                name="minus" 
                                size={24} 
                                color={baseOffer <= 1000 ? "#666" : "#f6a623"} 
                            />
                        </TouchableOpacity>
                        <Text style={styles.priceText}>{formatPrice(baseOffer)}</Text>
                        <TouchableOpacity 
                            style={styles.plusMinusButton} 
                            onPress={increaseOffer}
                        >
                            <Feather name="plus" size={24} color="#f6a623" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.driverInfoRow}>
                        <View style={styles.driverAvatars}>
                            {driverImages.map((image, index) => (
                                <View key={index} style={styles.avatarContainer}>
                                    <Image
                                        source={Car}
                                        style={styles.driverImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}
                        </View>
                        <Text style={styles.driverCountText}>6 drivers viewed your request</Text>
                    </View>
                </View>

                {/* Driver Bids List */}
                <View style={styles.bidsList}>
                    {driverBids.map((bid, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                styles.bidCard,
                                selectedBid?.id === bid.id && styles.selectedBidCard
                            ]} 
                            onPress={() => handleBidPress(bid)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.bidHeader}>
                                <View style={styles.driverNameContainer}>
                                    <View style={styles.avatarContainer}>
                                        <Image
                                            source={Car}
                                            style={styles.driverImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <Text style={styles.driverName}>{bid.name}</Text>
                                </View>
                                <View style={styles.ratingContainer}>
                                    <FontAwesome5 name="star" size={14} color="#f6a623" />
                                    <Text style={styles.ratingText}>{bid.rating}</Text>
                                </View>
                            </View>
                            <Text style={styles.bidPrice}>{formatPrice(bid.price)}</Text>
                            <View style={styles.bidDetailsRow}>
                                <Text style={styles.bidDetailsText}>{bid.eta}</Text>
                                <Text style={styles.bidDetailsText}>{bid.distance}</Text>
                                <Text style={styles.bidId}>{bid.id}</Text>
                            </View>
                            
                            {/* Price comparison indicator */}
                            <View style={styles.priceComparison}>
                                {bid.price < baseOffer ? (
                                    <Text style={styles.betterPriceText}>
                                        ✓ Better than your offer
                                    </Text>
                                ) : bid.price > baseOffer ? (
                                    <Text style={styles.higherPriceText}>
                                        +{formatPrice(bid.price - baseOffer)}
                                    </Text>
                                ) : (
                                    <Text style={styles.equalPriceText}>
                                        Matches your offer
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
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
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#000',
        zIndex: 10,
    },
    backButton: {
        padding: 10,
        backgroundColor: '#1c1c1c',
        borderRadius: 50,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    priceOfferContainer: {
        backgroundColor: '#1c1c1c',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#aaa',
        fontSize: 16,
        marginBottom: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    plusMinusButton: {
        backgroundColor: '#2b2b2b',
        borderRadius: 50,
        padding: 8,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
    },
    driverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverAvatars: {
        flexDirection: 'row',
        marginRight: 10,
    },
    avatarContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#444',
        marginRight: -8,
        borderWidth: 2,
        borderColor: '#1c1c1c',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 3,
    },
    driverImage: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    driverCountText: {
        color: '#aaa',
        fontSize: 14,
    },
    bidsList: {
        marginBottom: 20,
    },
    bidCard: {
        backgroundColor: '#1c1c1c',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedBidCard: {
        borderColor: '#f6a623',
        backgroundColor: '#2a2a2a',
    },
    bidHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    driverNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '600',
    },
    bidPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    bidDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bidDetailsText: {
        color: '#aaa',
        fontSize: 14,
    },
    bidId: {
        color: '#777',
        fontSize: 12,
        fontStyle: 'italic',
    },
    priceComparison: {
        marginTop: 5,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    betterPriceText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '600',
    },
    higherPriceText: {
        color: '#f6a623',
        fontSize: 14,
        fontWeight: '600',
    },
    equalPriceText: {
        color: '#aaa',
        fontSize: 14,
        fontStyle: 'italic',
    },
    cancelButton: {
        backgroundColor: '#f6a623',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});