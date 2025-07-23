using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class Acesso : IdentityRole<int>
{
    public Acesso() : base() { }

    public virtual ICollection<Utilizadore> Utilizadores { get; set; } = new List<Utilizadore>();
}
