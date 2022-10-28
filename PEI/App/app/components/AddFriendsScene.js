import React from 'react';
import { 
    View, 
    Text,
    StyleSheet, 
    KeyboardAvoidingView, 
    Keyboard,
    TextInput, 
    TouchableOpacity,
} from "react-native";
import { FlatList } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import {FontAwesome5} from '@expo/vector-icons';

import colors from '../config/colors'
import axiosInstance from "../config/axios";
import CardAddFriend from "../components/cards/CardAddFriend"

function AddFriendsScene(props) {
    const [searchId, setSearchId] = React.useState('')
    const [listUpdated, setListUpdated] = React.useState(false)
    const [dataForList, setDataForList] = React.useState([])
    const [idUser, setUserID] = React.useState('')
    const [infoUser, setInfoUser] = React.useState('')

    React.useEffect(()=>{
        SecureStore.getItemAsync("user_id").then( (idUser) =>{
            setUserID(idUser)
        })
        setInfoUser("Use the search bar to find some friend")
    },[])

    const renderFreinds = () =>{
        if(searchId != ''){
            let dataToSend = {
                id_user:idUser,
                user_search: searchId,
            };
            let formBody = [];
            for (let key in dataToSend) {
                let encodedKey = encodeURIComponent(key);
                let encodedValue = encodeURIComponent(dataToSend[key]);
                formBody.push(encodedKey + '=' + encodedValue);
            }
            formBody = formBody.join('&');
            axiosInstance.post('users/getUsername', formBody).then(request =>{
                if(request.data.MESSAGE){
                    setDataForList([])
                    setInfoUser("No User as that Username")
                }
                else{
                    let auxData = []
                    var x = 0
                    for( x in request.data){
                        if(request.data[x].id_user != idUser){
                            auxData.push(request.data[x])
                        }
                    }
                    setDataForList(auxData)
                }
            })
            .catch(error=>console.log(error))
            .finally(()=>setListUpdated(!listUpdated))
        }
    }

    return (
        <KeyboardAvoidingView enabled style={[styles.containerAddFriendsScene, {alignItems: 'center'}]}>
            <View style={styles.containerAddFriendsData}>
                <View style={styles.searchBar}>
                    <TextInput
                        underlineColorAndroid={colors.whiteOpacity00}
                        style={styles.textInput} 
                        placeholder = 'Username'
                        value={searchId}
                        onEndEditing={()=>{
                            renderFreinds()
                        }}
                        onChangeText={(id) => setSearchId(id)}
                        textAlign="center"
                        placeholderTextColor={colors.whiteOpacity60}
                        onSubmitEditing={Keyboard.dismiss}
                    >
                    </TextInput>
                    <TouchableOpacity
                        style={[styles.buttonSearch]}
                        title="Search"
                        onPress={()=>renderFreinds()}
                    >
                        <FontAwesome5
                            name="search"
                            size={14}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            color={colors.whiteOpacity60}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.containerScrollView}>
                    <FlatList
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{
                            alignContent: 'center',
                        }}
                        initialNumToRender={15}
                        refreshing={listUpdated}
                        onRefresh={()=>renderFreinds()}
                        data={dataForList}
                        ListEmptyComponent={
                            <Text style={styles.textForList} value={infoUser}>{infoUser}</Text>
                        }
                        renderItem={({item}) => (
                            <CardAddFriend id_user={item.id_user} username={item.username}/>
                        )}
                        keyExtractor={item => item.id_user.toString()}
                    />
                </View>
            </View>   
        </KeyboardAvoidingView>
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

export default AddFriendsScene;