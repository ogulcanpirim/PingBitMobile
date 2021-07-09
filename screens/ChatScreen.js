import React, { useEffect, useCallback } from 'react';
import { chatReducer, chatUserReducer } from '../services';
import { ticketLoad, updateMessages, postMessage, unMount, loadEarlierMessages } from '../services';
import { connect } from 'react-redux';
import { Bubble, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AccessoryBarComponent from '../components/AccessoryBarComponent';
import connectSocket from '../services/socket';
import { tickleConnection } from '../services/socket';
import tr from 'dayjs/locale/tr'
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

const chatScreen = (props) => {

    useEffect(() => {
        props.ticketLoad(props.route.params.id);
        connectSocket();
        return () => {
            props.unMount();
            tickleConnection();
        }
    }, [])

    const onSend = useCallback((message) => {
        const msgText = message[0]?.text;

        //check message is valid
        if ((msgText && /\S/.test(msgText)) || (message[0]?.image)) {
            props.postMessage(message);
        }

        this.giftedChatRef.scrollToBottom();
    }, []);

    const renderInputToolbar = (props) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={styles.inputToolbar}
                primaryStyle={{ alignItems: 'center' }}
            >
            </InputToolbar>
        );
    }

    const renderSend = (props) => {

        return (
            <Send {...props}
                //disabled={loading}
                containerStyle={{
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 4,
                    marginRight: 4,
                    marginBottom: 0,
                }}>
                <View>
                    <AntDesign
                        name={"rightcircleo"}
                        size={26}>
                    </AntDesign>
                </View>
            </Send>
        );
    }


    const renderChatEmpty = () => {
        if (props.isempty)
            return null;

        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000000"></ActivityIndicator>
            </View>
        );
    }


    const renderAccessory = () => (
        <AccessoryBarComponent {...props} onSend={onSend} />
    )

    return (
        <GiftedChat
            ref={ref => this.giftedChatRef = ref}
            user={props.user}
            showUserAvatar
            renderUsernameOnMessage
            isAnimated
            messages={props.messages}
            onSend={onSend}
            alwaysShowSend
            showAvatarForEveryMessage
            renderAvatarOnTop
            inverted={true}
            //Customize
            renderInputToolbar={renderInputToolbar}
            renderSend={renderSend}
            renderAccessory={renderAccessory}
            renderChatEmpty={renderChatEmpty}
            infiniteScroll
            isLoadingEarlier={props.isLoadingEarlier}
            loadEarlier={props.messages?.length > 0}
            onLoadEarlier={props.loadEarlierMessages}
            scrollToBottom
            //time
            locale={tr.name}
        ></GiftedChat>

    );

}

const mapStateToProps = (state) => ({
    chatReducer: state.chatReducer,
    websocket: state.chatReducer.websocket,
    messages: state.chatReducer.messages,
    user: state.chatUserReducer.user,
    isempty: state.chatReducer.isempty,
    isLoadingEarlier: state.chatReducer.isLoadingEarlier,
});

const params = {
    chatReducer,
    chatUserReducer,
    updateMessages,
    postMessage,
    ticketLoad,
    unMount,
    loadEarlierMessages,
};

const ChatScreen = connect(mapStateToProps, params)(chatScreen);


export default ChatScreen;

const styles = StyleSheet.create({
    inputToolbar: {
        borderWidth: 0.01,
        borderColor: 'grey',
        borderRadius: 25,
    },
    sendLogo: {
        marginRight: 10,
        marginBottom: 7,
    }
});

