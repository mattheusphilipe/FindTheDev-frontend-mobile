import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Image, Text, TextInput, TouchableOpacity, KeyboardAvoidingView} from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import {requestPermissionsAsync, getCurrentPositionAsync} from 'expo-location';
import {MaterialIcons} from '@expo/vector-icons';
import api from '../services/api';

export default function Main({navigation}) {
    const [currentRegion, setCurrentRegion] = useState(null);
    const [devs, setDevs] = useState([]);
    const [devTechs, setDevTechs] = useState('');

    useEffect(() => 
    {
        async function loadingInitialLocation() {
            const { granted } = await requestPermissionsAsync();

            if (granted) {
                const {coords} = await getCurrentPositionAsync({
                    enableHighAccuracy: true,
                });

                const {latitude, longitude} = coords;

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                })
            }
        }

        loadingInitialLocation();
    }, []);


    async function loadDevs() {
        const {latitude, longitude} = currentRegion;

        try {
            const response = await api.get('/search', {
                params: {
                    latitude,
                    longitude,
                    techs: devTechs,
                }
            });
        
            if (response.status === 200) {
                setDevs(response.data);
            }

            console.log('aqui',response.data)

        } catch (e) {
            console.log(e);
        }
    }

    function handleRegionChange(region) {
        console.log(region)
        setCurrentRegion(region);
    }

    return currentRegion && (
    <>
        <MapView 
            initialRegion={currentRegion} 
            style={styles.map}
            onRegionChangeComplete={handleRegionChange}
        >

            {
                devs && devs.map((dev) => (
                    <Marker
                        key={dev._id}
                        coordinate={
                        {   latitude: dev.location.coordinates[1], 
                            longitude: dev.location.coordinates[0]
                        }} >
                    <Image source={{uri: dev.avatar_url}} style={styles.avatar} />
                    <Callout onPress={() => navigation.navigate('Profile', 
                    {
                        github_username: 'mattheusphilipe'
                    })}>
                        <View style={styles.callout}>
                            <Text style={styles.devName}>{dev.name}</Text>
                            <Text style={styles.devBio}>{dev.bio}</Text>
                            <Text style={styles.devTechs}>{dev.techs.join(', ')}</Text>
                        </View>
                    </Callout>
                </Marker>
                ))
            }
        </MapView>
        <KeyboardAvoidingView 
            style={styles.searchForm}
            behavior="padding"
            keyboardVerticalOffset={100}
        >
                <TextInput 
                style={styles.searchInput}
                placeholder="Buscar devs por techs"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={setDevTechs}
                />

                <TouchableOpacity
                    style={styles.loadButton}
                    onPress={loadDevs}
                >
                <MaterialIcons name="my-location" size={20} color="#FFF"/>

                </TouchableOpacity>

        </KeyboardAvoidingView>
    </>
    );
}


const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: '#FFF',
    },

    devName: {
        fontWeight: 'bold',
        fontSize: 16
    },

    callout: {
        width: 260,
    },

    devBio: {
        color: '#666',
        marginTop: 5,
    },

    devTechs: {
        marginTop: 5,
    },

    searchForm: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row',
    },

    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFF',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4,
        },
        elevation: 2,
    },
    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8E4Dff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,

    }

});