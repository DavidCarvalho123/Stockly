using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Stockly_Server.Models;

public partial class StocklyContext : IdentityDbContext<Utilizadore, Acesso, int>
{
    public StocklyContext()
    {
    }

    public StocklyContext(DbContextOptions<StocklyContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Acesso> Acessos { get; set; }

    public virtual DbSet<Departamento> Departamentos { get; set; }

    public virtual DbSet<Estado> Estados { get; set; }

    public virtual DbSet<Fornecedore> Fornecedores { get; set; }

    public virtual DbSet<HistoricoStock> HistoricoStocks { get; set; }

    public virtual DbSet<LinhasPedido> LinhasPedidos { get; set; }

    public virtual DbSet<Localizaco> Localizacoes { get; set; }

    public virtual DbSet<Pedido> Pedidos { get; set; }

    public virtual DbSet<Produto> Produtos { get; set; }

    public virtual DbSet<StocksPorEstado> StocksPorEstados { get; set; }

    public virtual DbSet<LocalizacoesProduto> LocalizacoesProdutos { get; set; }

    public virtual DbSet<Utilizadore> Utilizadores { get; set; }


    public DbSet<IdentityUserClaim<int>> UserClaims { get; set; }
    public DbSet<IdentityUserRole<int>> UserRoles { get; set; }
    public DbSet<IdentityUserLogin<int>> UserLogins { get; set; }
    public DbSet<IdentityRoleClaim<int>> RoleClaims { get; set; }
    public DbSet<IdentityUserToken<int>> UserTokens { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySQL("Uid=root;Pwd=root;Database=Stockly;Server=localhost;Port=3306;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
        modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
        modelBuilder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
        modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");
        modelBuilder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");

        modelBuilder.Entity<Acesso>(entity =>
        {
            entity.ToTable("acessos");
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Name).HasMaxLength(20);
        });

        modelBuilder.Entity<Departamento>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Nome).HasMaxLength(50);
        });

        modelBuilder.Entity<Estado>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Estado1)
                .HasMaxLength(30)
                .HasColumnName("Estado");
        });

        modelBuilder.Entity<Fornecedore>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.ContactoTelefonico)
                .HasMaxLength(20)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Morada)
                .HasMaxLength(120)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Nif)
                .HasMaxLength(30)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("NIF");
            entity.Property(e => e.Nome).HasMaxLength(80);
        });

        modelBuilder.Entity<HistoricoStock>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.IdStockEstado, "IdStockEstado");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Data)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.IdStockEstado)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Justificativa)
                .HasMaxLength(255)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.StockFinal)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.StockInicial)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");

            entity.HasOne(d => d.IdStockEstadoNavigation).WithMany(p => p.HistoricoStocks)
                .HasForeignKey(d => d.IdStockEstado)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("historicostocks_ibfk_1");
        });

        modelBuilder.Entity<LinhasPedido>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.IdPedido, "IdPedido");

            entity.HasIndex(e => e.IdProduto, "IdProduto");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.DataPedido)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime")
                .HasColumnName("Data_Pedido");
            entity.Property(e => e.IdPedido)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdProduto)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Processado).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.QuantidadePedida)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");

            entity.HasOne(d => d.IdPedidoNavigation).WithMany(p => p.LinhasPedidos)
                .HasForeignKey(d => d.IdPedido)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("linhaspedidos_ibfk_1");

            entity.HasOne(d => d.IdProdutoNavigation).WithMany(p => p.LinhasPedidos)
                .HasForeignKey(d => d.IdProduto)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("linhaspedidos_ibfk_2");

            entity.HasOne(d => d.EstadoInicialNavigation)
                .WithMany()
                .HasForeignKey(d => d.EstadoInicial)
                .HasConstraintName("FK_LinhasPedidos_EstadoInicial");

            entity.HasOne(d => d.EstadoFinalNavigation)
                .WithMany()
                .HasForeignKey(d => d.EstadoFinal)
                .HasConstraintName("FK_LinhasPedidos_EstadoFinal");
        });

        modelBuilder.Entity<Localizaco>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.ArmazemCentral).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.CodPostal)
                .HasMaxLength(20)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.CoordX).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.CoordY).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.CoordZ).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.LocalizacaoPai)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Morada)
                .HasMaxLength(120)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Nome)
                .HasMaxLength(50)
                .HasDefaultValueSql("'NULL'");
        });

        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.IdLocalizacao, "IdLocalizacao");

            entity.HasIndex(e => e.IdLocalizacaoDestino, "IdLocalizacaoDestino");

       

            entity.HasIndex(e => e.IdUtilizador, "IdUtilizador");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Concluido).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Enviado).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.IdLocalizacao)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdLocalizacaoDestino)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdUtilizador)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Observacoes)
                .HasMaxLength(255)
                .HasDefaultValueSql("'NULL'");

            entity.HasOne(d => d.IdLocalizacaoNavigation).WithMany(p => p.PedidoIdLocalizacaoNavigations)
                .HasForeignKey(d => d.IdLocalizacao)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("pedidos_ibfk_3");

            entity.HasOne(d => d.IdLocalizacaoDestinoNavigation).WithMany(p => p.PedidoIdLocalizacaoDestinoNavigations)
                .HasForeignKey(d => d.IdLocalizacaoDestino)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("pedidos_ibfk_4");

            entity.HasOne(d => d.IdUtilizadorNavigation).WithMany(p => p.Pedidos)
                .HasForeignKey(d => d.IdUtilizador)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("pedidos_ibfk_1");
        });

        modelBuilder.Entity<Produto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.IdDepartamento, "IdDepartamento");

            entity.HasIndex(e => e.IdFornecedor, "IdFornecedor");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Altura).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Ativo).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Comprimento).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Ean)
                .HasMaxLength(14)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("EAN");
            entity.Property(e => e.IdDepartamento)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdFornecedor)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Iva)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)")
                .HasColumnName("IVA");
            entity.Property(e => e.Largura).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Nome).HasMaxLength(100);
            entity.Property(e => e.PrecoCompra).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.PrecoVenda).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.TipoUnidade)
                .HasMaxLength(20)
                .HasDefaultValueSql("'NULL'");

            entity.HasOne(d => d.IdDepartamentoNavigation).WithMany(p => p.Produtos)
                .HasForeignKey(d => d.IdDepartamento)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("produtos_ibfk_1");

            entity.HasOne(d => d.IdFornecedorNavigation).WithMany(p => p.Produtos)
                .HasForeignKey(d => d.IdFornecedor)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("produtos_ibfk_2");
        });

        modelBuilder.Entity<StocksPorEstado>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("StocksPorEstado");

            entity.HasIndex(e => e.Estado, "Estado");

            entity.HasIndex(e => e.IdLocalizacao, "IdLocalizacao");

            entity.HasIndex(e => e.IdProduto, "IdProduto");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Estado)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdLocalizacao)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdProduto)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Quantidade)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.StockMinimo)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");

            entity.HasOne(d => d.EstadoNavigation).WithMany(p => p.StocksPorEstados)
                .HasForeignKey(d => d.Estado)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("stocksporestado_ibfk_3");

            entity.HasOne(d => d.IdLocalizacaoNavigation).WithMany(p => p.StocksPorEstados)
                .HasForeignKey(d => d.IdLocalizacao)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("stocksporestado_ibfk_1");

            entity.HasOne(d => d.IdProdutoNavigation).WithMany(p => p.StocksPorEstados)
                .HasForeignKey(d => d.IdProduto)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("stocksporestado_ibfk_2");
        });

        modelBuilder.Entity<LocalizacoesProduto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("LocalizacoesProdutos");

            entity.HasIndex(e => e.IdLocalizacao, "IdLocalizacao");

            entity.HasIndex(e => e.IdStocksPorEstado, "IdStocksPorEstado");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.IdLocalizacao)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdStocksPorEstado)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Quantidade)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");

            entity.HasOne(d => d.IdLocalizacaoNavigation).WithMany(p => p.LocalizacoesProdutos)
                .HasForeignKey(d => d.IdLocalizacao)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_localizacoesprodutos_localizacoes");

            entity.HasOne(d => d.IdStocksPorEstadoNavigation).WithMany(p => p.LocalizacoesProdutos)
                .HasForeignKey(d => d.IdStocksPorEstado)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_localizacoesprodutos_stocksporestado");
        });

        modelBuilder.Entity<Utilizadore>(entity =>
        {
            entity.ToTable("utilizadores");
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.HasIndex(e => e.IdAcesso, "IdAcesso");

            entity.HasIndex(e => e.IdDepartamento, "IdDepartamento");

            entity.HasIndex(e => e.IdLocalizacao, "IdLocalizacao");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Ativo).HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Cargo)
                .HasMaxLength(50)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.CriadoEm)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");
            entity.Property(e => e.CriadoPor)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.IdAcesso)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdDepartamento)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IdLocalizacao)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("int(11)");
            entity.Property(e => e.IsLdap)
                .HasDefaultValueSql("'NULL'")
                .HasColumnName("IsLDAP");
            entity.Property(e => e.Nome)
                .HasMaxLength(80)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.NomeUtilizador)
                .HasMaxLength(15)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.Password)
                .HasMaxLength(64)
                .HasDefaultValueSql("'NULL'");
            entity.Property(e => e.UltimoLogin)
                .HasDefaultValueSql("'NULL'")
                .HasColumnType("datetime");

            entity.HasOne(d => d.IdAcessoNavigation).WithMany(p => p.Utilizadores)
                .HasForeignKey(d => d.IdAcesso)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("utilizadores_ibfk_3");

            entity.HasOne(d => d.IdDepartamentoNavigation).WithMany(p => p.Utilizadores)
                .HasForeignKey(d => d.IdDepartamento)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("utilizadores_ibfk_2");

            entity.HasOne(d => d.IdLocalizacaoNavigation).WithMany(p => p.Utilizadores)
                .HasForeignKey(d => d.IdLocalizacao)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("utilizadores_ibfk_1");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
