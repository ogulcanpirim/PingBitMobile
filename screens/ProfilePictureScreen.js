import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { SafeAreaView, Dimensions, Text, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AccessoryBarComponent from '../components/AccessoryBarComponent';
import SimplePopupMenu from 'react-native-simple-popup-menu';
import {getProfilePicture, updateProfilePicture, uploadProfilePicture} from '../services';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as ImagePicker from "react-native-image-picker"
import { Avatar } from "react-native-elements";
const profilePictureScreen = (props) => {

    const items = [
        { id: 'photo', label: 'Fotoğraf Çek' },
        { id: 'gallery', label: 'Galeriden Seç' },
    ];

    const [profile, setProfile] = useState(false);


    useEffect(() => {
        props.getProfilePicture();
        console.log("getprofilepicture");
    }, []);

    const camera = () => {
        launchCamera(
            {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: Dimensions.get('window').height,
                maxWidth: Dimensions.get('window').width,
            },
            (response) => {
                if (!response.hasOwnProperty("didCancel")) {
                    props.updateProfilePicture(response);
                }
            },
        );
    }
    const gallery = () => {
        launchImageLibrary(
            {
                mediaType: 'photo', //mixed for both
                includeBase64: false,
                maxHeight: Dimensions.get('window').height,
                maxWidth: Dimensions.get('window').width,
                quality: 1,
                //selection limit 10
            },
            (response) => {
                if (!response.hasOwnProperty("didCancel")) {
                    props.updateProfilePicture(response);
                }
            },
        )
    }

    if (props.loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000000"></ActivityIndicator>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
            <SimplePopupMenu
                items={items}
                onSelect={(response) => response.id == "photo" ? camera() : gallery()}
            >
                <Avatar
                    source={{ uri: props.avatar }}
                    rounded
                    size="xlarge"
                    activeOpacity={0.1}
                    containerStyle={{ marginTop: 100 }}
                >

                    <Avatar.Accessory
                        name="pencil-alt"
                        type="font-awesome-5"
                        size={32} />

                </Avatar>
            </SimplePopupMenu>
            <TouchableOpacity style={styles.saveButton} onPress={() => props.uploadProfilePicture()}>
                <Text style={{ color: 'white' }}>KAYDET</Text>
            </TouchableOpacity>
        </SafeAreaView >
    )
}

const mapStateToProps = (state) => ({
    loading: state.profilePictureReducer.loading,
    avatar: state.profilePictureReducer.avatar,
});

const params = {
    getProfilePicture,
    updateProfilePicture,
    uploadProfilePicture,
};

const ProfilePictureScreen = connect(mapStateToProps, params)(profilePictureScreen);


export default ProfilePictureScreen;

const styles = StyleSheet.create({
    saveButton: {
        marginTop: 100,
        padding: 20,
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'blue',
    },
});

