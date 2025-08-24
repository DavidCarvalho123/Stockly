using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stockly_Server.Models;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StocksController : ControllerBase
    {
        public StocksController() { }

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

        [HttpGet("GetStocksInventory/{localizacaoId}")]
        public IActionResult GetStocksInventory(int localizacaoId)
        {
            List<StocksInventarioShow> results = new List<StocksInventarioShow>();
            try
            {
                using (var context = new StocklyContext())
                {
                    var stocksraw = context.StocksPorEstados.Where(s => s.IdLocalizacao == localizacaoId).ToList();
                    foreach (var stock in stocksraw)
                    {
                        var prod = context.Produtos.Where(p => p.Id == stock.IdProduto).Select(p => new { p.Ean, p.Nome }).FirstOrDefault();
                        results.Add(new StocksInventarioShow()
                        {
                            Id = stock.Id,
                            Ean = prod.Ean,
                            Nome = prod.Nome,
                            StockAnt1 = stock.Estado == 1 ? stock.Quantidade : 0,
                            stockPic1 = 0,
                            stockReal1 = 0,
                            stockAnt2 = stock.Estado == 2 ? stock.Quantidade : 0,
                            stockPic2 = 0,
                            stockReal2 = 0,
                        });
                    }
                }
                return Ok(results);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }

    public class StocksInventarioShow()
    {
        public int Id { get; set; }
        public string Ean { get; set; }
        public string Nome { get; set; }
        public int? StockAnt1 { get; set; }
        public int? stockPic1 { get; set; }
        public int? stockReal1 { get; set; }
        public int? stockAnt2 { get; set; }
        public int? stockPic2 { get; set; }
        public int? stockReal2 { get; set; }
    }
}
