export interface StocksInventario{
    id:number,
    ean: string,
    nome: string,
    stockAnt1:number,
    stockPic1:number,
    stockReal1?: number,
    stockAnt2:number,
    stockPic2:number,
    stockReal2?:number
}