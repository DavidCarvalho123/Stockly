import { AuthContext } from "@/libs/AuthContext";
import { Colours } from "@/libs/Constants";
import { Login } from "@/libs/Requests";
import Style from "@/libs/Style";
import { Redirect } from "expo-router";
import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const login = () => {
    const { control, handleSubmit, formState: { errors } } = useForm({defaultValues: {username:'',password:''}})
    const [FailedLogin, setFailedLogin] = useState(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const auth = useContext(AuthContext);

    
    const submitForm = async (data:{username: string;password: string;}) => {
        setFailedLogin(false);
        setIsProcessing(true);
        let result = await Login(data);
        if(result.status >= 200 && result.status < 300){
            const json = await result.json();
            auth.logIn(json);
        }
        else{
            setFailedLogin(true);
        }
        setIsProcessing(false);
    }

        if(auth.isLoggedIn){return <Redirect href={"/"}/>;}
        return (
        <>
         <View style={styles.container}>
            <View style={[styles.loginForm, Platform.OS == 'web' ? {width:400} : {width:300}]}>
                <Text style={Style.StocklyTitle}>Stockly</Text>
                <View style={[styles.textInputViews,{marginTop: 50}]}>
                    <Controller control={control} rules={{required: true}} 
                    render={({field}) => (
                        <TextInput style={styles.textInputs} placeholder="Nome de Utilizador" placeholderTextColor={'#c2c2c2ff'}
                        value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} />
                    )}
                    name='username' />
                    {errors.username && <Text style={styles.errorText}>Nome de Utilizador é obrigatório</Text>}
                </View>
                <View style={styles.textInputViews}>
                    <Controller control={control} rules={{required: true}} 
                    render={({field}) => (
                        <TextInput style={styles.textInputs} placeholder="Password" placeholderTextColor={'#c2c2c2ff'} secureTextEntry={true}
                        value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} />
                    )}
                    name='password' />
                    {errors.password && <Text style={styles.errorText}>Password é obrigatório</Text>}
                </View>
                <View style={styles.submitView}>
                <View style={styles.failedLogin}>
                    {FailedLogin ? <Text style={{color: '#ffffff'}}>Utilizador ou Password inválidos.</Text> : <></>}
                </View>
                <ActivityIndicator size="large" color={'white'} animating={isProcessing}/>
                    <Pressable style={[Style.buttonPrimary, styles.submitButton,{ opacity:isProcessing ? 0.5 : 1 }]} onPress={handleSubmit(submitForm)} disabled={isProcessing}>
                        <Text style={Style.textButtonPrimary} >Entrar</Text>
                    </Pressable>
                </View>
            </View>
        </View>
        </>
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
        height: '60%',
        borderRadius: 15,
        boxShadow: '4px 5px 3px 5px rgb(191 191 191);',
        paddingTop: 40
    },
    textInputViews:{
        display:'flex',
        alignItems:'center',
        marginBottom: 20
    },
    textInputs:{
        backgroundColor: '#F4F6FA',
        borderColor:'grey',
        borderWidth:1,
        width:250,
        borderRadius: 5,
        height: 40,
        color:'#5f5f5f',
        paddingLeft: 10,
        fontStyle: 'italic'
    },
    submitButton:{
        marginTop: 20,
        width: '80%',
        
    },
    submitView: {
        display:'flex',
        alignItems: 'center',
        marginTop: 20,
    },
    errorText: {
        color: '#ffffff',
        textDecorationLine: 'underline'
    },
    failedLogin: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 20,
        
    }
})