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
}
