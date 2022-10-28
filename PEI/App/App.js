import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image, View} from 'react-native';

import { navigationRef, isReadyRef } from './app/config/RootNavigation';

import Login from './app/components/Login'
import LandingPage from './app/components/LandingPage'
import Register from './app/components/Register'
import Splash from './app/components/Splash'
import BottomBarNav from './app/components/BottomBarNav'
import EditUser from './app/components/EditUser'
import MovieDetails from "./app/components/MovieDetails";
import SearchMovie from './app/components/SearchMovie'

import colors from './app/config/colors';
import PickMovie from './app/components/PickMovie';
import SessionsPage from './app/components/SessionsPage';
import GroupPage from './app/components/GroupPage';
import FirstSurveyPage from './app/components/FirstSurveyPage';

import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

import * as Linking from 'expo-linking';

const Stack = createStackNavigator();

const LogoTitle = () =>{
  return (
    <View style={{marginLeft:-47, alignItems: 'center'}}>
      <Image
      style={{ width: 45, height: 45, alignSelf:'center',}}
      source={require('./app/assets/logo.png')}
      />
    </View>
  );
}

const Auth = () => {
  return(
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.main,
          borderBottomColor: colors.mainCard,
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.whiteOpacity60,
      }}
    >
      <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
      <Stack.Screen name="LandingPage" component={LandingPage} options={{headerShown: false}}/>
      <Stack.Screen name="FirstSurveyPage" component={FirstSurveyPage} options={{headerShown: false}}/>
      <Stack.Screen name="Register" component={Register} options={{ headerTitle: props => <LogoTitle {...props} /> }}/>
    </Stack.Navigator>
  );
}

const Functionality = () =>{
  return(
    <Stack.Navigator
      initialRouteName="BottomNavBar"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.main,
          borderBottomColor: colors.mainCard,
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.whiteOpacity60,
      }}
    >
      <Stack.Screen name="PickMovie" component={PickMovie} options={{headerShown: false}}/>
      <Stack.Screen name="GroupPage" component={GroupPage} options={{headerShown: false}}/>
      <Stack.Screen name="SessionsPage" component={SessionsPage} options={{headerShown: false}}/>
      <Stack.Screen name="BottomNavBar" component={BottomBarNav} options={{headerShown: false}}/>
      <Stack.Screen name="EditUser" component={EditUser} options={{ headerTitle: props => <LogoTitle {...props} /> }}/>
      <Stack.Screen name="MovieDetails" component={MovieDetails} options={{ headerTitle: props => <LogoTitle {...props} /> }}/>
      <Stack.Screen name="SearchMovie" component={SearchMovie} options={{ headerTitle: props => <LogoTitle {...props} /> }}/>
    </Stack.Navigator>
  );
}

const prefix = Linking.makeUrl('/');

function App() {
  useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  React.useEffect(() => {
    return () => {
      isReadyRef.current = false
    };
  }, []);

  // const linking = {
  //   prefixes: [prefix],
  // };

  // Linking.addEventListener('group', () => {
  //   console.log("NICE")
  // })

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
      }}
    >
      <Stack.Navigator
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={Splash} options={{headerShown: false}}/>
        <Stack.Screen name="Auth" component={Auth} options={{headerShown: false}}/>
        <Stack.Screen name="Functionality" component={Functionality} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
