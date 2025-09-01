using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stockly_Server.Models;
using System.Linq;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PedidosController : ControllerBase
    {
        public PedidosController() { }

        

        [HttpGet("GetAllPedidos")]
        public IActionResult GetAllPedidos()
        {
            try
            {
                using var context = new StocklyContext();

                // Carrega pedidos com navegações necessárias
                var pedidos = context.Pedidos
                    .Include(p => p.IdLocalizacaoNavigation)
                    .Include(p => p.IdLocalizacaoDestinoNavigation)
                    .Include(p => p.LinhasPedidos)
                        .ThenInclude(lp => lp.EstadoInicialNavigation)
                    .Include(p => p.LinhasPedidos)
                        .ThenInclude(lp => lp.EstadoFinalNavigation)
                    .ToList() // materializa para podermos calcular "Misto" em memória
                    .Select(p =>
                    {
                        // Derivar o nome do estado inicial
                        var inicNomes = p.LinhasPedidos
                            .Select(lp => lp.EstadoInicialNavigation?.Estado1 ?? "Desconhecido")
                            .Distinct()
                            .ToList();
                        var estadoInicial = inicNomes.Count == 1 ? inicNomes[0] : "Misto";

                        // Derivar o nome do estado final
                        var finalNomes = p.LinhasPedidos
                            .Select(lp => lp.EstadoFinalNavigation?.Estado1 ?? "Desconhecido")
                            .Distinct()
                            .ToList();
                        var estadoFinal = finalNomes.Count == 1 ? finalNomes[0] : "Misto";

                        return new
                        {
                            id = p.Id,
                            numero = p.Id, // se tiveres coluna específica de número, troca aqui
                            origem = p.IdLocalizacaoNavigation?.Nome ?? "Desconhecido",
                            destino = p.IdLocalizacaoDestinoNavigation?.Nome ?? "Desconhecido",
                            estadoInicial,
                            estadoFinal,
                            observacoes = p.Observacoes ?? string.Empty,
                            concluido = p.Concluido ?? false
                        };
                    })
                    .ToList();

                return Ok(pedidos);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet("GetLinhasByPedido/{pedidoId}")]
        public IActionResult GetLinhasByPedido(int pedidoId)
        {
            try
            {
                using var context = new StocklyContext();
                List<LinhasPedido> linhas = context.LinhasPedidos.Where(l => l.IdPedido == pedidoId).ToList();
                if (linhas.Count() < 1)
                    return NotFound("Nenhuma linha encontrada no pedido referenciado.");
                List<LinhaTratarShow> result = new List<LinhaTratarShow>();
                foreach(var linha in linhas)
                {
                    result.Add(new LinhaTratarShow()
                    {
                        idLinha = linha.Id,
                        Ean = context.Produtos.Where(p => p.Id == linha.IdProduto).Select(p => p.Ean).FirstOrDefault(),
                        EstadoInicial = context.Estados.Where(e => e.Id == linha.EstadoInicial).Select(e => e.Estado1).FirstOrDefault(),
                        EstadoFinal = context.Estados.Where(e => e.Id == linha.EstadoFinal).Select(e => e.Estado1).FirstOrDefault(),
                        QuantidadePedida = (int)linha.QuantidadePedida,
                        Tratado = linha.Processado?? false
                    });
                }
                return Ok(result);
            }
            catch(Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
        
        [HttpGet("GetPedidoByLinha/{linhaPedidoId}")]
        public IActionResult GetPedidoByLinha(int linhaPedidoId)
        {
            try
            {
                using var context = new StocklyContext();

                Pedido ped = context.Pedidos.Where(l => l.Id == context.LinhasPedidos.Where(p => p.Id == linhaPedidoId).Select(p => p.IdPedido).FirstOrDefault()).FirstOrDefault();
                if (ped == null)
                    return NotFound("Nenhum pedido encontrado .");
                return Ok(ped.Id);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpPut("ProcessLines/{pedidoId}")]
        public IActionResult ProcessLines(int pedidoId, [FromBody] LinhaForm[] linhas)
        {
            using var context = new StocklyContext();
            List<LinhaFormResponse> results = new List<LinhaFormResponse>();
            List<Estado> estados = context.Estados.ToList();
            Pedido pedido = context.Pedidos.Where(p => p.Id == pedidoId).FirstOrDefault();
            foreach(var linha in linhas)
            {
                try
                {
                    LinhasPedido data = context.LinhasPedidos.Where(l => l.Id == linha.Id).FirstOrDefault();
                    if (data.Processado == true)
                        continue;
                    var sqlWhere = context.StocksPorEstados.Where(s => s.IdProduto == data.IdProduto && s.IdLocalizacao == pedido.IdLocalizacao && s.Estado == data.EstadoInicial);
                    var origStock = sqlWhere.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                    if(origStock == null)
                    {
                        context.StocksPorEstados.Add(new StocksPorEstado()
                        {
                            IdLocalizacao = pedido.IdLocalizacao,
                            IdProduto = data.IdProduto,
                            Quantidade = 0,
                            Estado = data.EstadoInicial,
                            StockMinimo = 0
                        });
                        context.SaveChanges();
                        origStock = sqlWhere.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                    }
                    if (origStock.Quantidade < linha.Quantity)
                    {
                        results.Add(new LinhaFormResponse()
                        {
                            Id = linha.Id,
                            Processado = false,
                            Error = "Quantidade solicitada inferior à quantidade existente em stock"
                        });
                        continue;
                    }
                    if(linha.Quantity != data.QuantidadePedida)
                    {
                        // quantidade alterada pelo utilizador no form
                        context.HistoricoStocks.Add(new HistoricoStock()
                        {
                            IdStockEstado = origStock.Id,
                            StockInicial = data.QuantidadePedida,
                            StockFinal = linha.Quantity,
                            Justificativa = "Diferença de valores entre quantidade solicitada e quantidade a transferir - Estado " 
                                                    + estados.Where(e => e.Id == data.EstadoInicial).FirstOrDefault().Estado1 + " -> Estado "
                                                    + estados.Where(e => e.Id == data.EstadoFinal).FirstOrDefault().Estado1,
                            IdLinhaPedido = linha.Id,
                            Data = DateTime.Now,
                        });
                        context.SaveChanges();
                    }
                    var sqlwheredest = context.StocksPorEstados.Where(s => s.IdLocalizacao == pedido.IdLocalizacaoDestino && s.IdProduto == data.IdProduto && s.Estado == data.EstadoFinal);
                    var destStock = sqlwheredest.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                    if(destStock == null)
                    {
                        // stock não existe, criar
                        context.StocksPorEstados.Add(new StocksPorEstado()
                        {
                            IdLocalizacao = pedido.IdLocalizacaoDestino,
                            IdProduto = data.IdProduto,
                            Quantidade = 0,
                            Estado = data.EstadoFinal,
                            StockMinimo = 0
                        });
                        context.SaveChanges();
                        destStock = sqlwheredest.Select(s => new { s.Id, s.Quantidade }).FirstOrDefault();
                    }
                    context.HistoricoStocks.Add(new HistoricoStock()
                    {
                        IdStockEstado = destStock.Id,
                        StockInicial = origStock.Quantidade,
                        StockFinal = linha.Quantity,
                        Justificativa = "Processo de Tratamento de linhas de pedido - Estado "
                                                    + estados.Where(e => e.Id == data.EstadoInicial).FirstOrDefault().Estado1 + " -> Estado "
                                                    + estados.Where(e => e.Id == data.EstadoFinal).FirstOrDefault().Estado1,
                        IdLinhaPedido = linha.Id,
                        Data = DateTime.Now,
                    });
                    context.SaveChanges();

                    sqlwheredest.ExecuteUpdate(u => u.SetProperty(s => s.Quantidade, linha.Quantity + destStock.Quantidade));
                    sqlWhere.ExecuteUpdate(u => u.SetProperty(s => s.Quantidade, origStock.Quantidade - linha.Quantity));
                    context.LinhasPedidos.Where(l => l.Id == linha.Id).ExecuteUpdate(u => u.SetProperty(s => s.Processado, true));
                    results.Add(new LinhaFormResponse()
                    {
                        Id = linha.Id,
                        Processado = true
                    });
                }
                catch(Exception e)
                {
                    results.Add(new LinhaFormResponse()
                    {
                        Id = linha.Id,
                        Processado = false,
                        Error = e.Message
                    });
                    Console.WriteLine("Erro a atualizar linha de stock, skipping... Error: " + e.Message);
                }
                finally
                {
                    context.SaveChanges();
                }
            }
            try
            {
                using var contextNew = new StocklyContext();
                List<LinhasPedido> data = contextNew.LinhasPedidos.Where(l => l.IdPedido == pedido.Id).ToList();
                if(data.All(s => s.Processado == true))
                {
                    pedido.Concluido = true;
                    context.SaveChanges();
                }
            }
            catch(Exception e)
            {
                Console.WriteLine("Erro a atualizar header de pedido. Error: " + e.Message);
            }
            return Ok(results);
        }

        // devolve Id+1 (ou 1 se vazio)
        [HttpGet("GetNextNumero")]
        public IActionResult GetNextNumero()
        {
            using var context = new StocklyContext();
            int next = context.Pedidos.Any() ? context.Pedidos.Max(p => p.Id) + 1 : 1;
            return Ok(new { numero = next });
        }

        // Recebe diretamente um Pedido com LinhasPedidos
        // Campos relevantes esperados no payload:
        // - Pedido: IdLocalizacao (origem opcional), IdLocalizacaoDestino (destino), IdUtilizador (opcional)
        // - LinhasPedidos: IdProduto, QuantidadePedida, EstadoInicial, EstadoFinal
        [HttpPost("Create")]
        public IActionResult Create([FromBody] PedidoForm pedido)
        {
            if (pedido == null || pedido.Linhas == null || pedido.Linhas.Count == 0)
                return BadRequest(new { message = "Pedido sem linhas." });

            using var context = new StocklyContext();

            try
            {
                Pedido ped = new Pedido()
                {
                    IdUtilizador = context.Utilizadores.FirstOrDefault().Id,
                    Observacoes = "Transferencia",
                    IdLocalizacao = pedido.OrigemId,
                    IdLocalizacaoDestino = pedido.DestinoId,
                    Enviado = true,
                    Concluido = false,
                };
                context.Pedidos.Add(ped);
                context.SaveChanges();
                
                
                
                // Previne que o cliente force DataPedido/Processado
                foreach (var lp in pedido.Linhas)
                {
                    // valida produto
                    if (!context.Produtos.Any(p => p.Id == lp.ProdutoId))
                        return BadRequest(new { message = $"Produto {lp.ProdutoId} não existe." });

                    // força defaults ao criar
                    context.LinhasPedidos.Add(new LinhasPedido()
                    {
                        IdPedido = ped.Id,
                        IdProduto = lp.ProdutoId,
                        QuantidadePedida = lp.Quantidade,
                        Processado = false,
                        EstadoInicial = pedido.EstadoInicialId,
                        EstadoFinal = pedido.EstadoFinalId,
                        DataPedido = DateTime.Now,
                        
                    });
                }

                try
                {
                    context.SaveChanges(); // gera Id do pedido
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new
                    {
                        message = "Erro ao criar cabeçalho do pedido.",
                        error = ex.Message,
                        detail = ex.InnerException?.Message
                    });
                }
                

                

                return Ok(new { message = "Pedido criado com sucesso.", pedidoId = ped.Id, numero = ped.Id });
            }
            catch (Exception e)
            {
               
                return StatusCode(500, new
                {
                    message = "Erro inesperado ao criar pedido.",
                    error = e.Message,
                    detail = e.InnerException?.Message
                });
            }
        }

        
        // Helper → obtém ou cria StocksPorEstado
        private static StocksPorEstado GetOrCreateSpe(StocklyContext context, int produtoId, int localizacaoId, int estadoId)
        {
            var spe = context.StocksPorEstados.SingleOrDefault(s =>
                s.IdProduto == produtoId &&
                s.IdLocalizacao == localizacaoId &&
                s.Estado == estadoId);

            if (spe == null)
            {
                spe = new StocksPorEstado
                {
                    IdProduto = produtoId,
                    IdLocalizacao = localizacaoId,
                    Estado = estadoId,
                    Quantidade = 0
                };
                context.StocksPorEstados.Add(spe);
            }

            return spe;
        }
    }
    public class Linha
    {
        public int ProdutoId { get; set; }
        public int Quantidade { get; set; }
        public string? Ean { get; set; } // optional
    }

    public class PedidoForm
    {
        public int DestinoId { get; set; }
        public int EstadoInicialId { get; set; }
        public int EstadoFinalId { get; set; }
        public int OrigemId { get; set; }
        
        public List<Linha> Linhas { get; set; } = new List<Linha>();
    }

    public class LinhaTratarShow
    {
        public int idLinha { get; set; }
        public string Ean { get; set; }
        public string EstadoInicial { get; set; }
        public string EstadoFinal { get; set; }
        public int QuantidadePedida { get; set; }
        public bool Tratado { get; set; } = false;
    }

    public class LinhaForm
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
    }
    public class LinhaFormResponse
    {
        public int Id { get; set; }
        public bool Processado { get; set; }
        public string? Error { get; set; }
    }
}
