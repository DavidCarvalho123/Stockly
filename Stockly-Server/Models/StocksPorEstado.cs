using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class StocksPorEstado
{
    public int Id { get; set; }

    public int? IdLocalizacao { get; set; }

    public int? IdProduto { get; set; }

    public int? Quantidade { get; set; }

    public int? Estado { get; set; }

    public int? StockMinimo { get; set; }

    public virtual Estado? EstadoNavigation { get; set; }

    public virtual ICollection<HistoricoStock> HistoricoStocks { get; set; } = new List<HistoricoStock>();

    public virtual Localizaco? IdLocalizacaoNavigation { get; set; }

    public virtual ICollection<LocalizacoesProduto> LocalizacoesProdutos { get; set; } = new List<LocalizacoesProduto>();

    public virtual Produto? IdProdutoNavigation { get; set; }
}
