import React from 'react';
import { 
    View, 
    StyleSheet, 
    Image, 
    Text, 
    TouchableOpacity,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import {FontAwesome5} from '@expo/vector-icons';
import Toast from 'react-native-simple-toast';

import colors from '../../config/colors'
import axiosInstance from "../../config/axios";
import WebSocketFriends from '../../config/WebSocketFriends'

const ws = WebSocketFriends.instance.ws

function CardAddFriend ({id_user,username}){
    const [buttonPressed, setPressed] = React.useState(false)

    const addFriend = (idFriend) =>{
        console.log(idFriend)
        SecureStore.getItemAsync("user_id").then( (idUser) =>{
            if(idUser){
                let dataToSend = {
                    id_user: idUser,
                    id_friend: idFriend,
                };
                let formBody = [];
                for (let key in dataToSend) {
                    let encodedKey = encodeURIComponent(key);
                    let encodedValue = encodeURIComponent(dataToSend[key]);
                    formBody.push(encodedKey + '=' + encodedValue);
                }
                formBody = formBody.join('&');
                axiosInstance.post('user/addFriend',formBody).then( (response) =>{
                    console.log(response.data.MESSAGE)
                    if(response && response.data.MESSAGE == "THE USER HAS BEEN SUCCESSFULLY REQUESTED TO BE YOUR FRIEND"){
                        ws.send(JSON.stringify({
                            userID: idUser,
                            action: "friendRequest",
                            idFriend: idFriend,
                        }))
                    }
                })
                .catch((error)=>{
                    console.log(error)
                    return
                })
                .finally(() =>{
                    setPressed(!buttonPressed)
                    Toast.show("Friend Request Sent", Toast.LONG, Toast.BOTTOM)
                });
            }
            else{
                //clear tokens and so on
                props.navigation.navigate('Auth');
                return
            }
        })
    }

    return(
        <View style={styles.containerDisplayUser}>
            <Image source={{uri:'https://picsum.photos/35'}} resizeMode="contain" style={styles.logo}/>
            <View>
                <Text style={styles.textDisplayUser}>{username}</Text>
                <Text style={styles.textDisplayIdUser}>{id_user}</Text>
            </View>
            {buttonPressed ? 
                <View style={{flex:1, marginRight:5, flexDirection:"row-reverse"}}> 
                    <Text style={[styles.textDisplayUser,{paddingRight:10}]}>Friend Added</Text>
                </View>
            :
                <TouchableOpacity
                    style={[styles.buttonAddUser]}
                    title="AddFriend"
                    onPress={()=>addFriend(id_user)}
                >
                    <FontAwesome5
                        name="user-plus"
                        size={14}
                        backgroundColor='transparent'
                        underlayColor='transparent'
                        color={colors.blue}
                        style={styles.iconUser}
                    />
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    buttonAddUser:{
        flex:1,
        marginRight:15,
        flexDirection: 'row', 
        justifyContent: 'flex-end',
        borderColor: colors.blue
    },
    containerDisplayUser:{
        borderWidth:1,
        borderRadius:5,
        borderColor:colors.main,
        marginTop:7,
        marginHorizontal:5,
        backgroundColor:colors.main,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconUser:{
        textAlign: 'center',
        textAlignVertical: 'center',
        borderColor:colors.blue,
        borderWidth:1,
        borderRadius:15,
        width:30,
        height:30,
        padding:5,
    },
    logo:{
        width: 35,
        height: 35,
        borderRadius: 17.5,
        borderWidth: 1,
        margin:5
    },
    textDisplayUser:{
        color: colors.whiteOpacity60,
        fontSize: 14
    },
    textDisplayIdUser:{
        color: colors.whiteOpacity40,
        fontSize: 12
    },
})

export default CardAddFriend;