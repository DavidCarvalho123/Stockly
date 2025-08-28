import { renderedObjectsToSave } from "@/models/Localizacoes"; //funciona
import { LoginForm, Token } from "@/models/Login";
import { InventoryForm } from "@/models/Stocks";
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = 'http://192.168.124.97:8082/api/';

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

// -------------------------------


// ----------- Produtos -----------

export const GetAllProducts = async () => {
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

export const GetProdutoById = async (id: number) => {
  try {
     const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
    const resp = await fetch(baseUrl + 'Produtos/GetProdutoById/' + id, {headers:{'Authorization':'Bearer ' + tokenObj.token}});
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Erro ao obter produto ${id}: ${errText}`);
    }
    return await resp.json();
  } else throw new Error('Erro no token');
  } catch (error) {
    console.error("Erro no GetProdutoById:", error);
    throw error;
  }
};

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

// -------------------------------


// ----------- Fornecedores -----------

export const GetAllSuppliers = async () => {
  var results: any = '';
   const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
  await fetch(baseUrl + 'Fornecedores/GetAllFornecedores', {headers:{'Authorization':'Bearer ' + tokenObj.token}})
    .then((resp) => resp.json())
    .then((json) => results = json)
    .catch((error) => console.error(error));
    }
  return results;
}

// ---------------------------------


// ----------- Departamentos -----------

export const GetAllDepartments = async () => {
  var results: any = '';
   const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
  await fetch(baseUrl + 'Departamentos/GetAllDepartamentos', {headers:{'Authorization':'Bearer ' + tokenObj.token}})
    .then((resp) => resp.json())
    .then((json) => results = json)
    .catch((error) => console.error(error));
    }
  return results;
}

// ---------------------------------


// ----------- Localizações -----------

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

export const GetStoredGraphics = async (localId:number) => {
    var results: any = '';
    const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
        await fetch(baseUrl + 'Localizacoes/GetStoredGraphics?localId='+localId, {headers:{'Authorization':'Bearer ' + tokenObj.token}})
                .then((resp) => resp.json())
                .then((json) => results = json)
                .catch((error) => console.error(error));
    }
    return results;
}

export const UpdatePosObject = async (newCoords: {coords:{x:number,y:number,z:number}, rotation: number},localId: number) => {
    var results: Response = new Response();
    const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
        await fetch(baseUrl + 'Localizacoes/UpdatePosObject?localId='+localId, {method:'PATCH',headers:{'Authorization':'Bearer ' + tokenObj.token,'Content-Type':'Application/json'},body: JSON.stringify(newCoords)})
                .then((resp) => resp.json())
                .then((json) => results = json)
                .catch((error) => console.error(error));
    }
    return results;
}

export const PostGraphicalChanges = async (data:renderedObjectsToSave[]) => {
    var results: Response = new Response();
    const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
        await fetch(baseUrl + 'Localizacoes/PostGraphicalChanges', {method:'POST',headers:{'Authorization':'Bearer ' + tokenObj.token,'Content-Type':'Application/json'},body: JSON.stringify(data)})
                .then((resp) => resp.json())
                .then((json) => results = json)
                .catch((error) => console.error(error));
    }
    return results;
}

export const GetAllLocals = async () => {
  let results: any[] = [];
  const auth = await AsyncStorage.getItem("jwtToken");
  if (!auth) return results;
  const tokenObj = JSON.parse(auth) as Token;

  try {
    const resp = await fetch(baseUrl + "Localizacoes/GetAllLocalizacoes", {
      headers: { Authorization: "Bearer " + tokenObj.token },
    });
    if (!resp.ok) {
      console.error("GetAllLocals failed:", resp.status, await resp.text());
      return results;
    }
    results = await resp.json();
  } catch (e) {
    console.error("GetAllLocals error:", e);
  }
  return results; // [{Id, Nome}] ou [{id, nome}]
};

export const GetLocalizacaoById = async (id: number) => {
  try {
     const auth = await AsyncStorage.getItem('jwtToken');
    if(auth !== null){
        const tokenObj = JSON.parse(auth) as Token;
      const resp = await fetch(baseUrl + 'Localizacoes/GetLocalizacaoById/' + id, {headers:{'Authorization':'Bearer ' + tokenObj.token}});
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Erro ao obter produto ${id}: ${errText}`);
      }
      return await resp.json();
  } else throw new Error('Erro no token');
  } catch (error) {
    console.error("Erro no GetLocalizacaoById:", error);
    throw error;
  }
};

