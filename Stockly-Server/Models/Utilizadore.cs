using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace Stockly_Server.Models;

public partial class Utilizadore : IdentityUser<int>
{
    public Utilizadore() : base() { }
    public string? Nome { get; set; }

    public string? NomeUtilizador { get; set; }
    
    public string? Password { get; set; }
    
    public string? Cargo { get; set; }

    public int? IdLocalizacao { get; set; }

    public int? IdDepartamento { get; set; }

    public int? IdAcesso { get; set; }

    public bool? Ativo { get; set; }

    public bool? IsLdap { get; set; }

    public DateTime? UltimoLogin { get; set; }

    public DateTime? CriadoEm { get; set; }

    public int? CriadoPor { get; set; }

    public virtual Acesso? IdAcessoNavigation { get; set; }

    public virtual Departamento? IdDepartamentoNavigation { get; set; }

    public virtual Localizaco? IdLocalizacaoNavigation { get; set; }

    public virtual ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}
