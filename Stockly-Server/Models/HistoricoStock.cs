using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class HistoricoStock
{
    public int Id { get; set; }

    public int? IdStockEstado { get; set; }

    public int? StockInicial { get; set; }

    public int? StockFinal { get; set; }

    public string? Justificativa { get; set; }

    public DateTime? Data { get; set; }

    public virtual StocksPorEstado? IdStockEstadoNavigation { get; set; }
}
