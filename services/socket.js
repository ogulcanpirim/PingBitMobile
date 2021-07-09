import { Platform } from "react-native";
import SockJS from "sockjs-client";
import Stomp from "webstomp-client";
import AuthHeader from './AuthHeader';
import { chatReducer, store, updateMessages } from ".";
import { connect } from "react-redux";

var connected = false;
var socket = '';
export var stompClient = '';
const subHeader = {id: "sub-0"};

export default connectSocket = async (props) => {
    const header = await AuthHeader();
    socket = new SockJS("http" + (Platform.OS == "ios" ? "s" : "") + "://pingbitplatform.com/ws");
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};
    await stompClient.connect(
        { ...header },
        frame => {
            connected = true;
            const subHeader = {id: "sub-0"};
            stompClient.subscribe(`/tickets/27`, onmessage, subHeader);
        },
        error => {
            console.log(error);
            connected = false;
        }
    );    
}

const onmessage = (e) => {
    store.dispatch(updateMessages(e));
}

const disconnect = () => {
    if (stompClient) {
        stompClient.disconnect();
    }
    connected = false;
}
export const tickleConnection = () => {
    connected ? disconnect() : connectSocket();
}