//imports
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import RNFetchBlob from 'rn-fetch-blob';
import { Alert, Platform } from "react-native";
import { layout, mode } from "agora-rn-uikit";
import RtcEngine, {
    ChannelProfile,
    ClientRole,
    RtcEngineConfig,
} from 'react-native-agora';
import { ActivityIndicatorComponent } from "react-native";

//axios.defaults.headers.common = {'Authorization': `Bearer ${token}`}

//actions
export const onUserLoad = () => {

    return async (dispatch) => {
        try {
            dispatch({ type: 'ON_LOAD' });
            const userData = await AsyncStorage.getItem("USER_DATA");
            if (userData == null) {
                dispatch({ type: 'DO_LOGIN', payload: undefined });
            }
            else {
                const userJSON = JSON.parse(userData);
                dispatch(onUserLogin({ username: userJSON.username, password: userJSON.password }));
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export const onUserLogin = ({ username, password }) => async (dispatch) => {

    const fetchURL = "https://pingbitplatform.com/api/auth/signin";
    await RNFetchBlob.config({
        trusty: true
    }).fetch('POST', fetchURL,
        {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
        JSON.stringify({
            username: username,
            password: password
        }),
    ).then(function (response) {

        const responseData = JSON.parse(response?.data);

        //both empty
        if (responseData.status == 422) {
            alert("Kulllanıcı adı veya şifre boş olamaz !");
        }
        else if (responseData.error == null && responseData.status == 200) {
            const userData = {
                "username": username,
                "password": password,
                "token": responseData.message.data.token,
                "id": responseData.message.data.id,
                "roles": responseData.message.data.roles,
            };
            dispatch({ type: 'DO_LOGIN', payload: userData });
            storeUserData(userData);
        }

        else {
            alert(responseData.message);
            dispatch({ type: 'DO_LOGIN', payload: undefined });
        }

    }).catch(function (error) {
        //change alert
        alert(error.message);
    });

}

export const onUserLogout = () => async (dispatch) => {
    try {
        dispatch({ type: 'DO_LOGOUT', payload: undefined });
        deleteUserData();
    } catch (error) {
        dispatch({ type: 'ON_ERROR', payload: error });
    }
}

export const getSchedules = () => async (dispatch) => {



    const fetchURL = "https://pingbitplatform.com/api/schedules/all";
    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    await RNFetchBlob.config({
        trusty: true
    }).fetch('GET', fetchURL,
        {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userJSON.token}`,
            'Connection': 'keep-alive',
        },
    ).then(function (response) {

        const responseData = JSON.parse(response?.data);

        if (responseData.error == null && responseData.status == 200) {
            dispatch(getScheduleContent(responseData.message.data.content));
        }
        else {
            alert(responseData.message);
        }
    }).catch(function (error) {
        //dispatch({type: 'ON_ERROR', payload: error});
    });

}

const getScheduleContent = (content) => dispatch => {
    var schedules = []
    content.forEach(element => {
        schedules.push({
            "id": element.id,
            "title": element.title,
            "user": element.user.userDetail.firstname + " " + element.user.userDetail.lastname,
            "description": element.description,
            "startDate": element.startDate,
            "endDate": element.endDate,
            "meetingUser": element.meetingUser.userDetail.firstname + " " + element.meetingUser.userDetail.lastname,
        });
    });
    dispatch({ type: 'SCHEDULE_CREATE', schedules: schedules });
}

export const ticketLoad = (scheduleId) => async (dispatch) => {

    const fetchURL = "https://pingbitplatform.com/api/schedules/" + scheduleId + "/ticket";
    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    var redirectURL = '';
    await RNFetchBlob.config({
        trusty: true
    }).fetch('GET', fetchURL,
        {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userJSON.token}`,
            'Connection': 'keep-alive',
        },
    ).then(function (response) {

        const responseData = JSON.parse(response?.data);
        redirectURL = "https://pingbitplatform.com" + responseData.path;
        RNFetchBlob.config({
            trusty: true,
        }).fetch('GET', redirectURL,
            {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userJSON.token}`,
                'Connection': 'keep-alive',
            }
        ).then(function (response) {
            const redirectData = JSON.parse(response?.data);
            if (redirectData.error == null && redirectData.status == 200) {
                dispatch(setUsersInfo());
                const ticketId = redirectURL.substring(redirectURL.lastIndexOf('/') + 1);
                dispatch({ type: 'ON_CHAT', ticketID: ticketId });
                dispatch(loadEarlierMessages());
            }
            else {
                alert(redirectData.message);
            }
        });
    }).catch(function (error) {
        //dispatch({type: 'ON_ERROR', payload: error});
    });

}

export const loadEarlierMessages = () => async (dispatch) => {

    dispatch({ type: "LOAD_EARLIER", isLoadingEarlier: true });
    const lastDate = store.getState().chatReducer.lastDate;
    const ticketId = store.getState().chatReducer.ticketID;
    const loadMessageLimit = 10;

    const fetchURL = "https://pingbitplatform.com/api/tickets/" + ticketId + "/posts/?date=" + lastDate + "&limit=" + loadMessageLimit;
    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    await RNFetchBlob.config({
        trusty: true,
    }).fetch('GET', fetchURL,
        {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userJSON.token}`,
            'Connection': 'keep-alive',
        },
    ).then(function (response) {

        const responseData = JSON.parse(response?.data);
        if (responseData.error == null && responseData.status == 200) {
            dispatch(loadEarlier(responseData.message.data));
        }
        else {
            alert(responseData.message);
        }
    }).done();

}

const loadEarlier = (data) => async (dispatch) => {


    var messages = [];

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    const newLastDate = data[0]?.createdDate;


    await data.forEach(element => {
        const message = {
            _id: element.id,
            text: element.content,
            createdAt: element.createdDate,
            user: {
                _id: element.user.id,
                name: element.user.userDetail.firstname + ' ' + element.user.userDetail.lastname,
                avatar: element.user.userDetail.avatarpresent ? "http" + (Platform.OS == "ios" ? "s" : "") + "://pingbitplatform.com/api/users/avatar/" + element.user.id + "/?access_token=" + userJSON.token : null,
            }
        }
        messages.unshift(message);
    });
    dispatch({ type: 'LOAD_EARLIER', messages: messages, isempty: (messages.length == 0), lastDate: newLastDate, isLoadingEarlier: false });
}


const setUsersInfo = () => async (dispatch) => {


    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    const fetchURL = "https://pingbitplatform.com/api/users/" + userJSON.id;

    RNFetchBlob.config({
        trusty: true,
    }).fetch('GET', fetchURL,
        {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userJSON.token}`,
            'Connection': 'keep-alive',
        },
    ).then(function (response) {
        const responseData = JSON.parse(response?.data);

        if (responseData.error == null && responseData.status == 200) {

            const data = responseData.message.data;
            const user = {
                "_id": data.id,
                "username": data.username,
                "name": data.userDetail.firstname + ' ' + data.userDetail.lastname,
                "firstname": data.userDetail.firstname,
                "lastname": data.userDetail.lastname,
                "avatarpresent": data.userDetail.avatarpresent,
                "gender": data.userDetail.gender,
                "avatar": data.userDetail.avatarpresent ? "http" + (Platform.OS == "ios" ? "s" : "") + "://pingbitplatform.com/api/users/avatar/" + data.id + "/?access_token=" + userJSON.token : null
            };
            dispatch({ type: 'USER_LOAD', user: user });
        }
        else {
            alert(responseData.message);
        }
    }).done();

}

export const postMessage = (message) => async (dispatch) => {

    console.log("message: " + JSON.stringify(message));
    const newMessage = message[0];
    const user = store.getState().userReducer.user;

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    const ticketId = store.getState().chatReducer.ticketID;
    const postURL = "https://pingbitplatform.com/api/tickets/" + ticketId + "/post";
    const dataObject = {
        id: null,
        content: newMessage.text,
        user: {
            id: user.id,
        },
        ticket: {
            id: parseInt(ticketId)
        }
    }
    RNFetchBlob.config({ trusty: true })
        .fetch(
            "POST",
            postURL,
            {
                'Authorization': `Bearer ${userJSON.token}`,
            },
            [
                { name: 'data', type: 'application/json', data: JSON.stringify(dataObject) }
            ])
        .then(res => {
            //console.log("res:" + JSON.stringify(res.data));
        })
        .catch((error) => console.log(error));
}

export const updateMessages = (receiveData) => async (dispatch) => {

    const data = JSON.parse(receiveData.body);
    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    const newMessage = {
        _id: data.id,
        text: data.content,
        createdAt: data.createdDate,
        user: {
            _id: data.user.id,
            name: data.user.userDetail.firstname + ' ' + data.user.userDetail.lastname,
            avatar: data.user.userDetail.avatarpresent ? "http" + (Platform.OS == "ios" ? "s" : "") + "://pingbitplatform.com/api/users/avatar/" + data.user.id + "/?access_token=" + userJSON.token : null,
        }
    };

    dispatch({ type: 'NEW_CHAT', messages: [newMessage] });
}


export const unMount = () => (dispatch) => {
    dispatch({ type: 'ON_CHAT', messages: [], lastDate: "" });
}


export const onVideoLoad = (scheduleId, props) => async (dispatch) => {

    const fetchURL = "https://pingbitplatform.com/api/schedules/" + scheduleId + "/token";

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    await RNFetchBlob.config({
        trusty: true,
    }).fetch('GET', fetchURL,
        {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': `Bearer ${userJSON.token}`,
        })
        .then(function (response) {

            const responseData = JSON.parse(response?.data);
            if (responseData.error == null && responseData.status == 200) {
                dispatch(setVideoInfo(responseData.message.data));
            }
            else {
                //Permission denied !
                Alert.alert(
                    'Error',
                    responseData.message,
                    [
                        { text: 'OK', onPress: props.navigation.goBack() },
                    ],
                    { cancelable: false },
                );
            }

        }).catch(function (error) {
            console.log(error);
        });

}

export const closeVideo = () => async (dispatch) => {

    await dispatch(engineUnmount());
    dispatch({ type: "VIDEO_CLOSE" });
    dispatch({ type: "DEL_VIDEO_USERS" });
    dispatch({ type: "MEETING_USER_LOAD", isMeetingUser: false })
}


export const uploadPicture = (image) => async (dispatch) => {

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);


    //meetingUser

    const userId = store.getState().userReducer.user.id;

    const postURL = "https://pingbitplatform.com/api/user/" + userId + "/file/";


    let imageURI = image.uri;

    if (Platform.OS == "ios")
        imageURI = imageURI.replace("file://", "");

    
    RNFetchBlob.config({ fileCache: true, appendExt: "jpg", trusty: true })
        .fetch(
            "POST",
            postURL,
            {
                "Accept": '*/*',
                'Authorization': `Bearer ${userJSON.token}`,
                "Content-Type": "multipart/form-data",
                'Connection': 'keep-alive',
            },
            [
                {
                    name: "file",
                    filename: image.fileName,
                    type: image.type,
                    data: RNFetchBlob.wrap(imageURI), // check for iOS
                },
            ],
        )
        .then((res) => {
            //console.log("image chat response: " + JSON.stringify(res));
        })
        .catch((error) => console.log(error));

}

export const checkMeetingUser = (scheduleId, uid, meetingUserId, patientId) => async (dispatch) => {

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);


    const getURL = "https://pingbitplatform.com/api/schedules/" + scheduleId + "/" + uid + "/user/";

    await RNFetchBlob.config({
        trusty: true,
    }).fetch('GET', getURL,
        {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': `Bearer ${userJSON.token}`,
        })
        .then(function (response) {
            const responseData = JSON.parse(response?.data);
            if (responseData.error == null && responseData.status == 200) {

                //Doctor connection
                if (responseData.message.data.user.id == meetingUserId) {

                    console.log(">>>Doctor camera or screen connected !");
                    //Screen share 
                    if (responseData.message.data.result == "screen") {
                        dispatch({ type: "MEETING_USER_LOAD", meetingUserId: meetingUserId, screenId: uid, isMeetingUser: true });
                    }
                    //Camera share
                    else {
                        dispatch({ type: "MEETING_USER_LOAD", meetingUserId: meetingUserId, cameraId: uid, isMeetingUser: true });
                    }
                }

                //Patient Connection
                else if (responseData.message.data.user.id == patientId) {
                    console.log(">>>Patient Connected !");
                    dispatch({ type: "VIDEO_USER_LOAD", patientUID: uid });
                }
            }

        }).catch(function (error) {
            console.log(error);
        });

}

export const getUserInfo = () => async (dispatch) => {


    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);


    const getURL = "https://pingbitplatform.com/api/users/" + userJSON.id;

    await RNFetchBlob.config({
        trusty: true,
    }).fetch('GET', getURL,
        {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': `Bearer ${userJSON.token}`,
        })
        .then(function (response) {
            const responseData = JSON.parse(response?.data);
            if (responseData.error == null && responseData.status == 200) {

                const email = responseData.message.data.userDetail.email;
                const gsm = responseData.message.data.userDetail.gsmphone;
                dispatch({ type: "SETTINGS_LOAD", email: email, gsm: gsm });
            }

        }).catch(function (error) {
            console.log(error);
        });
}

export const updateProfilePicture = (imageData) => async (dispatch) => {

    
    const image = imageData.assets[0];
    const imageURI = image.uri;
    console.log("imageURI: " + imageURI);
    dispatch({ type: "PROFILE_PICTURE_LOAD", avatar: imageURI, image: image });

}

export const getProfilePicture = () => async (dispatch) => {

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);
    const avatar = "http" + (Platform.OS == "ios" ? "s" : "") + "://pingbitplatform.com/api/users/avatar/" + userJSON.id + "/?access_token=" + userJSON.token;
    console.log("gelen avatar: " + avatar);
    dispatch({ type: "PROFILE_PICTURE_LOAD", avatar: avatar });
    console.log("profile dispatchedd !!");
}

export const uploadProfilePicture = () => async (dispatch) => {

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);


    //meetingUser

    const putURL = "https://pingbitplatform.com/api/users/" + userJSON.id;
    

    const image = store.getState().profilePictureReducer.image;

    let imageURI = image.uri;
    let dataObject = null;

    if (Platform.OS == "ios")
        imageURI = imageURI.replace("file://", "");

    await RNFetchBlob.config({
        trusty: true,
    }).fetch('GET', putURL,
        {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': `Bearer ${userJSON.token}`,
        })
        .then(function (response) {
            const responseData = JSON.parse(response?.data);
            if (responseData.error == null && responseData.status == 200) {

                dataObject = responseData.message.data;
            }

        }).catch(function (error) {
            console.log(error);
        });



    //const dataobject = {"password":"","repassword":"","id":5,"username":"baris","roles":[{"id":4,"name":"ROLE_ADMIN"}],"userDetail":{"title":"","avatarpresent":true,"alias":"","firstname":"Barış Evren","lastname":"Eser","gender":"MALE","tcno":"33928219215","passportno":"","birthdate":"2021-04-08T00:00:00Z","birthplace":"","mothername":"","fathername":"","email":"baris.eser@biyomod.com.tr","gsmphone":"905332775811","workphone":"","homephone":"","address":"","postalcode":"","country":{"id":225,"name":"Turkey"},"city":{"id":107166,"name":"Ankara"},"language":{"id":1,"name":"Türkçe","locale":"tr"},"timezone":{"zoneName":"Europe/Istanbul","gmtOffset":10800,"gmtOffsetName":"UTC+03:00","abbreviation":"EET","tzName":"Eastern European Time"}},"userConfiguration":{"id":5,"enabled":true,"totalAllowSize":1073741824}};
    await RNFetchBlob.config({ fileCache: true, appendExt: "jpg", trusty: true })
        .fetch(
            "PUT",
            putURL,
            {
                'Connection': 'keep-alive',
                "Accept": '*/*',
                'Authorization': `Bearer ${userJSON.token}`,
                "Content-Type": "multipart/form-data",
            },
            [
                {
                    name: "file",
                    filename: image.fileName,
                    type: image.type,
                    data: RNFetchBlob.wrap(imageURI), // check for iOS
                },
                {
                    name: "data",
                    type: "application/json",
                    data: JSON.stringify(dataObject),
                }
            ]
        )
        .then((res) => {
            if (res.respInfo.status == 200){
                alert("Profil resmi güncellendi !");
            }
            else{
                alert("Lütfen tekrar deneyin !");
            }
        })
        .catch((error) => console.log(error));



}
//Functions
const storeUserData = async (userData) => {
    try {
        await AsyncStorage.setItem("USER_DATA", JSON.stringify(userData));
    } catch (error) {
        console.log(error);
    }
}

const deleteUserData = async () => {
    try {
        await AsyncStorage.removeItem("USER_DATA");
    } catch (error) {
        console.log(error);
    }
}

const setVideoInfo = (data) => async (dispatch) => {

    const rtcProps = {
        appId: data.appId,
        channel: data.schedule.id.toString(),
        uid: data.token.cameraId,
        token: data.token.cameraToken,
        enableAudio: true,
        enableVideo: true,
        switchCamera: true,
    };

    //Init Engine
    const rtcEngine = await RtcEngine.createWithConfig(
        new RtcEngineConfig(rtcProps.appId)
    );

    await rtcEngine.enableVideo();
    await rtcEngine.startPreview();
    await rtcEngine.setChannelProfile(ChannelProfile.LiveBroadcasting);
    await rtcEngine.setClientRole(ClientRole.Broadcaster);


    const patientId = data.schedule.user.id;
    //Add engine listeners
    rtcEngine.addListener('JoinChannelSuccess', async (channel, uid, elapsed) => {

        const userId = store.getState().userReducer.user.id;
        //Self uid
        await dispatch({ type: 'VIDEO_USER_LOAD', videoUsers: uid, userUid: uid, isDoctor: userId == data.schedule.meetingUser.id, isPatient: data.schedule.user.id == userId, patientUID: data.schedule.user.cameraId });

        console.info('JoinChannelSuccess', channel, uid, elapsed);
        const arr = store.getState().videoUserReducer.videoUsers;
        console.log(JSON.stringify(arr));
    });
    rtcEngine.addListener('UserJoined', async (uid, elapsed) => {

        //check for doctor || meetingUser (camera && screen)
        await dispatch(checkMeetingUser(data.schedule.id, uid, data.schedule.meetingUser.id, patientId));

        const isMeetingUser = store.getState().videoMeetingUser.cameraId == uid;
        const isScreen = store.getState().videoMeetingUser.screenId > 0;

        console.log(">>>isMeetingUser: " + isMeetingUser);
        console.log(">>>isScreen: " + isScreen);

        if (!isMeetingUser) {
            console.log(">>>izleyici or patient geldi !");
            const arr1 = store.getState().videoUserReducer.videoUsers;
            console.log(">>>before " + JSON.stringify(arr1));

            await dispatch({ type: 'NEW_VIDEO_USER', videoUsers: uid });

            const arr2 = store.getState().videoUserReducer.videoUsers;
            console.log(">>>after " + JSON.stringify(arr2));
        }
        else {
            //doctor joined (camera or screen)!
        }

        console.info('UserJoined', uid, elapsed);
        const pid = store.getState().videoUserReducer.patientUID;
        console.log("patientId: " + pid);
        const isDoctor = store.getState().videoUserReducer.isDoctor;
        console.log("isDoctor: " + isDoctor);

    });
    rtcEngine.addListener('UserOffline', async (uid, reason) => {

        const videoUsers = store.getState().videoUserReducer.videoUsers;

        const isMeetingUser = store.getState().videoMeetingUser.cameraId == uid;
        const isScreen = store.getState().videoMeetingUser.screenId == uid;

        if (isScreen) {
            await dispatch({ type: "MEETING_USER_LOAD", screenId: -1 });
        }

        else if (!isMeetingUser) {
            var index = videoUsers?.indexOf(uid);
            if (index !== -1) {
                await dispatch({ type: "VIDEO_USER_LOAD", videoUsers: videoUsers?.length == 0 ? [] : videoUsers });
            }
        }
        else {
            //doctor deleted !
            await dispatch({ type: "MEETING_USER_LOAD", isMeetingUser: false });
        }

        console.info('UserOffline', uid, reason);

        const videoUsersDebug = store.getState().videoUserReducer.videoUsers;
        console.log("videoUsersDebug Length: " + videoUsersDebug?.length);

    });
    rtcEngine.addListener('LeaveChannel', (stats) => {
        console.info('LeaveChannel', stats);
    });


    dispatch({ type: 'VIDEO_LOAD', rtcProps: rtcProps, rtcEngine: rtcEngine });

    await rtcEngine.joinChannel(
        rtcProps.token,
        rtcProps.channel,
        null,
        rtcProps.uid
    );

}
export const closeCamera = () => async (dispatch) => {

    const rtcEngine = store.getState().videoReducer.rtcEngine;
    const rtcProps = store.getState().videoReducer.rtcProps;

    //await rtcEngine.enableLocalVideo(rtcProps.enableVideo);

    if (rtcProps.enableVideo) {
        await rtcEngine.disableVideo();
        await rtcEngine.stopPreview();
    }
    else {
        await rtcEngine.enableVideo();
        await rtcEngine.startPreview();
    }

    rtcProps.enableVideo = !rtcProps.enableVideo;
    dispatch({ type: 'VIDEO_LOAD', rtcProps: rtcProps, rtcEngine: rtcEngine, loading: false });
}

export const closeAudio = () => async (dispatch) => {

    const rtcEngine = store.getState().videoReducer.rtcEngine;
    const rtcProps = store.getState().videoReducer.rtcProps;

    if (rtcProps.enableAudio) {
        await rtcEngine.disableAudio();
    }
    else {
        await rtcEngine.enableAudio();
    }

    rtcProps.enableAudio = !rtcProps.enableAudio;
    dispatch({ type: 'VIDEO_LOAD', rtcProps: rtcProps, rtcEngine: rtcEngine, loading: false });
}

export const switchCamera = () => async (dispatch) => {

    const rtcEngine = store.getState().videoReducer.rtcEngine;
    const rtcProps = store.getState().videoReducer.rtcProps;

    await rtcEngine.switchCamera();

    rtcProps.switchCamera = !rtcProps.switchCamera;

    dispatch({ type: 'VIDEO_LOAD', rtcProps: rtcProps, rtcEngine: rtcEngine, loading: false });
}

const engineUnmount = () => async () => {

    const rtcEngine = store.getState().videoReducer.rtcEngine;
    await rtcEngine?.leaveChannel();
    await rtcEngine?.destroy();
};




//Reducers

export const userReducer = (state = {}, action) => {
    switch (action.type) {
        case 'DO_LOGIN':
            return {
                ...state,
                user: action.payload,
                loading: false,
            };
        case 'DO_LOGOUT':
            return {
                ...state,
                user: action.payload,
                loading: false,
            };
        case 'ON_ERROR':
            return {
                ...state,
                appError: action.payload,
            };
        case 'ON_LOAD': {
            return {
                ...state,
                loading: true,
            };
        }
        default:
            return state;
    }
}
const initial_schedule_state = {
    schedules: null,
    loading: true,
};


const initial_message_state = {
    messages: [],
    websocket: null,
    loading: true,
    isempty: false,
    lastDate: "",
}
export const scheduleReducer = (state = initial_schedule_state, action) => {
    switch (action.type) {
        case 'SCHEDULE_CREATE':
            return {
                ...state,
                schedules: action.schedules,
                loading: false,
            };
        default:
            return state;
    }
}



export const chatReducer = (state = initial_message_state, action) => {
    switch (action.type) {
        case 'ON_CHAT':
            return {
                ...state,
                messages: (action.messages === undefined ? state.messages : action.messages),
                ticketID: action.ticketID,
                isempty: (action.isempty === undefined ? false : action.isempty),
                lastDate: (action.lastDate === undefined ? state.lastDate : action.lastDate),
                isLoadingEarlier: (action.isLoadingEarlier === undefined ? false : action.isLoadingEarlier),
                meetingUser: (action.meetingUser === undefined ? state.meetingUser : action.meetingUser),
            };
        case 'NEW_CHAT':
            return {
                ...state,
                messages: [...action.messages, ...state.messages],
                ticketID: (action.ticketID === undefined ? state.ticketID : action.ticketID),
                isempty: (action.isempty === undefined ? false : action.isempty),
                lastDate: (action.lastDate === undefined ? state.lastDate : action.lastDate),
                isLoadingEarlier: (action.isLoadingEarlier === undefined ? false : action.isLoadingEarlier),
                meetingUser: (action.meetingUser === undefined ? state.meetingUser : action.meetingUser),
            }
        case 'LOAD_EARLIER':
            return {
                ...state,
                messages: (action.messages === undefined ? state.messages : [...state.messages, ...action.messages]),
                ticketID: (action.ticketID === undefined ? state.ticketID : action.ticketID),
                isempty: (action.isempty === undefined ? false : action.isempty),
                lastDate: (action.lastDate === undefined ? state.lastDate : action.lastDate),
                isLoadingEarlier: (action.isLoadingEarlier === undefined ? false : action.isLoadingEarlier),
                meetingUser: (action.meetingUser === undefined ? state.meetingUser : action.meetingUser),
            }
        default:
            return state;
    }
}

export const chatUserReducer = (state = {}, action) => {
    switch (action.type) {
        case 'USER_LOAD':
            return {
                ...state,
                user: action.user,
            };
        default:
            return state;
    }
}

export const videoReducer = (state = { loading: true }, action) => {
    switch (action.type) {
        case 'VIDEO_LOAD':
            return {
                ...state,
                rtcProps: action.rtcProps,
                rtcEngine: action.rtcEngine,
                loading: false,
            };
        case 'VIDEO_CLOSE':
            return {
                ...state,
                loading: true,
                rtcProps: null,
                rtcEngine: null,
            }
        default:
            return state;
    }
}

export const videoUserReducer = (state = {}, action) => {

    switch (action.type) {
        case 'VIDEO_USER_LOAD':
            return {
                ...state,
                videoUsers: action.videoUsers === undefined ? state.videoUsers : [action.videoUsers],
                userUid: action.userUid === undefined ? state.userUid : action.userUid,
                isDoctor: action.isDoctor === undefined ? state.isDoctor : action.isDoctor,
                isPatient: action.isPatient === undefined ? state.isPatient : action.isPatient,
                patientUID: action.patientUID === undefined ? state.patientUID : action.patientUID,
            }
        case 'NEW_VIDEO_USER':
            return {
                ...state,
                videoUsers: state.videoUsers === undefined ? [action.videoUsers] : [...state.videoUsers, action.videoUsers],
                userUid: action.userUid === undefined ? state.userUid : action.userUid,
                isDoctor: state.isDoctor,
                isPatient: state.isPatient,
                patientUID: state.patientUID,
            }
        case 'DEL_VIDEO_USERS':
            return {
                ...state,
                videoUsers: undefined,
                userUid: action.userUid === undefined ? state.userUid : action.userUid,
                isDoctor: false,
                isPatient: state.isPatient,
                patientUID: undefined,
            }
        default:
            return state;
    }
}

export const videoMeetingUser = (state = { isMeetingUser: false, screenId: -1 }, action) => {

    switch (action.type) {
        case 'MEETING_USER_LOAD':
            return {
                ...state,
                isMeetingUser: action.isMeetingUser === undefined ? state.isMeetingUser : action.isMeetingUser,
                meetingUserId: action.meetingUserId === undefined ? state.meetingUserId : action.meetingUserId,
                cameraId: action.cameraId === undefined ? state.cameraId : action.cameraId,
                screenId: action.screenId === undefined ? -1 : action.screenId,
            }
        default:
            return state;
    }
}

export const settingsReducer = (state = { loading: true }, action) => {

    switch (action.type) {
        case 'SETTINGS_LOAD':
            return {
                ...state,
                email: action.email,
                gsm: action.gsm,
                loading: false,
            }
        default:
            return state;
    }
}

export const profilePictureReducer = (state = { loading: true }, action) => {

    switch (action.type) {
        case 'PROFILE_PICTURE_LOAD':
            return {
                ...state,
                avatar: action.avatar,
                image: action.image === undefined ? state.image : action.image,
                loading: false,
            }
        default:
            return state;
    }
}

//Root reducer
export const rootReducer = combineReducers({
    userReducer: userReducer,
    scheduleReducer: scheduleReducer,
    chatReducer: chatReducer,
    chatUserReducer: chatUserReducer,
    videoReducer: videoReducer,
    videoUserReducer: videoUserReducer,
    videoMeetingUser: videoMeetingUser,
    settingsReducer: settingsReducer,
    profilePictureReducer: profilePictureReducer,
});

//Store
export const store = createStore(rootReducer, applyMiddleware(thunk));

