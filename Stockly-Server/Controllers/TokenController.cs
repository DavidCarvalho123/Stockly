using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Stockly_Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Stockly_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TokenController : ControllerBase
    {
        private readonly UserManager<Utilizadore> _userManager;
        private readonly SignInManager<Utilizadore> _signInManager;
        private readonly IConfiguration _configuration;
        public TokenController(UserManager<Utilizadore> userManager, SignInManager<Utilizadore> signInManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] CregisterForm model)
        {
            var user = new Utilizadore { NomeUtilizador = model.NomeUtilizador, UserName = model.NomeUtilizador, Nome = model.Nome, Email = model.Email, Cargo = model.Cargo, IdLocalizacao = model.IdLocalizacao, IdDepartamento = model.IdDepartamento, IdAcesso = model.IdAcesso, IsLdap = model.IsLdap };
            var result = await _userManager.CreateAsync(user, model.Password);
            if (result.Succeeded)
            {
                return Ok(new { message = "User registered successfully" });
            }
            return BadRequest(result.Errors);
        }
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] CloginForm model)
        {
            var usert = await _userManager.FindByNameAsync(model.Username);
            var result = await _signInManager.PasswordSignInAsync(model.Username!, model.Password!, false, true);
            if (result.Succeeded)
            {
                var user = await _userManager.FindByNameAsync(model.Username);
                var token = GenerateJwtToken(user);
                await _userManager.UpdateAsync(user);
                return Ok(new { token });
            }
            return Unauthorized();
        }

        [HttpGet("testConnection")]
        public async Task<IActionResult> TestConnection()
        {
            return Ok();
        }

        private string GenerateJwtToken(Utilizadore user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, $"{Guid.NewGuid()}"),
                new Claim(JwtRegisteredClaimNames.Iat, $"{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}"),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(10),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
