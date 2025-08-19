using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class LocalizacoesProduto
{
    public int Id { get; set; }

    public int? IdLocalizacao { get; set; }

    public int? IdStocksPorEstado { get; set; }

    public int? Quantidade { get; set; }

    public virtual Localizaco? IdLocalizacaoNavigation { get; set; }

    public virtual StocksPorEstado? IdStocksPorEstadoNavigation { get; set; }
}
