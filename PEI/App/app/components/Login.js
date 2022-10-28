import React from 'react';
import { Dimensions, TouchableOpacity, Image, StyleSheet, Text, TextInput, View, Keyboard, KeyboardAvoidingView} from 'react-native';
import {FontAwesome5} from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import {CommonActions } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

import colors from '../config/colors'
import stylesGlobal from '../config/css'
import Loader from "../components/Loader";
import axiosInstance from "../config/axios";
import constants from '../config/constants';

const realWidth = (Dimensions.get('window').width)*0.5
const fontSize =  (Dimensions.get('window').width)

function Login({navigation}) {
    const [errorMessage, setErrorMessage] = React.useState('');
    const [visible, setVisibility] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const icon = !visible ? 'eye-slash' : 'eye';
    const passwordInputRef = React.createRef();

    const handleLogin = () =>{
        setErrorMessage("")
        if (!email) {
            setErrorMessage("Insert a email")
            return;
          }
        if (!password) {
            setErrorMessage("Insert a password")
            return;
        }
        setLoading(true);
        let dataToSend = {
            email: email,
            password: password,
        };
        let formBody = [];
        for (let key in dataToSend) {
            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(dataToSend[key]);
            formBody.push(encodedKey + '=' + encodedValue);
        }
        formBody = formBody.join('&');
        axiosInstance.post("user/login",formBody).then(result =>{
            setLoading(false);
            if(result.data.access && result.data.refresh && result.data.user_id){
                SecureStore.setItemAsync('access_token', result.data.access);
                SecureStore.setItemAsync('refresh_token', result.data.refresh);
                SecureStore.setItemAsync('user_id', result.data.user_id.toString());
                SecureStore.setItemAsync('email', email);
                SecureStore.setItemAsync('password', password);
                const now = new Date();
                const access_token_expiration = new Date(now.getTime()+ constants.minutes*60000).toJSON();
                const refresh_toke_expiration = new Date(now.getTime() + constants.days*86400000).toJSON();
                SecureStore.setItemAsync('access_token_expiration',access_token_expiration);
                SecureStore.setItemAsync('refresh_token_expiration',refresh_toke_expiration);

                axiosInstance.get('questionary/didSurvey&idUser=' + result.data.user_id)
                .then(result => {
                    // if user answered first survey
                    if(result.data.didSurvey == true){
                        navigation.dispatch(
                            CommonActions.reset({index:1, routes:[{name:"Functionality"}]})
                        )
                    } else {
                        navigation.navigate('FirstSurveyPage');
                    }
                })
            }
            else{
                setErrorMessage("Invalid Email or Password");
                return;
            }

        })
        .catch(error => {
            console.log(error); // Will output : NETWORK ERROR
            return;
        });
    }

    return (
        <View style={ styles.containerLogin }>
            <Loader loading={loading}/>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    flex: 1,
                    alignContent: 'center',
                }}
            >
                <View>
                    <KeyboardAvoidingView enabled style={{alignItems: 'center'}}>
                        <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain"/>
                        <View style={styles.textContainer}>
                            <FontAwesome5
                                name="at"
                                size={17}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.whiteOpacity60}
                                style={styles.icon}
                            />
                            <TextInput
                                underlineColorAndroid={colors.main}
                                style={styles.textInput}
                                placeholder="Email"
                                value={email}
                                onChangeText={(email) => setEmail(email)}
                                textAlign="left"
                                placeholderTextColor={colors.whiteOpacity60}
                                onSubmitEditing={() =>
                                    passwordInputRef.current &&
                                    passwordInputRef.current.focus()
                                }
                                returnKeyType="next"
                                blurOnSubmit={false}
                                >
                            </TextInput>
                        </View>
                        <View style={styles.textContainer}>
                            <FontAwesome5
                                name="lock"
                                size={17}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.whiteOpacity60}
                                style={styles.icon}
                            />
                            <TextInput
                                underlineColorAndroid={colors.main}
                                style={styles.textInput}
                                placeholder="Password"
                                ref={passwordInputRef}
                                value={password}
                                textAlign="left"
                                onChangeText={(password) => setPassword(password)}
                                secureTextEntry={!visible}
                                placeholderTextColor={colors.whiteOpacity60}
                                onSubmitEditing={Keyboard.dismiss}
                                returnKeyType="next"
                                blurOnSubmit={false}
                                >
                            </TextInput>
                            <FontAwesome5
                                name={icon}
                                size={17}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.whiteOpacity60}
                                style={styles.icon}
                                onPress={() => setVisibility(!visible)}
                            />
                        </View>
                        {errorMessage != '' ? <Text style={styles.textInvalid}>{errorMessage}</Text> : null}
                        <TouchableOpacity
                            style={[styles.buttonLogin, stylesGlobal.button]}
                            title="Login"
                            onPress={handleLogin}>
                                <Text style={[styles.textButton, stylesGlobal.textButton]}>Log in</Text>
                        </TouchableOpacity>
                        <View style={styles.lineContainer}>
                            <View style={styles.line}/>
                            <Text style={styles.lineText}>OR</Text>
                            <View style={styles.line}/>
                        </View>
                        <View style={styles.orContainer}>
                            <Text
                                style={styles.textCreateAccount}
                                onPress={()=> navigation.navigate('Register')}
                                >
                                Create An Account
                            </Text>
                            <Text style={styles.textOtherLogin}>Other Login Options</Text>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonLogin:{
        marginTop:15,
        backgroundColor:colors.blue,
        borderWidth:2,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: '70%',
        alignItems: 'center',
    },
    containerLogin:{
        paddingTop: 30,
        backgroundColor: colors.main,
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    icon:{
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    line:{
        backgroundColor: colors.grey,
        height: 2,
        flex: 1,
        alignSelf: 'center'
    },
    lineContainer:{
        paddingTop:15,
        flexDirection: 'row',
        width: '70%'
    },
    lineText:{
        alignSelf:'center',
        paddingHorizontal:10,
        fontSize: 24,
        color: colors.whiteOpacity60,
    },
    logo:{
        maxHeight: 200,
        maxWidth: 200,
        width: realWidth,
        height: realWidth,
    },
    orContainer:{
        width:"70%",
        alignItems: 'center',
    },
    textButton:{
        color:colors.blue,
        fontSize : fontSize*0.05,
    },
    textCreateAccount:{
        color:colors.red,
        fontSize : fontSize*0.065,
        textDecorationLine: 'underline',
    },
    textContainer:{
        paddingTop:15,
        width: '70%',
        flexDirection: 'row',
        alignItems: 'center',
        color: colors.whiteOpacity60,
        borderBottomColor: colors.whiteOpacity60,
        borderBottomWidth: 1,
    },
    textInput:{
        color: colors.whiteOpacity60,
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: (10),
        fontSize: fontSize*0.04
    },
    textInvalid:{
        alignSelf:"center",
        paddingTop: 5,
        color:colors.red,
        fontSize: fontSize*0.04
    },
    textOtherLogin:{
        paddingTop:10,
        color:colors.blue,
        fontSize : fontSize*0.065,
        textDecorationLine: 'underline',
    },
})

export default Login;