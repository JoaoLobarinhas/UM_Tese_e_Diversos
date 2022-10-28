import React from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    Image,
    Dimensions,
    Text,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
// import { ScrollView } from 'react-native-gesture-handler';
import { FlatList } from 'react-native-gesture-handler';
import {FontAwesome5} from '@expo/vector-icons';
import { TabBar, TabView} from 'react-native-tab-view';
import Modal from 'react-native-modal';
import * as SecureStore from 'expo-secure-store';
import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";
import Toast from 'react-native-simple-toast';

import colors from '../config/colors'
import stylesGlobal from '../config/css'
import TopBar from './TopBar'
import axiosInstance from "../config/axios";
import WebSocketFriends from '../config/WebSocketFriends'
import CardFriendList from "../components/cards/CardFriendList"
import AddFriendsScene from "../components/AddFriendsScene";
import FriendRequestScene from "../components/FriendRequestScene";

const realWidth = (Dimensions.get('window').width)*0.5
const fontSize =  (Dimensions.get('window').width)

const ws = WebSocketFriends.instance.ws

const ListFriends = () =>{
    const [dataForList, setDataForList] = React.useState([])
    const [infoUser, setInfoUser] = React.useState('')
    const [_idUser, setIdUser] = React.useState('')

    React.useEffect(()=>{
        loadData()
        setInfoUser("You don't have friends")
    },[]);

    const loadData = () =>{
        SecureStore.getItemAsync("user_id").then( (idUser) =>{
            setIdUser(idUser)
            axiosInstance.get('user/'+idUser+'/friends').then( (request) =>{
                setDataForList(request.data)
            })
        })
    }

    return (
        <View style={{backgroundColor:colors.main, width:"100%", flex:1, alignSelf:"center", alignContent:"center"}}>
            <View style={[styles.lineContainer, {alignSelf:"center"}]}>
                <View style={styles.lineForText}/>
                <Text style={styles.lineTextUser }>Friend List</Text>
                <View style={styles.lineForText}/>
            </View>
            <View style={[styles.containerAddFriendsData, styles.containerScrollView, {width:"90%", alignSelf:"center"}]}>
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
                        <CardFriendList idFriend={item.id_user} username={item.username} idUser={_idUser}/>
                    )}
                    keyExtractor={item => item.id_user.toString()}
                />
            </View>
        </View>
    )
}

const initialLayout = { width: Dimensions.get('window').width, height: Dimensions.get('window').height  };

