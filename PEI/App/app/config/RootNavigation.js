// RootNavigation.js

import * as React from 'react';

export const isReadyRef = React.createRef();

export const navigationRef = React.createRef();

export const navigateToLogin = () => {
  if (isReadyRef.current && navigationRef.current) {
    // Perform navigation if the app has mounted
    navigationRef.current.navigate("Auth");
  }
  return
}

export const navigateToEditUser = () =>{
  if (isReadyRef.current && navigationRef.current) {
    // Perform navigation if the app has mounted
    navigationRef.current.navigate("EditUser");
  }
  return
}

export const navigateToSplashScreen = () =>{
  if (isReadyRef.current && navigationRef.current) {
    // Perform navigation if the app has mounted
    navigationRef.current.navigate("Splash");
  }
  return
}