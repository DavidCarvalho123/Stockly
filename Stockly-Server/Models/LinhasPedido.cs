using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class LinhasPedido
{
    public int Id { get; set; }

    public int? IdPedido { get; set; }

    public int? IdProduto { get; set; }

    public int? QuantidadePedida { get; set; }

    public bool? Processado { get; set; }

    public DateTime? DataPedido { get; set; }
    
    public int EstadoInicial { get; set; }
    
    public int EstadoFinal { get; set; }

    public virtual Pedido? IdPedidoNavigation { get; set; }
    public virtual Produto? IdProdutoNavigation { get; set; }
    
    public virtual Estado? EstadoInicialNavigation { get; set; }
    
    public virtual Estado? EstadoFinalNavigation { get; set; }
    public virtual ICollection<HistoricoStock> HistoricoStocks { get; set; } = new List<HistoricoStock>();


}
