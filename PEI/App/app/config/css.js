import { StyleSheet } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

import colors from '../config/colors'

export default StyleSheet.create({
    app: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: colors.main,
    },
    container: {
        flex: 1,
        backgroundColor: colors.main
    },
    text: {
        color: colors.white,
        fontFamily: 'Poppins_500Medium',
    },
    button:{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth:0,
        borderRadius:50,
        width: '70%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    textButton:{
        alignSelf:"center",
        fontSize: 14,
        fontFamily: 'Poppins_500Medium',
        color: colors.white
    },
    input: {
        backgroundColor: colors.whiteOpacity10,
        height: 60,
        width: 200,
        alignSelf: 'center',
        flexDirection: 'row',
        margin: 20,
        padding: 15,
        color: colors.white,
        borderRadius: 15
    }
})

