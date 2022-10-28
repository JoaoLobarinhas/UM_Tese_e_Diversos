import React from 'react';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import {FontAwesome5} from '@expo/vector-icons';
import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";
import WebSocketFriends from "../config/WebSocketFriends";
import * as SecureStore from 'expo-secure-store';

import Icon from '../assets/logo.png';
import colors from '../config/colors';
import {navigateToEditUser, navigateToSplashScreen} from '../config/RootNavigation';

const ws = WebSocketFriends.instance.ws

function TopBar() {

  const checkLogout = () => {
    Alert.alert("Signing out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel"
      },
      { text: "YES", onPress: logOut }
    ])
    return true;
  }

  const logOut = () =>{
    const keys = ['access_token', 'refresh_token', 'user_id', 'access_token_expiration', 'refresh_token_expiration']
    SecureStore.getItemAsync("user_id").then((idUser)=>{
      if(idUser){
        ws.send(JSON.stringify({
          userID: idUser,
          action: "offline",
        }))
      }
      SecureStore.deleteItemAsync('access_token').then((e)=>{
        SecureStore.deleteItemAsync('refresh_token').then((e)=>{
          SecureStore.deleteItemAsync('user_id').then((e)=>{
            SecureStore.deleteItemAsync('access_token_expiration').then((e)=>{
              SecureStore.deleteItemAsync('refresh_token_expiration').then((e)=>{
                navigateToSplashScreen()
              })
            })
          })
        })
      })
    })
    .catch(error => {
      console.log(error);
      return;
    });

  }

  return (
    <View style={styles.topBar}>
      <FlashMessage position="top"/>
      <FontAwesome5
        name="user-cog"
        size={25}
        color={colors.whiteOpacity60}
        backgroundColor='transparent'
        underlayColor='transparent'
        activeOpacity={.3}
        style={styles.text, styles.iconLeft}
        onPress={()=>navigateToEditUser()}
        />
      <Image
        source={Icon}
        style={styles.centerIcon}
        />
      <FontAwesome5
        name="sign-out-alt"
        color={colors.whiteOpacity60}
        size={25}
        backgroundColor='transparent'
        underlayColor='transparent'
        activeOpacity={.3}
        style={styles.text, styles.iconRight}
        onPress={() => checkLogout()}
        />
    </View>
  );
}


const styles = StyleSheet.create({
  iconLeft:{
    justifyContent: 'flex-start',
    marginLeft: 17,
  },
  iconRight:{
    justifyContent: 'flex-end',
    marginRight: 17,
  },
  topBar: {
    paddingTop:15,
    paddingBottom:5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: colors.mainCard,
    borderBottomWidth:0.5
  },
  centerIcon: {
    alignSelf:"center",
    width: 45,
    height: 45
  },
  text: {
    color: "#fff"
  }
});

export default TopBar