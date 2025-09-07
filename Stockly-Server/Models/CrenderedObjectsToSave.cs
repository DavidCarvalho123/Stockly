namespace Stockly_Server.Models
{
    public class CrenderedObjectsToSave
    {
        public FurnitureTypes Obj { get; set; }
        public int LocalPai { get; set; }
        public Position Position { get; set; }
        public float Rotation { get; set; }
    }
    public class CrenderedObjectsToSaveResponse
    {
        public int Id { get; set; }
        public FurnitureTypes Obj { get; set; }
        public int LocalPai { get; set; }
        public Position Position { get; set; }
        public float Rotation { get; set; }
        public CrenderedObjectsToSaveResponse(CrenderedObjectsToSave form, int id)
        {
            Id = id;
            Obj = form.Obj;
            LocalPai = form.LocalPai;
            Position = form.Position;
            Rotation = form.Rotation;
        }
    }
    public class Space
    {
        public Position Coords { get; set; }
        public float Rotation { get; set; }
    }
    public class Position
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float Z { get; set; }
    }
    public class FurnitureTypes
    {
       public string Name { get; set; }
       public float SizeX { get; set; }
       public float SizeY { get; set; }
       public float SizeZ { get; set; }
       public string? RenderColour { get; set; }
    }
}
