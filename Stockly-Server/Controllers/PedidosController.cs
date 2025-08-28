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
        public IActionResult Create([FromBody] Pedido pedido)
        {
            if (pedido == null || pedido.LinhasPedidos == null || pedido.LinhasPedidos.Count == 0)
                return BadRequest(new { message = "Pedido sem linhas." });

            using var context = new StocklyContext();
            using var tx = context.Database.BeginTransaction();

            try
            {
                // Id do utilizador: se não vier no payload, usa o primeiro só para ter FK válida
                if (pedido.IdUtilizador == null)
                {
                    var anyUser = context.Utilizadores.Select(u => (int?)u.Id).FirstOrDefault();
                    if (anyUser == null)
                        return StatusCode(500, new { message = "Não existem utilizadores na base de dados." });
                    pedido.IdUtilizador = anyUser.Value;
                }

                // Valida destino
                if (pedido.IdLocalizacaoDestino == null ||
                    !context.Localizacoes.Any(l => l.Id == pedido.IdLocalizacaoDestino))
                {
                    return BadRequest(new { message = "Localização de destino inválida." });
                }

                // Previne que o cliente force DataPedido/Processado
                foreach (var lp in pedido.LinhasPedidos)
                {
                    // valida produto
                    if (!context.Produtos.Any(p => p.Id == lp.IdProduto))
                        return BadRequest(new { message = $"Produto {lp.IdProduto} não existe." });

                    // valida estados
                    if (!context.Estados.Any(e => e.Id == lp.EstadoInicial))
                        return BadRequest(new { message = $"Estado inicial {lp.EstadoInicial} inválido." });
                    if (!context.Estados.Any(e => e.Id == lp.EstadoFinal))
                        return BadRequest(new { message = $"Estado final {lp.EstadoFinal} inválido." });

                    // força defaults ao criar
                    lp.Processado = false;
                    lp.DataPedido = null;
                }

                // 1) Cabeçalho
                context.Pedidos.Add(pedido);
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

                // 2) Movimentação de stock (por cada linha)
                int destinoId = pedido.IdLocalizacaoDestino!.Value;

                foreach (var lp in pedido.LinhasPedidos)
                {
                    // Ajusta stock no destino entre estados (permite negativo)
                    var speInicial = GetOrCreateSpe(context, lp.IdProduto!.Value, destinoId, lp.EstadoInicial);
                    speInicial.Quantidade = (speInicial.Quantidade ?? 0) - (lp.QuantidadePedida ?? 0);

                    var speFinal = GetOrCreateSpe(context, lp.IdProduto!.Value, destinoId, lp.EstadoFinal);
                    speFinal.Quantidade = (speFinal.Quantidade ?? 0) + (lp.QuantidadePedida ?? 0);
                }

                try
                {
                    context.SaveChanges();
                    tx.Commit();
                }
                catch (Exception ex)
                {
                    tx.Rollback();
                    return StatusCode(500, new
                    {
                        message = "Erro ao gravar linhas/movimentos.",
                        error = ex.Message,
                        detail = ex.InnerException?.Message
                    });
                }

                return Ok(new { message = "Pedido criado com sucesso.", pedidoId = pedido.Id, numero = pedido.Id });
            }
            catch (Exception e)
            {
                tx.Rollback();
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
}
