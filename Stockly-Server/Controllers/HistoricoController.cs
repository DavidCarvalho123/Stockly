using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stockly_Server.Models;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HistoricoController : ControllerBase
    {
        public HistoricoController() { }

        [HttpGet]
        [Route("GetAllHistorico")]
        public IActionResult GetAllHistorico()
        {
            List<HistoricoShow> results = new List<HistoricoShow>();
            using (var context = new StocklyContext())
            {
                var hist = context.HistoricoStocks.ToList();
                List<StocksPorEstado> stocks = new List<StocksPorEstado>();
                hist.ForEach(h =>
                {
                    stocks.Add(context.StocksPorEstados.Where(s => s.Id == h.IdStockEstado).FirstOrDefault());
                });
                
                var availableLocals = context.Localizacoes
                    .Where(d => stocks.Select(p => p.IdLocalizacao).Contains(d.Id))
                    .ToDictionary(d => d.Id, d => d.Nome);
                var availableProdutos = context.Produtos
                    .Where(d => stocks.Select(p => p.IdProduto).Contains(d.Id))
                    .ToDictionary(d => d.Id, d => d.Nome);
                var availableEstados = context.Estados
                    .Where(d => stocks.Select(p => p.Estado).Contains(d.Id))
                    .ToDictionary(d => d.Id, d => d.Estado1);


                if (availableLocals.Count > 0 && availableProdutos.Count > 0 && availableEstados.Count > 0)
                {
                    hist.ForEach(h =>
                    {
                        results.Add(stocks
                            .Where(p => p.Id == h.IdStockEstado)
                            .Select(res =>
                                new HistoricoShow(h, availableLocals[(int)res.IdLocalizacao], availableProdutos[(int)res.IdProduto], availableEstados[(int)res.Estado])
                            )?.FirstOrDefault() ?? new HistoricoShow(h, "", "", ""));
                    });
                }
            }
            return Ok(results);
        }
    }

    public class HistoricoShow
    {
        public int Id { get; set; }
        public string Produto { get; set; }
        public string Localizacao { get; set; }
        public string Estado { get; set; }
        public int StockInicial { get; set; }
        public int StockFinal { get; set; }
        public string Justificativa { get; set; }
        public DateTime Data { get; set; }
        public int? IdLinhaPedido { get; set; } = null!;

        public HistoricoShow(HistoricoStock historico, string local, string produto, string estado)
        {
            Id = historico.Id;
            Produto = produto;
            Localizacao = local;
            Estado = estado;
            StockInicial = (int)historico.StockInicial;
            StockFinal = (int)historico.StockFinal;
            Justificativa = historico.Justificativa;
            Data = historico.Data?? DateTime.Now;
            IdLinhaPedido = historico.IdLinhaPedido ?? null;
        }
    }
}
