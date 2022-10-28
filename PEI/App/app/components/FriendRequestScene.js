import React from 'react';
import { 
    View, 
    Text,
    StyleSheet, 
} from "react-native";
import { FlatList } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';

import colors from '../config/colors'
import axiosInstance from "../config/axios";
import CardConfirmFriend from "../components/cards/CardConfirmFriend"

function FriendRequestScene(props) {
    const [dataForList, setDataForList] = React.useState([])
    const [infoUser, setInfoUser] = React.useState('')
    const [_idUser, setIdUser] = React.useState('')

    React.useEffect(()=>{
        loadData()
        setInfoUser("You don't have friend requests")
    },[]);
    
    const loadData = () =>{
        SecureStore.getItemAsync("user_id").then( (idUser) =>{
            setIdUser(idUser)
            axiosInstance.get('user/'+idUser+'/friendsRequest').then( (request) =>{
                console.log(request.data)
                setDataForList(request.data)
            })
        })
    }

    return(
        <View style={[styles.containerAddFriendsScene, {alignItems: 'center'}]} >
            <View style={[styles.containerAddFriendsData, styles.containerScrollView, {width:"90%"}]}>
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        alignContent: 'center',
                    }}
                    data={dataForList}
                    ListEmptyComponent={
                        <Text style={styles.textForList} value={infoUser}>{infoUser}</Text>
                    }
                    renderItem={({item}) => (
                        <CardConfirmFriend idFriend={item.id_user} username={item.username} idUser={_idUser} />
                    )}
                    keyExtractor={item => item.id_user.toString()}
                />
            </View>            
        </View>
    )
}

const styles = StyleSheet.create({
    buttonSearch:{
        paddingHorizontal:10,
        alignItems: 'center',
    },
    containerAddFriendsScene:{
        flex:1,
        backgroundColor:colors.main,
    },
    containerAddFriendsData:{
        marginTop:15,
    },
    containerScrollView:{
        flex:1,
        marginVertical:15,
        borderWidth:1,
        borderColor:colors.whiteOpacity40,
        backgroundColor:colors.whiteOpacity10
    },
    icon:{
        paddingRight:4,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    textForList:{
        marginTop:15,
        color:colors.whiteOpacity60,
        fontSize : 14,
        alignSelf:"center"
    },
    searchBar:{
        backgroundColor:colors.whiteOpacity10,
        alignSelf:"center",
        paddingTop:5,
        width:"90%",
        paddingRight:5,
        paddingBottom:5,
        flexDirection: 'row',
        alignItems: 'center',
        color: colors.whiteOpacity60,
        borderColor: colors.whiteOpacity60,
        borderWidth: 1,
        borderRadius:30,
    },
    textInput:{
        color: colors.whiteOpacity60,
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: (10),
        fontSize: 14
    },
    textForList:{
        marginTop:15,
        color:colors.whiteOpacity60,
        fontSize : 14,
        alignSelf:"center"
    },
})

export default FriendRequestScene;