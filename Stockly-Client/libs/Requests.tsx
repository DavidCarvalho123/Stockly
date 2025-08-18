import { LoginForm, Token } from "@/models/Login";
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = 'http://localhost:8082/api/'

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

// ----------- Produtos -----------

export const GetAllPoducts = async () => {
  var results: any = '';
  await fetch(baseUrl + 'Produtos/GetAllProdutos')
    .then((resp) => resp.json())
    .then((json) => results = json)
    .catch((error) => console.error(error));
  return results;
}

// Fornecedores
export const GetAllSuppliers = async () => {
  var results: any = '';
  await fetch(baseUrl + 'Produtos/GetAllFornecedores')
    .then((resp) => resp.json())
    .then((json) => results = json)
    .catch((error) => console.error(error));
  return results;
}

// Departamentos
export const GetAllDepartments = async () => {
  var results: any = '';
  await fetch(baseUrl + 'Produtos/GetAllDepartamentos')
    .then((resp) => resp.json())
    .then((json) => results = json)
    .catch((error) => console.error(error));
  return results;
}

// Criar produto
export const CriarProduto = async (produto: any) => {
  try {
    const auth = await AsyncStorage.getItem('jwtToken');
    if (!auth) throw new Error('Token não encontrado. Faça login novamente.');
    const tokenObj = JSON.parse(auth) as { token: string };

    const resp = await fetch(baseUrl + 'Produtos/CriarProduto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tokenObj.token
      },
      body: JSON.stringify(produto)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(errText || 'Erro ao criar produto');
    }

    return await resp.json();
  } catch (error) {
    console.error('Erro no CriarProduto:', error);
    throw error;
  }
};

// GET produto por ID
export const GetProdutoById = async (id: number) => {
  try {
    const resp = await fetch(baseUrl + 'Produtos/GetProdutoById/' + id);
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Erro ao obter produto ${id}: ${errText}`);
    }
    return await resp.json();
  } catch (error) {
    console.error("Erro no GetProdutoById:", error);
    throw error;
  }
};

// PUT editar produto
export const EditarProduto = async (id: number, produto: any) => {
  const auth = await AsyncStorage.getItem("jwtToken");
  if (!auth) throw new Error("Token não encontrado. Faça login novamente.");
  const tokenObj = JSON.parse(auth) as { token: string };

  const resp = await fetch(baseUrl + `Produtos/EditarProduto/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokenObj.token,
    },
    body: JSON.stringify(produto),
  });

  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
};
