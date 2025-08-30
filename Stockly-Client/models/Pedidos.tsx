export interface PedidosTransferencia{
    id: number,
    origem: number,
    destino: number,
    estadoInicial: number,
    estadoFinal: number,
    observacoes: string
    concluido: boolean
}