export const EditarLocalizacao = async (id: number, local: any) => {
  const auth = await AsyncStorage.getItem("jwtToken");
  if (!auth) throw new Error("Token não encontrado. Faça login novamente.");
  const tokenObj = JSON.parse(auth) as { token: string };

  const resp = await fetch(baseUrl + `Localizacoes/EditarLocalizacao/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokenObj.token,
    },
    body: JSON.stringify(local),
  });

  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
};

export const CriarLocalizacao = async (local: any) => {
  try {
    const auth = await AsyncStorage.getItem('jwtToken');
    if (!auth) throw new Error('Token não encontrado. Faça login novamente.');
    const tokenObj = JSON.parse(auth) as { token: string };

    const resp = await fetch(baseUrl + 'Localizacoes/CriarLocalizacao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tokenObj.token
      },
      body: JSON.stringify(local)
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(errText || 'Erro ao criar localização');
    }

    return await resp.json();
  } catch (error) {
    console.error('Erro no CriarLocalizacao:', error);
    throw error;
  }
};

// ---------------------------------


// ----------- StocksPorEstado -----------

// Atualiza/define o stock mínimo num par (produto, local, estado)
export const SetStockMinimo = async (
  produtoId: number,
  localId: number,
  estado: number,
  stockMinimo: number
) => {
  const auth = await AsyncStorage.getItem("jwtToken");
  if (!auth) throw new Error("Token não encontrado. Faça login novamente.");
  const tokenObj = JSON.parse(auth) as { token: string };

  const resp = await fetch(
    baseUrl +
      `Stocks/SetStockMinimo?produtoId=${produtoId}&localId=${localId}&estado=${estado}&stockMinimo=${stockMinimo}`,
    {
      method: "PUT",
      headers: { Authorization: "Bearer " + tokenObj.token },
    }
  );

  if (!resp.ok) throw new Error(await resp.text());
  // alguns controllers devolvem vazio; para segurança:
  try { return await resp.json(); } catch { return true as any; }
};

// Ver stocks de um produto
export const GetStocksByProduto = async (produtoId: number) => {
  var results: any = [];
  const auth = await AsyncStorage.getItem("jwtToken");
  if (auth !== null) {
    const tokenObj = JSON.parse(auth) as Token;
    await fetch(baseUrl + `Stocks/GetStocksByProduto/${produtoId}`, {
      headers: { Authorization: "Bearer " + tokenObj.token },
    })
      .then((resp) => resp.json())
      .then((json) => (results = json))
      .catch((error) => console.error(error));
  }
  return results;
};

export const GetStocksInventory = async (localizacaoId: number) => {
  var results: any = [];
  const auth = await AsyncStorage.getItem("jwtToken");
  if (auth !== null) {
    const tokenObj = JSON.parse(auth) as Token;
    await fetch(baseUrl + `Stocks/GetStocksInventory/${localizacaoId}`, {
      headers: { Authorization: "Bearer " + tokenObj.token },
    })
      .then((resp) => resp.json())
      .then((json) => (results = json))
      .catch((error) => console.error(error));
  }
  return results;
};

export const UpdateInventory = async (localizacaoId: number, stocks: InventoryForm[]) => {
  const auth = await AsyncStorage.getItem("jwtToken");
  if (!auth) throw new Error("Token não encontrado. Faça login novamente.");
  const tokenObj = JSON.parse(auth) as { token: string };

  const resp = await fetch(baseUrl + `Stocks/UpdateInventory/${localizacaoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + tokenObj.token,
    },
    body: JSON.stringify(stocks),
  });

  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json();
}

// ---------------------------------


// -------- Estados --------

// devolve array [{Id, Estado1}] (ou {id, nome})
export const GetAllStates = async (): Promise<any[]> => {
  let results: any[] = [];
  const auth = await AsyncStorage.getItem("jwtToken");
  if (auth !== null) {
    const tokenObj = JSON.parse(auth) as Token;
    await fetch(baseUrl + "Estados/GetAllEstados", {
      headers: { Authorization: "Bearer " + tokenObj.token },
    })
      .then((resp) => resp.json())
      .then((json) => {
        results = [];
        json.forEach((e: any) => {
          results[e.id] = {id: e.id, Estado: e.estado1};   // <- usa o campo Estado1 da BD
        });
      })
      .catch((error) => console.error(error));
  }
  return results;
};

// ------------------------ Pedidos

// 1) Obter produto por EAN  -> Produtos/GetByEAN/{ean}
export const GetProdutoByEAN = async (ean: string) => {
  const auth = await AsyncStorage.getItem("jwtToken");
  if (!auth) return null;
  const tokenObj = JSON.parse(auth) as Token;

  try {
    const resp = await fetch(
      `${baseUrl}Produtos/GetByEAN/${encodeURIComponent(ean)}`,
      { headers: { Authorization: "Bearer " + tokenObj.token } }
    );
    if (!resp.ok) return null;
    const row = await resp.json();
    return { id: row.id ?? row.Id, nome: row.nome ?? row.Nome, ean: row.ean ?? row.EAN };
  } catch {
    return null;
  }
};


export const GetNextPedidoNumero = async () => {
  let numero = 1;
  const auth = await AsyncStorage.getItem('jwtToken');
  if (auth) {
    const { token } = JSON.parse(auth) as Token;
    const resp = await fetch(baseUrl + 'Pedidos/GetNextNumero', {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (!resp.ok) throw new Error(await resp.text());
    const json = await resp.json();
    numero = json?.numero ?? 1;
  }
  return numero;
};

type CreatePedidoPayload = {
  destinoId: number;
  estadoInicialId: number;
  estadoFinalId: number;
  linhas: { produtoId: number; quantidade: number; ean?: string }[];
};

export const CreatePedido = async (payload: CreatePedidoPayload) => {
  const auth = await AsyncStorage.getItem('jwtToken');
  if (!auth) throw new Error('Token não encontrado. Faça login novamente.');
  const { token } = JSON.parse(auth) as Token;

  const resp = await fetch(baseUrl + 'Pedidos/Create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) throw new Error(await resp.text());
  return await resp.json(); // { message, pedidoId, numero }
};