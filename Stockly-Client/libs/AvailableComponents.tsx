import GestaoUtilizadores from "@/components/Administrador/GestaoUtilizadores";
import HistoricoTransferencias from "@/components/Administrador/HistoricoTransferencias";
import ManutencaoLocalizacoes from "@/components/Localizacoes/ManutencaoLocalizacoes";
import Representacao3d from "@/components/Localizacoes/Representacao3d";
import Transferencias from "@/components/Pedidos/Transferencias";
import TratarPedidos from "@/components/Pedidos/TratarPedidos";
import Inventario from "@/components/Produtos/Inventario";
import ManutencaoProdutos from "@/components/Produtos/ManutencaoProdutos";
import React, { JSX } from "react";


export const AvailableComponents: Record<string, JSX.Element> = {
    "Manutenção Produtos": <ManutencaoProdutos/>,
    "Inventário": <Inventario/>,
    "Tratar Pedidos": <TratarPedidos/>,
    "Transferências": <Transferencias/>,
    "Manutenção Localizações": <ManutencaoLocalizacoes/>,
    "Representação 3D": <Representacao3d/>,
    "Gestão de Utilizadores": <GestaoUtilizadores/>,
    "Historico de Transferencias": <HistoricoTransferencias/>
}