// -- Packages
import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, createRef, useContext} from 'react';
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback, SafeAreaView, Button, BackHandler, Alert, } from 'react-native';
import Swiper, { swipeLeft } from 'react-native-deck-swiper';
import { color } from 'react-native-reanimated';
import {Transitioning, Transition} from 'react-native-reanimated';
// import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";
// -- Style
import data from '../config/data';
import colors from '../config/colors'
import stylesGlobal from '../config/css'
import WebSocketSessions from '../config/WebSocketSessions'
import axiosInstance from '../config/axios'
// -- Components
import Card from './cards/Card';
import CardDetails from './cards/CardDetails';
import CardDetailsExpanded from './cards/CardDetailsExpanded';
import BottomOptions from './BottomOptions';

// import RoomNumberContext from '../context/Room';
import * as SecureStore from 'expo-secure-store';


const ANIMATION_DURATION = 100;
const transition = (
  <Transition.Sequence>
    <Transition.Out type="slide-bottom" durationMs={ANIMATION_DURATION} interpolation='easeIn' />
    <Transition.Together>
      <Transition.In type='fade' durationMs={ANIMATION_DURATION} delayMs={0} />
      <Transition.In type='slide-bottom' durationMs={ANIMATION_DURATION} delayMs={0} interpolation='easeIn' />
    </Transition.Together>
  </Transition.Sequence>
);

const transitionRef = createRef();

const ws = WebSocketSessions.instance.ws

class PickMovie extends React.Component {

  _isMounted = false;

