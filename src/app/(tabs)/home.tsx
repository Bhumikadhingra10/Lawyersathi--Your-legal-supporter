import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, StyleSheet, Dimensions, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { 
  Menu, 
  MapPin, 
  SlidersHorizontal, 
  Search, 
  Flame, 
  Building2, 
  Scale, 
  FileText, 
  PenTool, 
  Files, 
  CheckCircle2, 
  Check,
  Star, 
  ChevronDown, 
  Compass, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Users,
  User,
  Calendar,
  CreditCard,
  LogIn,
  LogOut,
  Info
} from 'lucide-react-native';
import { useStore } from '../../store/store';

const { width, height } = Dimensions.get('window');

const headingFont = Platform.OS === 'web' ? "'Times New Roman', Times, Georgia, serif" : (Platform.OS === 'ios' ? 'Times New Roman' : 'serif');
const bodyFont = Platform.OS === 'web' ? "'Inter', sans-serif" : (Platform.OS === 'ios' ? 'System' : 'sans-serif');

const SDM_OFFICES = [
  {
    region: 'North Region',
    offices: [
      { name: 'SDM Alipur', address: 'DM Office Complex, Alipur, Delhi-110036', latitude: 28.7972, longitude: 77.1331 },
      { name: 'SDM Model Town', address: 'Near NDPL Office, Azadpur Flyover, Delhi-110033', latitude: 28.7031, longitude: 77.1950 }
    ]
  },
  {
    region: 'South Region',
    offices: [
      { name: 'SDM Saket', address: 'M.B. Road, Saket, New Delhi-110068', latitude: 28.5222, longitude: 77.2185 },
      { name: 'SDM Mehrauli', address: 'Old Tehsil Building, Mehrauli, New Delhi', latitude: 28.5175, longitude: 77.1820 }
    ]
  },
  {
    region: 'East Region',
    offices: [
      { name: 'SDM Gandhi Nagar', address: 'Office of DC-East, LM Bund Road, Shastri Nagar, New Delhi', latitude: 28.6542, longitude: 77.2680 },
      { name: 'SDM Preet Vihar', address: 'Office of DC-East, LM Bund Road, Shastri Nagar, New Delhi', latitude: 28.6418, longitude: 77.2910 }
    ]
  },
  {
    region: 'West Region',
    offices: [
      { name: 'SDM Rajouri Garden', address: 'Plot No. 3, Shivaji Place, Raja Garden, Delhi-27', latitude: 28.6415, longitude: 77.1208 },
      { name: 'SDM Punjabi Bagh', address: 'Co-operative Bank Building, Nangloi, Delhi-110041', latitude: 28.6678, longitude: 77.1264 }
    ]
  },
  {
    region: 'Central Region',
    offices: [
      { name: 'SDM Karol Bagh', address: 'Flatted Factory Complex, Jhandewalan, New Delhi-110002', latitude: 28.6514, longitude: 77.1903 },
      { name: 'SDM Civil Lines', address: '2nd Floor, Old Civil Supply Building, Tis Hazari, Delhi-54', latitude: 28.6814, longitude: 77.2229 }
    ]
  },
  {
    region: 'New Delhi Region',
    offices: [
      { name: 'SDM New Delhi (HQ)', address: '12/1, Jam Nagar House, Shahjahan Road, New Delhi-110011', latitude: 28.6106, longitude: 77.2303 },
      { name: 'SDM Chanakyapuri', address: '12/1, Jam Nagar House, Shahjahan Road, New Delhi-110011', latitude: 28.5923, longitude: 77.1843 }
    ]
  },
  {
    region: 'South West Region',
    offices: [
      { name: 'SDM Dwarka', address: 'Sector-10, Dwarka, New Delhi', latitude: 28.5872, longitude: 77.0605 },
      { name: 'SDM Najafgarh', address: 'B-64A Tehsil Road, Turamandi, Najafgarh-45', latitude: 28.6119, longitude: 76.9839 }
    ]
  },
  {
    region: 'North East Region',
    offices: [
      { name: 'SDM Karawal Nagar', address: 'DC Office Complex, Nand Nagri, Delhi-93', latitude: 28.7303, longitude: 77.2764 },
      { name: 'SDM Yamuna Vihar', address: 'Near DCP Office, North East Delhi-110053', latitude: 28.7019, longitude: 77.2731 }
    ]
  },
  {
    region: 'North West Region',
    offices: [
      { name: 'SDM Rohini', address: 'DC Office Complex, Kanjhawala, Delhi-110081', latitude: 28.7424, longitude: 77.1190 },
      { name: 'SDM Saraswati Vihar', address: 'Old Middle School Building, Lawrence Road, Rampura, Delhi-110035', latitude: 28.6918, longitude: 77.1430 }
    ]
  },
  {
    region: 'South East Region',
    offices: [
      { name: 'SDM Defence Colony', address: 'Old Gargi College Building, Lajpat Nagar-IV, New Delhi', latitude: 28.5726, longitude: 77.2332 },
      { name: 'SDM Kalkaji', address: 'Plot No. 37, Institutional Area, Tughlakabad, New Delhi', latitude: 28.5482, longitude: 77.2513 }
    ]
  },
  {
    region: 'Shahdara Region',
    offices: [
      { name: 'SDM Shahdara', address: 'DC Office, Nand Nagri, Near Gagan Cinema, Delhi-93', latitude: 28.6731, longitude: 77.2885 },
      { name: 'SDM Vivek Vihar', address: 'DC Office, Nand Nagri, Near Gagan Cinema, Delhi-93', latitude: 28.6667, longitude: 77.3008 }
    ]
  }
];

