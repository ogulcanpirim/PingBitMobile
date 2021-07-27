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
import VideoCallScreen from '../screens/VideoCallScreen';
import CustomVideoScreen from '../screens/CustomVideoScreen';


const Stack = createStackNavigator();

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
    )
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
                    }
                    return (
                        <>
                            <IonicIcon name={iconName} size={size} color={color} style={{ paddingBottom: padding }}></IonicIcon>
                        </>
                    );
                },
            })}>
            <Tab.Screen name="Home" component={HomeStackScreen} />
            <Tab.Screen name="Schedule" component={ScheduleStackScreen} />
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