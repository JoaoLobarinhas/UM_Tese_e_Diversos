// Packages
import React, {useState, useEffect, createRef, useContext} from 'react';
import { StyleSheet, Text, Share, View, Image, TouchableOpacity, Alert, BackHandler, TouchableWithoutFeedback, SafeAreaView, Button, MaskedViewBase } from 'react-native';
import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";
// Style
import stylesGlobal from '../config/css'
import colors from '../config/colors'
import PickMovie from './PickMovie';
// Services
import RoomNumberContext from '../context/Room';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from "../config/axios";
import WebSocketSessions from '../config/WebSocketSessions'
// import Clipboard from '@react-native-community/clipboard';
import { Clipboard } from 'react-native'
import Toast from 'react-native-simple-toast';
import { ceil, round } from 'react-native-reanimated';
import { Inter_500Medium } from '@expo-google-fonts/inter';
import { ScrollView } from 'react-native-gesture-handler';


const ws = WebSocketSessions.instance.ws;

class GroupPage extends React.Component{

  static roomNumberContext = RoomNumberContext

  constructor(props){
    super(props);
    this.state = {
      userID: null,
      isAdmin: false,
      roomNumber: null,
      usersOnline: [],
      chatSocket: null,
      openSocket: false,
      pickingMovie: false,
      moviesForRounds: [],
      userPickedMovies: [],
      pickedMovies: [],
      round: 0,
      totalUsersWantToChoose: 0,
      gotMatch: false,
      startRoundCountdown: false
    };
  }

  componentDidMount(){
    // when pressing back button on phone
    // if(this.state.QRCode && ws.readyState !== WebSocket.OPEN){
    //   ws.onopen = (event) =>{
    //     console.log("Reconnected.");
    //   };
    // }

    const roomNumber = this.props.route.params.idSession;
    SecureStore.getItemAsync('user_id').then((idUser)=>{
      this.setState({
        userID: idUser,
        roomNumber: roomNumber,
        QRCode: 'data:image/png;base64,'+this.props.route.params.QRCode,
        idSession: this.props.route.params.idSession,
        isAdmin: this.props.route.params.isAdmin
      })

      if(ws){
        this.state.chatSocket=true
      }

      // connect to room using WebSocket
      axiosInstance.get(`user/${idUser}`)
      .then(response => {
        this.setState({username: response.data.username}, () => {
          if(ws.readyState === WebSocket.OPEN){
            this.connect();
          } else {
            this.props.navigation.goBack();
            alert("Error when connecting to server. Try again. If problem persists, please restart the app.")
          }
        })
      })
      .catch(error => {
        console.log(error.message) })
    });
  }

  componentWillUnmount(){
    this.setState = (state,callback)=>{
      return;
    };
  }

  // using axios to fetch data
  getMoviesFromAPI = () => {
    var tmdbKey = "77a94847a9f04daeca63a30a6187448c";
    var apiURL = "https://api.themoviedb.org/3/tv/popular?api_key=";
    axiosInstance.get("sugestions&idSession=" + this.state.roomNumber)
    .then(response => {
      // console.log(response)
      this.separateMoviesForEachRound(response.data);
    })
    .catch(error => {
      console.log("No server")
      console.log(error);
    });
  }

  shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
  }


  // Set 10 movies for each round
  separateMoviesForEachRound = (moviesData) => {
    const totalMoviesEachRound = 9;
    moviesData = this.shuffleArray(moviesData);

    // Divide movies in groups of 10
    var moviesForRounds = moviesData.map( function(e,i){
      return i%totalMoviesEachRound===0 ? moviesData.slice(i, i+totalMoviesEachRound) : null;
    }).filter(function(e){ return e; });

    this.setState({moviesForRounds: moviesForRounds}, () => {
      this.adminSetStartRound(moviesForRounds)
      this.startPickingMovie(moviesForRounds)
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
        ws.send(JSON.stringify({
          userID: this.state.userID,
          room: this.state.roomNumber,
          action: "leave"
        }))
        axiosInstance.put("/session/" + this.state.userID + "&removeUser", {
          "id_session": this.props.route.params.idSession,
          "id_user": this.state.userID
        })
        .then( res => {
          var newAdmin = res.data.admin
          ws.send(JSON.stringify({
            userID: this.state.userID,
            room: this.state.roomNumber,
            data: { admin: this.state.isAdmin, username: this.state.username, newAdmin: newAdmin },
            action: "new_admin"
          }))
          // this.props.navigation.navigate("SessionPage");
          // Broadcast message that user is leaving
          this.props.navigation.goBack();
        })
        .catch(error => {
          console.log(error.message)
          // this.props.navigation.navigate("SessionPage");
          this.props.navigation.goBack();
        })
      }}
    ])
    return true;
  }

  // Connect to WebSocket
  connect = () => {
    // var socketPath = 'ws://10.0.2.2:9898/ws/room/' + '1234' + '?user=' + user;

    ws.onopen = (event) =>{
      console.log("WebSocketFriends is open now.");
    };

    ws.send(
      JSON.stringify({
        userID: this.state.userID,
        room: this.state.roomNumber ,
        data: { admin: this.state.isAdmin, username: this.state.username },
        action: "join"
      })
    )

    // Refresh online users data
    // ws.send(JSON.stringify({
    //   userID: this.state.userID,
    //   room: this.state.roomNumber,
    //   action: "refresh"
    // }))

    // Connect to WebSocket
    ws.onmessage = (e) => {
        // Get data sent from server
      var data = JSON.parse(e.data);
        // --)
        // FINISHING ROUND
      if(data.action && data.action === "finish_round"){
        var message = {user: data.user, message: data.message, action: data.action, usersData: data.usersFinishedRoundList, pickedMovies: data.pickedMovies, userPickedMovies: data.userPickedMovies};
        // get only first most picked
        var mostPickedMovie;
        message.pickedMovies.forEach(movie => {
          if(mostPickedMovie == null){
            mostPickedMovie = movie;
          }
          if(mostPickedMovie.total < movie.total){
            mostPickedMovie = movie;
          }
        });
        this.setState({openSocket: true, usersFinishedRound: message.usersData, pickedMovies: mostPickedMovie, userPickedMovies: message.userPickedMovies});
        // --
        // STARTING ROUND
      } else if(data.action && data.action === "start_round"){
        showMessage({
          message: data.user + " started round",
          type: "info"
        });
        this.setState({openSocket: true, moviesForRounds: data.moviesForRounds}, () => {
          this.startPickingMovie(data.moviesForRounds)
        });
      } else if(data.action && data.action === "user_wants_keep_movie"){
        this.setState({openSocket: true, totalUsersWantToChoose: data.totalUsersWantToChoose})
      } else if (data.action && data.action === "new_admin"){
        Toast.show(data.username + "" + data.message, Toast.LONG, Toast.BOTTOM)
        this.setState({openSocket: true, usersOnline: data.userList, isAdmin: data.username == this.state.username ? true : false});
      } else {
        var message = {user: data.user, message: data.message, action: data.action, usersData: data.userList};
        // Display information with data from room
        // -- Shows top popup with message
        if(message.action !== "refresh"){
          message.usersData.forEach(user => {
            if(user.userID == message.user){
              Toast.show(user.username + " " + message.message, Toast.LONG, Toast.BOTTOM)
            }
          });
        }
        // if user leaves room in the middle of choosing
        if(message.action == 'leave' && this.round != 0){
          this.endRoom();
        }

        this.setState({openSocket: true, usersOnline: message.usersData});
      }
      // if (message.action === "join"){
      //   this.setState({usersOnline: [...this.state.usersOnline, message.user]})
      // }
    };

    // When socket closes
    ws.onclose = (e) => {
      showMessage({
        message: 'Chat socket closed unexpectedly',
        type: "danger",
      });
      this.setState({openSocket: false})
    };

  }

  // Get data for when round is finished
  onRoundFinished = (round) => {
    this.setState({round: round});
  }

  // Only admin can press button to start round
  // So data is sent to socket to tell other users to start too
  adminSetStartRound = (moviesForRounds) => {
    // Admin sets start of round
    // -> Gets movies from API
    // -> sends signal to sockets (with movies get)
    // -> Everyone on the room receives response and round starts with movies
    ws.send(JSON.stringify({
      userID: this.state.userID,
      room: this.state.roomNumber,
      action: "start_round",
      data: moviesForRounds
    }));
  }

  // When button to start round is pressed
  startRound = () => {
    this.setState({startRoundCountdown: true}, () => {
      // start round after 3 seconds
      setTimeout( () => {
        this.setState({startRoundCountdown: false})
        // on first round get movies from api
        // and separate movies into each round
        // and open PickMovies page
        if(this.state.round == 0 || this.state.round + 1 == this.state.moviesForRounds.length){
          this.getMoviesFromAPI();
        } else {
          // on other rounds, get movies for this round
          // and open PickMovies page
          this.adminSetStartRound(this.state.moviesForRounds)
          this.startPickingMovie(this.state.moviesForRounds);
        }
      }, 3000);
    })
  }

  startPickingMovie = (moviesForRounds) => {
    // check if this is the last downloaded round
    // moviesForRounds.forEach((rounds, key) => {
    //   console.log("ROUND__________ ", key)
    //   rounds.forEach(movie => {
    //     console.log("MOVIE _____ " , movie.title)
    //   });
    // });
    this.props.navigation.navigate('PickMovie',
    {
      userID: this.state.userID,
      username: this.state.username,
      idSession: this.props.route.params.idSession,
      moviesData: moviesForRounds[ parseInt(this.state.round)],
      round: parseInt(this.state.round) + 1,
      onRoundFinished: this.onRoundFinished
    });
    // this.setState({ pickingMovie: true })
  }

  userWantsToChooseMovie = () => {
    ws.send(JSON.stringify({
      userID: this.state.userID,
      room: this.state.roomNumber,
      action: "user_wants_keep_movie"
    }))
  }

  chooseMovie = (pickedMovieID) => {
    for(var userID in this.state.userPickedMovies) {
      this.state.userPickedMovies[userID].forEach(movie => {
        // if user selected this movie
        console.log(movie.id_movie)
        if(movie.movie_id === pickedMovieID){
          // remove from user seeLater)
          console.log("remove see later")
          axiosInstance.put(`seeLater/${userID}&idMovie=${pickedMovieID}&delete`)
          .then(response => console.log(response.data))
          .catch(error => { console.log(error.message) })
          // add movie to history
          console.log("add to history")
          axiosInstance.put(`history/${userID}&idMovie=${pickedMovieID}`)
          .then(response => console.log(response.data))
          .catch(error => { console.log(error.message) })
        }
      });
    }
  }

  endRoom = () => {
    ws.send(JSON.stringify({
      userID: this.state.userID,
      room: this.state.roomNumber,
      action: "leave"
    }))
    // this.props.navigation.navigate("Sessions");
    this.props.navigation.goBack();
    axiosInstance.put("/session/" + this.state.userID + "&removeUser", {
      "id_session": this.props.route.params.idSession,
      "id_user": this.state.userID
    })
    .then( res => {
      // Broadcast message that user is leaving
      console.log(res.data)
    })
    .catch(error => {
      console.log(error.message)
      // this.props.navigation.navigate("Sessions");
    })
  }

  copyToClipboard = () => {
    Clipboard.setString(this.props.route.params.idSession)
    Toast.show("Copied to Clipboard", Toast.LONG, Toast.BOTTOM)
  }

  render(){
    // Don't show round number on first round
    var usersText = <Text></Text>;
    var roundNumber;
    var pickedMovies;
    var movieMatch = <></>;

    // if error on getting users list
    // if(this.state.usersOnline.length == 0 && this.state.userID) {
    //   axiosInstance.put("/session/" + this.state.userID + "&removeUser", {
    //     "id_session": this.props.route.params.idSession,
    //     "id_user": this.state.userID
    //   })
    //   .then( res => {
    //     // Broadcast message that user is leaving
    //     ws.send(JSON.stringify({
    //       userID: this.state.userID,
    //       room: this.state.roomNumber,
    //       action: "leave"
    //     }))
    //     this.props.navigation.navigate("SessionPage");
    //   }).catch(error => {
    //     console.log(error.message)
    //     alert("Error when connecting to room. Please try again. If the problem persists try restarting the app.")
    //   })
    // }

    var allUsersEndedRound = this.state.usersOnline && this.state.usersFinishedRound && this.state.usersFinishedRound.length && this.state.usersOnline.length && this.state.usersOnline.length == this.state.usersFinishedRound.length

    var gotMatch = this.state.totalUsersWantToChoose && this.state.usersOnline.length && this.state.totalUsersWantToChoose === this.state.usersFinishedRound.length

    if(this.state.pickedMovies && this.state.usersOnline && this.state.pickedMovies.total === this.state.usersOnline.length) {
      gotMatch = true;
    }
    if(gotMatch) {
      this.chooseMovie(this.state.pickedMovies.movie.id_movie)
    }

    // round finished secondary page
    if(this.state.round != 0 && this.state.usersFinishedRound && this.state.pickedMovies){
      roundNumber = <Text style={stylesGlobal.text}>{"Round #" + this.state.round + " Results"}</Text>
      pickedMovies = <View style={{ alignSelf: 'center' }}>
          <Image style={styles.selectedMovieCover} source={{ uri: this.state.pickedMovies.movie.profile_photo }} />
          <Text key={this.state.pickedMovies.movie.id} style={[stylesGlobal.text, {fontSize: 10} ]}>{this.state.pickedMovies.movie.title + " (" + this.state.pickedMovies.total + ")"}</Text>
        </View>
      movieMatch = ( <View style={{alignSelf: 'center'}}>
          <Text style={[stylesGlobal.text, {fontSize: 20, alignSelf: 'center', textAlign: 'center'}]}>We have a Match!</Text>
          <Text style={[stylesGlobal.text, {fontSize: 10, alignSelf: 'center', textAlign: 'center'}]}>Enjoy your movie!</Text>
          <Image style={styles.matchedMovieCover} source={{ uri: this.state.pickedMovies.movie.profile_photo }} />
          <Text key={this.state.pickedMovies.movie.id} style={[stylesGlobal.text, {fontSize: 10} ]}>{this.state.pickedMovies.movie.title}</Text>
          {/* <TouchableOpacity
            style={[stylesGlobal.button, styles.buttonLeave]}
            title="ReturnToSessionsPage"
            onPress={() => this.endRoom()}
            >
              <Text style={[stylesGlobal.textButton, {textAlign: 'center'}]}>Close Room</Text>
          </TouchableOpacity> */}
        </View>)
    }
      // movieMatch = ( <View style={{alignSelf: 'center'}}>
      //     <Text style={[stylesGlobal.text, {fontSize: 20}]}>We have a Match!</Text>
      //     <Image style={styles.matchedMovieCover} source={{ uri: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/wTLyzRc4Dr9dHgwh3EXUKnveA6Q.jpg' }} />
      //     <Text key={2} style={[stylesGlobal.text, {fontSize: 10} ]}>{"Finding Nemo"}</Text>
      //   </View>
      // )

    var shareGroup;
    shareGroup = <View style={[styles.share, { display: this.state.isAdmin ? "flex" : "none" }]}>
      <Text style={stylesGlobal.text}>Share Group</Text>
      <Image style={styles.qrCode} source={{uri: this.state.QRCode}}/>
      <TouchableOpacity
        style={[stylesGlobal.button, styles.buttonCopy]}
        title="ShareCodeButton"
        onPress={() => this.copyToClipboard()}
        >
          <Text style={stylesGlobal.textButton}>{this.props.route.params.idSession}</Text>
      </TouchableOpacity>
      <Text style={[stylesGlobal.text, {color:colors.whiteOpacity60, fontSize: 11}]}>(Click to copy)</Text>
    </View>

    // Show on first round
    var firstRoundData = (
      <>
      { roundNumber }
      <View style={styles.pickedMoviesSection}>
        { this.state.pickedMovies ?  pickedMovies : <Text></Text> }
      </View>
      <Text style={[stylesGlobal.text, {marginTop: 30}]}>{"Elements online:" }</Text>
      { this.state.usersOnline && this.state.usersOnline.length > 0 && this.state.usersOnline.map((user, key) => {
        return (<Text key={key} style={stylesGlobal.text}>{`${user.username} ${user.isAdmin ? " - Admin" : ""} `}</Text>)
      })}
      { shareGroup }
      </>)

    // Show after finishing each Round
    var resultsRoundsData = (
      <>
      <TouchableOpacity
        style={[stylesGlobal.button, styles.buttonStart, { backgroundColor: colors.secondaryGrey, marginTop: 20, marginBottom: 10, width: '100%', display: this.state.pickedMovies ? 'flex' : 'none'}]}
        title="StartPickMovieButton"
        onPress={() => this.userWantsToChooseMovie()}
        >
          <Text style={[styles.textButton]}>
            {`Choose "${this.state.pickedMovies && this.state.pickedMovies.movie ? this.state.pickedMovies.movie.title : ""}"`}
          </Text>
      </TouchableOpacity>
      <Text style={[stylesGlobal.text, {fontSize: 10, alignSelf: 'center', marginTop: 0, display: this.state.pickedMovies ? 'flex' : 'none'}]}>
        {`(${this.state.totalUsersWantToChoose} user wants to choose this movie)`}
      </Text>
      <Text style={[stylesGlobal.text, {fontSize: 10, alignSelf: 'center', marginTop: 0, display: this.state.pickedMovies ? 'none' : 'flex'}]}>
        {`No movies were picked on this round.`}
      </Text>
      { roundNumber }
      { this.state.pickedMovies && this.state.pickedMovies.length > 0 ? <Text style={stylesGlobal.text}>Most voted on last round:</Text> : <Text></Text>}
      <View style={styles.pickedMoviesSection}>
        { this.state.pickedMovies ?  pickedMovies : <Text></Text> }
      </View>
      <Text style={[stylesGlobal.text, {marginTop: 30}]}>{"Elements that finished last round:" }</Text>
      { this.state.usersFinishedRound && this.state.usersFinishedRound.length > 0 && this.state.usersFinishedRound.map((user, key) => {
        return (<Text key={key} style={stylesGlobal.text}>{`${user}`}</Text>)
      })}
      </>)

    var waitingForUsersToFinishRound = (
      <View style={{alignSelf: 'center'}}>
        <Text style={[stylesGlobal.text, {fontSize: 20, alignSelf: 'center', textAlign: 'center', marginTop: 20}]}>Waiting for all users to end round...</Text>
        <Text style={[stylesGlobal.text, {marginTop: 30}]}>{"Elements that finished last round:" }</Text>
        { this.state.usersFinishedRound && this.state.usersFinishedRound.length > 0 && this.state.usersFinishedRound.map((user, key) => {
          return (<Text key={key} style={stylesGlobal.text}>{`${user}`}</Text>)
        })}
      </View>
    )

    // Check if user is admin or not (hide start button if not)
    var showStartButton = !gotMatch && (allUsersEndedRound || this.state.round == 0) ? "flex" : "none";
    var startButtonPosition = this.state.isAdmin && !gotMatch && (allUsersEndedRound || this.state.round == 0)  ? "absolute" : "relative";
    var startRoundText = this.state.startRoundCountdown ? "Starting Round in 3 sec..." : this.state.isAdmin ? "Start New Round" : "Waiting for Admin to Start..."
    // var showLeaveRoomButton = this.state.round == 0 ? "flex" : "none" ;

    return(
      <RoomNumberContext.Provider value={this.props.route.params.idSession}>
        <SafeAreaView style={stylesGlobal.app}>
        {ws ? (
          <ScrollView>
          <TouchableOpacity
            style={[stylesGlobal.button, styles.buttonStart, { display: showStartButton, position: startButtonPosition }]}
            title="StartPickMovieButton"
            disabled={this.state.isAdmin ? false : true}
            onPress={() => this.startRound()}
            >
              <Text style={[styles.textButton]}>{startRoundText}</Text>
          </TouchableOpacity>
          <View style={styles.groupSection}>
            {/* { movieMatch } */}
            <TouchableOpacity
              style={[stylesGlobal.button, styles.buttonLeave, { display: "flex" }]}
              title="LeaveRoomButton"
              onPress={() => this.exitRoom()}
              >
                <Text style={[styles.textButton]}>Leave Room</Text>
            </TouchableOpacity>
            { gotMatch ?
            movieMatch : this.state.round === 0 ? firstRoundData : allUsersEndedRound ? resultsRoundsData : waitingForUsersToFinishRound }
          </View>
          <FlashMessage position="top" />
          </ScrollView>
        ) : (
          <View><Text>Error...</Text></View>
        )}
        </SafeAreaView>
      </RoomNumberContext.Provider>
    );
  }
}


const styles = StyleSheet.create({
  groupSection: {
    padding: 30,
    margin: 'auto',
    marginTop: 30,
    backgroundColor: colors.mainCard,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 15
  },
  qrCode: {
    width: 200,
    height: 200,
    borderWidth: 1,
    margin: 'auto',
    borderRadius: 20
  },
  share: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonStart:{
    zIndex: 99,
    marginTop: 15,
    backgroundColor:colors.blue,
  },
  buttonLeave: {
    marginTop: 10,
    backgroundColor: colors.red
  },
  buttonCopy: {
    backgroundColor: colors.secondaryGrey,
    width: '50%'
  },
  textButton:{
    color:colors.white,
    fontSize : 16,
  },
  pickedMoviesSection :{
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  selectedMovieCover: {
    width: 140,
    height: 200,
    borderWidth: 1,
    margin: 'auto',
    borderRadius: 15
  },
  matchedMovieCover: {
    width: 200,
    height: 300,
    borderRadius: 5,
    alignSelf: 'center',
    borderColor: colors.red,
    borderWidth: 3,
    margin: 30,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 1,
    shadowRadius: 160.00,
  }
});

export default GroupPage;