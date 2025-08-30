import GestaoUtilizadores from "@/components/Administrador/GestaoUtilizadores";
import HistoricoTransferencias from "@/components/Administrador/HistoricoTransferencias";
import ManutencaoLocalizacoes from "@/components/Localizacoes/ManutencaoLocalizacoes";
import Representacao3d from "@/components/Localizacoes/Representacao3d";
import Inventario from "@/components/Produtos/Inventario";
import ManutencaoProdutos from "@/components/Produtos/ManutencaoProdutos";
import Pedidos from "@/components/Transferências/Pedidos";
import React, { JSX } from "react";


export const AvailableComponents: Record<string, JSX.Element> = {
    "Manutenção Produtos": <ManutencaoProdutos/>,
    "Inventário": <Inventario/>,
    "Pedidos": <Pedidos/>,
    "Manutenção Localizções": <ManutencaoLocalizacoes/>,
    "Representação 3D": <Representacao3d/>,
    "Gestão de Utilizadores": <GestaoUtilizadores/>,
    "Historico de Transferencias": <HistoricoTransferencias/>
}