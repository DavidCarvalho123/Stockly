namespace Stockly_Server.Models
{
    public class CregisterForm
    {
        public string? Nome { get; set; }

        public string? NomeUtilizador { get; set; }

        public string? Password { get; set; }

        public string? Email { get; set; }

        public string? Cargo { get; set; }

        public int? IdLocalizacao { get; set; }

        public int? IdDepartamento { get; set; }

        public int? IdAcesso { get; set; }

        public bool? IsLdap { get; set; }
    }
}
