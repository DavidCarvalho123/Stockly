using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class Fornecedore
{
    public int Id { get; set; }

    public string Nome { get; set; } = null!;

    public string? Morada { get; set; }

    public string? Nif { get; set; }

    public string? Email { get; set; }

    public string? ContactoTelefonico { get; set; }

    public virtual ICollection<Produto> Produtos { get; set; } = new List<Produto>();
}
