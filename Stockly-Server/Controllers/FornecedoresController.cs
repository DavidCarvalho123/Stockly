using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stockly_Server.Models;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FornecedoresController : ControllerBase
    {
        public FornecedoresController() { }

        [HttpGet]
        [Route("GetAllFornecedores")]
        public IActionResult GetAllFornecedores()
        {
            using var context = new StocklyContext();
            var list = context.Fornecedores
                .Select(f => new { f.Id, f.Nome })
                .ToList();
            return Ok(list);
        }
    }
}
