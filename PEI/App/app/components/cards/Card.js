import React, {useState, useEffect, createRef} from 'react';
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback, SafeAreaView } from 'react-native';

// Style
import stylesGlobal from '../../config/css'
import colors from '../../config/colors'

class Card extends React.Component{
  render(){
    return(
      <View style={styles.card}>
        <Image source={{ uri: this.props.card.profile_photo }} style={styles.cardImage} />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  card: {
    marginTop: -60,
    flex: 0.6,
    borderRadius: 8,
    shadowRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 0},
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.mainCard
  },
  cardImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 8
  },
});

export default Card;