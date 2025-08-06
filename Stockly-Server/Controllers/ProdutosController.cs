using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stockly_Server.Models;
using System.Linq;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProdutosController : ControllerBase
    {
        public ProdutosController() { }

        [HttpGet]
        [Route("GetAllProdutos")]
        public IActionResult GetAllProdutos()
        {
            List<ProdutosShow> results = new List<ProdutosShow>();
            using (var context = new StocklyContext())
            {
                var prods = context.Produtos.ToList();
                var availableDepartments = context.Departamentos.Where(d => prods.Select(p => p.IdDepartamento).Contains(d.Id)).ToDictionary(d => d.Id, d => d.Nome);
                if(availableDepartments.Count > 0)
                {
                    results = prods.Where(p => availableDepartments.ContainsKey((int)p.IdDepartamento)).Select(products => new ProdutosShow(products, availableDepartments[(int)products.IdDepartamento])).ToList();
                }
            }
            return Ok(results);
        }
    }

    public class ProdutosShow
    {
        public int Id { get; set; }

        public string? Ean { get; set; }

        public string Nome { get; set; } = null!;

        public bool? Ativo { get; set; }

        public string? Departamento { get; set; }

        public string? TipoUnidade { get; set; }

        public float? PrecoVenda { get; set; }

        public int? Iva { get; set; }
        public ProdutosShow(Produto prod, string departmentName)
        {
            Id = prod.Id;
            Ean = prod.Ean;
            Nome = prod.Nome;
            Ativo = prod.Ativo;
            Departamento = departmentName;
            TipoUnidade = prod.TipoUnidade;
            PrecoVenda = prod.PrecoVenda;
            Iva = prod.Iva;
        }
    }
}
