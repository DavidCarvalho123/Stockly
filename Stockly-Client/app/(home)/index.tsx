import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { AvailableComponents } from "@/libs/AvailableComponents";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ClickOutsideProvider } from 'react-native-click-outside';
import { SafeAreaView } from "react-native-safe-area-context";


const index = () => {
    const [MainComponentTitle, setMainComponentTitle] = useState<string>('');

    const updateCurrentMainComponent = (component: string) => () => {
        setMainComponentTitle(component)
    }

    if(Platform.OS == 'web'){
        return(
            <View style={styles.container}>
    
                <Sidebar parentStyle={styles.sidebar} updateComponent={updateCurrentMainComponent} />

                <View style={styles.mainWindow}>
                    <Navbar componentTitle={MainComponentTitle} updateComponent={(_:string) => () => {}}/>
                    {AvailableComponents[MainComponentTitle]}
                </View>
    
            </View>
        )
    }
    else{
        return (
            <ClickOutsideProvider>
                <Navbar componentTitle="" updateComponent={updateCurrentMainComponent} />
                <SafeAreaView>
                    {AvailableComponents[MainComponentTitle]}
                </SafeAreaView>
            </ClickOutsideProvider>
        )
    }
}

export default index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        flex: 1
    },
    mainWindow: {
        flex: 4
    }
});