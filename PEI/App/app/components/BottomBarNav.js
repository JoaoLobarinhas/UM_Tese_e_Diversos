import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";
import {FontAwesome5} from '@expo/vector-icons';
import { Image, View} from 'react-native';

import WebSocketFriends from '../config/WebSocketFriends'
import axiosInstance from '../config/axios'
import * as SecureStore from 'expo-secure-store';
import {CommonActions } from '@react-navigation/native';

import colors from '../config/colors'
import LandingPage_ from './LandingPage';
import PickMovie from './PickMovie';
import GroupPage_ from './GroupPage';
import SessionsPage from './SessionsPage';
import History from './History'
import WatchLater from './WatchLater'
import { event } from 'react-native-reanimated';

const Tab = createMaterialBottomTabNavigator();

const ws = WebSocketFriends.instance.ws

const Stack = createStackNavigator();

const LogoTitle = () =>{
    return (
      <View style={{marginLeft:-47, alignItems: 'center'}}>
        <Image
        style={{ width: 45, height: 45, alignSelf:'center',}}
        source={require('../assets/logo.png')}
        />
      </View>
    );
}

function PickMovies() {
    return(
        <Stack.Navigator
          initialRouteName="SessionPage"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.main,
              borderBottomColor: colors.mainCard,
              borderBottomWidth: 0.5,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.whiteOpacity60,
          }}
        >
          <Stack.Screen name="SessionPage" component={SessionsPage} options={{headerShown: false}}/>
          <Stack.Screen name="GroupPage" component={GroupPage_} options={{headerShown: false}}/>
          <Stack.Screen name="PickMovie" component={PickMovie} options={{headerShown: false}}/>
        </Stack.Navigator>
      );
}


function BottomBarNav(props) {
    const [idUser, setIdUser] = React.useState('');

    React.useEffect(() => {
        sendData()
        userOnline()
        ws.onclose = function(event) {
            showMessage({
                description: "Couldn't connect to the socket server",
                message: "Socket not available",
                type: "danger",
            });
        };
    }, [props]);

    // Async Storage get id, make request friends, send to socket
    const sendData=()=>{
        SecureStore.getItemAsync("user_id").then((idUser)=>{
            if(idUser){
                setIdUser(idUser)
                axiosInstance.get("/user/"+idUser+"/friends").then((request)=>{
                    if(request.data){
                        try {
                            ws.send(JSON.stringify({
                                userID: idUser,
                                action: "online",
                                friends: request.data
                            }))
                        } catch (error) {
                            console.log(error)
                        }

                    }
                    else{
                        try {
                            ws.send(JSON.stringify({
                                userID: idUser,
                                action: "online",
                                friends: []
                            }))
                        } catch (error) {
                            console.log(error)
                        }
                    }
                })
                .catch(error => {
                    console.log(error); // Will output : NETWORK ERROR
                });
            }
            else{
                props.navigation.dispatch(
                    CommonActions.reset({index:1, routes:[{name:"Auth"}]})
                )
            }
        })
    }

    const userOnline = () =>{
        ws.addEventListener("message", (e)=>{
            var data = JSON.parse(e.data);
            if(data.action && data.action === "friendRequest"){
                axiosInstance.get("/user/"+data.userID).then((response)=>{
                    showMessage({
                        description: response.data.username + " sent a friend request",
                        message: "Friend Request",
                        type: "info",
                        backgroundColor: colors.mainCard,
                        color: colors.whiteOpacity60,
                        onPress: () => {
                            props.navigation.navigate('LandingPage', { newFriend: true })
                        },
                    });
                })

            }
            if(data.action && data.action === "NewUserOnline"){
                console.log(data)
            }
        })
    }

    return (
        <Tab.Navigator
        initialRouteName="LandingPage"
        backBehavior= "history"
        shifting="True"
        barStyle={{ borderColor: colors.mainCard, borderTopWidth:1 }}
        keyboardHidesTabBar="true"
        >
            <Tab.Screen
                name="LandingPage"
                component={LandingPage_}
                options={{
                    tabBarColor: colors.main,
                    tabBarLabel: 'Home',
                    tabBarIcon: () => (
                        <FontAwesome5
                            name="home"
                            size={20}
                            color={colors.yellow}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            activeOpacity={.3}
                        />
                    ),

                }}
            />
            <Tab.Screen
                name="Sessions"
                component={PickMovies}
                options={{
                    tabBarLabel: 'Sessions',
                    tabBarColor: colors.main,
                    tabBarIcon: () => (
                        <FontAwesome5
                            name="users"
                            size={20}
                            color={colors.red}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            activeOpacity={.3}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Watch Later"
                component={WatchLater}
                options={{
                    tabBarLabel: 'Watch Later',
                    tabBarColor: colors.main,
                    tabBarIcon: () => (
                        <FontAwesome5
                            name="clock"
                            size={20}
                            color={colors.purple}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            activeOpacity={.3}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={History}
                options={{
                    tabBarLabel: 'History',
                    tabBarColor: colors.main,
                    tabBarIcon: () => (
                        <FontAwesome5
                            name="history"
                            size={20}
                            color={colors.blue}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            activeOpacity={.3}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default BottomBarNav;