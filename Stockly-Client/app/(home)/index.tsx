import BottomTabs from "@/components/BottomTabs";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { AuthContext } from "@/libs/AuthContext";
import { AvailableComponents } from "@/libs/AvailableComponents";
import { useContext, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { ClickOutsideProvider } from 'react-native-click-outside';


const index = () => {
    const [MainComponentTitle, setMainComponentTitle] = useState<string>('');
    const context = useContext(AuthContext);
    const updateCurrentMainComponent = (component: string) => () => {
        if(component != 'Representação 3D' )
        {
            context.set3D(false);
        }
        setMainComponentTitle(component);
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
                <View style={styles.mobileContainer}>
                    <Navbar componentTitle={MainComponentTitle} updateComponent={updateCurrentMainComponent} />
                    <View style={styles.activeMain}>
                        {AvailableComponents[MainComponentTitle]}
                    </View>
                    <BottomTabs currentComponent={MainComponentTitle} updateComponent={updateCurrentMainComponent} />
                </View>
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
    mobileContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    sidebar: {
        flex: 1
    },
    mainWindow: {
        flex: 5
    },
    activeMain: {
        flex: 3.5
    }
});