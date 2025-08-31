export interface PedidosTransferencia{
    id: number,
    origem: number,
    destino: number,
    estadoInicial: number,
    estadoFinal: number,
    observacoes: string
    concluido: boolean
}

export interface LinhaTratarShow {
    idLinha: number,
    ean: string;
    estadoInicial: string;
    estadoFinal: string;
    quantidadePedida: number;
    tratado: boolean;
}

export interface LinhaForm{
    id:number,
    quantity:number
}

export interface LinhaFormResponse{
    id: number,
    processado: boolean,
    error?:string
}