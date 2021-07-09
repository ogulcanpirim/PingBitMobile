import { Text ,StyleSheet, View, TouchableOpacity} from "react-native";
import React from 'react';
import {connect} from 'react-redux';
import {userReducer} from '../services';
import {onUserLogout, getSchedules} from "../services";

const homeScreen = (props) => {


    const {onUserLogout, getSchedules} = props;

    return (
        <View style={styles.container}>
            <Text style = {styles.LoginText}>Welcome,{props.user.username}.</Text>
            <TouchableOpacity style = {styles.CloseButton} onPress={() => onUserLogout()}>
                <Text style = {{color: 'white'}}>SIGN OUT</Text>
            </TouchableOpacity>
        </View>
);

}
const mapStateToProps = (state) => ({
    user: state.userReducer.user
})

const HomeScreen = connect (mapStateToProps, {userReducer, onUserLogout, getSchedules})(homeScreen);

export default HomeScreen;

const styles = StyleSheet.create({
    container:{
        padding: 20,
    },
    LoginText: {
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 'bold',
        paddingTop: 100,
        marginBottom: 30,
    },
    InputText:{
        backgroundColor: '#e8e8e8',
        padding: 20,
        borderRadius: 8,
        marginVertical: 10,
    },
    CloseButton:{
        padding: 20,
        alignItems: 'center',   
        borderRadius: 8,
        backgroundColor: 'red',
        marginVertical: 20,
    },
  });
