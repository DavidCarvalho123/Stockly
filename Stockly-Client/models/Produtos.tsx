export interface ProdutosManutencao{
    id: number,
    ean: string,
    nome: string,
    ativo: boolean,
    departamento: string,
    tipoUnidade: string,
    precoVenda: number,
    iva: number,
}