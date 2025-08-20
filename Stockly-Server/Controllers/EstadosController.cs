using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stockly_Server.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EstadosController : ControllerBase
    {
        public EstadosController() { }

    [HttpGet("GetAllEstados")]
    public IActionResult GetAllEstados()
    {
        using var context = new StocklyContext();
        var estados = context.Estados
            .Select(e=> new {e.Id, e.Estado1})
            .ToList();
        
        
        return Ok(estados);
    }
    }
}


