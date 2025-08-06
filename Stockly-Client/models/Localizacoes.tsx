export interface TreeLocals{
    id: number;
    nome: string;
    morada?: string;
    codPostal?: string;
    localizacaoPai?: number;
    armazemCentral?: boolean;
    localReal?: boolean;
    sizeX: number;
    sizeZ: number;
    coordX?: number;
    coordY?: number;
    coordZ?: number;
    subLocalizacao: TreeLocals[];
}

export interface TreeData{ // obligatory object for tree view library
    key:string,
    label:string,
    index:number,
    id:number,
    sizeX:number,
    sizeZ:number,
    nodes?:TreeData[],
}