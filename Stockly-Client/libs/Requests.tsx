import { LoginForm } from "@/models/Login";

const baseUrl = 'http://localhost:8082/api/'

// JWT-based login

export const Login = async (loginForm:LoginForm) => {
    var results: any = '';
    await fetch(baseUrl + 'Token/login')
            .then((resp) => resp.json())
            .then((json) => results = json)
            .catch((error) => console.error(error));
    return results;
}

// -----------


// Produtos

export const GetAllPoducts = async () => {
    var results: any = '';
    await fetch(baseUrl + 'Produtos/GetAllProdutos')
            .then((resp) => resp.json())
            .then((json) => results = json)
            .catch((error) => console.error(error));
    return results;
}

// -----------

