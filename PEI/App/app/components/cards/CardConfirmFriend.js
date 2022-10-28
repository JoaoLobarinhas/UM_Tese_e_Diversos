import React from 'react';
import { 
    View, 
    StyleSheet, 
    Image, 
    Text, 
    TouchableOpacity,
} from "react-native";
import {FontAwesome5} from '@expo/vector-icons';
import Toast from 'react-native-simple-toast';

import colors from '../../config/colors'
import axiosInstance from "../../config/axios";
import WebSocketFriends from '../../config/WebSocketFriends'

const ws = WebSocketFriends.instance.ws

function CardConfirmFriend ({idFriend,username,idUser}){
    const [buttonPressed, setPressed] = React.useState(false)
    const [msgText, setMsgText] = React.useState('')

    const acceptFriend = () =>{
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
        axiosInstance.put('user/acceptFriend',formBody).then( (response) =>{
                console.log(response.data)
                axiosInstance.get("/user/"+idUser+"/friends").then((request)=>{
                    console.log(request.data)
                    if(request.data){
                        console.log(request.data.length)
                        setNumberFriends(request.data.length)
                        ws.send(JSON.stringify({
                            userID: idUser,
                            action: "online",
                            friends: request.data
                        }))
                    }
                    else{
                        ws.send(JSON.stringify({
                            userID: idUser,
                            action: "online",
                            friends: []
                        }))
                    }
                })
            }
        )
        .catch((error)=>{
            console.log(error)
            return
        })
        .finally(() =>{
            setMsgText("Friend Added")
            setPressed(!buttonPressed)
            Toast.show("Friend Request Was Accepted", Toast.LONG, Toast.BOTTOM)
        });
    }

    const deleteFriend = () =>{
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
        axiosInstance.post('user/removeFriend',formBody).then( (response) =>{
                console.log(response.data)
            }
        )
        .catch((error)=>{
            console.log(error)
            return
        })
        .finally(() =>{
            setMsgText("Friend Deleted")
            setPressed(!buttonPressed)
            Toast.show("Friend Request Was Deleted", Toast.LONG, Toast.BOTTOM)
        });
    }

    return(
        <View style={styles.containerDisplayUser}>
            <Image source={{uri:'https://picsum.photos/35'}} resizeMode="contain" style={styles.logo}/>
            <View>
                <Text style={styles.textDisplayUser}>{username}</Text>
                <Text style={styles.textDisplayIdUser}>{idFriend}</Text>
            </View>
            {buttonPressed ?
                <View style={{flex:1, marginRight:5, flexDirection:"row-reverse"}}> 
                    <Text style={[styles.textDisplayUser,{paddingRight:10}]}>{msgText}</Text>
                </View>
            :
                <View style={{flex:1, marginRight:5, flexDirection:"row-reverse"}}>
                    <TouchableOpacity
                        style={[styles.buttonConfirmUser]}
                        title="AddFriend"
                        onPress={()=>acceptFriend()}
                    >
                        <FontAwesome5
                            name="check"
                            size={14}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            color={colors.green}
                            style={[styles.iconUser,{borderColor:colors.green}]}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.buttonDeleteUser,{borderColor:colors.red}]}
                        title="AddFriend"
                        onPress={()=>deleteFriend()}
                    >
                        <FontAwesome5
                            name="times"
                            size={14}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            color={colors.red}
                            style={[styles.iconUser,{borderColor:colors.red}]}
                        />
                    </TouchableOpacity>
                </View>
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
    buttonConfirmUser:{
        marginRight:5,
        flexDirection: 'row', 
        justifyContent: 'flex-end',
        borderColor: colors.green
    },
    buttonDeleteUser:{
        marginRight:5,
        flexDirection: 'row', 
        justifyContent: 'flex-end',
        borderColor: colors.red
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

export default CardConfirmFriend;