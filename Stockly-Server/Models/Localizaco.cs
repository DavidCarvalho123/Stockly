using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Stockly_Server.Models;

public partial class Localizaco
{
    public int Id { get; set; }

    public string? Nome { get; set; }

    public string? Morada { get; set; }

    public string? CodPostal { get; set; }

    public int? LocalizacaoPai { get; set; }

    public bool? ArmazemCentral { get; set; }
    public bool? LocalReal { get; set; }
    public float? SizeX { get; set; }
    public float? SizeZ { get; set; }

    public float? CoordX { get; set; }

    public float? CoordY { get; set; }

    public float? CoordZ { get; set; }

    [NotMapped]
    public List<Localizaco> SubLocalizacao { get; set; }

    public virtual ICollection<Pedido> PedidoIdLocalizacaoDestinoNavigations { get; set; } = new List<Pedido>();

    public virtual ICollection<Pedido> PedidoIdLocalizacaoNavigations { get; set; } = new List<Pedido>();

    public virtual ICollection<StocksPorEstado> StocksPorEstados { get; set; } = new List<StocksPorEstado>();

    public virtual ICollection<Utilizadore> Utilizadores { get; set; } = new List<Utilizadore>();
}
