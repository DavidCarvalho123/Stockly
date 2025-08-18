using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class Produto
{
    public int Id { get; set; }

    public string? Ean { get; set; }

    public string Nome { get; set; } = null!;

    public bool? Ativo { get; set; }

    public int? IdDepartamento { get; set; }

    public float? Altura { get; set; }

    public float? Comprimento { get; set; }

    public float? Largura { get; set; }

    public string? TipoUnidade { get; set; }

    public float? PrecoCompra { get; set; }

    public float? PrecoVenda { get; set; }

    public int? Iva { get; set; }

    public int? IdFornecedor { get; set; }

    public int? QuantidadeMinimaPedido { get; set; }

    public virtual Departamento? IdDepartamentoNavigation { get; set; }

    public virtual Fornecedore? IdFornecedorNavigation { get; set; }

    public virtual ICollection<LinhasPedido> LinhasPedidos { get; set; } = new List<LinhasPedido>();

    public virtual ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();

    public virtual ICollection<StocksPorEstado> StocksPorEstados { get; set; } = new List<StocksPorEstado>();
}
