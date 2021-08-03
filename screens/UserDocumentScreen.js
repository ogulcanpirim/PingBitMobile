import React, { useState , useEffect} from 'react';
import { connect } from 'react-redux';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native';
import { ListItem } from 'react-native-elements'
import { onUserLogout, getUserInfo } from "../services";

import IonicIcon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const userDocumentScreen = (props) => {

    return (
        <SafeAreaView style={{flex: 1}}>
            <Text>userDocumentScreen</Text>
        </SafeAreaView>
    )
}

const mapStateToProps = (state) => ({

});

const params = {
};

const UserDocumentScreen = connect(mapStateToProps, params)(userDocumentScreen);


export default UserDocumentScreen;

const styles = StyleSheet.create({

});

