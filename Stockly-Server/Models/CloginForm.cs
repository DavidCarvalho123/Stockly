using System.ComponentModel.DataAnnotations;

namespace Stockly_Server.Models
{
    public class CloginForm
    {
        [Required(ErrorMessage = "Nome de utilizador é obrigatório.")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Password é obrigatória.")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
