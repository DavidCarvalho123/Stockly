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

// Tipos
export interface ProdutoForm {
  nome: string;
  codigoEAN: string;
  departamento: string; // ID como string
  fornecedor: string;   // ID como string
  unidade: string;      // texto
  stockMinimo?: string; // opcional
  altura?: string;
  largura?: string;
  comprimento?: string;
  precoCompra: string;
  precoVenda: string;
  iva: string;          // ID como string
  ativo: boolean;
}
