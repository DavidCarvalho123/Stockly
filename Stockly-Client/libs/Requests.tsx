import { LoginForm, Token } from "@/models/Login";
import AsyncStorage from '@react-native-async-storage/async-storage';


const baseUrl = 'http://192.168.1.81:8082/api/'

// JWT-based login

export const Login = async (loginForm:LoginForm) => {
    var results: Response = new Response();
    await fetch(baseUrl + 'Token/login', {method:'POST',headers: { 'Content-Type':'Application/json'}, body: JSON.stringify(loginForm)})
            .then((resp) => results = resp)
            .catch((error) => console.error(error));
    return results;
}

export const TestConnection = async () => {
    var status: number = 510;
    const auth = await AsyncStorage.getItem('jwtToken');
    if (auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
        await fetch(baseUrl + 'Token/TestConnection', {headers: {'Authorization':'Bearer ' + tokenObj.token}})
                .then((resp) => status = resp.status)
                .catch((error) => console.error(error));
    }
    return status
}

// -----------


// Produtos

export const GetAllPoducts = async () => {
    var results: any = '';
    const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
        await fetch(baseUrl + 'Produtos/GetAllProdutos', {headers:{'Authorization':'Bearer ' + tokenObj.token}})
                .then((resp) => resp.json())
                .then((json) => results = json)
                .catch((error) => console.error(error));
    }
    return results;
}

// -----------

// Localizações

export const GetTreeLocals = async () => {
    var results: any = '';
    const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
        await fetch(baseUrl + 'Localizacoes/GetTreeLocations', {headers:{'Authorization':'Bearer ' + tokenObj.token}})
                .then((resp) => resp.json())
                .then((json) => results = json)
                .catch((error) => console.error(error));
    }
    return results;
}

// -----------