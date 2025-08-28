export interface StocksInventario{
    id:number,
    ean: string,
    nome: string,
    departamento: string,
    stockAnt1:number,
    stockPic1:number,
    stockReal1?: number,
    stockAnt2:number,
    stockPic2:number,
    stockReal2?:number,
    stock3: number,
    stock4: number
}

export interface InventoryForm{
    produtoId: number,
    stockPic1:number,
    stockReal1: number,
    stockPic2:number,
    stockReal2:number,
}
