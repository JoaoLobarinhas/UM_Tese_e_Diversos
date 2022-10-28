import React, {useState, useEffect, createRef} from 'react';
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback, SafeAreaView } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import YoutubePlayer from "react-native-youtube-iframe";
import { Dimensions } from 'react-native';
import Carousel from 'react-native-snap-carousel';

// Style
import stylesGlobal from '../../config/css'
import colors from '../../config/colors'
import { color } from 'react-native-reanimated';

class CardDetailsExpanded extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      playing: false,
      galleryItems: [
        "trailer", "cover"
      ]
    }
  }

  onStateChange(state) {
    if(state === "ended") {
      this.setState( { playing: false })
    }
  }

  togglePlaying() {
    this.setState({ play: !this.state.playing })
  }

  _renderItem = ({item, index}) => {
    if(item == "trailer") {
      return (
        <WebView
          mediaPlaybackRequiresUserAction={true}
          style={ styles.trailer }
          // get trailer video ID
          source={{uri: 'https://www.youtube.com/embed/' + this.props.currentItem.trailer.slice(this.props.currentItem.trailer.lastIndexOf('=') + 1) + '?rel=0' }}
          />
      )
    }
    if (item == "cover") {
      return <Image style={{margin: 10}} source={{uri: this.props.currentItem.profile_photo, width: 70, height: 100 }} />
    }
    return (
      <View>
        { item }
      </View>
    );
  }

  render(){
    var movieGenres = this.props.currentItem.genres.map((genre, key) => {
      return (
        <View key={key} style={ styles.genreSection }>
          <Text key={genre} style={[styles.text, {fontSize: 10, color: colors.white} ]}>{ genre }</Text>
        </View>
      )
    })

    var trailer = <WebView
      // onScroll={(e) => {e.preventDefault();}}
      scrollEnabled={false}
      mediaPlaybackRequiresUserAction={true}
      style={ styles.trailer }
      // get trailer video ID
      source={{uri: 'https://www.youtube.com/embed/' + this.props.currentItem.trailer.slice(this.props.currentItem.trailer.lastIndexOf('=') + 1) + '?rel=0' }}
      />
    var directedBy = <Text style={{color: colors.white, fontSize: 13}}>
        Directed By {this.props.currentItem.director}
      </Text>
    var movieYear = <Text style={[stylesGlobal.text, {fontSize: 12}]}>{this.props.currentItem.release_year}</Text>

    var ratings = <View style={styles.rating}>
        <Image style={{width: 40, height: 20, resizeMode: 'center'}} source={{uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/1200px-IMDB_Logo_2016.svg.png"}} />
        <Text style={[stylesGlobal.text, {textAlign: 'left'}]}>{this.props.currentItem.vote_average}</Text>
      </View>
    var cover = <Image style={ styles.cover } source={{uri: this.props.currentItem.profile_photo, width: 150, height: '100%' }} />

    var actors = this.props.currentItem.actors.map((actor) => {
      return (
        <View style={{ padding: 20 }}>
          <Text key={actor} style={[styles.text, {fontSize: 10, color: colors.white} ]}>{ actor }</Text>
        </View>
      )
    })

    var gallery = <ScrollView style={styles.gallery} horizontal>
        { cover }
        { trailer }
      </ScrollView>

    return(
      this.props.currentItem ?  (
        <View>
          <Text style={ styles.returnButton } onPress={this.props.toggleMovieDetails}>Return</Text>
          <ScrollView style={{ height: 520, marginBottom: 40 }}>
            <View style={styles.cardDetailsExpanded} key={this.props.index} >
              {/* <Image source={{ uri: this.props.currentItem.profile_photo }} style={styles.cardImage} /> */}
              {/* { trailer } */}
              { gallery }
              <View style={styles.details}>
                <View style={{ flexDirection: 'row' }}>
                  { movieGenres }
                </View>
                <View>
                  {/* { cover } */}
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={[stylesGlobal.text, {fontSize: 30, maxWidth: Dimensions.get('screen').width * 0.7}]}>{this.props.currentItem.title}</Text>
                    { ratings }
                  </View>
                  { movieYear }
                  { directedBy }
                </View>
                <Text style={[stylesGlobal.text, { marginTop: 20 }]}>{this.props.currentItem.description}</Text>
                <Text style={[stylesGlobal.text, {fontSize: 20, marginTop: 20}]}>Cast:</Text>
                <View style={{ flexDirection: 'row', textAlign: 'center' }}>
                  { actors }
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      ) : (<View><Text>Fail</Text></View>)
    );
  }
}

const styles = StyleSheet.create({
  cardDetailsExpanded: {
    borderRadius: 8,
    shadowRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 0},
    alignItems: 'flex-start',
    height: 600
  },
  cardImage: {
    height: '60%',
    width: '100%',
    resizeMode: 'cover',
  },
  rating: {
    alignSelf: 'flex-start',
    textAlign: 'right',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 70,
    marginTop: 10
  },
  details: {
    margin: 20
  },
  genreSection: {
    backgroundColor: colors.red,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 10,
    borderRadius: 10
  },
  returnButton: {
    backgroundColor: colors.red,
    textAlign: 'center',
    color: colors.white,
    padding: 10,
    fontSize: 16
  },
  trailer: {
    alignSelf:"center",
    alignContent:"center",
    width: Dimensions.get('window').width,
    height: 500
  },
  gallery: {
    padding: 5
  },
  cover: {
    resizeMode: 'center',
    shadowRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 10},
    marginHorizontal: 20
  }
});

export default CardDetailsExpanded;