import { StyleSheet } from "react-native";
import { Colours } from "@/libs/Constants";

export default StyleSheet.create({
    StocklyTitle: {
        fontFamily: 'roboto',
        fontSize: 50,
        color: '#ffffff',
        textAlign: 'center'
    },
    buttonPrimary: {
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 30
    },
     buttonSecondary: {
        backgroundColor: Colours.stocklyBlue,
        marginBottom: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 30
    },
    textButtonPrimary:{
        textAlign: 'center',
        fontSize: 14,
        fontWeight:'400'
    },
    textButtonSecondary:{
        textAlign: 'center',
        fontSize: 14,
        fontWeight:'400',
        color: '#ffffff',

    },
    mobileButtonPrimary: {
        backgroundColor: '#ffffff',
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 30,
        width: '100%'
    },
    mobileTextButtonPrimary:{
        textAlign: 'center',
        fontSize: 14,
        fontWeight:'400'
    },
    title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#000000ff',
    textAlign: 'center',
  },
});