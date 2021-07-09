import {StyleSheet,View, ActivityIndicator} from "react-native";
import React,{useEffect} from 'react';
import HomeScreen from "./HomeScreen";
import LoginScreen from "./LoginScreen";
import {connect} from 'react-redux';
import {userReducer} from '../services';
import { onUserLoad } from "../services";
import NavigationComponent from "../components/NavigationComponent";

const applicationScreen = (props) => {


    useEffect(() => {
        props.onUserLoad();
    }, []);
    
    if (props.loading){
        return (
            <View style = {{flex: 1, justifyContent: 'center', alignItems:'center'}}>
                <ActivityIndicator size="large" color="#000000"></ActivityIndicator>
            </View>
        );
    }

    return (
        <>
        {props.user !== undefined ?
        <NavigationComponent></NavigationComponent>:
        <LoginScreen></LoginScreen>
        }
        </>
    );
}

const mapStateToProps = (state) => ({
    user: state.userReducer.user,
    loading: state.userReducer.loading,
    state,
})

const ApplicationScreen = connect (mapStateToProps, {userReducer, onUserLoad})(applicationScreen);


export default ApplicationScreen;

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
    CheckButton:{
        padding: 20,
        alignItems: 'center',   
        borderRadius: 8,
        backgroundColor: 'blue',
        marginVertical: 20,
    },
    CloseButton:{
        padding: 20,
        alignItems: 'center',   
        borderRadius: 8,
        backgroundColor: 'red',
        marginVertical: 20,
    },
  });
