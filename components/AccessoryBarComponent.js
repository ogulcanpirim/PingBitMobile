import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import IonicIcon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { connect } from 'react-redux';
import { Dimensions } from 'react-native';
import { uploadPicture } from '../services';

import {PermissionsAndroid} from 'react-native';

const openCameraWithPermission = async (props) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'App Camera Permission',
          message: 'App needs access to your camera ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        launchCamera(
          {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: Dimensions.get('window').height,
            maxWidth: Dimensions.get('window').width,
          },
          (response) => {
            if (!response.hasOwnProperty("didCancel")){
                const newMessage = {
                    _id: Math.random() * (999999 - 2) + 2,
                    image: response.assets[0].uri,
                    createdAt: new Date(),
                    user: props.user,
                };
                props.onSend([newMessage]);
                props.uploadPicture(response.assets[0]);
            }
          },
        );
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

const openImageLibrary = (props) => {
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
            if (!response.hasOwnProperty("didCancel")){
                const newMessage = {
                    _id: Math.random() * (999999 - 2) + 2,
                    image: response.assets[0].uri,
                    createdAt: new Date(),
                    user: props.user,
                    base64: response.assets[0].base64,
                };
                props.onSend([newMessage]);
                props.uploadPicture(response.assets[0]);
            }
        },
      )
}


const accessoryBarComponent = (props) => {

    return (
      <View style={styles.container}>
        <Button onPress={() => openImageLibrary(props)} name='photo' />
        <Button onPress={() => openCameraWithPermission(props)} name='camera' />
        <Button onPress={() => console.log("location")} name='location' />
      </View>
    )
}

const Button = ({
  onPress,
  size = 30,
  color = 'rgba(0,0,0,0.5)',
  ...props
}) => (
  <TouchableOpacity onPress={onPress}>
    {props.name == "photo" ? <FontAwesome size={size} color={color} {...props}/> :
    <IonicIcon size={size} color={color} {...props} /> }
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    height: 44,
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.3)',
  },
})
const mapStateToProps = (state) => ({
});

const params = {
    uploadPicture,
};

const AccessoryBarComponent = connect(mapStateToProps, params)(accessoryBarComponent);

export default AccessoryBarComponent;