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

function CardMovie({idMovie,title,image,navigation,idUser,year}){

    return(
        <View style={styles.containerDisplayUser}>
            <TouchableOpacity
                style={styles.buttonDetails}
                title={"touch"}
                onPress={() => navigation.navigate('MovieDetails',{idMovie:idMovie, idUser:idUser})}
            >
                <Image source={{uri:image}} resizeMode="contain" style={styles.logo}/>
                <View>
                    <Text style={styles.textTitle}>{title}</Text>
                    <Text style={styles.textIdMovie}>{year}</Text>
                </View>
            </TouchableOpacity>
            <View style={{flex:1}}></View>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonAddUser:{
        flex:1,
        marginRight:15,
        flexDirection: 'row', 
        justifyContent: 'flex-end',
        borderColor: colors.red
    },
    buttonDetails:{
        flex:2,
        flexDirection: 'row', 
        justifyContent: "flex-start",
        alignSelf:"flex-start"
    },
    containerDisplayUser:{
        flex:1,
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
        width: 60,
        height: 90,
        borderRadius: 5,
        marginRight:15,
    },
    textTitle:{
        color: colors.whiteOpacity60,
        fontSize: 17,
        flexWrap: 'wrap'
    },
    textIdMovie:{
        color: colors.whiteOpacity40,
        fontSize: 14
    },
})

export default CardMovie;