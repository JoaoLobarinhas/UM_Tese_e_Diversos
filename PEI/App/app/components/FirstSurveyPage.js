import React, {useState, useEffect, createRef} from 'react';
import { Dimensions, StyleSheet, Text, View, Image, ScrollView, FlatList, TouchableOpacity, TouchableWithoutFeedback, SafeAreaView, Button } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist'
import {CommonActions } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

// Style
import stylesGlobal from '../config/css'
import colors from '../config/colors'
import TopBar from '../components/TopBar'
import { color } from 'react-native-reanimated';
// services
import axiosInstance from "../config/axios";

var userID = "";

const renderItem = ({ item, index, drag, isActive }) => {

  return (
    <TouchableOpacity
      style={[styles.card_background, {
        backgroundColor: isActive ? colors.blue : colors.secondaryGrey
      }]}
      onLongPress={drag}
    >
      <Text style={styles.category_title}> {item.genres[0].name + ", " + item.genres[1].name + ", " + item.genres[2].name} </Text>
      <FlatList
        horizontal
        data={item.movies}
        renderItem={ ({item, index}) => (
          <View key={index} style={{width: 100}}>
            <Image
            key={index}
            style={{alignSelf: 'center', width: 60, height: 90}}
            resizeMode={'contain'}
            source={{uri: item.profile_photo}} />
            <Text style={styles.movie_title}>{item.title}</Text>
          </View>
        )}
        keyExtractor={item => item.title}
        />
    </TouchableOpacity>
  )
}

const SurveySection = (props) => {
  const [dataState, setData] = useState(props.surveyData);

  props.setSurveyData(dataState)
  return(
    <View style={{ flex: 1 }}>
      <DraggableFlatList
        data={dataState}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.genres[0].name}-${item.genres[1].name}-${item.genres[2].name}`}
        onDragEnd={({ data }) => setData(data)}
      />
    </View>
  )
}

const FirstSurveyPage = (props) => {
  const [surveyData, setSurveyData] = useState();

  useEffect(() => {
    // get survey data from api
    async function get_user_id () {
      userID = await SecureStore.getItemAsync('user_id');
    }

    get_user_id()
    getSurveyData()
  }, [])

  const getSurveyData = () => {
    axiosInstance.get("questionary")
    .then(response => {
      setSurveyData(response.data)
    })
  }

  const saveSurveyAnswers = (e) => {
    // merge top movies arrays
    var topMovies = [...surveyData[0].movies, ...surveyData[1].movies, ...surveyData[2].movies]
    var topMoviesID = []
    topMovies.forEach(movie => {
      topMoviesID.push(movie.id_movie)
    });

    axiosInstance.put("questionary/response&idUser=" + userID, { movies: topMoviesID }).
    then( response => {
      props.navigation.dispatch(
        CommonActions.reset({index:1, routes:[{name:"Splash"}]})
      )
    })
  }

  return(
    <SafeAreaView style={stylesGlobal.app}>
      <TopBar />
      <View style={{padding: 20}}>
        <Text style={styles.title}>Order the following movies and categories by order of preference</Text>
        <Text style={styles.subtitle}>Best to worst (top to bottom)</Text>
      </View>
      {surveyData &&
        <View style={{ flex: 1 }}>
          <DraggableFlatList
            data={surveyData}
            renderItem={renderItem}
            keyExtractor={(item, index) => `draggable-item-${item.genres[0].name}-${item.genres[1].name}-${item.genres[2].name}`}
            onDragEnd={({ data }) => setSurveyData(surveyData)}
          />
        </View>
      }
      <TouchableOpacity
        style={[stylesGlobal.button, styles.confirmButton]}
        onPress={saveSurveyAnswers}
        >
          <Text style={[stylesGlobal.textButton]}>Confirm</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  card_background: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    marginBottom: 20,
    borderRadius: 10,
    marginHorizontal: 20
  },
  title: {
    color: colors.white,
    fontSize: 20
  },
  subtitle: {
    color: colors.white,
    fontSize: 14,
  },
  category_title: {
    fontSize: 15,
    color: colors.white,
    textAlign: 'center',
    paddingBottom: 10
  },
  movie_title: {
    fontSize: 10,
    textAlign: 'center',
    color: colors.white
  },
  confirmButton: {
    backgroundColor:colors.blue,
  }
});

export default FirstSurveyPage;