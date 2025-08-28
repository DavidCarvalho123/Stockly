export interface TreeLocals{
    id: number;
    nome: string;
    morada?: string;
    codPostal?: string;
    localizacaoPai?: number;
    armazemCentral?: boolean;
    localReal?: boolean;
    sizeX: number;
    sizeY?: number;
    sizeZ: number;
    coordX?: number;
    coordY?: number;
    coordZ?: number;
    rotation?: number;
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

export interface FurnitureTypes{
  name:string,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  renderColour?: string
}

export interface renderedObjectsToSave{
    obj: FurnitureTypes,
    localPai: number,
    position: {x:number,y:number,z:number},
    rotation: number
}

export interface localizacaoForm{
    nome: string,
    morada: string,
    codPostal: string,
    localizacaoPai: number,
    armazemCentral: boolean,
    sizeX: number,
    sizeZ: number
}