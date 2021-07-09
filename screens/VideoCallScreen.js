import React, { useEffect, useState } from 'react';
import AgoraUIKit from 'agora-rn-uikit';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
import { connect } from 'react-redux';
import { onVideoLoad, closeVideo, checkVideoUser } from '../services';
import { videoReducer, videoUserReducer } from '../services';

const videoCallScreen = (props) => {

  const [videoCall, setVideoCall] = useState(true);

  useEffect(() => {
    props.onVideoLoad(props.route.params.id, props);
  }, []);

  const videoUnmount = () => {
    props.closeVideo();
    setVideoCall(false);
    props.navigation.goBack();
  }

  const callbacks = {
    EndCall: videoUnmount,
    LocalMuteAudio: () => { console.log("muted audio!") },
    //LocalMuteVideo: () => {console.log("muted video!")},
    VideoStopped: () => { console.log("video stopped !"); },
    UserJoined: (userInfo) => { props.checkVideoUser(props.route.params.id, userInfo) },
    LocalUserRegistered: (info) => { console.log("local user registered => info : " + info); },
    LocalVideoStateChanged: (info) => { console.log("local video state changed info ==> " + info); }
  };

  if (props.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000"></ActivityIndicator>
      </View>
    );
  }

  const providerProps = {
    rtcProps: props.rtcProps,
    styleProps: props.styleProps,
    callbacks: callbacks,
  };

  
  return(
      <SafeAreaView>
      {videoCall ? (
        <>
          <AgoraUIKit
            styleProps={props.styleProps}
            rtcProps={props.rtcProps}
            callbacks={callbacks}
          />
        </>
      ) : null}
    </SafeAreaView>
      );

};

const params = {
  videoReducer,
  videoUserReducer,
  onVideoLoad,
  closeVideo,
  checkVideoUser,
};

const mapStateToProps = (state) => ({
  videoReducer: state.videoReducer,
  rtcProps: state.videoReducer.rtcProps,
  styleProps: state.videoReducer.styleProps,
  loading: state.videoReducer.loading,
  error: state.videoReducer.error,
  enableAudio: state.videoUserReducer.enableAudio,
  enableVideo: state.videoUserReducer.enableVideo,
});

const VideoCallScreen = connect(mapStateToProps, params)(videoCallScreen);


export default VideoCallScreen;
