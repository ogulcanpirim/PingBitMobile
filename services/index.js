//imports
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import RNFetchBlob from 'rn-fetch-blob';
import { Alert, Platform } from "react-native";
import { layout, mode } from "agora-rn-uikit";
import { VideoRenderMode } from "react-native-agora";

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

export const closeVideo = () => (dispatch) => {
    dispatch({ type: "VIDEO_CLOSE" });
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
            //console.log("res:" + JSON.stringify(res));
        })
        .catch((error) => console.log(error));

}

export const checkVideoUser = (scheduleId, userId) => async (dispatch) => {

    console.log("userId: " + userId);

    const userData = await AsyncStorage.getItem("USER_DATA");
    const userJSON = JSON.parse(userData);

    const getURL = "https://pingbitplatform.com/api/schedules/" + scheduleId + "/" + userId + "/user";

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
            console.log("responseData: " + JSON.stringify(responseData));
            if (responseData.error == null && responseData.status == 200) {
                dispatch(changeLayout(userId, responseData.message.data));
            }
            else {

            }

        }).catch(function (error) {
            console.log(error);
        });

}


const changeLayout = (userId, data) => async (dispatch) => {


    // Open Camera
    if (data.result == "camera") {

        //Meeting User
        if (data.cameraId == userId) {

        }
        //Contributer,patient
        else {

        }
    }
    // Share Screen 
    else {
        //changeFullScreen
    }
    //

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

const setVideoInfo = (data) => (dispatch) => {


    //set doctor || meeting user
    dispatch({ type: "MEETING_USER_LOAD", id: data.schedule.meetingUser.id });

    const rtcProps = {
        appId: data.appId,
        channel: data.schedule.id.toString(),
        uid: data.token.cameraId,
        token: data.token.cameraToken,
        enableAudio: false,
        enableVideo: false,
        layout: layout.grid,
    };


    const styleProps = {
        styleProps: {
            iconSize: 30,
            theme: '#ffffffee',
            videoMode: {
                max: VideoRenderMode.Hidden,
                min: VideoRenderMode.Hidden,
            },
            gridVideoView: {
                display: 'none',
            }
        },
    };

    dispatch({ type: 'VIDEO_LOAD', rtcProps: rtcProps, styleProps: styleProps });
}
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
                styleProps: action.styleProps,
                loading: false,
            };
        case 'VIDEO_CLOSE':
            return {
                ...state,
                loading: true,
                rtcProps: null,
            }
        default:
            return state;
    }
}

export const videoUserReducer = (state = {}, action) => {

    switch (action.type) {
        case 'USER_VIDEO_LOAD':
            return {
                ...state,
                enableAudio: action.enableAudio,
                enableVideo: action.enableVideo,
            }
        default:
            return state;
    }
}

export const videoMeetingUser = (state = {}, action) => {

    switch (action.type) {
        case 'MEETING_USER_LOAD':
            return {
                ...state,
                id: action.id,
                cameraId: action.cameraId,
                screenId: action.screenId,
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
});

//Store
export const store = createStore(rootReducer, applyMiddleware(thunk));

