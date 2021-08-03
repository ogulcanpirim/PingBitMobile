import React, { useState , useEffect} from 'react';
import { connect } from 'react-redux';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native';
import { ListItem } from 'react-native-elements'
import { onUserLogout, getUserInfo } from "../services";

import IonicIcon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const settingsScreen = (props) => {

    const [expanded, setExpanded] = useState(false);
    

    useEffect(() => {
        props.getUserInfo();
    }, []);

    if (props.loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000000"></ActivityIndicator>
            </View>
        );
    }

    

    const data = [
        { name: "İletişim Bilgileri", icon: "contacts" },
        { name: "Profil Fotoğrafı", icon: "person-add-outline", event: () => props.navigation.navigate("ProfilePicture") },
        { name: "Şifre Değiştir", icon: "lock-closed-outline" },
        { name: "Kullanıcı Sözleşmesi", icon: "document-text-outline", event: () => props.navigation.navigate("UserDocument")},
        { name: "Çıkış", icon: "exit-outline", event: () => props.onUserLogout() }];

    const renderItem = ({ item, index }) => {

        if (index == 0) {
            return (
                <ListItem.Accordion bottomDivider
                    content={
                        <>
                        <AntDesign name={item.icon} size={20}></AntDesign>
                            <ListItem.Content>
                                <ListItem.Title>{"\t\t" + item.name}</ListItem.Title>
                            </ListItem.Content>
                        </>
                    }
                    isExpanded={expanded}
                    onPress={() => {
                        setExpanded(!expanded);
                    }}>
                    <ListItem bottomDivider>
                        <AntDesign size={20}></AntDesign>
                        <ListItem.Content>
                            <ListItem.Title>E-posta: {props.email}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                    <ListItem bottomDivider>
                        <AntDesign size={20}></AntDesign>
                        <ListItem.Content>
                            <ListItem.Title>GSM: {props.gsm}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                </ListItem.Accordion>

            );
        }



        return (
            <TouchableOpacity onPress={item.event}>
                <ListItem bottomDivider>
                    <IonicIcon name={item.icon} size={20} ></IonicIcon>
                    <ListItem.Content>
                        <ListItem.Title>{item.name}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            </TouchableOpacity>
        );
    }
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            >
            </FlatList>
        </SafeAreaView>
    )
}

const mapStateToProps = (state) => ({
    user: state.userReducer.user,
    loading: state.settingsReducer.loading,
    email: state.settingsReducer.email,
    gsm: state.settingsReducer.gsm,
});

const params = {
    onUserLogout,
    getUserInfo,
};

const SettingsScreen = connect(mapStateToProps, params)(settingsScreen);


export default SettingsScreen;

const styles = StyleSheet.create({

});

