import React from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    View,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableOpacity,
    Text,
    Dimensions,
    Keyboard,
} from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import * as SecureStore from 'expo-secure-store';
import {FontAwesome5} from '@expo/vector-icons';
import Toast from 'react-native-simple-toast';

import colors from '../config/colors'
import stylesGlobal from '../config/css'
import Loader from "../components/Loader";
import axiosInstance from "../config/axios";

const realWidth = (Dimensions.get('window').width)*0.5
const fontSize =  (Dimensions.get('window').width)

function EditUser(props) {
    // Storage Data
    const [_saveUsername, setSaveUsername] = React.useState('')
    const [_saveEmail, setSaveEmail] = React.useState('')
    // Waiting for get response
    const [_loading, setLoading] = React.useState(true);
    // Modal Data User
    const [_modal, setModal] = React.useState(false)
    const [visibleModal, setVisibilityModal] = React.useState(false);
    const [_passwordModal, setPasswordModal] = React.useState('');
    const iconModal = !visibleModal ? 'eye-slash' : 'eye';
    // Modal Password
    const [_modalPassword, setModalPassword] = React.useState(false)
    // Get data
    const [_username, setUsername] = React.useState('');
    const [_email, setEmail] = React.useState('');
    // Password Stuff
    const [_password, setPassword] = React.useState('');
    const [_passwordNew, setPasswordNew] = React.useState('');
    const [visible, setVisibility] = React.useState(false);
    const [visibleNew, setVisibilityNew] = React.useState(false);
    const icon = !visible ? 'eye-slash' : 'eye';
    const iconNew = !visibleNew ? 'eye-slash' : 'eye';
    // Loader Placeholder
    const [_loader, setLoader] = React.useState(false)
    // Error Message data
    const [errorMessage, setErrorMessage] = React.useState('');
    // Error Message Password
    const [errorMessagePassword, setErrorMessagePassword] = React.useState('');
    // Error Message Modal
    const [errorMessageModal, setErrorMessageModal] = React.useState('');
    // Input Refs
    const emailInputRef = React.createRef();
    const passwordNewInputRef = React.createRef();

    React.useEffect(() => {
        loadData()
    }, []);

    const loadData = () =>{
        SecureStore.getItemAsync("user_id").then( (idUser) =>{
            if(idUser){
                axiosInstance.get('user/'+idUser).then( (response) =>{
                        setUsername(response.data.username)
                        setEmail(response.data.email)
                        setSaveEmail(response.data.email)
                        setSaveUsername(response.data.username)
                    }
                )
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
    }

    const handleChangeDataUser = () =>{
        setErrorMessage('');
        if( _username != _saveUsername || _email != _saveEmail){
            if(!_username){
                setUsername(_saveUsername)
            }
            else if(_username.length < 4 || _username.length > 15){
                setErrorMessage("Username lenght needs to be between 4 and 15")
                return;
            }
            if( _email == ''){
                setEmail(_saveEmail)
            }
            else if(_email.length < 6 || !_email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){
                setErrorMessage("Invalid Email")
                return;
            }
            setModal(!_modal)
        }
        else{
            Toast.show("Data Saved", Toast.LONG, Toast.BOTTOM)
        }
    }

    const handleConfirmData = () =>{
        setErrorMessageModal('')
        if(!_passwordModal){
            setErrorMessageModal("Insert a Password")
            return
        }
        else{
            setLoader(true)
            let dataToSend = {
                email: _saveEmail,
                password: _passwordModal,
            }
            let formBody = [];
            for (let key in dataToSend) {
                let encodedKey = encodeURIComponent(key);
                let encodedValue = encodeURIComponent(dataToSend[key]);
                formBody.push(encodedKey + '=' + encodedValue);
            }
            formBody = formBody.join('&');
            axiosInstance.post('user/login',formBody).then( result =>{
                console.log(result.data.user_id)
                if(!result.data.user_id){
                    setLoader(false)
                    setErrorMessageModal("Wrong Password")
                    return
                }
                else{
                    SecureStore.getItemAsync("user_id").then(idUser =>{
                        if(idUser){
                            let dataToSend = {
                                email: _email,
                                username: _username,
                                password: _passwordModal,
                                id_user: idUser
                            };
                            let formBody = [];
                            for (let key in dataToSend) {
                                let encodedKey = encodeURIComponent(key);
                                let encodedValue = encodeURIComponent(dataToSend[key]);
                                formBody.push(encodedKey + '=' + encodedValue);
                            }
                            formBody = formBody.join('&');
                            axiosInstance.put('user/'+idUser+'&modify', formBody).then(result => {
                                setLoader(false)
                                console.log(result.data);
                                setModal(!_modal)
                                setSaveEmail(_email)
                                setSaveUsername(_username)
                                setVisibilityModal(false)
                                setModalPassword('')
                                Toast.show("Changes Saved", Toast.LONG, Toast.BOTTOM)
                                return
                            })
                            .catch((error)=>{
                                console.log(error)
                                return
                            })
                            .finally(() => setLoader(false));
                        }
                        else{
                            //clear tokens and so on
                            props.navigation.navigate('Auth');
                            return
                        }
                    })
                }
            })

        }
    }

    const handleConfirmPassword = () =>{
        setLoader(true)
        SecureStore.getItemAsync("user_id").then(idUser =>{
            if(idUser){
                let dataToSend = {
                    email: _saveEmail,
                    username: _saveUsername,
                    password: _passwordNew,
                    id_user: idUser
                };
                let formBody = [];
                for (let key in dataToSend) {
                    let encodedKey = encodeURIComponent(key);
                    let encodedValue = encodeURIComponent(dataToSend[key]);
                    formBody.push(encodedKey + '=' + encodedValue);
                }
                formBody = formBody.join('&');
                axiosInstance.put('user/'+idUser+'&modify', formBody).then(result => {
                    setModalPassword(!_modalPassword)
                    setPassword('')
                    setVisibility(false)
                    setPasswordNew('')
                    setVisibilityNew(false)
                    Toast.show("Password changed", Toast.LONG, Toast.BOTTOM)
                    return
                })
                .catch((error)=>{
                    console.log(error)
                    return
                })
                .finally(() => setLoader(false));
            }
            else{
                //clear tokens and so on
                props.navigation.navigate('Auth');
                return
            }
        })

    }

    const renderModalDataUser = () =>{
        return(
            <Modal
                animationType="slide"
                coverScreen={false}
                isVisible={_modal}
                hasBackdrop={true}
                avoidKeyboard={true}
                backdropColor={colors.whiteOpacity40}
                onBackdropPress={() => setModal(!_modal)}
                onBackButtonPress={() => setModal(!_modal)}
                onModalWillShow={()=>{
                    setErrorMessageModal('')
                    setPasswordModal('')
                    setVisibilityModal(false)
                }}
            >
                <View style={styles.modalView}>
                    <Text style={styles.titleModal}>Confirm Changes</Text>
                    <View style={styles.line}/>
                    <Text style={styles.textModal}>Insert your password to confirm the changes?</Text>
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
                            style={[stylesGlobal.text, styles.textInput]}
                            placeholder = 'Password'
                            value={_passwordModal}
                            onChangeText={(password) => setPasswordModal(password)}
                            textAlign="center"
                            secureTextEntry={!visibleModal}
                            placeholderTextColor={colors.whiteOpacity60}
                            onSubmitEditing={Keyboard.dismiss}
                        >
                        </TextInput>
                        <FontAwesome5
                            name={iconModal}
                            size={17}
                            backgroundColor='transparent'
                            underlayColor='transparent'
                            color={colors.whiteOpacity60}
                            style={styles.icon}
                            onPress={() => setVisibilityModal(!visibleModal)}
                        />
                    </View>
                    {errorMessageModal != '' ? <Text style={styles.textInvalid}>{errorMessageModal}</Text> : null}
                    <View style={styles.containerBtnsModal}>
                        <TouchableOpacity
                            style={[stylesGlobal.button, styles.button, styles.buttonDiscard]}
                            title="DiscardChangesModal"
                            onPress={()=> setModal(!_modal)}
                        >
                            <FontAwesome5
                                name="times"
                                size={17}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.red}
                                style={styles.iconBtns}
                            />
                            <Text style={styles.textButtonDiscard}>Discard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[stylesGlobal.button, styles.button, styles.buttonSave]}
                            title="SaveChangesModal"
                            onPress={()=> handleConfirmData()}
                        >
                            <FontAwesome5
                                name="check"
                                size={17}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.green}
                                style={styles.iconBtns}
                            />
                            <Text style={styles.textButtonSave}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    const renderModalPassword = () =>{
        return(
            <Modal
                animationType="slide"
                coverScreen={false}
                isVisible={_modalPassword}
                hasBackdrop={true}
                avoidKeyboard={true}
                backdropColor={colors.whiteOpacity40}
                onBackdropPress={() => setModalPassword(!_modalPassword)}
                onBackButtonPress={() => setModalPassword(!_modalPassword)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.titleModal}>Confirm Changes</Text>
                    <View style={styles.line}/>
                    <Text style={styles.textModal}>Do you want to change your password?</Text>
                    <View style={styles.containerBtnsModal}>
                        <TouchableOpacity
                            style={[stylesGlobal.button, styles.button, styles.buttonDiscard]}
                            title="DiscardPasswordModal"
                            onPress={()=> setModalPassword(!_modalPassword)}
                        >
                            <FontAwesome5
                                name="times"
                                size={17}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.red}
                                style={styles.iconBtns}
                            />
                            <Text style={styles.textButtonDiscard}>Discard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[stylesGlobal.button, styles.button, styles.buttonSave]}
                            title="SavePasswordModal"
                            onPress={()=> handleConfirmPassword()}
                        >
                            <FontAwesome5
                                name="check"
                                size={17}
                                backgroundColor='transparent'
                                underlayColor='transparent'
                                color={colors.green}
                                style={styles.iconBtns}
                            />
                            <Text style={styles.textButtonSave}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    const handleChangePassword = () =>{
        setErrorMessagePassword('')
        if(!_password){
            setErrorMessagePassword("Insert your current password")
            return
        }
        else if(!_passwordNew){
            setErrorMessagePassword("Insert a new password")
            return
        }
        else if(_passwordNew.length > 16 || _passwordNew.length < 6){
            setErrorMessagePassword("The password needs to be between 6 to 16 character long")
            return;
        }
        else if(!_passwordNew.match(/\d+/g) || !(/[A-Z]/).test(_passwordNew)){
            setErrorMessagePassword("The password needs to contain a number and a capital letter")
            return;
        }
        else{
            setLoader(true)
            let dataToSend = {
                email: _saveEmail,
                password: _password,
            }
            let formBody = [];
            for (let key in dataToSend) {
                let encodedKey = encodeURIComponent(key);
                let encodedValue = encodeURIComponent(dataToSend[key]);
                formBody.push(encodedKey + '=' + encodedValue);
            }
            formBody = formBody.join('&');
            axiosInstance.post('user/login', formBody).then( result =>{
                console.log(result.data)
                if(result.data.user_id){
                    setLoader(false)
                    setModalPassword(!_modalPassword)
                }
                else{
                    setLoader(false)
                    setErrorMessagePassword("Current Password is invalid")
                    return
                }
            })
        }
    }

    return (
        <SafeAreaView style={stylesGlobal.container}>
            {_loading ? <ActivityIndicator/> :(
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                        flex: 1,
                        alignContent: 'center',
                    }}
                >
                    <Loader loading={_loader}/>
                    {_modal ? renderModalDataUser() : null}
                    {_modalPassword ? renderModalPassword() : null}
                    <KeyboardAvoidingView enabled style={{alignItems: 'center'}}>
                        <View style={styles.lineContainer}>
                            <View style={styles.lineForText}/>
                            <Text style={[stylesGlobal.text, styles.lineTextUser]}>Edit User</Text>
                            <View style={styles.lineForText}/>
                        </View>
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
                                style={[stylesGlobal.text, styles.textInput]}
                                placeholder={_saveUsername}
                                value={_username}
                                onChangeText={(username) => setUsername(username)}
                                textAlign="center"
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
                                style={[stylesGlobal.text, styles.textInput]}
                                placeholder={_saveEmail}
                                value={_email}
                                ref={emailInputRef}
                                onChangeText={(email) => setEmail(email)}
                                textAlign="center"
                                placeholderTextColor={colors.whiteOpacity60}
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>
                        {errorMessage != '' ? <Text style={styles.textInvalid}>{errorMessage}</Text> : null}
                        <View style={styles.containerBtns}>
                            <TouchableOpacity
                                style={[stylesGlobal.button, styles.button, styles.buttonEditUser]}
                                title="SaveChangesUser"
                                onPress={()=>handleChangeDataUser()}>
                                    <FontAwesome5
                                        name="save"
                                        size={17}
                                        backgroundColor='transparent'
                                        underlayColor='transparent'
                                        color={colors.whiteOpacity60}
                                        style={styles.iconBtns}
                                    />
                                    <Text style={stylesGlobal.textButton}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.lineContainer}>
                            <View style={styles.lineForText}/>
                            <Text style={[stylesGlobal.text, styles.lineTextPassword]}>Change Password</Text>
                            <View style={styles.lineForText}/>
                         </View>
                        <View>
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
                                    style={[stylesGlobal.text, styles.textInput]}
                                    placeholder = 'Current Password'
                                    value={_password}
                                    onChangeText={(password) => setPassword(password)}
                                    textAlign="center"
                                    secureTextEntry={!visible}
                                    placeholderTextColor={colors.whiteOpacity60}
                                    onSubmitEditing={() =>
                                        passwordNewInputRef.current &&
                                        passwordNewInputRef.current.focus()
                                    }
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
                                    style={[stylesGlobal.text, styles.textInput]}
                                    placeholder = 'New Password'
                                    value={_passwordNew}
                                    ref={passwordNewInputRef}
                                    onChangeText={(password) => setPasswordNew(password)}
                                    textAlign="center"
                                    secureTextEntry={!visibleNew}
                                    placeholderTextColor={colors.whiteOpacity60}
                                    onSubmitEditing={Keyboard.dismiss}
                                    >
                                </TextInput>
                                <FontAwesome5
                                    name={iconNew}
                                    size={17}
                                    backgroundColor='transparent'
                                    underlayColor='transparent'
                                    color={colors.whiteOpacity60}
                                    style={styles.icon}
                                    onPress={() => setVisibilityNew(!visibleNew)}
                                />
                            </View>
                        </View>
                        {errorMessagePassword != '' ? <Text style={styles.textInvalid}>{errorMessagePassword}</Text> : null}
                        <View style={styles.containerBtns}>
                                <TouchableOpacity
                                style={[stylesGlobal.button, styles.button, styles.buttonEditUser]}
                                title="SaveChangesPwd"
                                onPress={()=>handleChangePassword()}>
                                    <FontAwesome5
                                        name="save"
                                        size={17}
                                        backgroundColor='transparent'
                                        underlayColor='transparent'
                                        color={colors.whiteOpacity60}
                                        style={styles.iconBtns}
                                    />
                                    <Text style={stylesGlobal.textButton}>Save Password</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    button:{
        backgroundColor: colors.secondaryGrey,
        alignSelf: 'flex-end',
        right: 0,
        flexDirection: 'row',
        marginTop: 20
    },
    buttonDiscard:{
        justifyContent:"center",
        width:"40%",
        borderColor:colors.red,
    },
    buttonSave:{
        width:"40%",
        justifyContent:"center",
        borderColor:colors.green,
    },
    containerBtns:{
        flexDirection: 'row-reverse',
        width: '70%',
    },
    containerBtnsModal:{
        marginTop:15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    containerPasswords:{
        marginTop:15,
        borderColor: colors.whiteOpacity60,
        borderWidth: 1,
        borderRadius: 5,
        padding: 30,
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
    iconBtns:{
        marginRight: 7,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    line:{
        backgroundColor: colors.grey,
        height: 2,
        alignSelf: 'center'
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
    lineTextPassword:{
        alignSelf:'center',
        paddingHorizontal:10,
        fontSize: 22,
        color: colors.blue,
    },
    lineContainer:{
        paddingTop:15,
        flexDirection: 'row',
        width: '80%'
    },
    modalView:{
        borderRadius:3,
        padding:15,
        justifyContent: "center",
        alignSelf:"center",
        alignContent: "center",
        backgroundColor: colors.main,
    },
    textButton:{
        color:colors.whiteOpacity60,
        fontSize : 16,
    },
    textButtonSave:{
        color:colors.green,
        fontSize : 16,
    },
    textButtonDiscard:{
        color:colors.red,
        fontSize : 16,
    },
    textContainer:{
        alignSelf:"center",
        paddingTop:15,
        width: '70%',
        flexDirection: 'row',
        alignItems: 'center',
        color: colors.whiteOpacity60,
        borderBottomColor: colors.whiteOpacity60,
        borderBottomWidth: 1,
    },
    textInput:{
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
        fontSize: 15,
    },
    textModal:{
        alignSelf:"center",
        fontSize : 15,
        paddingTop: 10,
        color:colors.whiteOpacity60,
    },
    titleModal:{
        borderColor: colors.grey,
        borderBottomWidth:1,
        color:colors.red,
        paddingRight: 5,
        paddingLeft: 5,
        fontSize : 20,
        paddingTop: 10,
        alignSelf: "center"
    },
})

export default EditUser;