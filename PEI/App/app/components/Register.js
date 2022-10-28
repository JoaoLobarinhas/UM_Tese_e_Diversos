import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {FontAwesome5} from '@expo/vector-icons';
import { Keyboard, Dimensions, Text, StyleSheet, View, TextInput, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { ScrollView, Switch } from 'react-native-gesture-handler';

import colors from '../config/colors'
import Loader from "../components/Loader";
import axiosInstance from "../config/axios";
import stylesGlobal from '../config/css'


const realWidth = (Dimensions.get('window').width)*0.5
const fontSize =  (Dimensions.get('window').width)

function Register({navigation}) {
    const [visible, setVisibility] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isTermsEnabled, setIsTermsEnabled] = React.useState(false);
    const [isAgeEnabled, setIsAgeEnabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const toggleSwitchTerms = () => setIsTermsEnabled(previousState => !previousState);
    const toggleSwitchAge = () => setIsAgeEnabled(previousState => !previousState);
    const icon = !visible ? 'eye-slash' : 'eye';

    const emailInputRef = React.createRef();
    const passwordInputRef = React.createRef();

    const handleCreateAccount = () =>{
        setErrorMessage('');
        const emailRegex = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
        if(!username){
            setErrorMessage("Insert a username")
            return;
        }
        else if(username.length < 4 || username.length > 15){
            setErrorMessage("Username lenght needs to be between 4 and 15 characters")
            return;
        }
        if(!email){
            setErrorMessage("Insert a email")
            return;
        }
        else if(email.length < 6 || !emailRegex.test(email)){
            setErrorMessage("Invalid Email")
            return;
        }
        if(!password){
            setErrorMessage("Insert a password")
            return;
        }
        else if(password.length > 16 || password.length < 6){
            setErrorMessage("The password needs to be between 6 to 16 character long")
            return;
        }
        else if(!password.match(/\d+/g) || !(/[A-Z]/).test(password)){
            setErrorMessage("The password needs to contain a number and a capital letter")
            return;
        }
        if(!isTermsEnabled){
            setErrorMessage("Acept the terms ")
            return;
        }
        if(!isAgeEnabled){
            setErrorMessage("Acept the Age ")
            return;
        }
        setLoading(true)
        let dataToSend = {
            email: email,
            password: password,
            username: username,
        };
        let formBody = [];
        for (let key in dataToSend) {
            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(dataToSend[key]);
            formBody.push(encodedKey + '=' + encodedValue);
        }
        formBody = formBody.join('&');
        axiosInstance.post('user/signup',formBody).then(result => {
            setLoading(false);
            console.log(result.data);
            if(result.data.email != "user with this email already exists." && !result.data.response){
                navigation.navigate('Login');
            }
            else{
                setErrorMessage("Email already registed")
                return
            }
        })
        .catch(error => {
            console.log(error); // Will output : NETWORK ERROR
            return;
        });
    }

    return (
        <View style={styles.containerRegister}>
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
                        <Text style={styles.title}>
                            Create An Account
                        </Text>
                        <View style={styles.line}/>
                        <View style={styles.textContainer}>
                            <FontAwesome5
                                name="user"
                                size={17}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.whiteOpacity60}
                                style={styles.icon}
                            />
                            <TextInput
                                underlineColorAndroid={colors.main}
                                style={styles.textInput}
                                placeholder="Username"
                                value={username}
                                onChangeText={(username) => setUsername(username)}
                                textAlign="left"
                                placeholderTextColor={colors.whiteOpacity60}
                                onSubmitEditing={() =>
                                    emailInputRef.current &&
                                    emailInputRef.current.focus()
                                }
                            />
                        </View>
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
                                ref={emailInputRef}
                                onChangeText={(email) => setEmail(email)}
                                textAlign="left"
                                placeholderTextColor={colors.whiteOpacity60}
                                onSubmitEditing={() =>
                                    passwordInputRef.current &&
                                    passwordInputRef.current.focus()
                                }
                            />
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
                                value={password}
                                ref={passwordInputRef}
                                onChangeText={(password) => setPassword(password)}
                                textAlign="left"
                                secureTextEntry={!visible}
                                placeholderTextColor={colors.whiteOpacity60}
                                onSubmitEditing={Keyboard.dismiss}
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
                        <View style={styles.switchContainer}>
                            <Switch
                            trackColor={{ false: colors.grey, true: colors.grey }}
                            thumbColor={isTermsEnabled ? colors.red : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchTerms}
                            value={isTermsEnabled}
                            />
                            <Text style={styles.textSwitch}>
                                By pressing this you are accepting the Terms and Conditions
                            </Text>
                        </View>
                        <View style={styles.switchContainer}>
                            <Switch
                            trackColor={{ false: colors.grey, true: colors.grey }}
                            thumbColor={isAgeEnabled ? colors.blue : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitchAge}
                            value={isAgeEnabled}
                            />
                            <Text style={styles.textSwitch}>
                                Are you 18 or older?
                            </Text>
                        </View>
                        {errorMessage != '' ? <Text style={styles.textInvalid}>{errorMessage}</Text> : null}
                        <TouchableOpacity
                            style={[styles.buttonLogin, stylesGlobal.button]}
                            title="Create Account"
                            onPress={handleCreateAccount}>
                                <Text style={styles.textButton}>Create Account</Text>
                        </TouchableOpacity>
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
    containerRegister:{
        backgroundColor: colors.main,
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: 30,
    },
    icon:{
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    line:{
        marginTop: 5,
        marginBottom: 15,
        backgroundColor: colors.grey,
        height: 2,
        alignSelf: 'center',
        width:"70%"
    },
    switchContainer:{
        paddingTop:15,
        width: '70%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        color: colors.whiteOpacity60,
    },
    textButton:{
        color:colors.white,
        fontSize : fontSize*0.05,
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
        textAlign: 'center',
        alignSelf:"center",
        width:"70%",
        paddingTop: 10,
        color:colors.red,
        fontSize: fontSize*0.04,
    },
    textSwitch:{
        color: colors.whiteOpacity60,
        fontSize: fontSize*0.03,
        flex: 1,
    },
    title:{
        color:colors.red,
        fontSize : fontSize*0.07,
    },
})

export default Register;
