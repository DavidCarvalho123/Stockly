using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
                        var prod = context.Produtos.Where(p => p.Id == stock.IdProduto).Select(p => new { p.Id,p.Ean, p.Nome, p.IdDepartamento }).FirstOrDefault();
                        string? dep = context.Departamentos.Where(p => p.Id == prod.IdDepartamento).Select(d => d.Nome).FirstOrDefault();
                        if(results.Any(r => r.Id == prod.Id))
                        {
                            // already exists, append new stock
                            foreach(var result in results.Where(r => r.Id == prod.Id).ToList())
                            {
                                result.StockAnt1 = stock.Estado == 1 ? stock.Quantidade : result.StockAnt1;
                                result.stockAnt2 = stock.Estado == 2 ? stock.Quantidade : result.stockAnt2;
                                result.stock3 = stock.Estado == 3 ? stock.Quantidade : result.stock3;
                                result.stock4 = stock.Estado == 4 ? stock.Quantidade : result.stock4;
                            }
                        }
                        else
                        {
                            results.Add(new StocksInventarioShow()
                            {
                                Id = prod.Id,
                                Ean = prod.Ean,
                                Nome = prod.Nome,
                                Departamento = dep,
                                StockAnt1 = stock.Estado == 1 ? stock.Quantidade : 0,
                                stockPic1 = 0,
                                stockReal1 = 0,
                                stockAnt2 = stock.Estado == 2 ? stock.Quantidade : 0,
                                stockPic2 = 0,
                                stockReal2 = 0,
                                stock3 = stock.Estado == 3 ? stock.Quantidade : 0,
                                stock4 = stock.Estado == 4 ? stock.Quantidade : 0,
                            });
                        }
                    }
                }
                return Ok(results);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpPut("UpdateInventory/{localizacaoId}")]
        public IActionResult UpdateInventory(int localizacaoId, [FromBody] InventoryForm[] values)
        {
            using var context = new StocklyContext();
            foreach(InventoryForm stock in values)
            {
                try
                {
                    if(stock.stockReal1 > 0)
                    {
                        var sqlWhere = context.StocksPorEstados.Where(s => s.IdLocalizacao == localizacaoId && s.IdProduto == stock.ProdutoId && s.Estado == 1);
                        var origStock = sqlWhere.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                        if(origStock == null)
                        {
                            // stock não existe, criar
                            context.StocksPorEstados.Add(new StocksPorEstado()
                            {
                                IdLocalizacao = localizacaoId,
                                IdProduto = stock.ProdutoId,
                                Quantidade = stock.stockReal1,
                                Estado = 1,
                                StockMinimo = 0
                            });
                            context.SaveChanges();
                            origStock = sqlWhere.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                        }
                        
                        if (stock.stockPic1 != stock.stockReal1)
                        {
                            // diferença na picagem, registar movimento
                            context.HistoricoStocks.Add(new HistoricoStock()
                            {
                                IdStockEstado = origStock.Id,
                                StockInicial = stock.stockPic1,
                                StockFinal = stock.stockReal1,
                                Justificativa = "Diferença de stocks entre picado e real no processo de Inventário - Estado FRENTE DE LOJA",
                                Data = DateTime.Now,
                            });
                            context.SaveChanges();
                        }
                        // stock 1 - frente de loja está preenchido, atualizar valores
                        context.HistoricoStocks.Add(new HistoricoStock()
                        {
                            IdStockEstado = origStock.Id,
                            StockInicial = origStock.Quantidade,
                            StockFinal = stock.stockReal1,
                            Justificativa = "Processo de Inventário - Estado FRENTE DE LOJA",
                            Data = DateTime.Now,
                        });
                        context.SaveChanges();

                        sqlWhere.ExecuteUpdate(u => u.SetProperty(s => s.Quantidade, stock.stockReal1));
                        
                    }
                    if(stock.stockReal2 > 0)
                    {
                        var sqlWhere = context.StocksPorEstados.Where(s => s.IdLocalizacao == localizacaoId && s.IdProduto == stock.ProdutoId && s.Estado == 2);
                        var origStock = sqlWhere.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                        if (origStock == null)
                        {
                            // stock não existe, criar
                            context.StocksPorEstados.Add(new StocksPorEstado()
                            {
                                IdLocalizacao = localizacaoId,
                                IdProduto = stock.ProdutoId,
                                Quantidade = stock.stockReal2,
                                Estado = 2,
                                StockMinimo = 0
                            });
                            context.SaveChanges();
                            origStock = sqlWhere.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                        }
                        if (stock.stockPic2 != stock.stockReal2)
                        {
                            // diferença na picagem, registar movimento
                            context.HistoricoStocks.Add(new HistoricoStock()
                            {
                                IdStockEstado = origStock.Id,
                                StockInicial = stock.stockPic2,
                                StockFinal = stock.stockReal2,
                                Justificativa = "Diferença de stocks entre picado e real no processo de Inventário - Estado ARMAZÉM",
                                Data = DateTime.Now,
                            });
                            context.SaveChanges();
                        }

                        // stock 2 - armazém está preenchido, atualizar valores
                        context.HistoricoStocks.Add(new HistoricoStock()
                        {
                            IdStockEstado = origStock.Id,
                            StockInicial = origStock.Quantidade,
                            StockFinal = stock.stockReal2,
                            Justificativa = "Processo de Inventário - Estado ARMAZÉM",
                            Data = DateTime.Now,
                        });
                        context.SaveChanges();

                        sqlWhere.ExecuteUpdate(u => u.SetProperty(s => s.Quantidade, stock.stockReal2));
                    }
                }
                catch(Exception e)
                {
                    Console.WriteLine("Erro a atualizar linha de stock, skipping... Error: " + e.Message);
                }
            }
            return Ok();
        }

        [HttpPut("UpdateInventoryMobile/{localizacaoId}/{estadoId}")]
        public IActionResult UpdateInventoryMobile(int localizacaoId, int estadoId, [FromBody] MobileInventoryForm[] values)
        {
            using var context = new StocklyContext();
            List<MobileInventoryFormErrors> errors = new List<MobileInventoryFormErrors>();
            int index = 0;
            foreach(MobileInventoryForm stock in values)
            {
                if(!context.Produtos.Any(p => p.Ean == stock.Ean))
                {
                    errors.Add(new MobileInventoryFormErrors { Index = index, ProdutoEan = stock.Ean, Error = "Produto não existe! É necessário criar a ficha de produto" });
                }
                index++;
            }
            if (errors.Count() > 0)
                return NotFound(errors);
            foreach(MobileInventoryForm stock in values)
            {
                try
                {
                    int ProdutoId = context.Produtos.Where(p => p.Ean == stock.Ean).FirstOrDefault().Id;
                    var sqlWhere = context.StocksPorEstados.Where(s => s.IdLocalizacao == localizacaoId && s.IdProduto == ProdutoId && s.Estado == estadoId);
                    var origStock = sqlWhere.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                    if (origStock == null)
                    {
                        // stock não existe, criar
                        context.StocksPorEstados.Add(new StocksPorEstado()
                        {
                            IdLocalizacao = localizacaoId,
                            IdProduto = ProdutoId,
                            Quantidade = stock.Quantity,
                            Estado = estadoId,
                            StockMinimo = 0
                        });
                        context.SaveChanges();
                        origStock = sqlWhere.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                    }
                        
                    context.HistoricoStocks.Add(new HistoricoStock()
                    {
                        IdStockEstado = origStock.Id,
                        StockInicial = origStock.Quantidade,
                        StockFinal = stock.Quantity,
                        Justificativa = "Processo de Inventário - Estado FRENTE DE LOJA",
                        Data = DateTime.Now,
                    });
                    context.SaveChanges();

                    sqlWhere.ExecuteUpdate(u => u.SetProperty(s => s.Quantidade, stock.Quantity));
                }
                catch (Exception e)
                {
                    Console.WriteLine("Erro a atualizar linha de stock, skipping... Error: " + e.Message);
                }
            }
            return Ok();
        }
    }

    public class StocksInventarioShow()
    {
        public int Id { get; set; }
        public string Ean { get; set; }
        public string Nome { get; set; }
        public string? Departamento { get; set; }
        public int? StockAnt1 { get; set; }
        public int? stockPic1 { get; set; }
        public int? stockReal1 { get; set; }
        public int? stockAnt2 { get; set; }
        public int? stockPic2 { get; set; }
        public int? stockReal2 { get; set; }
        public int? stock3 { get; set; }
        public int? stock4 { get; set; }
    }

    public class InventoryForm()
    {
        public int ProdutoId { get; set; }
        public int stockPic1 { get; set; }
        public int stockReal1 { get; set; }
        public int stockPic2 { get; set; }
        public int stockReal2 { get; set; }
    }
    public class MobileInventoryForm()
    {
        public string Ean { get; set; }
        public int Quantity { get; set; }
    }
    public class MobileInventoryFormErrors()
    {
        public int Index { get; set; }
        public string ProdutoEan { get; set; }
        public string Error { get; set; }
    }
}