export default function HomeDashboard() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const selectedLocation = useStore(state => state.selectedLocation);
  const setLocation = useStore(state => state.setLocation);
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const fetchLawyerApplications = useStore(state => state.fetchLawyerApplications);

  useEffect(() => {
    fetchLawyerApplications();
  }, [fetchLawyerApplications]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);

  const drawerItems = [
    { title: 'User Information', icon: User, action: () => router.push('/(tabs)/profile') },
    { title: 'Bookings', icon: Calendar, action: () => router.push('/(tabs)/bookings') },
    { title: 'Documents', icon: FileText, action: () => router.push('/documents-vault') },
    { title: 'Payment History', icon: CreditCard, action: () => router.push('/payment-history') },
    { title: 'Lawyer Applications', icon: Briefcase, action: () => router.push('/lawyer-applications') },
    { title: 'About Us', icon: Info, action: () => router.push('/about') },
  ];


  const reverseGeocodeWeb = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      if (latitude === 28.6304 && longitude === 77.2177) {
        return 'Connaught Place, New Delhi';
      }
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'LawyerSathi-App'
          }
        }
      );
      const data = await response.json();
      if (data && data.address) {
        const area = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.subdistrict || data.address.city_district || data.address.road || data.address.village || 'Central Delhi';
        const city = data.address.city || data.address.town || data.address.state || 'Delhi';
        return `${area}, ${city}`;
      }
    } catch (err) {
      console.log('Nominatim reverse geocoding failed:', err);
    }
    return null;
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied.');
        setDetectingLocation(false);
        return;
      }

      let currentLoc = null;
      try {
        currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000
        } as any);
      } catch (posError) {
        console.log('Location.getCurrentPositionAsync failed, trying browser geolocation:', posError);
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          try {
            const pos = await new Promise<any>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000
              });
            });
            currentLoc = {
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              }
            };
          } catch (browserError) {
            console.log('Browser geolocation also failed:', browserError);
          }
        }
      }

      if (!currentLoc) {
        currentLoc = {
          coords: {
            latitude: 28.6304,
            longitude: 77.2177
          }
        };
        console.log('Using mock Delhi fallback coordinates.');
      }

      let locationName = '';

      try {
        const addressList = await Location.reverseGeocodeAsync({
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude
        });
        if (addressList && addressList.length > 0) {
          const address = addressList[0];
          const city = address.city || address.subregion || address.region || 'Delhi';
          const area = address.district || address.street || address.name || 'Central Delhi';
          locationName = `${area}, ${city}`;
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed, trying web fallback:', geocodeError);
      }

      if (!locationName) {
        const webAddress = await reverseGeocodeWeb(currentLoc.coords.latitude, currentLoc.coords.longitude);
        if (webAddress) {
          locationName = webAddress;
        }
      }

      if (!locationName) {
        locationName = 'Connaught Place, New Delhi';
      }

      setLocation(locationName);
      setCityModalVisible(false);
    } catch (err: any) {
      console.error(err);
      setLocationError('Error detecting location. Please select manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleToggleTracking = async () => {
    if (isTracking) {
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
      setIsTracking(false);
    } else {
      setDetectingLocation(true);
      setLocationError(null);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied.');
          setDetectingLocation(false);
          return;
        }

        let currentLoc = null;
        try {
          currentLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000
          } as any);
        } catch (posError) {
          console.log('Location.getCurrentPositionAsync failed, trying browser geolocation:', posError);
          if (typeof navigator !== 'undefined' && navigator.geolocation) {
            try {
              const pos = await new Promise<any>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 5000
                });
              });
              currentLoc = {
                coords: {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude
                }
              };
            } catch (browserError) {
              console.log('Browser geolocation also failed:', browserError);
            }
          }
        }

        if (!currentLoc) {
          currentLoc = {
            coords: {
              latitude: 28.6304,
              longitude: 77.2177
            }
          };
        }

        let initialLocName = '';
        try {
          const address = await Location.reverseGeocodeAsync({
            latitude: currentLoc.coords.latitude,
            longitude: currentLoc.coords.longitude
          });
          if (address && address.length > 0) {
            const city = address[0].city || address[0].subregion || address[0].region || 'Delhi';
            const area = address[0].district || address[0].street || address[0].name || 'Central Delhi';
            initialLocName = `${area}, ${city}`;
          }
        } catch (e) {
          console.log('reverseGeocodeAsync failed on toggle tracking init:', e);
        }

        if (!initialLocName) {
          const webAddress = await reverseGeocodeWeb(currentLoc.coords.latitude, currentLoc.coords.longitude);
          if (webAddress) {
            initialLocName = webAddress;
          }
        }

        if (initialLocName) {
          setLocation(initialLocName);
        }

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 10
          },
          async (newLoc) => {
            try {
              let locationText = '';
              try {
                const [addr] = await Location.reverseGeocodeAsync({
                  latitude: newLoc.coords.latitude,
                  longitude: newLoc.coords.longitude
                });
                if (addr) {
                  const city = addr.city || addr.subregion || addr.region || 'Delhi';
                  const area = addr.district || addr.street || addr.name || 'Central Delhi';
                  locationText = `${area}, ${city}`;
                }
              } catch (e) {
                console.log('watchPosition reverseGeocodeAsync failed, trying web:', e);
              }

              if (!locationText) {
                const webAddress = await reverseGeocodeWeb(newLoc.coords.latitude, newLoc.coords.longitude);
                if (webAddress) {
                  locationText = webAddress;
                }
              }

              if (locationText) {
                setLocation(locationText);
              }
            } catch (e) {
              console.log('Error reverse geocoding in watchPosition:', e);
            }
          }
        );
        setSubscription(sub);
        setIsTracking(true);
      } catch (err) {
        console.error(err);
        setLocationError('Error enabling live tracking.');
      } finally {
        setDetectingLocation(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  const handleSelectNearestSDM = async () => {
    setDetectingLocation(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied.');
        setDetectingLocation(false);
        return;
      }

      let currentLoc = null;
      try {
        currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000
        } as any);
      } catch (posError) {
        console.log('Location.getCurrentPositionAsync failed, trying browser geolocation:', posError);
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          try {
            const pos = await new Promise<any>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000
              });
            });
            currentLoc = {
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              }
            };
          } catch (browserError) {
            console.log('Browser geolocation also failed:', browserError);
          }
        }
      }

      if (!currentLoc) {
        currentLoc = {
          coords: {
            latitude: 28.6304,
            longitude: 77.2177
          }
        };
        console.log('Using mock Delhi fallback coordinates.');
      }

      const userLat = currentLoc.coords.latitude;
      const userLng = currentLoc.coords.longitude;

      let nearestOffice = null;
      let minDistance = Infinity;

      for (const regionGroup of SDM_OFFICES) {
        for (const office of regionGroup.offices) {
          if (office.latitude !== undefined && office.longitude !== undefined) {
            const lat1 = userLat;
            const lon1 = userLng;
            const lat2 = office.latitude;
            const lon2 = office.longitude;
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;

            if (distance < minDistance) {
              minDistance = distance;
              nearestOffice = office;
            }
          }
        }
      }

      if (nearestOffice) {
        const fullOfficeText = `${nearestOffice.name}, Delhi`;
        
        if (isTracking) {
          if (subscription) {
            subscription.remove();
            setSubscription(null);
          }
          setIsTracking(false);
        }
        
        setLocation(fullOfficeText);
        setCityModalVisible(false);
        alert(`Nearest Office Found: ${nearestOffice.name}\nDistance: ${minDistance.toFixed(1)} km away`);
      } else {
        setLocationError('Could not determine nearest SDM office.');
      }
    } catch (err: any) {
      console.error(err);
      setLocationError('Error finding nearest office. Please select manually.');
    } finally {
      setDetectingLocation(false);
    }
  };





  const subServices = [
    {
      id: 'sub1',
      title: 'Hindu Marriage Registration',
      icon: Flame,
      desc: 'For Hindu, Buddhist, Jain, or Sikh couples',
      longDesc: 'For couples where both parties are Hindu, Buddhist, Jain, or Sikh, available for marriages solemnized through traditional ceremonies or those registered post-facto.',
      tag: 'Popular'
    },
    {
      id: 'sub2',
      title: 'Special Marriage Registration',
      icon: FileText,
      desc: 'For inter-faith or Christian/Muslim couples',
      longDesc: 'For couples where one or both parties belong to religions such as Christian or Muslim, or for inter-faith marriages, often requiring a 30-day notice period.',
      tag: 'Popular'
    },
    {
      id: 'sub3',
      title: 'Intended Marriage Registration',
      icon: Building2,
      desc: 'Solemnize & register simultaneously',
      longDesc: 'For couples wishing to solemnize and register their marriage simultaneously in the presence of a sub-registrar.'
    },
    {
      id: 'sub4',
      title: 'Late Registration',
      icon: ShieldCheck,
      desc: 'For marriages occurred > 5 years prior',
      longDesc: 'For marriages that occurred more than five years prior, requiring verification by higher authorities like the District Registrar or Collector.'
    },
    {
      id: 'sub5',
      title: 'Certificate Issuance',
      icon: Files,
      desc: 'Provision of certified copies',
      longDesc: 'Provision of certified copies of the registered marriage deed or certificate for official use.'
    }
  ];

  const lawyerApplications = useStore(state => state.lawyerApplications);
  const registeredLawyers = lawyerApplications.map((app, index) => {
    let avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=150&h=150&q=80'; // Default Male
    if (app.gender === 'Female') {
      avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150&q=80';
    }

    return {
      id: `real_lawyer_${index}`,
      name: app.name.startsWith('Adv.') ? app.name : `Adv. ${app.name}`,
      avatar: avatar,
      experience: app.experience ? `${app.experience} Yrs Exp.` : '',
      rating: 5.0,
      reviews: 0,
      service: app.selectedSpecs?.[0] || 'Marriage Registration',
    };
  });

  return (
    <View className="flex-1 bg-[#F8F5EF]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 1. Splash / Header Section */}
        <View 
          className="w-full bg-[#FCFAF6] border-b border-neutral-100 z-10 relative items-center justify-center" 
          style={{ 
            aspectRatio: Platform.OS === 'web' ? 1020 / 339 : undefined,
            height: Platform.OS === 'web' ? undefined : 160,
            paddingTop: Platform.OS === 'web' ? 0 : 30,
            overflow: 'hidden'
          }}
        >
          <Image
            source={require('../../../assets/images/logo_banner.png')}
            style={{ 
              width: '100%', 
              height: '100%',
            }}
            contentFit="contain"
          />

          {/* Left overlay hamburger Menu */}
          <TouchableOpacity 
            onPress={() => setMenuDrawerVisible(true)}
            style={{ 
              position: 'absolute', 
              top: Platform.OS === 'web' ? 20 : 45, 
              left: 20,  
              zIndex: 10,
              backgroundColor: '#FAF7EE',
              borderWidth: 1.5,
              borderColor: '#D4AF37',
              padding: 10,
              borderRadius: 99,
              shadowColor: '#D4AF37',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Menu size={20} color="#D4AF37" strokeWidth={2.5} />
          </TouchableOpacity>


        </View>
        
        {/* 2. Location Section */}
        <View className="px-6 pt-5">
          <View className="bg-white rounded-3xl p-4 border border-neutral-150 flex-row justify-between items-center shadow-xs">
            <TouchableOpacity 
              onPress={() => setCityModalVisible(true)}
              className="flex-row items-center flex-1 pr-3"
            >
              <View className="w-10 h-10 bg-amber-50 rounded-2xl justify-center items-center mr-3 border border-gold/15 shadow-xs">
                {selectedLocation.toLowerCase().includes('sdm') ? (
                  <Building2 size={22} color="#B8860B" strokeWidth={2.2} />
                ) : (
                  <MapPin size={22} color="#B8860B" strokeWidth={2.2} />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5 flex-wrap">
                  <Text 
                    className="text-gray-400 text-[9px] font-bold uppercase tracking-wider"
                    style={{ fontFamily: bodyFont }}
                  >
                    {selectedLocation.toLowerCase().includes('sdm') ? 'Assigned SDM Registry' : 'Current Location'}
                  </Text>
                  {isTracking && (
                    <View className="flex-row items-center bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-250">
                      <View className="w-1 h-1 bg-emerald-500 rounded-full mr-1" />
                      <Text 
                        className="text-[7px] text-emerald-600 font-extrabold uppercase tracking-wide"
                        style={{ fontFamily: bodyFont }}
                      >
                        Live GPS
                      </Text>
                    </View>
                  )}
                  {selectedLocation.toLowerCase().includes('sdm') && (
                    <View className="flex-row items-center bg-amber-50 px-1.5 py-0.5 rounded-full border border-gold/25">
                      <Building2 size={8} color="#D4AF37" className="mr-0.5" />
                      <Text 
                        className="text-[7px] text-[#6D5218] font-extrabold uppercase tracking-wide"
                        style={{ fontFamily: bodyFont }}
                      >
                        SDM Registry
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center mt-1 flex-wrap gap-1">
                  <Text 
                    className="text-neutral-900 font-black text-xs mr-1" 
                    numberOfLines={1}
                    style={{ fontFamily: headingFont }}
                  >
                    {selectedLocation}
                  </Text>
                  <ChevronDown size={12} color="#9CA3AF" />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setCityModalVisible(true)}
              className="bg-neutral-900 px-3.5 py-2 rounded-xl flex-row items-center"
            >
              <Compass size={12} color="#FFFFFF" className="mr-1.5" />
              <Text 
                className="text-white text-[10px] font-bold uppercase tracking-wider"
                style={{ fontFamily: bodyFont }}
              >
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* 4. Search Section */}
        <View className="px-6 pt-6">
          <View className="flex-row gap-3">
            <View className="flex-grow flex-row items-center bg-white border border-neutral-150 rounded-2xl px-3.5 py-3 shadow-xs">
              <Search size={14} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search lawyers, legal services..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-neutral-850 text-xs font-semibold p-0"
              />
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/lawyers')}
              className="p-3 bg-white border border-neutral-150 rounded-2xl items-center justify-center shadow-xs"
            >
              <SlidersHorizontal size={14} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Hero Banner Section */}
        <View className="px-6 pt-6">
          <TouchableOpacity 
            onPress={() => router.push('/package')}
            className="w-full overflow-hidden rounded-[28px] border border-gold/15 shadow-sm bg-[#F3F0DF] relative flex-row items-center"
            style={{ 
              height: Platform.OS === 'web' ? 140 : 120
            }}
          >
            {/* Flowers on the extreme right */}
            <Image
              source={require('../../../assets/images/flowers_only_banner.png')}
              style={{ 
                position: 'absolute',
                right: 0,
                width: windowWidth < 380 ? 90 : (Platform.OS === 'web' ? 140 : 120),
                height: '100%'
              }}
              contentFit="contain"
            />

            {/* Programmatic details text on the left */}
            <View 
              style={{ 
                flex: 1, 
                paddingLeft: windowWidth < 380 ? 16 : 24, 
                paddingRight: windowWidth < 380 ? 100 : (Platform.OS === 'web' ? 150 : 130),
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <Text 
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumScaleFactor={0.7}
                style={{ 
                  color: '#5C4033', 
                  fontSize: windowWidth < 380 ? 13 : (Platform.OS === 'web' ? 20 : 15), 
                  fontWeight: '900',
                  letterSpacing: 0.5,
                  marginBottom: 6,
                  fontFamily: headingFont
                }}
              >
                MARRIAGE REGISTRATION
              </Text>
              <Text 
                style={{ 
                  color: '#6e5d53', 
                  fontSize: windowWidth < 380 ? 9 : (Platform.OS === 'web' ? 12 : 10), 
                  fontWeight: '700',
                  lineHeight: windowWidth < 380 ? 12 : (Platform.OS === 'web' ? 16 : 14),
                  fontFamily: bodyFont
                }}
              >
                Register your marriage at your choice.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. Legal Services Section (6 Sub Services Cards Grid) */}
        <View className="px-6 pt-6">
          <View className="mb-3 flex-row items-center gap-2">
            <View className="w-7 h-7 bg-amber-50 rounded-lg justify-center items-center border border-gold/10">
              <Scale size={16} color="#B8860B" strokeWidth={2.5} />
            </View>
            <View>
              <Text 
                className="text-neutral-900 text-lg font-black"
                style={{ fontFamily: headingFont }}
              >
                Marriage Registrations
              </Text>
              <Text 
                className="text-gold text-[10px] font-bold uppercase tracking-wider"
                style={{ fontFamily: bodyFont }}
              >
                Premium Legal Registries
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {subServices.map((sub: any) => {
              const IconComp = sub.icon;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => {
                    router.push({
                      pathname: '/service-detail',
                      params: { id: sub.id }
                    });
                  }}
                  className="w-[48%] bg-white border border-neutral-150 rounded-2xl p-3 mb-3 shadow-xs flex-col justify-between"
                  style={{ minHeight: 96 }}
                >
                  <View className="flex-row justify-between items-center w-full mb-1.5">
                    <View className="w-7 h-7 bg-amber-50 rounded-xl justify-center items-center border border-gold/15">
                      <IconComp size={16} color="#B8860B" strokeWidth={2.5} />
                    </View>
                    {sub.tag && (
                      <View className="bg-amber-100/70 border border-gold/25 px-1.5 py-0.5 rounded-md">
                        <Text className="text-[#6D5218] text-[7.5px] font-extrabold uppercase tracking-wide">{sub.tag}</Text>
                      </View>
                    )}
                  </View>
                  
                  <View className="flex-1 w-full justify-end">
                    <View className="flex-row items-center justify-between w-full">
                      <View className="flex-1 pr-1">
                        <Text 
                          className="text-neutral-900 font-extrabold text-xs leading-3.5 mb-0.5"
                          style={{ fontFamily: headingFont }}
                        >
                          {sub.title}
                        </Text>
                        <Text 
                          className="text-gray-400 text-[9px] font-semibold leading-3" 
                          numberOfLines={2}
                          style={{ fontFamily: bodyFont }}
                        >
                          {sub.desc}
                        </Text>
                      </View>
                      <ChevronRight size={10} color="#D4AF37" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 7. Top Lawyers Section */}
        <View className="pt-3">
          <View className="px-6 flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 bg-amber-50 rounded-lg justify-center items-center border border-gold/10">
                <Briefcase size={16} color="#B8860B" strokeWidth={2.5} />
              </View>
              <View>
                <Text 
                  className="text-neutral-900 text-lg font-black"
                  style={{ fontFamily: headingFont }}
                >
                  Top Lawyers Near You
                </Text>
                <Text 
                  className="text-gold text-[10px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: bodyFont }}
                >
                  Verified Advocates
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/lawyers')}>
              <Text 
                className="text-gold text-[10px] font-bold uppercase tracking-wider"
                style={{ fontFamily: bodyFont }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {registeredLawyers.length === 0 ? (
            <View className="mx-6 bg-white border border-neutral-150 rounded-3xl p-5 items-center shadow-xs">
              <Text className="text-neutral-900 font-bold text-xs text-center mb-1">No verified advocates registered yet</Text>
              <Text className="text-gray-400 text-[9px] text-center mb-3">Be the first to join our premium legal network!</Text>
              <TouchableOpacity
                onPress={() => router.push('/lawyer-registration')}
                className="bg-gold px-4 py-1.5 rounded-full"
                style={{ backgroundColor: '#D4AF37' }}
              >
                <Text className="text-white font-bold text-[9px] uppercase tracking-wider">Register Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              className="flex-row"
            >
              {registeredLawyers.map(lawyer => (
                <TouchableOpacity
                  key={lawyer.id}
                  onPress={() => router.push('/lawyers')}
                  className="bg-white rounded-3xl p-4 mr-4 border border-neutral-150 w-[160px] items-center shadow-xs"
                >
                  <View className="w-12 h-12 rounded-full border border-gold/10 overflow-hidden mb-2 relative">
                    <Image
                      source={{ uri: lawyer.avatar }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                    <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white justify-center items-center">
                      <CheckCircle2 size={7} color="#FFFFFF" />
                    </View>
                  </View>

                  <Text 
                    className="text-neutral-900 font-extrabold text-xs text-center mb-3" 
                    numberOfLines={1}
                    style={{ fontFamily: headingFont }}
                  >
                    {lawyer.name}
                  </Text>

                  <View className="bg-neutral-950 py-1.5 px-3.5 rounded-lg w-full items-center">
                    <Text 
                      className="text-white text-[8px] font-bold uppercase tracking-wider"
                      style={{ fontFamily: bodyFont }}
                    >
                      Consult
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 8. Recruitment Banner Card ("Are You a Lawyer?") */}
        <View className="px-6 pt-6">
          <View className="bg-[#F3F0DF] border border-gold/15 rounded-3xl p-5 flex-row items-center justify-between shadow-xs">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center mb-1">
                <Briefcase size={18} color="#B8860B" strokeWidth={2.2} />
                <Text 
                  className="text-neutral-900 font-extrabold text-sm ml-1.5"
                  style={{ fontFamily: headingFont }}
                >
                  Are You a Lawyer?
                </Text>
              </View>
              <Text 
                className="text-gray-500 text-[10px] font-semibold leading-3"
                style={{ fontFamily: bodyFont }}
              >
                Join our premium partner advocate network and grow your corporate & family court practice today.
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/lawyer-registration')}
              className="bg-neutral-900 px-3.5 py-2.5 rounded-xl flex-row items-center"
            >
              <Text 
                className="text-white text-[9px] font-bold uppercase tracking-wider mr-1"
                style={{ fontFamily: bodyFont }}
              >
                Join
              </Text>
              <ChevronRight size={10} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 9. "How It Works" Flowchart Section */}
        <View className="px-6 pt-1.5 mb-2">
          <View className="mb-1">
            <Text 
              className="text-neutral-900 text-base font-black"
              style={{ fontFamily: headingFont }}
            >
              How It Works
            </Text>
            <Text 
              className="text-gold text-[9px] font-bold uppercase tracking-wider"
              style={{ fontFamily: bodyFont }}
            >
              Simple 4-Step Registration Process
            </Text>
          </View>
 
          <View className="bg-white rounded-xl border border-neutral-150 p-1.5 shadow-xs">
            <View className="flex-row justify-between items-start">
              {/* Step 1 */}
              <View className="items-center w-[22%]">
                <View style={{ width: 16, height: 16, borderRadius: 8 }} className="bg-neutral-950 items-center justify-center mb-0.5 shadow-xs">
                  <Text className="text-white font-extrabold text-[7px]" style={{ fontFamily: headingFont }}>1</Text>
                </View>
                <Text style={{ fontSize: 7, fontFamily: headingFont }} className="text-neutral-900 font-extrabold text-center uppercase tracking-wide">Choose</Text>
                <Text style={{ fontSize: 6, fontFamily: bodyFont }} className="text-gray-400 text-center mt-0.5">Service package</Text>
              </View>
 
              {/* Arrow 1 */}
              <View className="pt-1 w-[4%] items-center">
                <ChevronRight size={4} color="#D4AF37" />
              </View>
 
              {/* Step 2 */}
              <View className="items-center w-[22%]">
                <View style={{ width: 16, height: 16, borderRadius: 8 }} className="bg-neutral-950 items-center justify-center mb-0.5 shadow-xs">
                  <Text className="text-white font-extrabold text-[7px]" style={{ fontFamily: headingFont }}>2</Text>
                </View>
                <Text style={{ fontSize: 7, fontFamily: headingFont }} className="text-neutral-900 font-extrabold text-center uppercase tracking-wide">Upload</Text>
                <Text style={{ fontSize: 6, fontFamily: bodyFont }} className="text-gray-400 text-center mt-0.5">Required IDs</Text>
              </View>
 
              {/* Arrow 2 */}
              <View className="pt-1 w-[4%] items-center">
                <ChevronRight size={4} color="#D4AF37" />
              </View>
 
              {/* Step 3 */}
              <View className="items-center w-[22%]">
                <View style={{ width: 16, height: 16, borderRadius: 8 }} className="bg-neutral-950 items-center justify-center mb-0.5 shadow-xs">
                  <Text className="text-white font-extrabold text-[7px]" style={{ fontFamily: headingFont }}>3</Text>
                </View>
                <Text style={{ fontSize: 7, fontFamily: headingFont }} className="text-neutral-900 font-extrabold text-center uppercase tracking-wide">Select</Text>
                <Text style={{ fontSize: 6, fontFamily: bodyFont }} className="text-gray-400 text-center mt-0.5">Date & Time</Text>
              </View>
 
              {/* Arrow 3 */}
              <View className="pt-1 w-[4%] items-center">
                <ChevronRight size={4} color="#D4AF37" />
              </View>
 
              {/* Step 4 */}
              <View className="items-center w-[22%]">
                <View style={{ width: 16, height: 16, borderRadius: 8 }} className="bg-neutral-900 items-center justify-center mb-0.5 shadow-xs border border-gold/30">
                  <Text className="text-gold font-extrabold text-[7px]" style={{ fontFamily: headingFont }}>4</Text>
                </View>
                <Text style={{ fontSize: 7, fontFamily: headingFont }} className="text-gold font-extrabold text-center uppercase tracking-wide">Registry</Text>
                <Text style={{ fontSize: 6, fontFamily: bodyFont }} className="text-gray-400 text-center mt-0.5">Get Certificate</Text>
              </View>
            </View>
          </View>
        </View>



      </ScrollView>

      {/* Location Selector Dropdown Modal */}
      <Modal
        visible={cityModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6 relative">
          {/* Backdrop Touch Area */}
          <TouchableOpacity 
            className="absolute inset-0 w-full h-full"
            activeOpacity={1}
            onPress={() => setCityModalVisible(false)}
          />

          {/* Modal Content Card */}
          <View className="bg-white w-full rounded-[32px] p-6 border border-neutral-150 shadow-md z-10" style={{ maxHeight: '80%' }}>
            <Text 
              className="text-neutral-900 font-black text-xl mb-4 text-center"
              style={{ fontFamily: headingFont }}
            >
              Select SDM Office
            </Text>
            
            {/* Auto GPS Location Detector / Tracker Toggle Button */}
            {/* Auto GPS Location Detector Buttons */}
            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                className="flex-1 py-3.5 px-3 rounded-xl border border-dashed bg-amber-50 border-gold/40 flex-row justify-center items-center gap-1.5"
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#D4AF37" />
                ) : (
                  <MapPin size={14} color="#D4AF37" />
                )}
                <Text className="font-extrabold text-[10px] text-gold" numberOfLines={1}>
                  {detectingLocation ? 'Capturing...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSelectNearestSDM}
                disabled={detectingLocation}
                className="flex-1 py-3.5 px-3 rounded-xl border border-dashed bg-neutral-900 border-neutral-800 flex-row justify-center items-center gap-1.5"
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Compass size={14} color="#FFFFFF" />
                )}
                <Text className="font-extrabold text-[10px] text-white" numberOfLines={1}>
                  {detectingLocation ? 'Finding...' : 'Select Nearest SDM'}
                </Text>
              </TouchableOpacity>
            </View>

            {locationError && (
              <Text className="text-red-500 text-[10px] text-center font-bold mb-3">
                {locationError}
              </Text>
            )}

            <View className="w-full h-[1px] bg-neutral-100 mb-4" />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-grow-0" style={{ maxHeight: Dimensions.get('window').height * 0.45 }}>
              {SDM_OFFICES.map(regionGroup => (
                <View key={regionGroup.region} className="mb-4">
                  <Text 
                    className="text-neutral-900 font-extrabold text-[10px] uppercase tracking-wider mb-2 text-gold"
                    style={{ fontFamily: headingFont }}
                  >
                    {regionGroup.region}
                  </Text>
                  {regionGroup.offices.map(office => {
                    const fullOfficeText = `${office.name}, Delhi`;
                    const isSelected = selectedLocation === fullOfficeText;
                    return (
                      <TouchableOpacity
                        key={office.name}
                        onPress={() => {
                          if (isTracking) {
                            if (subscription) {
                              subscription.remove();
                              setSubscription(null);
                            }
                            setIsTracking(false);
                          }
                          setLocation(fullOfficeText);
                          setCityModalVisible(false);
                        }}
                        className={`py-3 px-4 rounded-xl border mb-2 flex-col justify-center items-start ${isSelected ? 'bg-amber-50/45 border-gold' : 'border-neutral-200 bg-neutral-50'}`}
                      >
                        <View className="flex-row justify-between items-center w-full">
                          <View className="flex-row items-center gap-2">
                            <Building2 size={12} color={isSelected ? "#D4AF37" : "#9CA3AF"} />
                            <Text 
                              className={`font-bold text-xs ${isSelected ? 'text-gold' : 'text-neutral-800'}`}
                              style={{ fontFamily: headingFont }}
                            >
                              {office.name}
                            </Text>
                          </View>
                          {isSelected && <Check size={12} color="#D4AF37" strokeWidth={3} />}
                        </View>
                        <View className="flex-row items-center mt-1 w-full">
                          <MapPin size={9} color="#9CA3AF" />
                          <Text 
                            className="text-[9px] text-gray-400 ml-1 flex-1" 
                            numberOfLines={1}
                            style={{ fontFamily: bodyFont }}
                          >
                            {office.address}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>





      {/* Side Menu Drawer */}
      <Modal
        visible={menuDrawerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuDrawerVisible(false)}
      >
        <View className="flex-1 bg-black/60 flex-row">
          {/* Main Drawer Container */}
          <View className="bg-white w-[70%] h-full pt-12 pb-6 px-5 border-r border-neutral-100 flex-col justify-between">
            <View>
              {/* Brand Logo (Always visible at the top) */}
              <View className="items-center pb-5 border-b border-neutral-100 mb-5 w-full">
                <Image
                  source={require('../../../assets/images/logo_shield_transparent.png')}
                  style={{ width: 64, height: 64 }}
                  className="mb-2"
                  contentFit="contain"
                />
                <Text 
                  style={{ 
                    fontFamily: headingFont,
                    color: '#6D5218',
                    fontSize: 18,
                    fontWeight: 'bold',
                    letterSpacing: 1.0,
                    marginTop: 4,
                  }}
                >
                  LawyerSathi
                </Text>
              </View>

              {/* User Info (Only if logged in) */}
              {user && (
                <View className="flex-row items-center pb-5 border-b border-neutral-100 mb-5">
                  <View className="w-10 h-10 rounded-full bg-neutral-200 border border-gold/15 overflow-hidden">
                    <Image
                      source={{ 
                        uri: user.photoURL || 
                          (user.gender === 'Female' 
                            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150&q=80' 
                            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=150&h=150&q=80') 
                      }}
                      className="w-full h-full"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-neutral-900 font-bold text-xs" numberOfLines={1}>
                      {user.displayName || 'LawyerSathi Client'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Menu List */}
              <View>
                {drawerItems.map(item => {
                  const IconComp = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      onPress={() => {
                        setMenuDrawerVisible(false);
                        if (!user && item.title !== 'About Us') {
                          router.push('/(auth)/login');
                        } else {
                          item.action();
                        }
                      }}
                      className="flex-row items-center py-3 px-2 rounded-xl mb-1 bg-white"
                    >
                      <View className="w-7 h-7 bg-amber-50 rounded-full justify-center items-center mr-3 border border-gold/10">
                        <IconComp size={16} color="#B8860B" strokeWidth={2.5} />
                      </View>
                      <Text className="text-neutral-800 text-xs font-bold">{item.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Logout / Footer at bottom of drawer */}
            {user ? (
              <TouchableOpacity
                onPress={async () => {
                  setMenuDrawerVisible(false);
                  await logout();
                  router.replace('/(auth)/login');
                }}
                className="bg-red-50 border border-red-100/50 rounded-xl py-3 flex-row justify-center items-center"
              >
                <LogOut size={14} color="#EF4444" className="mr-1.5" />
                <Text className="text-red-500 font-bold text-[10px] uppercase tracking-wider">Log Out</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setMenuDrawerVisible(false);
                  router.push('/(auth)/login');
                }}
                className="bg-amber-50 border border-amber-100/50 rounded-xl py-3 flex-row justify-center items-center"
              >
                <LogIn size={14} color="#D4AF37" className="mr-1.5" />
                <Text className="text-gold font-bold text-[10px] uppercase tracking-wider">Log In / Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Dismiss Overlay area */}
          <TouchableOpacity 
            className="flex-grow h-full" 
            onPress={() => setMenuDrawerVisible(false)} 
            activeOpacity={1}
          />
        </View>
      </Modal>

    </View>
  );
}
