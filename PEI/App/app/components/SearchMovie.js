import React from 'react';
import { KeyboardAvoidingView, TextInput, StyleSheet, Text, View, Keyboard, TouchableOpacity, Dimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import {FontAwesome5} from '@expo/vector-icons';

import colors from '../config/colors'
import stylesGlobal from '../config/css'
import axiosInstance from "../config/axios";
import CardMovie from "../components/cards/CardMovie";

function SearchMovie(props) {
    const [dataForList, setDataForList] = React.useState([])
    const [msgError, setMsgError] = React.useState('')
    const [loading, setLoading] = React.useState(true)
    const [listUpdated, setListUpdated] = React.useState(false)
    const [movie, setMovie] = React.useState('')
    const [idUser, setIdUser] = React.useState('')

    React.useEffect(()=>{
        const load = props.navigation.addListener('focus', () => {
            loadData()
            setMsgError("Search For a Movie")
        });
        return load
    },[props])

    const loadData = () =>{
        setLoading(true)
        SecureStore.getItemAsync("user_id").then((idUser)=>{
            if(idUser){
                setIdUser(idUser)
            }
        })
    }

    const searchMovie = () =>{
        if(movie.length > 0){
            let dataToSend = {
                title_search:movie
            };
            let formBody = [];
            for (let key in dataToSend) {
                let encodedKey = encodeURIComponent(key);
                let encodedValue = encodeURIComponent(dataToSend[key]);
                formBody.push(encodedKey + '=' + encodedValue);
            }
            formBody = formBody.join('&');
            axiosInstance.post("/movies/getMoviesNames",formBody).then((response)=>{
                if(response.data.MESSAGE){
                    setMsgError("No Movie With That Title")
                }
                else{
                    setDataForList(response.data)
                    }
                })
                .catch(error=>console.log(error))
                .finally(()=>setListUpdated(!listUpdated))
            }
            else{
                setDataForList([])
                setMsgError("Search For a Movie")
            }
        }

    return (
       <KeyboardAvoidingView enabled  style={stylesGlobal.app}>
           <View style={styles.container}>
                <View style={styles.searchBar}>
                    <TextInput
                        underlineColorAndroid={colors.whiteOpacity00}
                        style={styles.textInput}
                        placeholder = 'Movie Title'
                        value={movie}
                        onEndEditing={()=>{
                            searchMovie()
                        }}
                        onChangeText={(text) => setMovie(text)}
                        textAlign="center"
                        placeholderTextColor={colors.whiteOpacity60}
                        onSubmitEditing={Keyboard.dismiss}
                    >
                    </TextInput>
                    <TouchableOpacity
                        style={[styles.buttonSearch]}
                        title="Search"
                        onPress={()=>searchMovie()}
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
                <View style={[styles.containerList , {width:"92%", alignSelf:"center"}]}>
                    <FlatList
                        contentContainerStyle={{
                            alignContent: 'center',
                            marginBottom:15,
                        }}
                        style={{ backgroundColor: colors.secondaryGrey, borderRadius: 15 }}
                        initialNumToRender={15}
                        refreshing={listUpdated}
                        onRefresh={()=>searchMovie()}
                        data={dataForList}
                        ListEmptyComponent={
                            <Text style={styles.text}>{msgError}</Text>
                        }
                        renderItem={({item}) => (
                            <CardMovie idMovie={item.id_movie} title={item.title} image={item.profile_photo} navigation={props.navigation} idUser={idUser}  year={item.release_year}/>
                        )}
                        keyExtractor={item => item.id_movie.toString()}
                    />
               </View>
           </View>
       </KeyboardAvoidingView>
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
    },
    containerList:{
        marginTop:15,
        marginVertical:15,
        borderRadius:3,
        backgroundColor:colors.secondaryGrey,
        borderRadius: 15,
        marginBottom: 15,
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
        flexWrap:"wrap"
    },
    text:{
        alignSelf:"center",
        fontSize: 14,
        color: colors.whiteOpacity60,
        marginTop: 50,
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
    buttonSearch:{
        paddingHorizontal:10,
        alignItems: 'center',
    },
})

export default SearchMovie;