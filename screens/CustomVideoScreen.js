import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { onVideoLoad, closeVideo, closeCamera, closeAudio, switchCamera } from '../services';
import { RtcLocalView, RtcRemoteView } from 'react-native-agora';

const videoCallScreen = (props) => {

    const [share, setShare] = useState(false);

    useEffect(() => {
        props.onVideoLoad(props.route.params.id, props);
        return () => {
            props.closeVideo();
        }
    }, []);
    const videoUnmount = async () => {
        await props.closeVideo();
        props.navigation.goBack();
    }


    if (props.loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000000"></ActivityIndicator>
            </View>
        );
    }


    return (
        <SafeAreaView style={{ flex: 1 }}>

            {props.screenId > 0 ? <ScreenShare screenId={props.screenId} ></ScreenShare> :
                <View style={{ flex: 1 }}>

                    {/*MeetingUser On Top*/}
                    {props.isMeetingUser ?
                        <RtcRemoteView.SurfaceView
                            style={{ flex: 1 }}
                            uid={props.cameraId}
                            zOrderMediaOverlay={true}
                        /> : <RtcLocalView.SurfaceView style={{ flex: 1 }} />}

                    {/*Other Users*/}

                    {props.videoUsers?.map((value, index) => (

                        <RtcRemoteView.SurfaceView
                            style={styles.container}
                            uid={value}
                            zOrderMediaOverlay={true}
                        />

                    ))}

                    {props.isMeetingUser ? <RtcLocalView.SurfaceView style={{ flex: 1 }} /> : null}



                    {/*Buttons*/}
                    <View style={styles.float}>
                        <TouchableOpacity onPress={props.switchCamera}>
                            <Text style={{ fontSize: 28, color: '#ffffff' }}>SWITCH</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ position: 'absolute', left: 0, bottom: 0 }}>
                        <TouchableOpacity onPress={props.closeCamera}>
                            <Text style={{ fontSize: 28, color: '#ffffff' }}>CAMERA</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ position: 'absolute', right: 0, top: 0 }}>
                        <TouchableOpacity onPress={videoUnmount}>
                            <Text style={{ fontSize: 28, color: '#ffffff' }}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ position: 'absolute', left: 0, top: 0 }}>
                        <TouchableOpacity onPress={props.closeAudio}>
                            <Text style={{ fontSize: 28, color: '#ffffff' }}>{props.rtcProps.enableAudio ? "" : "UN"}MUTE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </SafeAreaView>
    );

};

const ScreenShare = (props) => {

    return (
        <View style={{ flex: 1 }}>
            <RtcRemoteView.SurfaceView
                style={{ flex: 1 }}
                uid={props.screenId}
                zOrderMediaOverlay={true}
            />
        </View>
    );
}


const params = {
    onVideoLoad,
    closeCamera,
    closeVideo,
    closeAudio,
    switchCamera,
};

const mapStateToProps = (state) => ({
    videoReducer: state.videoReducer,
    rtcProps: state.videoReducer.rtcProps,
    loading: state.videoReducer.loading,
    videoUsers: state.videoUserReducer.videoUsers,
    isMeetingUser: state.videoMeetingUser.isMeetingUser,
    cameraId: state.videoMeetingUser.cameraId,
    screenId: state.videoMeetingUser.screenId,
});

const CustomVideoScreen = connect(mapStateToProps, params)(videoCallScreen);


export default CustomVideoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },

    user: {
        flex: 2,
        backgroundColor: '#4287f5',
    },

    meetingUser: {
        flex: 1,
        backgroundColor: '#fc03db',
    },

    surface: {
        flex: 1,
    },
    float: {
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    remoteContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
    remote: {
        width: 120,
        height: 120,
    },
});

