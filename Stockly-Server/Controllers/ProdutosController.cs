using Microsoft.AspNetCore.Authorization;//funciona
using Microsoft.AspNetCore.Mvc;
using Stockly_Server.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProdutosController : ControllerBase
    {
        public ProdutosController() { }

        // ============================
        // GET: Todos os produtos
        // ============================
        [HttpGet]
        [Route("GetAllProdutos")]
        public IActionResult GetAllProdutos()
        {
            List<ProdutosShow> results = new List<ProdutosShow>();
            using (var context = new StocklyContext())
            {
                var prods = context.Produtos.ToList();
                var availableDepartments = context.Departamentos
                    .Where(d => prods.Select(p => p.IdDepartamento).Contains(d.Id))
                    .ToDictionary(d => d.Id, d => d.Nome);

                if (availableDepartments.Count > 0)
                {
                    results = prods
                        .Where(p => availableDepartments.ContainsKey((int)p.IdDepartamento))
                        .Select(products =>
                            new ProdutosShow(products, availableDepartments[(int)products.IdDepartamento])
                        ).ToList();
                }
            }
            return Ok(results);
        }

        // ============================
        // GET: Produto por Id
        // ============================
        [HttpGet("GetProdutoById/{id}")]
        public IActionResult GetProdutoById(int id)
        {
            using var context = new StocklyContext();
            var produto = context.Produtos.FirstOrDefault(p => p.Id == id);
            if (produto == null) return NotFound();
            
            const int estadoFrenteLoja = 3;
            const int localPadrao = 1;
            
            var spe = context.StocksPorEstados
                .FirstOrDefault(s =>
                    s.IdProduto == id &&
                    s.Estado == estadoFrenteLoja &&
                    s.IdLocalizacao == localPadrao);

            var stockMin = spe?.StockMinimo ?? 0;

            return Ok(new {
                id = produto.Id,
                nome = produto.Nome,
                ean = produto.Ean,
                idDepartamento = produto.IdDepartamento,
                idFornecedor = produto.IdFornecedor,
                tipoUnidade = produto.TipoUnidade,
                altura = produto.Altura,
                largura = produto.Largura,
                comprimento = produto.Comprimento,
                precoCompra = produto.PrecoCompra,
                precoVenda = produto.PrecoVenda,
                iva = produto.Iva,
                ativo = produto.Ativo,
                stockMinimo = stockMin
            });
        }


        // ============================
        // POST: Criar Produto
        // ============================
        [HttpPost]
        [Route("CriarProduto")]
        [Authorize]
        public IActionResult CriarProduto([FromBody] ProdutoFormModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Nome) ||
                string.IsNullOrWhiteSpace(model.CodigoEAN) ||
                string.IsNullOrWhiteSpace(model.Departamento) ||
                string.IsNullOrWhiteSpace(model.Fornecedor) ||
                string.IsNullOrWhiteSpace(model.Unidade) ||
                string.IsNullOrWhiteSpace(model.PrecoCompra) ||
                string.IsNullOrWhiteSpace(model.PrecoVenda) ||
                string.IsNullOrWhiteSpace(model.Iva))
            {
                return BadRequest(new { message = "Campos obrigatórios em falta." });
            }

            try
            {
                using (var context = new StocklyContext())
                {
                    var produto = new Produto
                    {
                        Nome = model.Nome,
                        Ean = model.CodigoEAN,
                        IdDepartamento = int.Parse(model.Departamento),
                        IdFornecedor = int.Parse(model.Fornecedor),
                        TipoUnidade = model.Unidade,
                        Altura = string.IsNullOrWhiteSpace(model.Altura) ? null : float.Parse(model.Altura),
                        Largura = string.IsNullOrWhiteSpace(model.Largura) ? null : float.Parse(model.Largura),
                        Comprimento = string.IsNullOrWhiteSpace(model.Comprimento) ? null : float.Parse(model.Comprimento),
                        PrecoCompra = float.Parse(model.PrecoCompra),
                        PrecoVenda = float.Parse(model.PrecoVenda),
                        Iva = int.Parse(model.Iva),
                        Ativo = model.Ativo
                    };

                    context.Produtos.Add(produto);
                    context.SaveChanges();

                    return Ok(new { message = "Produto criado com sucesso!", produto.Id });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar produto", error = ex.Message });
            }
        }

        // ============================
        // PUT: Editar Produto
        // ============================
        [HttpPut]
        [Route("EditarProduto/{id}")]
        [Authorize]
        public IActionResult EditarProduto(int id, [FromBody] ProdutoFormModel model)
        {
            using var context = new StocklyContext();
            var produto = context.Produtos.FirstOrDefault(p => p.Id == id);

            if (produto == null) return NotFound(new { message = "Produto não encontrado" });

            try
            {
                produto.Nome = model.Nome;
                produto.Ean = model.CodigoEAN;
                produto.IdDepartamento = int.Parse(model.Departamento);
                produto.IdFornecedor = int.Parse(model.Fornecedor);
                produto.TipoUnidade = model.Unidade;
                produto.Altura = string.IsNullOrWhiteSpace(model.Altura) ? null : float.Parse(model.Altura);
                produto.Largura = string.IsNullOrWhiteSpace(model.Largura) ? null : float.Parse(model.Largura);
                produto.Comprimento = string.IsNullOrWhiteSpace(model.Comprimento) ? null : float.Parse(model.Comprimento);
                produto.PrecoCompra = float.Parse(model.PrecoCompra);
                produto.PrecoVenda = float.Parse(model.PrecoVenda);
                produto.Iva = int.Parse(model.Iva);
                produto.Ativo = model.Ativo;

                context.SaveChanges();
                return Ok(new { message = "Produto atualizado com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar produto", error = ex.Message });
            }
        }

        // ============================
        // GET: Departamentos
        // ============================
        [HttpGet]
        [Route("GetAllDepartamentos")]
        public IActionResult GetAllDepartamentos()
        {
            using var context = new StocklyContext();
            var departamentos = context.Departamentos
                .Select(d => new { d.Id, d.Nome })
                .ToList();
            return Ok(departamentos);
        }

        // ============================
        // GET: Fornecedores
        // ============================
        [HttpGet]
        [Route("GetAllFornecedores")]
        public IActionResult GetAllFornecedores()
        {
            using var context = new StocklyContext();
            var list = context.Fornecedores
                .Select(f => new { f.Id, f.Nome })
                .ToList();
            return Ok(list);
        }
        
        [HttpPut("SetStockMinimo")]
        public IActionResult SetStockMinimo(int produtoId, int localId, int estado, int stockMinimo)
        {
            try
            {
                using (var context = new StocklyContext())
                {
                    var entry = context.StocksPorEstados
                        .FirstOrDefault(s => s.IdProduto == produtoId && s.IdLocalizacao == localId && s.Estado == estado);

                    if (entry == null)
                    {
                        entry = new StocksPorEstado
                        {
                            IdProduto = produtoId,
                            IdLocalizacao = localId,
                            Estado = estado,
                            Quantidade = 0,
                            StockMinimo = stockMinimo
                        };
                        context.StocksPorEstados.Add(entry);
                    }
                    else
                    {
                        entry.StockMinimo = stockMinimo;
                    }

                    context.SaveChanges();
                    return Ok(entry);
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet("GetStocksByProduto/{produtoId}")]
        public IActionResult GetStocksByProduto(int produtoId)
        {
            List<StocksPorEstado> results = new List<StocksPorEstado>();
            try
            {
                using (var context = new StocklyContext())
                {
                    results = context.StocksPorEstados

                        .Where(s => s.IdProduto == produtoId)
                        .ToList();

                }
                    return Ok(results);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
        
        
    }

    // ============================
    // DTO para exibir produto na tabela
    // ============================
    public class ProdutosShow
    {
        public int Id { get; set; }
        public string? Ean { get; set; }
        public string Nome { get; set; } = null!;
        public bool? Ativo { get; set; }
        public string? Departamento { get; set; }
        public string? TipoUnidade { get; set; }
        public float? PrecoVenda { get; set; }
        public float? PrecoCompra { get; set; }
        public int? Iva { get; set; }
        public float? Comprimento { get; set; }
        public float? Altura { get; set; }
        public float? Largura { get; set; }
        

        public ProdutosShow(Produto prod, string departmentName)
        {
            Id = prod.Id;
            Ean = prod.Ean;
            Nome = prod.Nome;
            Ativo = prod.Ativo;
            Departamento = departmentName;
            TipoUnidade = prod.TipoUnidade;
            PrecoVenda = prod.PrecoVenda;
            PrecoCompra = prod.PrecoCompra;
            Iva = prod.Iva;
            Comprimento = prod.Comprimento;
            Altura = prod.Altura;
            Largura = prod.Largura;
        }
    }
}