  // static roomNumberContext = RoomNumberContext
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      isLoading: false,
      moviesData: [],
      pickedMovies: [],
      detailsVisible: false,
      currentItem: null,
      round: 1,
      finishedRound: false
    };
  }

  toggleMovieDetails = (card) => {
    // Show movie details (overlay)
    // -- Gets "card" from onTapCard parameter from Swiper
    this.setState({ detailsVisible: !this.state.detailsVisible, currentItem:card });
  };

  componentDidMount(){
    // const roomNumber = this.context
    SecureStore.getItemAsync('user_id').then((idUser)=>{
      // get username from user_id

      this.setState({
        userID: idUser,
        roomNumber: this.props.route.params.idSession,
        round: this.props.route.params.round,
        moviesData: this.props.route.params.moviesData,
        username: this.props.route.params.username
      })
      this.backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        this.exitRoom
      );
      _isMounted=true
    });

    // load movies from API into this.state.moviesData
  }

  // Get movies for current round
  getMoviesCurrentRound = (round) => {
    return this.state.moviesForRounds[round - 1];
  }

  // Start round X
  checkFinishedRound() {
    // if(this.state.index === this.state.moviesData.length - 1){
    if(this.state.index == this.state.moviesData.length){
      this.setState({finishedRound: true}, () => {
        this.setFinishedRound(this.state.userID);
        this.props.navigation.goBack({ userID: this.state.userID });
        let round = this.state.round.toString()
        this.props.route.params.onRoundFinished(round);
      })
    }
  }

  componentWillUnmount(){
    _isMounted=false
  }

  setFinishedRound = () => {
    // --> Send socket data
    // User finished round
    console.log("FINISHED ROUND")
    console.log(this.state.username)
    ws.send(JSON.stringify({
      userID: this.state.userID,
      room: this.state.roomNumber,
      action: "finish_round",
      data: {pickedMovies: this.state.pickedMovies, username: this.state.username}
    }));
  }

  bottomOptionSelected = (action) => {
    switch (action) {
      case "seen":
        // add movie to user history movies
        axiosInstance.put( `history/${this.state.userID}&idMovie=${this.state.moviesData[this.state.index].id_movie}`)
        .then(() => {
          console.log("Add '" + this.state.moviesData[this.state.index].title +  "' to " + action)
          this.onSwipedLeft()
        })
        break;
      case "accept":
        // add movie to user favorites
        console.log("Accept '" + this.state.moviesData[this.state.index].title)
        this.onSwipedRight(this.state.moviesData[this.state.index])
        break
      default: // reject
      // add movie to user favorites
        console.log("Reject '" + this.state.moviesData[this.state.index].title)
        this.onSwipedLeft()
        break
    }
  }

  // When rejecting movie
  onSwipedLeft = () => {
    transitionRef.current.animateNextTransition();
    this.setState({index: (this.state.index + 1)}, () => {
      this.checkFinishedRound()
    })
  };

  // When choosing movie
  onSwipedRight = (card) => {
    // --> Add movie id to list of picked movies
    this.setState({
      index: (this.state.index + 1),
      pickedMovies: [...this.state.pickedMovies, card]
    }, () => {
      axiosInstance.put(`seeLater/${this.state.userID}&idMovie=${card.id_movie}`)
      .catch(error => { console.log(error.message) })
      this.checkFinishedRound()
    })
  }

  exitRoom = () => {
    Alert.alert("Leaving room", "Are you sure you want to leave this group?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel"
      },
      { text: "YES", onPress: () => {
        // Remove user from group on database
        axiosInstance.put("session/" + this.state.userID + "&removeUser", {
          "id_session": this.props.route.params.idSession,
          "id_user": this.state.userID
        })
        .then( res => {
            // Broadcast message that user is leaving
            ws.send(JSON.stringify({
              userID: this.state.userID,
              room: this.state.roomNumber,
              action: "leave"
            }));
            // Leave group and move to Sessions Page
            this.props.navigation.navigate("SessionPage");
          })
      }}
    ])
    return true;
  }

  render(){
    // this.checkFinishedRound();
    if(this.state.finishedRound) {
      return <View></View>;
    }

    return (
      <SafeAreaView style={stylesGlobal.app}>
        { this.state.moviesData
        && this.state.moviesData.length > 0
        && this.state.moviesData[this.state.index]
        && !this.state.detailsVisible
        && !this.state.finishedRound ? (
          <View style={stylesGlobal.container}>
          <Text style={[stylesGlobal.text, styles.groupTitle]}>{"Group #" + this.props.route.params.idSession + " - Round " + this.state.round}</Text>
          <View style={styles.swiperContainer}>
            <Swiper
              cards={this.state.moviesData}
              cardIndex={this.state.index}
              renderCard={(card) => <Card card={this.state.moviesData[this.state.index]} />}
              onSwipedLeft={this.onSwipedLeft}
              onSwipedRight={(index) => this.onSwipedRight(this.state.moviesData[this.state.index])}
              stackSize={3}
              stackScale={10}
              stackSeparation={5}
              backgroundColor={'transparent'}
              onTapCard={ (index) =>this.toggleMovieDetails(this.state.moviesData[this.state.index])}
              disableTopSwipe
              disableBottomSwipe
              animateOverlayLabelsOpacity
              animateCardOpacity
              overlayLabels={{
                left: {
                  title: 'NO',
                  style: {
                    label: {
                      backgroundColor: colors.red,
                      color: colors.white,
                      fontSize: 24
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                      marginLeft: -20
                    }
                  }
                },
                right: {
                  title: 'YES',
                  style: {
                    label: {
                      backgroundColor: colors.green,
                      color: colors.white,
                      fontSize: 24
                    },
                    wrapper: {
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                      marginLeft: 20
                    }
                  }
                }
              }}
            />
          </View>
          <Transitioning.View ref={transitionRef} transition={transition}>
            <CardDetails index={this.state.index} moviesData={this.state.moviesData} />
          </Transitioning.View>
          <View style={styles.bottomContainer}>
            <BottomOptions bottomOptionSelected={this.bottomOptionSelected} firstMovie={this.state.index === 0}  />
          </View>
          {/* <FlashMessage position="top" /> */}
        </View>
        ) : this.state.detailsVisible ? (
          <View>
            {/* If details are visible, show movie details */}
            <CardDetailsExpanded currentItem={this.state.moviesData[this.state.index]} index={this.state.index} toggleMovieDetails={this.toggleMovieDetails} />
          </View>
        // ) : this.state.finishedRound ? (
        //   <View>
        //     {/* If details are visible, show movie details */}
        //     <Text style={{color: '#FFF'}}>Round finished</Text>
        //     <Button onPress={this.props.navigation.goBack} title="Refresh"/>
        //   </View>
        ) : (
          <View>
             {/* If some error ocurred, try to refresh */}
            <Button onPress={this.connect} title="Refresh"/>
          </View>
        )}
      </SafeAreaView>
    );
  }
}


const styles = StyleSheet.create({
  swiperContainer:{
    flex: 0.8
  },
  bottomContainer: {
    justifyContent: 'space-evenly',
    flex: 0.12,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: 'transparent',
    marginBottom: 0,
    padding: 10
  },
  icon: {
    backgroundColor: colors.mainCard,
    borderRadius: 100,
    shadowColor: colors.black,
    shadowOffset: {width: 10, height: 10},
    padding: 10,
    justifyContent:'center',
    lineHeight:40
  },
  groupTitle: {
    color: '#fff',
    textAlign: 'left',
    fontSize: 13,
    padding: 10,
  }
});


export default PickMovie;