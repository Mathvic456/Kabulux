import CarSpecsModal from '@/components/ui/CarSpecsModal';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
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
import Driver from '../../../assets/images/driver.png';



export default function OriginalDriverDetailScreen({setScreen, goBack}: {setScreen: (screen: string) => void, goBack: () => void}                               ) {
    
  const [specsVisible, setSpecsVisible] = useState(false);
    
    return (
        <View style={styles.container}>
            {/* Header with back button and title */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Driver Detail</Text>
            </View>

            {/* Main content in a scrollable view */}
            <ScrollView style={styles.scrollView}>
                {/* Driver status section */}
                <View style={styles.statusSection}>
                    <Text style={styles.statusText}>Your Driver is on his way</Text>
                    <View style={styles.etaContainer}>
                        <Ionicons name="time-outline" size={16} color="white" />
                        <Text style={styles.etaText}>4mins</Text>
                    </View>
                </View>

                {/* Driver and action cards */}
                <View style={styles.infoCardsRow}>
                    <View style={styles.driverInfoCard}>
                        <Image source={Driver} style={styles.driverAvatar} />
                        <Text style={styles.driverName}>Azeez</Text>
                        <View style={styles.ratingContainer}>
                            <FontAwesome5 name="star" size={14} color="#f6a623" />
                            <Text style={styles.ratingText}>4.2</Text>
                        </View>
                        <Text style={styles.carDetailText}>Dark Red Toyota Corolla</Text>
                    </View>

                    <View style={styles.actionButtons}>
                        <View style={{alignItems:'center'}} >
                            <TouchableOpacity style={styles.actionButton}>
                                <Feather name="phone" size={18} color="#f6a623" />
                            </TouchableOpacity>

                            <Text style={styles.actionText}>Contact Driver</Text> 
                        </View>

                        <View style={{alignItems:'center'}} >       
                            <TouchableOpacity style={styles.actionButton} onPress={() => setScreen("chatScreen")}>
                                <Feather name="message-circle" size={18} color="#f6a623" />
                            </TouchableOpacity>
                            <Text style={styles.actionText}>Chat</Text>
                        </View>

                        <View style={{alignItems:'center'}} >    
                            <TouchableOpacity style={styles.actionButton}>
                                <Feather name="share-2" size={18} color="#f6a623" />
                            </TouchableOpacity>
                            <Text style={styles.actionText}>Share</Text>
                        </View> 
                    
                    </View>
                </View>

                {/* Car details section */}
                <View style={styles.carDetailSection}>
                    <Text style={styles.carName}>Mustang Shelby GT</Text>
                    <View style={styles.carRatingContainer}>
                        <FontAwesome5 name="star" size={16} color="#f6a623" />
                        <Text style={styles.carRatingText}>4.9</Text>
                        <Text style={styles.carReviewText}>(531 reviews)</Text>
                    </View>
                    <View style={styles.carImageContainer}>
                        <TouchableOpacity style={styles.imageArrow}>
                            <Feather name="chevron-left" size={30} color="#777" />
                        </TouchableOpacity>
                        <Image source={Car} style={styles.carImage} />
                        <TouchableOpacity style={styles.imageArrow}>
                            <Feather name="chevron-right" size={30} color="#777" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Specifications section */}
                <View style={styles.specificationsSection}>
                    <Text style={styles.specificationsTitle}>Specifications</Text>
                    <TouchableOpacity onPress={() => setSpecsVisible(true)}>
                        <Text style={styles.specificationsText}>Click to see more</Text>
                    </TouchableOpacity>
                </View>

                {/* Pickup message section */}
                <View style={styles.pickupMessageSection}>
                    <Feather name="message-square" size={20} color="#f6a623" />
                    <Text style={styles.pickupMessageText}>Pickup Message</Text>
                    <Image source={Car} style={styles.pickupAvatar} />
                </View>

                {/* Payment and pickup location details */}
                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailTitle}>Payment</Text>
                        <View style={styles.paymentInfo}>
                            <Feather name="credit-card" size={20} color="#388e3c" />
                            <Text style={styles.paymentAmount}>NGN 6,700</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailTitle}>Pickup</Text>
                        <View style={styles.pickupInfo}>
                            <Feather name="map-pin" size={20} color="#fff" />
                            <Text style={styles.pickupAddress}>Abraham Adesanya Estate</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            </TouchableOpacity>

             {/* Bottom Sheet */}
      <CarSpecsModal visible={specsVisible} onClose={() => setSpecsVisible(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#181818',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
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
        paddingHorizontal: 20,
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    statusText: {
        fontSize: 16,
        color: 'white',
    },
    etaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    etaText: {
        color: 'white',
        marginLeft: 5,
    },
    infoCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    driverInfoCard: {
        backgroundColor: '#1c1c1c',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
    },
    driverAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 5,
    },
    ratingText: {
        color: 'white',
        marginLeft: 5,
    },
    carDetailText: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 5,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flex: 1,
        marginLeft: 15,
        // borderWidth:1,
        // borderColor:'blue',
    },
    actionButton: {
        alignItems: 'center',
        backgroundColor: '#1F212A',
        borderRadius: 100,
        borderWidth:1,
        padding:10,
        borderColor:'#FEB914',
        height:40,
        width:40,   
        justifyContent:'center' 
        
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
        
    },
    carDetailSection: {
        backgroundColor: '#1c1c1c',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    carName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    carRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    carRatingText: {
        color: 'white',
        marginLeft: 5,
    },
    carReviewText: {
        color: '#aaa',
        marginLeft: 5,
    },
    carImageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    imageArrow: {
        padding: 10,
    },
    carImage: {
        width: 250,
        height: 125,
        resizeMode: 'contain',
    },
    specificationsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    specificationsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    specificationsText: {
        color: '#aaa',
    },
    pickupMessageSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    pickupMessageText: {
        fontSize: 16,
        color: 'white',
        marginLeft: 10,
        flex: 1,
    },
    pickupAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    detailCard: {
        backgroundColor: '#1c1c1c',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    detailTitle: {
        color: '#aaa',
        fontSize: 14,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 5,
    },
    pickupInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickupAddress: {
        fontSize: 16,
        color: 'white',
        marginLeft: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 10,
    },
    cancelButton: {
        backgroundColor: '#f6a623',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
