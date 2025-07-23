import { Colours } from "@/libs/Constants";
import Style from "@/libs/Style";
import React from "react";
import { StyleSheet, Text, View } from "react-native";


const login: React.FC = () => {

    return (
        <View style={styles.container}>
            <View style={styles.loginForm}>
                <Text style={Style.StocklyTitle}>Stockly</Text>
            </View>
        </View>
    );
}

export default login;

const styles = StyleSheet.create({
    container:{
        display: 'flex',
        alignContent: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        height: '100%'
    },
    loginForm:{
        backgroundColor: Colours.loginBlue,
        width: '20%',
        height: '50%',
        borderRadius: 15,
        boxShadow: '4px 5px 3px 5px rgb(191 191 191);',
        paddingTop: 40
    }
})