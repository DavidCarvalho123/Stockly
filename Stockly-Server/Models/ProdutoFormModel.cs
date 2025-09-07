namespace Stockly_Server.Models;


    // Classe para receber o payload do front-end
    public class ProdutoFormModel
    {
        public string Nome { get; set; }
        public string CodigoEAN { get; set; }
        public string Departamento { get; set; }
        public string Fornecedor { get; set; }
        public string Unidade { get; set; }
        public int StockMinimo { get; set; }
        public string Altura { get; set; }
        public string Largura { get; set; }
        public string Comprimento { get; set; }
        public string PrecoCompra { get; set; }
        public string PrecoVenda { get; set; }
        public string Iva { get; set; }
        public bool Ativo { get; set; }
    }
