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
    }

    public class LocalizacoesShow
    {
    }
}
