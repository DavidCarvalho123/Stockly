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
                    IdUtilizador = 5,
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
}
