import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

import WebSocketFriends from '../config/WebSocketFriends'
import colors from '../config/colors';
import axiosInstance from "../config/axios";
import constants from '../config/constants';

const ws = WebSocketFriends.instance.ws
const realWidth = (Dimensions.get('window').width)*0.5

const SplashScreen = ({navigation}) => {
  
  //State for ActivityIndicator animation
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAnimating(false);
      //Check if user_id is set or not
      //If not then send for Authentication
      //else send to Home Screen
      SecureStore.isAvailableAsync().then(response=>console.log("Secure thing: "+ response))
      SecureStore.getItemAsync('refresh_token').then((value) => {
        const refresh_token= value
          SecureStore.getItemAsync('refresh_token_expiration').then((value)=>{
            const refresh_token_expiration = new Date(value);
            const today = new Date();
            if( refresh_token && refresh_token_expiration && today < refresh_token_expiration){
              SecureStore.getItemAsync('email').then((value)=>{
                var email = value
                SecureStore.getItemAsync('password').then((value)=>{
                  var password = value
                  let dataToSend = {
                    email: email,
                    password: password,
                  };
                  let formBody = [];
                  for (let key in dataToSend) {
                      let encodedKey = encodeURIComponent(key);
                      let encodedValue = encodeURIComponent(dataToSend[key]);
                      formBody.push(encodedKey + '=' + encodedValue);
                  }
                  formBody = formBody.join('&');
                  axiosInstance.post("user/login",formBody).then(result =>{
                    if(result.data.access && result.data.refresh && result.data.user_id){
                        SecureStore.setItemAsync('access_token', result.data.access);
                        SecureStore.setItemAsync('refresh_token', result.data.refresh);
                        SecureStore.setItemAsync('user_id', result.data.user_id.toString());
                        SecureStore.setItemAsync('email', email);
                        SecureStore.setItemAsync('password', password);
                        const now = new Date();
                        const access_token_expiration = new Date(now.getTime()+ constants.minutes*60000).toJSON();
                        const refresh_toke_expiration = new Date(now.getTime() + constants.days*86400000).toJSON();
                        SecureStore.setItemAsync('access_token_expiration',access_token_expiration);
                        SecureStore.setItemAsync('refresh_token_expiration',refresh_toke_expiration);
                        ws.onopen = (event) =>{
                          console.log("WebSocketFriends is open now.");
                        };
                        navigation.dispatch(
                          CommonActions.reset({index:1, routes:[{name:"Functionality"}]})
                        )
                    }
                    else{
                        setErrorMessage("Invalid Email or Password");
                        return;
                    }
                })
                .catch(error => {
                    console.log(error); // Will output : NETWORK ERROR
                    return;
                });
                })
              })
            }
            else{
              navigation.dispatch(
                CommonActions.reset({index:1, routes:[{name:"Auth"}]})
              )
            }
          })
          
        }
      );
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain"/>
      <ActivityIndicator
        animating={animating}
        color={colors.red}
        size="large"
        style={styles.activityIndicator}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop:30,
    backgroundColor: colors.main,
  },
  activityIndicator: {
    alignItems: 'center',
    height: 80,
  },
  logo:{
    maxHeight: 200,
    maxWidth: 200,
    width: realWidth,
    height: realWidth,
},
});