import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import IonicIcon from 'react-native-vector-icons/Ionicons';

//import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

//Screens
import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ChatScreen from '../screens/ChatScreen';
import CustomVideoScreen from '../screens/CustomVideoScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfilePictureScreen from '../screens/ProfilePictureScreen';
import UserDocumentScreen from '../screens/UserDocumentScreen';

const Stack = createStackNavigator();
const SettingsStack = createStackNavigator();
const Drawer = createDrawerNavigator();


function HomeStackScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen}></Stack.Screen>
        </Stack.Navigator>
    );
}
function ScheduleStackScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Schedules" component={ScheduleScreen}></Stack.Screen>
        </Stack.Navigator>
    );
}

function SettingsStackScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Setting"
                component={SettingsScreen}
            />
            <Stack.Screen name="UserDocument" component={UserDocumentScreen}/>
            <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen}/>
        </Stack.Navigator>
    );
}

const Tab = createBottomTabNavigator();

const MyStack = (props) => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Schedules"
                component={BottomNavigator}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="VideoCall" options={{ headerShown: false }} component={CustomVideoScreen} />
        </Stack.Navigator>
    );
}



function BottomNavigator() {
    return (
        <Tab.Navigator initialRouteName="Home"
            screenOptions={({ route }) => ({
                HeaderTitle: () => <Text>Header</Text>,
                tabBarIcon: ({ focused, color, size, padding }) => {

                    let iconName;
                    if (route.name == 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name == 'Schedule') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name == 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return (
                        <IonicIcon name={iconName} size={size} color={color} style={{ paddingBottom: padding }}></IonicIcon>

                    );
                },
            })}>
            <Tab.Screen name="Home" component={HomeStackScreen} />
            <Tab.Screen name="Schedule" component={ScheduleStackScreen} />
            <Tab.Screen name="Settings" component={SettingsStackScreen} />
            
        </Tab.Navigator>
    );
}


export default function NavigationComponent(props) {
    return (
        <NavigationContainer>
            <Drawer.Navigator initialRouteName="Home">
                <Drawer.Screen name="Home" component={MyStack} />
            </Drawer.Navigator>
        </NavigationContainer>
    )
}