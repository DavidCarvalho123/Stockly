using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stockly_Server.Models;
using System.Linq;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LocalizacoesController : ControllerBase
    {
        public LocalizacoesController() { }

        [HttpGet]
        [Route("GetTreeLocations")]
        public IActionResult GetTreeLocations()
        {
            List<Localizaco> results = new List<Localizaco>();
            using (var context = new StocklyContext())
            {
                results = context.Localizacoes.Where(l => l.LocalReal == true).ToList();
                var lookupHash = results.ToLookup(l => l.LocalizacaoPai);

                List<Localizaco> BuildTree(int? parentId)
                {
                    return lookupHash[parentId]
                        .Select(l => {
                            l.SubLocalizacao = BuildTree(l.Id); // recursion
                            return l;
                        })
                        .ToList();
                }

                results = BuildTree(null);
            }
            return Ok(results);
        }

        [HttpGet]
        [Route("GetStoredGraphics")]
        public IActionResult GetStoredGraphics(int localId)
        {
            try
            {
                List<Localizaco> results = new List<Localizaco>();
                using(var context = new StocklyContext())
                {
                    results = context.Localizacoes.Where(l => l.LocalizacaoPai == localId && l.LocalReal == false).ToList();
                    var lookupHash = results.ToLookup(l => l.LocalizacaoPai);
                    foreach (var local in results)
                    {
                        local.SubLocalizacao = lookupHash[local.Id].ToList();
                    }
                }
                return Ok(results);     
            }
            catch(Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        [Route("GetExistingStocks")]
        public IActionResult GetExistingStocks(int localId)
        {
            try
            {
                using var context = new StocklyContext();
                var results = new List<GroupedStocks>();
                int[] furnitureIds = context.Localizacoes.Where(l => l.LocalizacaoPai == localId && l.LocalReal == false).Select(l => l.Id).ToArray();
                foreach (var f in furnitureIds)
                {
                    var locs = context.LocalizacoesProdutos.Where(l => l.IdLocalizacao == f).ToList();
                    foreach (var loc in locs)
                    {
                        results.Add(new GroupedStocks()
                        {
                            FurnitureId = f,
                            Quantity = (int)loc.Quantidade,
                            Departamento = (int)context.Produtos.FirstOrDefault(p => p.Id == context.StocksPorEstados.FirstOrDefault(s => s.Id == loc.IdStocksPorEstado).IdProduto).IdDepartamento,
                            ProductX = (float)context.Produtos.FirstOrDefault(p => p.Id == context.StocksPorEstados.FirstOrDefault(s => s.Id == loc.IdStocksPorEstado).IdProduto).Comprimento,
                            ProductY = (float)context.Produtos.FirstOrDefault(p => p.Id == context.StocksPorEstados.FirstOrDefault(s => s.Id == loc.IdStocksPorEstado).IdProduto).Altura,
                            ProductZ = (float)context.Produtos.FirstOrDefault(p => p.Id == context.StocksPorEstados.FirstOrDefault(s => s.Id == loc.IdStocksPorEstado).IdProduto).Largura,
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

        [HttpPost]
        [Route("PostGraphicalChanges")]
        public IActionResult PostGraphicalChanges([FromBody] CrenderedObjectsToSave[] data)
        {
            try
            {
                using (var context = new StocklyContext())
                {
                    Localizaco objDb = null;
                    foreach(CrenderedObjectsToSave obj in data)
                    {
                        objDb = new Localizaco()
                        {
                            Nome = obj.Obj.Name,
                            LocalizacaoPai = obj.LocalPai,
                            ArmazemCentral = false,
                            LocalReal = false,
                            SizeX = obj.Obj.SizeX,
                            SizeY = obj.Obj.SizeY,
                            SizeZ = obj.Obj.SizeZ,
                            CoordX = obj.Position.X,
                            CoordY = obj.Position.Y,
                            CoordZ = obj.Position.Z,
                            Rotation = obj.Rotation
                        };
                        context.Add(objDb);
                    }
                    context.SaveChanges();
                }
            }
            catch(Exception e)
            {
                return StatusCode(500, e.Message);
            }
            return Ok();
        }

        [HttpPatch]
        [Route("UpdatePosObject")]
        public IActionResult UpdatePosObject(int localId, [FromBody] Space newCoords)
        {
            try
            {
                using (var context = new StocklyContext())
                {
                    context.Localizacoes.Where(l => l.Id == localId).ExecuteUpdate(u => u
                                                                    .SetProperty(l => l.CoordX, newCoords.Coords.X)
                                                                    .SetProperty(l => l.CoordY, newCoords.Coords.Y)
                                                                    .SetProperty(l => l.CoordZ,newCoords.Coords.Z)
                                                                    .SetProperty(l => l.Rotation, newCoords.Rotation));
                }
            }
            catch(Exception e)
            {
                return StatusCode(500, e.Message);
            }
            return Ok();
        }
        
        [HttpGet("GetAllLocalizacoes")]
        public IActionResult GetAllLocalizacoes()
        {
            using var context = new StocklyContext();
            var local = context.Localizacoes.Where(l => l.LocalReal == true)
                .Select(l=> new {l.Id, l.Nome})
                .ToList();
        
            return Ok(local);
        }

        [HttpGet("GetLocalizacaoById/{localizacaoId}")]
        public IActionResult GetLocalizacaoById(int localizacaoId)
        {
            LocalizacoesShow result = new LocalizacoesShow();
            using (var context = new StocklyContext())
            {
                var local = context.Localizacoes.Where(l => l.Id == localizacaoId).FirstOrDefault();
                result = new LocalizacoesShow()
                {
                    Nome = local.Nome,
                    Morada = local.Morada,
                    CodPostal = local.CodPostal,
                    LocalizacaoPai = local.LocalizacaoPai,
                    ArmazemCentral = local.ArmazemCentral,
                    SizeX = local.SizeX,
                    SizeZ = local.SizeZ
                };
            }
            return Ok(result);
        }

        [HttpPut]
        [Route("EditarLocalizacao/{id}")]
        public IActionResult EditarLocalizacao(int id, [FromBody] LocalizacoesShow model)
        {
            using var context = new StocklyContext();
            var local = context.Localizacoes.FirstOrDefault(p => p.Id == id);

            if (local == null) return NotFound(new { message = "Produto não encontrado" });

            try
            {
                local.Nome = model.Nome;
                local.Morada = model.Morada;
                local.CodPostal = model.CodPostal;
                local.LocalizacaoPai = model.LocalizacaoPai == 0 ? null : model.LocalizacaoPai;
                local.ArmazemCentral = model.ArmazemCentral ? true : false;
                local.SizeX = model.SizeX ?? null;
                local.SizeZ = model.SizeZ ?? null;
                context.SaveChanges();
                return Ok(new { message = "Produto atualizado com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar produto", error = ex.Message });
            }
        }

        [HttpPost]
        [Route("CriarLocalizacao")]
        public IActionResult CriarLocalizacao([FromBody] LocalizacoesShow model)
        {
            try
            {
                using (var context = new StocklyContext())
                {
                    var local = new Localizaco
                    {
                        Nome = model.Nome,
                        Morada = model.Morada,
                        CodPostal = model.CodPostal,
                        LocalizacaoPai = model.LocalizacaoPai == 0 ? null : model.LocalizacaoPai,
                        ArmazemCentral = model.ArmazemCentral,
                        LocalReal = true,
                        SizeX = model.SizeX,
                        SizeZ = model.SizeZ
                    };

                    context.Localizacoes.Add(local);
                    context.SaveChanges();

                    return Ok(new { message = "Produto criado com sucesso!", local.Id });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao criar produto", error = ex.Message });
            }
        }

        [HttpPost]
        [Route("GetOrganizedStocks/{localId}")]
        public IActionResult GetOrganizedStocks([FromBody] int[] furnitureIds, int localId)
        {
            try
            {
                using var context = new StocklyContext();
                Localizaco localMain = context.Localizacoes.Where(l => l.Id == localId).FirstOrDefault();
                // order in database in table localizacoes produtos, assume its always a total reorganize so ignore whats already in the table
                List<StocksPorEstado> allStocks = context.StocksPorEstados.Where(s => s.IdLocalizacao == localId && s.Estado == 1).OrderBy(s => s.IdProduto).AsNoTracking().ToList();
                int sizeXPer = 0;
                float? currentSlotUsedSize = 0;
                int numberSlots = 0;
                int filledSlots = 0;

                int sizeOfLastObject = 0;
                foreach (int fid in furnitureIds)
                {
                    context.LocalizacoesProdutos.Where(l => l.IdLocalizacao == fid).ExecuteDelete();
                    context.SaveChanges();
                    Localizaco f = context.Localizacoes.FirstOrDefault(l => l.Id == fid && l.LocalReal == false);
                    switch (f.Nome)
                    {
                        case "mesa":
                            sizeXPer = 40;
                            numberSlots = 6;
                            currentSlotUsedSize = 0;
                            filledSlots = 0;
                            break;
                        case "rack":
                            sizeXPer = 40;
                            numberSlots = 40;
                            currentSlotUsedSize = 0;
                            filledSlots = 0;
                            break;
                    }
                    foreach(StocksPorEstado stock in allStocks)
                    {
                        if (stock.Quantidade <= 0) continue;
                        Produto prod = context.Produtos.FirstOrDefault(p => p.Id == stock.IdProduto);
                        if (sizeOfLastObject == 0 && prod.Comprimento > sizeXPer)
                        {
                            numberSlots = numberSlots / 2;
                            // bigger than a single slot, cuts to half the effective slots
                            if (stock.Quantidade > numberSlots)
                            {
                                // more than this rack holds, update to the next iteration
                                stock.Quantidade = stock.Quantidade - numberSlots;
                                filledSlots = numberSlots;
                            }
                            else
                            {
                                filledSlots = (int)stock.Quantidade;
                                stock.Quantidade = 0;
                            }
                            context.LocalizacoesProdutos.Add(new LocalizacoesProduto()
                            {
                                IdLocalizacao = fid,
                                IdStocksPorEstado = stock.Id,
                                Quantidade = filledSlots
                            });
                            if (stock.Quantidade == 0) break;
                        }
                        else
                        {
                            // smaller than a slot
                            int i = 1;
                            // more than this rack holds, update to the next iteration
                            for (i = 1; i <= stock.Quantidade; i++)
                            {
                                if (i == 1)
                                {
                                    currentSlotUsedSize = prod.Comprimento;
                                }
                                else
                                {
                                    if (currentSlotUsedSize + prod.Comprimento > sizeXPer)
                                    {
                                        currentSlotUsedSize = 0;
                                        filledSlots++;
                                        i--;
                                    }
                                    else
                                    {
                                        currentSlotUsedSize += prod.Comprimento;
                                    }
                                }


                                if (currentSlotUsedSize >= sizeXPer)
                                {
                                    currentSlotUsedSize = 0;
                                    filledSlots++;
                                }
                                if (filledSlots == numberSlots)
                                {
                                    break;
                                }
                            }
                            stock.Quantidade = stock.Quantidade - (i + 1);
                            context.LocalizacoesProdutos.Add(new LocalizacoesProduto()
                            {
                                IdLocalizacao = fid,
                                IdStocksPorEstado = stock.Id,
                                Quantidade = i
                            });
                            break;
                        }
                        
                        
                    if (filledSlots == numberSlots)
                        break; // rack is full, next furniture
                    }
                }
                context.SaveChanges();

                var results = new List<GroupedStocks>();
                foreach(var f in furnitureIds)
                {
                    var locs = context.LocalizacoesProdutos.Where(l => l.IdLocalizacao == f).ToList();
                    foreach(var loc in locs)
                    {
                        results.Add(new GroupedStocks(){
                            FurnitureId = f,
                            Quantity = (int)loc.Quantidade,
                            Departamento = (int)context.Produtos.FirstOrDefault(p => p.Id == context.StocksPorEstados.FirstOrDefault(s => s.Id == loc.IdStocksPorEstado).IdProduto).IdDepartamento,
                            ProductX = (float)context.Produtos.FirstOrDefault(p => p.Id == context.StocksPorEstados.FirstOrDefault(s => s.Id == loc.IdStocksPorEstado).IdProduto).Comprimento,
                            ProductY = (float)context.Produtos.FirstOrDefault(p => p.Id == context.StocksPorEstados.FirstOrDefault(s => s.Id == loc.IdStocksPorEstado).IdProduto).Altura,
                            ProductZ = (float)context.Produtos.FirstOrDefault(p => p.Id == context.StocksPorEstados.FirstOrDefault(s => s.Id == loc.IdStocksPorEstado).IdProduto).Largura,
                        });
                    }
                }
                return Ok(results);
            }
            catch(Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }

    public class LocalizacoesShow
    {
        public string Nome { get; set; }
        public string Morada { get; set; }
        public string CodPostal { get; set; }
        public int? LocalizacaoPai { get; set; }
        public bool ArmazemCentral { get; set; }
        public float? SizeX { get; set; }
        public float? SizeZ { get; set; }
    }

    public class GroupedStocks
    {
        public int FurnitureId { get; set; }
        public int Quantity { get; set; }
        public int Departamento { get; set; }
        public float ProductX { get; set; }
        public float ProductY { get; set; }
        public float ProductZ { get; set; }
    }
}
