using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class Estado
{
    public int Id { get; set; }

    public string Estado1 { get; set; } = null!;

    public virtual ICollection<StocksPorEstado> StocksPorEstados { get; set; } = new List<StocksPorEstado>();
}
