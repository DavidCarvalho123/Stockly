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
                results = results.Where(l => l.LocalizacaoPai == null).ToList();
                foreach(var local in results)
                {
                    local.SubLocalizacao = lookupHash[local.Id].ToList();
                }
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
                            CoordZ = obj.Position.Z
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
        public IActionResult UpdatePosObject(int localId, [FromBody] Position newCoords)
        {
            try
            {
                using (var context = new StocklyContext())
                {
                    context.Localizacoes.Where(l => l.Id == localId).ExecuteUpdate(u => u
                                                                    .SetProperty(l => l.CoordX, newCoords.X)
                                                                    .SetProperty(l => l.CoordY, newCoords.Y)
                                                                    .SetProperty(l => l.CoordZ,newCoords.Z));
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
            var local = context.Localizacoes
                .Select(l=> new {l.Id, l.Nome})
                .ToList();
        
            return Ok(local);
        }
    }

    public class LocalizacoesShow
    {
    }
}
