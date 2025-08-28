import GestaoUtilizadores from "@/components/Administrador/GestaoUtilizadores";
import HistoricoTransferencias from "@/components/Administrador/HistoricoTransferencias";
import ManutencaoLocalizacoes from "@/components/Localizacoes/ManutencaoLocalizacoes";
import Representacao3d from "@/components/Localizacoes/Representacao3d";
import CriarPedidos from "@/components/Pedidos/CriarPedidos";
import TratarPedidos from "@/components/Pedidos/TratarPedidos";
import Inventario from "@/components/Produtos/Inventario";
import ManutencaoProdutos from "@/components/Produtos/ManutencaoProdutos";
import React, { JSX } from "react";


export const AvailableComponents: Record<string, JSX.Element> = {
    "Manutenção Produtos": <ManutencaoProdutos/>,
    "Inventário": <Inventario/>,
    "Tratar Pedidos": <TratarPedidos/>,
    "Criar Pedidos": <CriarPedidos/>,
    "Manutenção Localizções": <ManutencaoLocalizacoes/>,
    "Representação 3D": <Representacao3d/>,
    "Gestão de Utilizadores": <GestaoUtilizadores/>,
    "Historico de Transferencias": <HistoricoTransferencias/>
}