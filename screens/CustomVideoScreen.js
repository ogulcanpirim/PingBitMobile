import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { onVideoLoad, closeVideo, closeCamera, closeAudio, switchCamera } from '../services';
import { RtcLocalView, RtcRemoteView } from 'react-native-agora';
import { Dimensions } from 'react-native';

const videoCallScreen = (props) => {

    const [upper, setUpper] = useState(false);

    const data = [{ key: '#4287f5' }, { key: '#fc03db' }, { key: '#990a00' }, { key: '#2ce670' }, { key: '#ebcf34' }, { key: '#a6a498' }];

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

    const renderItem = ({ item, index }) => {

        let divider = 2;

        if (props.videoUsers?.length > 2)
            divider = divider * 2;

        const cellHeight = Dimensions.get('window').height / divider;

        console.log("length ==> " + props.videoUsers?.length);

        console.log("index: " + index);
        console.log("props.userUid: " + props.userUid);
        
        if (!props.isPatient && (props.videoUsers?.includes(props.patientUID) && item == props.patientUID))
        {
            return null;
        }

        //only self
        if (index == 0 && !upper && props.videoUsers?.length == 1){

            console.log("surface view ???");
            return (
                <RtcLocalView.SurfaceView
                    style={{ flex: 1, margin: 1, height: Dimensions.get('window').height}}>
                </RtcLocalView.SurfaceView>
            )
        }
        else if (index == 0){
            return (
                <RtcLocalView.SurfaceView
                    style={{ flex: 1, margin: 1, height: cellHeight}}>
                </RtcLocalView.SurfaceView>
            )
        }
        
        return (
            <RtcRemoteView.SurfaceView
                style={{ flex: 1, margin: 1, height: cellHeight }}
                uid={item}
                zOrderMediaOverlay={true}
            />
        )
    }

    const Doctor = (props) => {

        
        return (
            <View style={{ flex: 1 }}>
                <RtcRemoteView.SurfaceView
                    style={{ flex: 1 }}
                    uid={props.cameraId}
                    zOrderMediaOverlay={true}
                />
            </View>);
    }

    const Patient = (props) => {

        return (
            <View style={{ flex: 1 }}>
                <RtcRemoteView.SurfaceView
                    style={{ flex: 1 }}
                    uid={props.patientUID}
                    zOrderMediaOverlay={true}
                />
            </View>);
    }

    const Upper = (props) => {
        setUpper(props.set);
        return null;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>

            {props.screenId > 0 ? <ScreenShare screenId={props.screenId} ></ScreenShare> :
                <View style={{ flex: 1 }}>


                    {/*isDoctor && isMeetingUser*/}

                    {props.isPatient ?
                        (props.isMeetingUser ? <Doctor cameraId={props.cameraId}></Doctor> : <Upper set = {false}></Upper>) :
                        (props.videoUsers?.includes(props.patientUID) ? <Patient patientUID={props.patientUID}></Patient> : <Upper set ={false}></Upper>)
                    }

                    {console.log("props.isMeetingUser => " + props.isMeetingUser + "props.isPatient===>" + props.isPatient +  "\nprops.isDoctor: " + props.isDoctor + "\nprops.patientUID" + JSON.stringify(props.patientUID) + "\nincludes? " + props.videoUsers?.includes(props.patientUID))}
                    
                    
                    {/*MeetingUser On Top*/}

                    {/*Other Users*/}
                    { <FlatList
                        data={props.videoUsers}
                        style={{ flex: 1 }}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={2}
                    />}



                    {/*props.isMeetingUser ?  : null*/}

                    {/*Buttons*/}
                    <View style={styles.float}>
                        <TouchableOpacity style={{ backgroundColor: '#000000' }} onPress={props.switchCamera}>
                            <Text style={{ fontSize: 28, color: '#ffffff' }}>SWITCH</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ position: 'absolute', left: 0, bottom: 0 }}>
                        <TouchableOpacity style={{ backgroundColor: '#000000' }} onPress={props.closeCamera}>
                            <Text style={{ fontSize: 28, color: '#ffffff' }}>CAMERA</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ position: 'absolute', right: 0, top: 0 }}>
                        <TouchableOpacity style={{ backgroundColor: '#000000' }} onPress={videoUnmount}>
                            <Text style={{ fontSize: 28, color: '#ffffff' }}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ position: 'absolute', left: 0, top: 0 }}>
                        <TouchableOpacity style={{ backgroundColor: '#000000' }} onPress={props.closeAudio}>
                            <Text style={{ fontSize: 28, color: '#ffffff' }}>{props.rtcProps.enableAudio ? "" : "UN"}MUTE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }

        </SafeAreaView >
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
    userUid: state.videoUserReducer.userUid,
    isDoctor: state.videoUserReducer.isDoctor,
    isPatient: state.videoUserReducer.isPatient,
    patientUID: state.videoUserReducer.patientUID,
});

const CustomVideoScreen = connect(mapStateToProps, params)(videoCallScreen);


export default CustomVideoScreen;

const styles = StyleSheet.create({

    gridContainer: {
        flex: 1,
        marginVertical: 20,
    },

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

