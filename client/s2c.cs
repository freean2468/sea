//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

// Generated from: s2c.proto
namespace S2C
{
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"RegisterAccountReply")]
  public partial class RegisterAccountReply : global::ProtoBuf.IExtensible
  {
    public RegisterAccountReply() {}
    

    private ulong _id = (ulong)1622018505;
    [global::ProtoBuf.ProtoMember(1, IsRequired = false, Name=@"id", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public ulong id
    {
      get { return _id; }
      set { _id = value; }
    }
    private string _k_id;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"k_id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string k_id
    {
      get { return _k_id; }
      set { _k_id = value; }
    }
    private S2C.RegisterAccountReply.Result _res;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"res", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public S2C.RegisterAccountReply.Result res
    {
      get { return _res; }
      set { _res = value; }
    }
    [global::ProtoBuf.ProtoContract(Name=@"Result")]
    public enum Result
    {
            
      [global::ProtoBuf.ProtoEnum(Name=@"FALSE", Value=0)]
      FALSE = 0,
            
      [global::ProtoBuf.ProtoEnum(Name=@"TRUE", Value=1)]
      TRUE = 1
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"UnregisterAccountReply")]
  public partial class UnregisterAccountReply : global::ProtoBuf.IExtensible
  {
    public UnregisterAccountReply() {}
    

    private ulong _id = (ulong)1477441904;
    [global::ProtoBuf.ProtoMember(1, IsRequired = false, Name=@"id", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public ulong id
    {
      get { return _id; }
      set { _id = value; }
    }
    private string _k_id;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"k_id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string k_id
    {
      get { return _k_id; }
      set { _k_id = value; }
    }
    private S2C.UnregisterAccountReply.Result _res;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"res", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public S2C.UnregisterAccountReply.Result res
    {
      get { return _res; }
      set { _res = value; }
    }
    [global::ProtoBuf.ProtoContract(Name=@"Result")]
    public enum Result
    {
            
      [global::ProtoBuf.ProtoEnum(Name=@"FALSE", Value=0)]
      FALSE = 0,
            
      [global::ProtoBuf.ProtoEnum(Name=@"TRUE", Value=1)]
      TRUE = 1
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"StartGameReply")]
  public partial class StartGameReply : global::ProtoBuf.IExtensible
  {
    public StartGameReply() {}
    

    private ulong _id = (ulong)519762701;
    [global::ProtoBuf.ProtoMember(1, IsRequired = false, Name=@"id", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public ulong id
    {
      get { return _id; }
      set { _id = value; }
    }
    private string _k_id;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"k_id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string k_id
    {
      get { return _k_id; }
      set { _k_id = value; }
    }
    private S2C.StartGameReply.Result _res;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"res", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public S2C.StartGameReply.Result res
    {
      get { return _res; }
      set { _res = value; }
    }
    private int _heart;
    [global::ProtoBuf.ProtoMember(4, IsRequired = true, Name=@"heart", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int heart
    {
      get { return _heart; }
      set { _heart = value; }
    }
    private long _last_charged_time;
    [global::ProtoBuf.ProtoMember(5, IsRequired = true, Name=@"last_charged_time", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public long last_charged_time
    {
      get { return _last_charged_time; }
      set { _last_charged_time = value; }
    }
    [global::ProtoBuf.ProtoContract(Name=@"Result")]
    public enum Result
    {
            
      [global::ProtoBuf.ProtoEnum(Name=@"FALSE", Value=0)]
      FALSE = 0,
            
      [global::ProtoBuf.ProtoEnum(Name=@"TRUE", Value=1)]
      TRUE = 1
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"AccountInfo")]
  public partial class AccountInfo : global::ProtoBuf.IExtensible
  {
    public AccountInfo() {}
    

    private ulong _id = (ulong)74840653;
    [global::ProtoBuf.ProtoMember(1, IsRequired = false, Name=@"id", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public ulong id
    {
      get { return _id; }
      set { _id = value; }
    }
    private string _k_id;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"k_id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string k_id
    {
      get { return _k_id; }
      set { _k_id = value; }
    }
    private S2C.AccountInfo.Result _res;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"res", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public S2C.AccountInfo.Result res
    {
      get { return _res; }
      set { _res = value; }
    }
    private int _coin;
    [global::ProtoBuf.ProtoMember(4, IsRequired = true, Name=@"coin", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int coin
    {
      get { return _coin; }
      set { _coin = value; }
    }
    private int _mineral;
    [global::ProtoBuf.ProtoMember(5, IsRequired = true, Name=@"mineral", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int mineral
    {
      get { return _mineral; }
      set { _mineral = value; }
    }
    private int _lv;
    [global::ProtoBuf.ProtoMember(6, IsRequired = true, Name=@"lv", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int lv
    {
      get { return _lv; }
      set { _lv = value; }
    }
    private int _exp;
    [global::ProtoBuf.ProtoMember(7, IsRequired = true, Name=@"exp", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int exp
    {
      get { return _exp; }
      set { _exp = value; }
    }
    private int _point;
    [global::ProtoBuf.ProtoMember(8, IsRequired = true, Name=@"point", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int point
    {
      get { return _point; }
      set { _point = value; }
    }
    private int _heart;
    [global::ProtoBuf.ProtoMember(9, IsRequired = true, Name=@"heart", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int heart
    {
      get { return _heart; }
      set { _heart = value; }
    }
    private long _last_charged_time;
    [global::ProtoBuf.ProtoMember(10, IsRequired = true, Name=@"last_charged_time", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public long last_charged_time
    {
      get { return _last_charged_time; }
      set { _last_charged_time = value; }
    }
    private int _selected_character;
    [global::ProtoBuf.ProtoMember(11, IsRequired = true, Name=@"selected_character", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int selected_character
    {
      get { return _selected_character; }
      set { _selected_character = value; }
    }
    private int _selected_assistant;
    [global::ProtoBuf.ProtoMember(12, IsRequired = true, Name=@"selected_assistant", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int selected_assistant
    {
      get { return _selected_assistant; }
      set { _selected_assistant = value; }
    }
    private int _characters;
    [global::ProtoBuf.ProtoMember(13, IsRequired = true, Name=@"characters", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int characters
    {
      get { return _characters; }
      set { _characters = value; }
    }
    private int _basic_charac_lv;
    [global::ProtoBuf.ProtoMember(14, IsRequired = true, Name=@"basic_charac_lv", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int basic_charac_lv
    {
      get { return _basic_charac_lv; }
      set { _basic_charac_lv = value; }
    }
    private int _assistants;
    [global::ProtoBuf.ProtoMember(15, IsRequired = true, Name=@"assistants", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int assistants
    {
      get { return _assistants; }
      set { _assistants = value; }
    }
    private int _basic_assist_lv;
    [global::ProtoBuf.ProtoMember(16, IsRequired = true, Name=@"basic_assist_lv", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int basic_assist_lv
    {
      get { return _basic_assist_lv; }
      set { _basic_assist_lv = value; }
    }
    private int _items;
    [global::ProtoBuf.ProtoMember(17, IsRequired = true, Name=@"items", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int items
    {
      get { return _items; }
      set { _items = value; }
    }
    private int _count;
    [global::ProtoBuf.ProtoMember(18, IsRequired = true, Name=@"count", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int count
    {
      get { return _count; }
      set { _count = value; }
    }
    [global::ProtoBuf.ProtoContract(Name=@"Result")]
    public enum Result
    {
            
      [global::ProtoBuf.ProtoEnum(Name=@"FALSE", Value=0)]
      FALSE = 0,
            
      [global::ProtoBuf.ProtoEnum(Name=@"TRUE", Value=1)]
      TRUE = 1
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"ChargeInfo")]
  public partial class ChargeInfo : global::ProtoBuf.IExtensible
  {
    public ChargeInfo() {}
    

    private ulong _id = (ulong)7663927;
    [global::ProtoBuf.ProtoMember(1, IsRequired = false, Name=@"id", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public ulong id
    {
      get { return _id; }
      set { _id = value; }
    }
    private string _k_id;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"k_id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string k_id
    {
      get { return _k_id; }
      set { _k_id = value; }
    }
    private S2C.ChargeInfo.Result _res;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"res", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public S2C.ChargeInfo.Result res
    {
      get { return _res; }
      set { _res = value; }
    }
    private int _heart;
    [global::ProtoBuf.ProtoMember(4, IsRequired = true, Name=@"heart", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int heart
    {
      get { return _heart; }
      set { _heart = value; }
    }
    private long _last_charged_time;
    [global::ProtoBuf.ProtoMember(5, IsRequired = true, Name=@"last_charged_time", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public long last_charged_time
    {
      get { return _last_charged_time; }
      set { _last_charged_time = value; }
    }
    [global::ProtoBuf.ProtoContract(Name=@"Result")]
    public enum Result
    {
            
      [global::ProtoBuf.ProtoEnum(Name=@"FALSE", Value=0)]
      FALSE = 0,
            
      [global::ProtoBuf.ProtoEnum(Name=@"TRUE", Value=1)]
      TRUE = 1
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"RankInfo")]
  public partial class RankInfo : global::ProtoBuf.IExtensible
  {
    public RankInfo() {}
    

    private ulong _id = (ulong)25751552;
    [global::ProtoBuf.ProtoMember(1, IsRequired = false, Name=@"id", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public ulong id
    {
      get { return _id; }
      set { _id = value; }
    }
    private string _k_id;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"k_id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string k_id
    {
      get { return _k_id; }
      set { _k_id = value; }
    }
    private S2C.RankInfo.Result _res;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"res", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public S2C.RankInfo.Result res
    {
      get { return _res; }
      set { _res = value; }
    }
    private long _overall_ranking;
    [global::ProtoBuf.ProtoMember(4, IsRequired = true, Name=@"overall_ranking", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public long overall_ranking
    {
      get { return _overall_ranking; }
      set { _overall_ranking = value; }
    }
    private readonly global::System.Collections.Generic.List<S2C.RankInfo.FriendRankInfo> _ranking_list = new global::System.Collections.Generic.List<S2C.RankInfo.FriendRankInfo>();
    [global::ProtoBuf.ProtoMember(5, Name=@"ranking_list", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public global::System.Collections.Generic.List<S2C.RankInfo.FriendRankInfo> ranking_list
    {
      get { return _ranking_list; }
    }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"FriendRankInfo")]
  public partial class FriendRankInfo : global::ProtoBuf.IExtensible
  {
    public FriendRankInfo() {}
    
    private string _k_id;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"k_id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string k_id
    {
      get { return _k_id; }
      set { _k_id = value; }
    }
    private int _score;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"score", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int score
    {
      get { return _score; }
      set { _score = value; }
    }
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
    [global::ProtoBuf.ProtoContract(Name=@"Result")]
    public enum Result
    {
            
      [global::ProtoBuf.ProtoEnum(Name=@"FALSE", Value=0)]
      FALSE = 0,
            
      [global::ProtoBuf.ProtoEnum(Name=@"TRUE", Value=1)]
      TRUE = 1
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"GameResult")]
  public partial class GameResult : global::ProtoBuf.IExtensible
  {
    public GameResult() {}
    

    private ulong _id = (ulong)10876551;
    [global::ProtoBuf.ProtoMember(1, IsRequired = false, Name=@"id", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public ulong id
    {
      get { return _id; }
      set { _id = value; }
    }
    private string _k_id;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"k_id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string k_id
    {
      get { return _k_id; }
      set { _k_id = value; }
    }
    private S2C.GameResult.Result _res;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"res", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public S2C.GameResult.Result res
    {
      get { return _res; }
      set { _res = value; }
    }
    private int _score;
    [global::ProtoBuf.ProtoMember(4, IsRequired = true, Name=@"score", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int score
    {
      get { return _score; }
      set { _score = value; }
    }
    [global::ProtoBuf.ProtoContract(Name=@"Result")]
    public enum Result
    {
            
      [global::ProtoBuf.ProtoEnum(Name=@"FALSE", Value=0)]
      FALSE = 0,
            
      [global::ProtoBuf.ProtoEnum(Name=@"TRUE", Value=1)]
      TRUE = 1
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  

}