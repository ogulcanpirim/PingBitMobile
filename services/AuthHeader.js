import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthHeader = async () => {

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    if (userJSON && userJSON.token) {
        return { Authorization: 'Bearer ' + userJSON.token }; // for Spring Boot back-end
        // return { 'x-access-token': user.token }; // for node.js Express back-end
    } else
        return {};
}

export default AuthHeader;