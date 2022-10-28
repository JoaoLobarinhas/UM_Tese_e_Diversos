import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios'

import {navigateToLogin} from './RootNavigation';
import constants from './constants';

var baseURL;

// if(Platform.OS == "android"){
//     baseURL = 'http://10.0.2.2:8000/api/';
// }
// else{
//     baseURL = 'http://127.0.0.1:8000/api/';
// }
baseURL = 'http://3.10.23.52/api/';

const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
});

axiosInstance.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

axiosInstance.interceptors.request.use(async (config) => {
    if ( !(config.url.endsWith('login') || config.url.endsWith('refresh') || config.url.endsWith('signup')) ) {
        const refresh_token_expiration = new Date(await SecureStore.getItemAsync('refresh_token_expiration'));
        const today = new Date();
        const refresh_token = await SecureStore.getItemAsync('refresh_token');
        if(today < refresh_token_expiration && refresh_token){
            var access_token_expiration = new Date(await SecureStore.getItemAsync('access_token_expiration'));
            if (today > access_token_expiration) {
                await axiosInstance.post('/token/refresh',{refresh: refresh_token}).then(res=>{
                    SecureStore.setItemAsync('access_token',res.data.access);
                    const now = new Date();
                    access_token_expiration = new Date(now.getTime()+ constants.minutes*60000).toJSON();
                    SecureStore.setItemAsync('access_token_expiration', access_token_expiration);
                    const access_token=res.data.access;
                    config.headers.Authorization =  access_token ? "Bearer " + access_token : null;
                })
            } else {
                const access_token = await SecureStore.getItemAsync('access_token');
                config.headers.Authorization =  access_token ? "Bearer " + access_token : null;
            }
        }
        else{
            console.log("Refresh token is expired");
            navigateToLogin();
        }
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) =>{
    return response
    },
    (error) => {
    const originalRequest = error.config;
    console.log(error)
    if(error.response){
        if (error.response.status === 401 && originalRequest.url === baseURL+'token/refresh/') {
            console.log("1: "+Promise.reject(error));
            navigateToLogin();
            return Promise.reject(error);
        }

        if (error.response.status === 401) {
            let refresh_token
            SecureStore.getItemAsync('refresh_token').then((_refresh_token)=>{
                refresh_token=_refresh_token
            })
            if(refresh_token){
                let refresh_token_expiration
                SecureStore.getItemAsync('refresh_token_expiration').then((_refresh_token_expiration)=>{
                    refresh_token_expiration=new Date(_refresh_token_expiration);
                })
                const today = new Date();
                if(today < refresh_token_expiration){
                    let access_token_expiration
                    SecureStore.getItemAsync('access_token_expiration').then((_access_token_expiration)=>{
                        access_token_expiration = new Date(_access_token_expiration)
                    })
                    if (today > access_token_expiration) {
                        try {
                            axiosInstance.post('/token/refresh', { refresh: refresh_token }).then( (res) =>{
                                SecureStore.setItemAsync('access_token', res.data.access);
                                const now = new Date();
                                let access_token_expiration = new Date(now.getTime()+ constants.minutes*60000).toJSON();
                                SecureStore.setItemAsync('access_token_expiration', access_token_expiration);
                                axiosInstance.defaults.headers.Authorization = "Bearer " + response.data.access;
                                originalRequest.headers.Authorization = "Bearer " + response.data.access;
                                return axiosInstance(originalRequest);
                            })
                            .catch(error=>console.log(error));
                        } catch (err) {
                            console.log(err);
                        }
                    } else {
                        let access_token
                        SecureStore.getItemAsync('access_token').then((_access_token)=>{
                            access_token = _access_token
                        });
                        if(access_token){
                            axiosInstance.defaults.headers.Authorization = "Bearer " + access_token;
                            originalRequest.headers.Authorization = "Bearer " + access_token;
                            return axiosInstance(originalRequest);
                        }
                        else{
                            console.log("Acess token doesn't exist");
                            navigateToLogin() ;
                        }
                    }
                }
                else{
                    console.log("Refresh token is expired");
                    navigateToLogin();
                }
            }
            else{
                console.log("Refresh token doesn't exist");
                navigateToLogin();
            }
        }
    }
    return Promise.reject(error);
});

export default axiosInstance
