using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stockly_Server.Models;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DepartamentosController : ControllerBase
    {
        public DepartamentosController() { }

        [HttpGet]
        [Route("GetAllDepartamentos")]
        public IActionResult GetAllDepartamentos()
        {
            using var context = new StocklyContext();
            var departamentos = context.Departamentos
                .Select(d => new { d.Id, d.Nome })
                .ToList();
            return Ok(departamentos);
        }
    }
}
