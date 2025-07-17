import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { AvailableComponents } from "@/libs/AvailableComponents";
import { useState } from "react";
import { StyleSheet, View } from "react-native";


const index = () => {
    const [MainComponentTitle, setMainComponentTitle] = useState<string>('');

    const updateCurrentMainComponent = (component: string) => () => {
        setMainComponentTitle(component)
    }

    return(
        <View style={styles.container}>

            <Sidebar parentStyle={styles.sidebar} updateComponent={updateCurrentMainComponent} />
            <View style={styles.mainWindow}>
                <Navbar componentTitle={MainComponentTitle}/>
                {AvailableComponents[MainComponentTitle]}
                    
              
            </View>

        </View>
    )
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