function LandingPage_(props) {
    const [_loading, setLoading] = React.useState(true);
    const [_username, setUsername] = React.useState('');
    const [numberFriends, setNumberFriends] = React.useState(0)
    const [numberOnline, setNumberOnline] = React.useState(0)
    const [newFriend, setNewFriend] = React.useState(false)
    const [friendsOnline, setFriendsOnline] = React.useState([]);
    const [idUser, setIdUser ] = React.useState('');

    //Modal Add Users
    const [_modalAddFriends, setModalAddFriends] = React.useState(false)
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'addFriends', title: 'Add Friends' },
        { key: 'friendsRequest', title: 'Friend Requests' },
    ]);

    //Modal Friend List
    const [_modalFriendList, setModalFriendList] = React.useState(false)

    React.useEffect(() => {
        if(props.route.params?.newFriend){
            setModalAddFriends(true)
        }
        const load = props.navigation.addListener('focus', () => {
            loadData()
            userOnline()
        });
        return load
    }, [props]);

    const loadData = () =>{
        SecureStore.getItemAsync("user_id").then( (idUser) =>{
            if(idUser){
                setIdUser(idUser)
                axiosInstance.get('user/'+idUser).then( (response) =>{
                    setUsername(response.data.username)
                    sendOnlineMsg()
                })
                .catch((error)=>{
                    console.log(error)
                    return
                })
                .finally(() => setLoading(false));
            }
            else{
                //clear tokens and so on
                props.navigation.navigate('Auth');
                return
            }
        })
    };

    const userOnline = () =>{
        ws.addEventListener("message", (e)=>{
            var data = JSON.parse(e.data);
            if(data.action && data.action === "online"){
                if(data.friendList == 0){
                    setNumberOnline(0)
                }
                else{
                    setNumberOnline(data.friendList.length)
                    setFriendsOnline(data.friendList)
                }

            }
            if(data.action && data.action === "friendRequest"){
                axiosInstance.get("/user/"+data.userID).then((response)=>{
                    Toast.show(response.data.username + " sent a friend request", Toast.LONG, Toast.BOTTOM)
                    // showMessage({
                    //     description: response.data.username + " sent a friend request",
                    //     message: "Friend Request",
                    //     type: "info",
                    //     backgroundColor: colors.mainCard,
                    //     color: colors.whiteOpacity60,
                    // });
                    setNewFriend(true)
                }).catch(error => {
                    console.log(error.response)
                })
            }
            if(data.action && data.action === "NewUserOnline"){
                console.log(data)
                axiosInstance.get("/user/"+idUser+"/friends").then((request)=>{
                    if(request.data){
                        setNumberOnline(data.friendList.length)
                        setFriendsOnline(data.friendList)
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
        })
    }

    const sendOnlineMsg = () =>{
        SecureStore.getItemAsync("user_id").then( (idUser) =>{
            axiosInstance.get("/user/"+idUser+"/friends").then((request)=>{
                if(request.data){
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
        })
    }

    const renderTabBar = (props) =>{
        return(
            <TabBar
                style={{backgroundColor:colors.main, borderColor: colors.mainCard}}
                labelStyle={{color: colors.whiteOpacity60}}
                {...props}
                indicatorStyle={{backgroundColor: colors.whiteOpacity60}}
            />
        )
    }

    const renderScene = ({ route }) => {
        switch (route.key) {
          case 'addFriends':
            return <AddFriendsScene/>;
          case 'friendsRequest':
            return <FriendRequestScene/>;
          default:
            return null;
        }
     };

    const renderAddFriendModal = () =>{
        return (
            <Modal
                animationType="slide"
                coverScreen={false}
                isVisible={_modalAddFriends}
                hasBackdrop={true}
                avoidKeyboard={true}
                backdropColor={colors.whiteOpacity40}
                onBackdropPress={() => setModalAddFriends(!_modalAddFriends)}
                onBackButtonPress={() => setModalAddFriends(!_modalAddFriends)}
                onModalHide={() => sendOnlineMsg()}
            >
                <TabView
                    renderTabBar={renderTabBar}
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={initialLayout}
                    style={{height:"100%"}}
                />
                <View style={styles.containerButtonClose}>
                    <TouchableOpacity
                        style={[stylesGlobal.button, styles.buttonCloseModal]}
                        title="Search"
                        onPress={()=>setModalAddFriends(!_modalAddFriends)}
                    >
                        <FontAwesome5
                            name="times"
                            size={14}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            color={colors.white}
                            style={styles.icon}
                        />
                        <Text style={styles.textLowerFriends}>Close</Text>
                    </TouchableOpacity>
                </View>

            </Modal>
        )
    }

    const renderFriendList = () =>{
        return (
            <Modal
                animationType="slide"
                coverScreen={false}
                isVisible={_modalFriendList}
                hasBackdrop={true}
                avoidKeyboard={true}
                backdropColor={colors.whiteOpacity40}
                onBackdropPress={() => setModalFriendList(!_modalFriendList)}
                onBackButtonPress={() => setModalFriendList(!_modalFriendList)}
                onModalHide={() => sendOnlineMsg()}
            >
                <ListFriends/>
                <View style={styles.containerButtonClose}>
                    <TouchableOpacity
                        style={[stylesGlobal.button, styles.buttonCloseModal]}
                        title="Close"
                        onPress={()=>setModalFriendList(!_modalFriendList)}
                    >
                        <FontAwesome5
                            name="times"
                            size={14}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            color={colors.whiteOpacity60}
                            style={styles.icon}
                        />
                        <Text style={styles.textLowerFriends}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        )
    }

    return (
        <SafeAreaView style={stylesGlobal.app}>
            <TopBar/>
            {_loading ? <ActivityIndicator/> : (
                <View style={styles.container}>
                    {_modalAddFriends ? renderAddFriendModal() : null}
                    {_modalFriendList ? renderFriendList() : null}
                    <View style={styles.containerData}>
                        <Text style={styles.textUsername}  value={_username}>{_username}</Text>
                        <Text style={styles.textIdUser}  value={idUser}>#{idUser}</Text>
                        <View style={styles.line}/>
                        <View style={styles.containerFriends}>
                            <View style={styles.containerFriendsData}>
                                <Text style={styles.textFriends}>Friends</Text>
                                <TouchableOpacity>
                                    <Text style={styles.textLowerFriends}>Online</Text>
                                    <Text style={styles.textLowerFriends}>{numberOnline}/{numberFriends}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.containerFriendsButtons}>
                                <TouchableOpacity
                                    style={[stylesGlobal.button, styles.buttonAddFriend]}
                                    title="AddFriend"
                                    onPress={()=>{
                                        if(newFriend) setNewFriend(!newFriend)
                                        setModalAddFriends(!_modalAddFriends)
                                    }}
                                >
                                    <FontAwesome5
                                        name="user-plus"
                                        size={14}
                                        backgroundColor='transparent'
                                        underlayColor='transparent'
                                        color={colors.white}
                                        style={styles.icon}
                                    />
                                    <Text style={[stylesGlobal.textButton, styles.textButtonAdd]}>Add friend</Text>
                                    { newFriend ?
                                        <FontAwesome5
                                            name="exclamation"
                                            size={12}
                                            backgroundColor='transparent'
                                            underlayColor='transparent'
                                            color={colors.blue}
                                            style={[styles.icon, {paddingLeft:5} ]}
                                        />
                                        :
                                        null
                                    }

                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[stylesGlobal.button, styles.buttonListFriend]}
                                    title="FriendList"
                                    onPress={()=>setModalFriendList(!_modalFriendList)}
                                >
                                    <FontAwesome5
                                        name="users"
                                        size={14}
                                        backgroundColor='transparent'
                                        underlayColor='transparent'
                                        color={colors.white}
                                        style={styles.icon}
                                    />
                                    <Text style={[stylesGlobal.textButton, styles.textButtonList]}>Friend List</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.line}/>
                        <TouchableOpacity
                            style={[styles.button, {borderColor:colors.whiteOpacity60, alignContent:"center", justifyContent:"center", marginTop:15, marginBottom:15}]}
                            title="SearchMovie"
                            onPress={()=>props.navigation.navigate("SearchMovie")}
                        >
                            <FontAwesome5
                                name="search"
                                size={14}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.whiteOpacity60}
                                style={styles.icon}
                            />
                            <Text style={[styles.textButton,{color:colors.whiteOpacity60}]}>Search Movies</Text>
                        </TouchableOpacity>
                    </View>
                    <Image style={styles.circle} source={{uri:'https://picsum.photos/200'}}/>
                    <FlashMessage position="top" />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scene: {
        flex: 1,
    },
    auxFixer:{
        height:200,
    },
    buttonAddFriend:{
        marginTop:15,
        backgroundColor: colors.blue
    },
    buttonListFriend:{
        marginTop:7,
        backgroundColor: colors.secondaryGrey
    },
    buttonCloseModal:{
        padding:10,
        backgroundColor:colors.secondaryGrey,
        margin:10
    },
    circle:{
        top: 5,
        alignSelf:'center',
        position: 'absolute',
        maxWidth:150,
        maxHeight:150,
        width: realWidth,
        height: realWidth,
        borderRadius: realWidth / 2,
        borderColor: colors.main,
        borderWidth: 5,
    },
    container:{
        flex:1,
        paddingTop: 90,
        alignItems: "center",
    },
    containerAddFriendsData:{
        marginTop:15,
    },
    containerButtonClose:{
        backgroundColor:colors.main,
        width:"100%",
        alignItems:"center",
        justifyContent:"center"
    },
    containerData:{
        width:"80%",
        backgroundColor:colors.mainCard,
        alignItems: "center",
        borderRadius: 15,
        padding: 20
    },
    containerFriends:{
        marginTop:5,
        paddingBottom:5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: colors.mainCard,
    },
    containerFriendsButtons:{
        borderLeftWidth:0.8,
        borderColor: colors.whiteOpacity60,
        alignContent: "center",
        justifyContent:"flex-end",
        flex:2,
    },
    containerFriendsData:{
        alignContent: "center",
        justifyContent:"flex-start",
        flex:1,
        paddingLeft:15,
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
    line:{
        backgroundColor: colors.whiteOpacity40,
        height: 1,
        width: "80%",
        alignSelf: 'center'
    },
    lineContainer:{
        paddingTop:15,
        flexDirection: 'row',
        width: '80%'
    },
    lineForText:{
        backgroundColor: colors.grey,
        height: 2,
        flex: 1,
        alignSelf: 'center'
    },
    lineTextUser:{
        alignSelf:'center',
        paddingHorizontal:10,
        fontSize: 22,
        color: colors.red,
    },
    textButtonAdd:{
        color: colors.white
    },
    textButtonList:{
        color: colors.white
    },
    textInput:{
        color: colors.whiteOpacity60,
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: (10),
        fontSize: 14
    },
    textFriends:{
        color:colors.whiteOpacity60,
        fontSize : 18,
        alignSelf:"center"
    },
    textForList:{
        marginTop:15,
        color:colors.whiteOpacity60,
        fontSize : 14,
        alignSelf:"center"
    },
    textIdUser:{
        color:colors.whiteOpacity60,
        fontSize: fontSize*0.04,
        paddingBottom:5
    },
    textLowerFriends:{
        color:colors.whiteOpacity60,
        fontSize : 14,
        alignSelf:"center"
    },
    textUsername:{
       paddingTop:45,
       color:colors.whiteOpacity60,
       fontSize: fontSize*0.07,
    }
})

export default LandingPage_;