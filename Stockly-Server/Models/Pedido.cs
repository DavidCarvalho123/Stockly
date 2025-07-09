using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class Pedido
{
    public int Id { get; set; }

    public int? IdUtilizador { get; set; }

    public string? Observacoes { get; set; }

    public int? IdProdutoPedido { get; set; }

    public int? IdLocalizacao { get; set; }

    public int? IdLocalizacaoDestino { get; set; }

    public bool? Enviado { get; set; }

    public bool? Concluido { get; set; }

    public virtual Localizaco? IdLocalizacaoDestinoNavigation { get; set; }

    public virtual Localizaco? IdLocalizacaoNavigation { get; set; }

    public virtual Produto? IdProdutoPedidoNavigation { get; set; }

    public virtual Utilizadore? IdUtilizadorNavigation { get; set; }

    public virtual ICollection<LinhasPedido> LinhasPedidos { get; set; } = new List<LinhasPedido>();
}
