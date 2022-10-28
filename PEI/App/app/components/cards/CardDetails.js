import React, {useState, useEffect, createRef} from 'react';
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback, SafeAreaView } from 'react-native';

// Style
import stylesGlobal from '../../config/css'
import colors from '../../config/colors'

class CardDetails extends React.Component{
  render(){
    return(
      this.props.moviesData && this.props.moviesData.length > 0 ?  (
        <View style={styles.cardDetails} key={this.props.index}>
          <View>
            <Text style={[stylesGlobal.text, styles.title]}>{this.props.moviesData[this.props.index].title}</Text>
            <Text style={[stylesGlobal.text, styles.sinopse]}>{this.props.moviesData[this.props.index].description.substr(0, 150) + "\u2026"}</Text>
          </View>
          <View style={styles.rating}>
            <Image style={{width: 40, height: 20, resizeMode: 'center'}} source={{uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/1200px-IMDB_Logo_2016.svg.png"}} />
            <Text style={[stylesGlobal.text, {textAlign: 'right'}]}>{this.props.moviesData[this.props.index].vote_average}</Text>
          </View>
        </View>
      ) : (<View><Text>Fail</Text></View>)
    );
  }
}

const styles = StyleSheet.create({
  cardDetails:{
    backgroundColor: 'rgba(0,0,0, 0.7)',
    padding: 15,
    alignSelf: 'center',
    width: '90%',
    display: 'flex',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 20
  },
  sinopse: {
    fontSize: 12
  },
  rating: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 70
  }
});

export default CardDetails;