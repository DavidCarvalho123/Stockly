import React from "react";
import { StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#d9d9d9',
    },
});

interface Props {
    style: any
}

const Sidebar: React.FC<Props> = ({ style }: any) => {

    return(
        <>
            <View style={[styles.container, style]}>
                test
            </View>
        </>
    );
}

export default React.memo(Sidebar);