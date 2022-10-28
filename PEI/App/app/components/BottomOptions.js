import React, {useState, useEffect, createRef} from 'react';
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback, SafeAreaView } from 'react-native';

// Style
import {FontAwesome5} from '@expo/vector-icons';
import stylesGlobal from '../config/css'
import colors from '../config/colors'

class BottomOptions extends React.Component{
  constructor(props){
    super(props)
  }

  movieSeen(){
    this.props.bottomOptionSelected("seen")
  }

  movieAccept(){
    this.props.bottomOptionSelected("accept")
  }

  movieReject(){
    this.props.bottomOptionSelected("reject")
  }

  render(){
    return(
      <View style={styles.bottomOptions}>
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Text style={{color: colors.white, display: this.props.firstMovie > 0 ? "flex" : "none"}}>No</Text>
          <FontAwesome5
            name="times"
            size={40}
            backgroundColor='transparent'
            underlayColor='transparent'
            activeOpacity={.3}
            color={colors.red}
            onPress={() => this.movieReject()}
            style={styles.icon}
            />
        </View>
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Text style={{color: colors.white, display: this.props.firstMovie > 0 ? "flex" : "none"}}>Seen</Text>
          <FontAwesome5
            name="eye"
            size={40}
            backgroundColor='transparent'
            underlayColor='transparent'
            activeOpacity={.3}
            color={colors.yellow}
            onPress={() => this.movieSeen()}
            style={styles.icon}
            />
        </View>
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Text style={{color: colors.white, display: this.props.firstMovie > 0 ? "flex" : "none"}}>Yes</Text>
          <FontAwesome5
            name="check"
            size={40}
            backgroundColor='transparent'
            underlayColor='transparent'
            activeOpacity={.3}
            color={colors.green}
            onPress={() => this.movieAccept()}
            style={styles.icon}
            />
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  bottomOptions:{
    display: "flex",
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexGrow: 0
  },
});

export default BottomOptions;