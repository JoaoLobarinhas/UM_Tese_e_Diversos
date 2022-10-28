import React from 'react';
import { Image, SafeAreaView, StyleSheet, Dimensions, ActivityIndicator, View, Text } from 'react-native';
import { FlatList, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import {FontAwesome5} from '@expo/vector-icons';

import axiosInstance from '../config/axios';

import stylesGlobal from '../config/css'
import colors from '../config/colors'

function MovieDetails(props) {
    const [movieObject, setMovieObject] = React.useState()
    const [errorMsg, setErrorMsg] = React.useState('')
    const [loading, setLoading] = React.useState(true)
    const [inWatchLatter, setInWatchLatter] = React.useState(false)
    const [inHistory, setInHistory] = React.useState(false)

    React.useEffect(()=>{
        const load = props.navigation.addListener('focus', () => {
            loadData()
        });
        return load
    },[props])

    const loadData = () =>{
        setLoading(true)
        if(props.route.params?.idMovie){
            axiosInstance.get('/movie/'+props.route.params?.idMovie).then((response)=>{
                if(response.data.MESSAGE){
                    setErrorMsg("Movie not avaible")
                }
                else{
                    setMovieObject(response.data)
                    axiosInstance.get('/history/'+props.route.params?.idUser).then((response)=>{
                        if(!response.data.MESSAGE){
                            response.data.forEach(element => {
                                if(element.id_movie == props.route.params?.idMovie){
                                    setInHistory(true)
                                }
                            });
                        }
                        else{
                            setInHistory(false)
                        }
                        axiosInstance.get('/seeLater/'+props.route.params?.idUser).then((response)=>{
                            if(!response.data.MESSAGE){
                                response.data.forEach(element => {
                                    if(element.id_movie == props.route.params?.idMovie){
                                        setInWatchLatter(true)
                                    }
                                });
                            }
                            else{
                                setInWatchLatter(false)
                            }
                            setLoading(false)
                        })
                    })
                }
            })
        }
    }

    const historyStuff = () =>{
        if(inHistory){
            axiosInstance.put('/history/'+props.route.params?.idUser+'&idMovie='+props.route.params?.idMovie+'&delete').then((response)=>{
                console.log(response.data)
                setInHistory(!inHistory)
            })
        }
        else{
            axiosInstance.put('/history/'+props.route.params?.idUser+'&idMovie='+props.route.params?.idMovie).then((response)=>{
                console.log(response.data)
                setInHistory(!inHistory)
            })
        }
    }

    const watchLaterStuff = () =>{
        if(inWatchLatter){
            axiosInstance.put('/seeLater/'+props.route.params?.idUser+'&idMovie='+props.route.params?.idMovie+'&delete').then((response)=>{
                console.log(response.data)
                setInWatchLatter(!inWatchLatter)
            })
        }
        else{
            axiosInstance.put('/seeLater/'+props.route.params?.idUser+'&idMovie='+props.route.params?.idMovie).then((response)=>{
                console.log(response.data)
                setInWatchLatter(!inWatchLatter)
            })
        }
    }

    return (
        <SafeAreaView style={[stylesGlobal.container,{alignItems:"center", alignContent:"center"}]}>
            {loading ? <ActivityIndicator></ActivityIndicator> :
                <View style={{flex:1}}>
                    <ScrollView>
                        <View>
                            <ScrollView 
                                horizontal={true} 
                                style={[styles.gallery, {marginBottom: 10 }]} 
                                pagingEnabled={true} 
                                persistentScrollbar={true}
                            >
                                <Image source={{uri:movieObject.profile_photo}} resizeMode="stretch" style={{height: 420, width: Dimensions.get('window').width}}/>
                                <WebView
                                    scrollEnabled={false}
                                    scalesPageToFit={true}
                                    mediaPlaybackRequiresUserAction={true}
                                    style={ styles.trailer}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    allowsFullscreenVideo={true}
                                    source={{uri: 'https://www.youtube.com/embed/' + movieObject.trailer.slice(movieObject.trailer.lastIndexOf('=') + 1) + '?rel=0' }}
                                />
                            </ScrollView>
                            <View style={styles.details}>
                                <View style={{ flexDirection: 'row' }}>
                                    <FlatList
                                        horizontal={true}
                                        contentContainerStyle={{
                                            alignContent: 'center',
                                        }}
                                        data={movieObject.genres}
                                        renderItem={({item}) => (
                                            <View style={ styles.genreSection}>
                                                <Text key={item.id_genre} style={[styles.text, {fontSize: 10, color: colors.white} ]}>{ item.name }</Text>
                                            </View>
                                        )}
                                        keyExtractor={item => item.id_genre.toString()}
                                    />
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <Text style={[stylesGlobal.text, {fontSize: 30, maxWidth: Dimensions.get('screen').width * 0.7}]}>{movieObject.title}</Text>
                                    <View style={styles.rating}>
                                        <Image style={{width: 40, height: 20, resizeMode: 'center'}} source={{uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/1200px-IMDB_Logo_2016.svg.png"}} />
                                        <Text style={[stylesGlobal.text, {textAlign: 'left', marginRight:5}]}>{movieObject.vote_average}</Text>
                                    </View>
                                </View>
                                <Text style={[stylesGlobal.text, {fontSize: 12}]}>{movieObject.release_year}</Text>
                                <Text style={{color: colors.white, fontSize: 13}}>
                                    Directed By {movieObject.director}
                                </Text>
                                <Text style={[stylesGlobal.text, { marginTop: 20 }]}>{movieObject.description}</Text>
                                <Text style={[stylesGlobal.text, {fontSize: 20, marginTop: 20}]}>Cast:</Text>
                            </View>
                            <ScrollView horizontal={true} style={{ textAlign: 'center', marginBottom: 70 }}>
                                {movieObject.actor1 ?
                                    <View style={{ padding: 20 }}>
                                        <Text style={[styles.text, {fontSize: 14, color: colors.white} ]}>{ movieObject.actor1 }</Text>
                                    </View> 
                                : 
                                    null
                                }
                                {movieObject.actor2 ?
                                    <View style={{ padding: 20 }}>
                                        <Text style={[styles.text, {fontSize: 14, color: colors.white} ]}>{ movieObject.actor2 }</Text>
                                    </View> 
                                : 
                                    null
                                }
                                {movieObject.actor3 ?
                                    <View style={{ padding: 20 }}>
                                        <Text style={[styles.text, {fontSize: 14, color: colors.white} ]}>{ movieObject.actor3 }</Text>
                                    </View> 
                                : 
                                    null
                                }
                            </ScrollView >
                        </View>
                    </ScrollView>
                    <View style={{ position:"absolute", bottom:0, alignSelf:"center"}}>
                        <View style={styles.bottomOptions}>
                            {inWatchLatter ? 
                                <TouchableOpacity
                                    style={[{
                                        justifyContent:"center",
                                        marginRight:15,
                                        alignItems:"center",
                                    }]}
                                    onPress={()=>watchLaterStuff()}
                                    title="historyStuff"
                                >
                                    <FontAwesome5
                                        name="clock"
                                        size={30}
                                        backgroundColor={colors.whiteOpacity10}
                                        underlayColor={colors.whiteOpacity10}
                                        activeOpacity={.3}
                                        color={colors.yellow}
                                        style={[styles.icon,{
                                            borderColor:colors.yellow, 
                                            borderWidth:2, 
                                            borderRadius:45, 
                                            width:45, 
                                            height:45, 
                                            backgroundColor:colors.whiteOpacity10
                                        }]}
                                    />
                                    <Text style={{color: colors.yellow, fontSize: 12}}>Remove Watch Later</Text>
                                    
                                </TouchableOpacity>
                            :
                                <TouchableOpacity
                                    style={[{
                                        justifyContent:"center",
                                        marginRight:15,
                                        alignItems:"center",
                                    }]}
                                    onPress={()=>watchLaterStuff()}
                                    title="SaveChangesUser"
                                >
                                    <FontAwesome5
                                        name="clock"
                                        size={30}
                                        backgroundColor={colors.whiteOpacity10}
                                        underlayColor={colors.whiteOpacity10}
                                        activeOpacity={.3}
                                        color={colors.purple}
                                        style={[styles.icon,{
                                            borderColor:colors.purple, 
                                            borderWidth:2, 
                                            borderRadius:45, 
                                            width:45, 
                                            height:45, 
                                            backgroundColor:colors.whiteOpacity10
                                        }]}
                                    />
                                    <Text style={{color: colors.purple, fontSize: 12}}>Add to Watch Later</Text>
                                </TouchableOpacity>
                            }
                            {inHistory ? 
                                <TouchableOpacity
                                    style={[{
                                        justifyContent:"center",
                                        alignItems:"center",
                                        marginRight:15,
                                    }]}
                                    onPress={()=>historyStuff()}
                                    title="SaveChangesUser"
                                >
                                    <FontAwesome5
                                        name="history"
                                        size={30}
                                        backgroundColor={colors.whiteOpacity10}
                                        underlayColor={colors.whiteOpacity10}
                                        activeOpacity={.3}
                                        color={colors.red}
                                        style={[styles.icon,{
                                            borderColor:colors.red, 
                                            borderWidth:2, 
                                            borderRadius:45, 
                                            width:45, 
                                            height:45,
                                            backgroundColor:colors.whiteOpacity10
                                        }]}
                                    />
                                    <Text style={{color: colors.red, fontSize: 12}}>Remove History</Text>
                                </TouchableOpacity>
                            : 
                                <TouchableOpacity
                                    style={[{
                                        justifyContent:"center",
                                        alignItems:"center",
                                        marginRight:15,
                                    }]}
                                    onPress={()=>historyStuff()}
                                    title="SaveChangesUser"
                                >
                                    <FontAwesome5
                                        name="history"
                                        size={30}
                                        backgroundColor={colors.whiteOpacity10}
                                        underlayColor={colors.whiteOpacity10}
                                        activeOpacity={.3}
                                        color={colors.blue}
                                        style={[styles.icon,{
                                            borderColor:colors.blue, 
                                            borderWidth:2, 
                                            borderRadius:45, 
                                            width:45, 
                                            height:45,
                                            backgroundColor:colors.whiteOpacity10
                                        }]}
                                    />
                                    <Text style={{color: colors.blue, fontSize: 12}}>Add to History</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View>
            }
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    cardDetailsExpanded: {
        flex:1,
        borderRadius: 8,
        shadowRadius: 25,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: {width: 0, height: 0},
        alignItems: 'flex-start',
    },
    cardImage: {
        height: '60%',
        width: '100%',
        resizeMode: 'cover',
    },
    rating: {
        alignSelf: 'flex-start',
        textAlign: 'right',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 70,
        marginTop: 10
    },
    details: {
        margin: 7.5
    },
    genreSection: {
        backgroundColor: colors.red,
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginRight: 10
    },
    returnButton: {
        backgroundColor: colors.black,
        textAlign: 'center',
        color: colors.white,
        padding: 10,
        fontSize: 16
    },
    trailer: {
        height: 420,
        alignSelf:"center",
        alignContent:"center",
        width: Dimensions.get('window').width,
    },
    gallery: {
        paddingBottom:5
    },
    cover: {
        resizeMode: 'center',
        shadowRadius: 40,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowOffset: {width: 0, height: 10},
        marginHorizontal: 20
    },
    bottomOptions:{
        display: "flex",
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom:10
    },
    icon:{
        textAlign: 'center',
        textAlignVertical: 'center',
    },
})

export default MovieDetails;