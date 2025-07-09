import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        flex: 1
    },
    mainContent: {
        flex: 4
    }
});

const index = () => {

    return(
        <View style={styles.container}>
            <Sidebar style={styles.sidebar}/>
            <div style={styles.mainContent}>
                <Navbar/>
                custom content
            </div>
        </View>
    )
}

export default index;