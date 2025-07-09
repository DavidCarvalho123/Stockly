using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class Departamento
{
    public int Id { get; set; }

    public string Nome { get; set; } = null!;

    public virtual ICollection<Produto> Produtos { get; set; } = new List<Produto>();

    public virtual ICollection<Utilizadore> Utilizadores { get; set; } = new List<Utilizadore>();
}
