import { Text ,StyleSheet, TextInput, View, TouchableOpacity} from "react-native";
import React,{useState} from 'react';
import {connect} from 'react-redux';
import { onUserLogin} from "../services";

const loginScreen = (props) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const {onUserLogin} = props;


    return (
        <View style={styles.container}>
        <Text style = {styles.LoginText}>Login</Text>
        <TextInput onChangeText={(value) => setUsername(value)} style = {styles.InputText} placeholder={"Username"}></TextInput>
        <TextInput onChangeText={(value) => setPassword(value)} style = {styles.InputText} placeholder={"Password"} secureTextEntry ></TextInput>
        <TouchableOpacity style = {styles.InputButton} onPress={() => onUserLogin({username: username, password: password})}>
            <Text style = {{color: 'white'}}>LOGIN</Text>
        </TouchableOpacity> 
        </View>
);

}

const mapStateToProps = (state) => ({
    userReducer: state.userReducer,
    loading: state.userReducer.loading,
})

const LoginScreen = connect (mapStateToProps, {onUserLogin})(loginScreen);

export default LoginScreen;

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
    InputButton:{
        padding: 20,
        alignItems: 'center',   
        borderRadius: 8,
        backgroundColor: 'blue',
        marginVertical: 20,
    },
  });
