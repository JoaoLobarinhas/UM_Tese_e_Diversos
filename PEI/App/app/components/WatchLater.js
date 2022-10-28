import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';

import colors from '../config/colors'
import stylesGlobal from '../config/css'
import TopBar from './TopBar'
import axiosInstance from "../config/axios";
import CardMovieHistory from "../components/cards/CardMovieHistory";

function WatchLater(props) {
    const [dataForList, setDataForList] = React.useState([])
    const [msgError, setMsgError] = React.useState('')
    const [loading, setLoading] = React.useState(true)
    const [idUser, setIdUser] = React.useState('')

    React.useEffect(()=>{
        const load = props.navigation.addListener('focus', () => {
            loadData()
        });
        return load
    },[props])

    const loadData = () =>{
        setLoading(true)
        SecureStore.getItemAsync("user_id").then((idUser)=>{
            if(idUser){
                setIdUser(idUser)
                setDataForList([])
                axiosInstance.get("/seeLater/"+idUser).then((response)=>{
                    if(response.data.MESSAGE){
                        setMsgError("You don't have any movies on your see later list")
                    }
                    else{
                        setDataForList(response.data)
                    }
                    setLoading(false)
                })
            }
        })
    }


    return (
       <SafeAreaView style={stylesGlobal.app}>
           <TopBar/>
           <View style={styles.container}>
                <Text style={[styles.title,{color:colors.purple}]}>Watch Later</Text>
                <View style={styles.line}></View>
                <View style={[styles.containerList , {width:"92%", alignSelf:"center"}]}>
                    {loading ?
                        <ActivityIndicator
                            style={{alignItems: 'center', justifyContent: 'center', paddingTop:"15"}}
                            animating={loading}
                            color={colors.red}
                            size="large"
                            style={styles.activityIndicator}
                        />
                    :
                        <FlatList
                            contentContainerStyle={{
                                alignContent: 'center',
                            }}
                            data={dataForList}
                            initialNumToRender={15}
                            ListEmptyComponent={
                                <Text style={styles.text}>{msgError}</Text>
                            }
                            renderItem={({item}) => (
                                <CardMovieHistory idMovie={item.id_movie} title={item.title} image={item.profile_photo} navigation={props.navigation} idUser={idUser} watchLater={true} year={item.release_year}/>
                            )}
                            keyExtractor={item => item.id_movie.toString()}
                        />
                    }
               </View>
           </View>
       </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    activityIndicatorWrapper: {
        height: 100,
        width: 100,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    container:{
        alignItems: "center",
        flex:1
    },
    containerList:{
        marginTop:15,
        flex:1,
        marginVertical:15,
        borderRadius:3,
        backgroundColor:colors.secondaryGrey
    },
    line:{
        marginTop: 5,
        backgroundColor: colors.grey,
        height: 2,
        alignSelf: 'center',
        width:"80%"
    },
    title:{
        alignSelf:'center',
        paddingHorizontal:10,
        marginTop: 10,
        fontSize: 26,
        color: colors.red,
    },
    text:{
        alignSelf:"center",
        fontSize: 14,
        color: colors.whiteOpacity60,
        marginTop: 50,
    },
})

export default WatchLater;