import React, {useState, useEffect} from 'react';
import { StyleSheet, SafeAreaView, Text, Button, Alert, View, TouchableOpacity, Image } from 'react-native';
// styles
import stylesGlobal from '../config/css'
import TopBar from './TopBar'
import colors from '../config/colors'
import {FontAwesome5} from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';
// services
import * as SecureStore from 'expo-secure-store';
import axiosInstance from "../config/axios";


const SessionsPage = (props) => {
  const [userID, setUserID] = useState(0)
  const [showJoinGroup, setShowJoinGroup] = useState(false)
  const [joinGroupID, setJoinGroupID] = useState("")

  useEffect(() => {
    let isMounted = true; // note this flag denote mount status
    SecureStore.getItemAsync('user_id').then(idUser=>{
      if (isMounted) setUserID(idUser);
    });
    return () => { isMounted = false };
  }, [])

  function createGroup(){
    // send request to backend to create group
    axiosInstance.post("session/create", {
      "id_user": userID
    })
    .then(
      // receive group number
      res => {
        // move to group page
        props.navigation.navigate('GroupPage', {idSession: res.data.id_session, QRCode: res.data.qr_code, isAdmin: true})
      }
    )
  }

  function joinGroup(){
    // send post to add user to
    axiosInstance.get(`api/session/verify/idUser=${userID}&idSession=${joinGroupID}`)
    .then(
      // receive positive response
      res => {
        if(res.data.onSession == true) {
          // move to group page
          props.navigation.navigate('GroupPage', {idSession: joinGroupID.toUpperCase(), isAdmin: false});
        } else {
          alert("Error joining room. Try again. If the error persists, please restart the app.")
        }
      }
    ).catch((error) => {
      if(error.response.status != 200){
        Alert.alert("Error joining room", "This room does not exist", [
          {
            text: "OK",
            onPress: () => null,
            style: "cancel"
          }
        ])
        return false;
      }
    })
  }

  return (
    <SafeAreaView style={stylesGlobal.app}>
      <TopBar/>
      <Text style={styles.title} >Sessions</Text>
        <TouchableOpacity
          style={[stylesGlobal.button, styles.createSessionButton]}
          title="CreateGroupButton"
          onPress={() => createGroup()}
          >
            <Text style={[ stylesGlobal.textButton, styles.textButton ]}>Create Group</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[stylesGlobal.button, styles.joinSessionButton]}
          title="JoinGroupButton"
          onPress={() => setShowJoinGroup(!showJoinGroup)}
          >
            <Text style={[stylesGlobal.textButton, styles.textButton ]}>Join Group</Text>
        </TouchableOpacity>
        <View style={{display: showJoinGroup ? "flex" : "none" }}>
          <TextInput
            style={[stylesGlobal.text, stylesGlobal.input]}
            placeholder="Insert group ID"
            onChangeText={joinGroupID => setJoinGroupID(joinGroupID)}
            value={joinGroupID} />
          <TouchableOpacity style={[stylesGlobal.button, styles.joinGroupButton, {display: joinGroupID.length > 1 ? "flex" : "none"}]} onPress={() => joinGroup()}>
            <Text style={[styles.textButton, {color: joinGroupID.length > 1 ? colors.black : colors.whiteOpacity60}]}>Join</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    color: 'white',
    textAlign: 'center'
  },
  buttonsSection: {
    display: 'flex',
  },
  createSessionButton: {
    bottom: 0,
    marginTop: 40,
    backgroundColor: colors.blue,
    textAlign: 'center',
  },
  joinSessionButton:{
    bottom: 0,
    marginTop: 20,
    backgroundColor: colors.secondaryGrey,
    textAlign: 'center',
  },
  joinGroupButton:{
    backgroundColor: colors.purple,
    width: '50%'
  },
  containerBtns:{
    flexDirection: 'row',
  },
  iconBtns:{
    marginRight: 7,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  textButton:{
    color: colors.white,
    fontSize : 16,
  }
})

export default SessionsPage;