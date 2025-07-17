import { Colours } from "@/libs/Constants";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
    componentTitle: string
}

const Navbar: React.FC<Props> = ({componentTitle}:Props) => {

    return(
        <>
            <View style={styles.container}>
                {componentTitle ? <Text style={styles.currentBodyTitle}>{componentTitle}</Text> : <View style={styles.emptyBody}></View>}
                
            </View>
        </>
    );
}

export default React.memo(Navbar);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colours.stocklyBlue,
        width: '100%',
        paddingTop: 11,
        paddingBottom: 10,
    },
    currentBodyTitle: {
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'roboto',
        marginStart: 20
    },
    emptyBody: {
        paddingTop:47
    }
});