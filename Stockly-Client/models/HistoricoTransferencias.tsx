export interface HistoricoManutencao {
    id: number;
    produto: string;
    localizacao: string;
    estado: string;
    stockInicial: number;
    stockFinal: number;
    justificativa: string;
    data: Date;
    idLinhaPedido?: number | null; // nullable
}