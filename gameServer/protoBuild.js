var pb = require('protobufjs');
var ver = pb.protoFromFile('./ver.proto');
var s2c = pb.protoFromFile('./s2c.proto');
var c2s = pb.protoFromFile('./c2s.proto');
var g2l = pb.protoFromFile('./g2l.proto');

var VersionInfo = ver.build('VER').VersionInfo;
var VersionInfoReply = ver.build('VER').VersionInfoReply;
var ClientVersionInfo = ver.build('VER').ClientVersionInfo;
var ClientVersionInfoReply = ver.build('VER').ClientVersionInfoReply;
var RegisterAccountReply = s2c.build('S2C').RegisterAccountReply;
var UnregisterAccountReply = s2c.build('S2C').UnregisterAccountReply;
var StartGameReply = s2c.build('S2C').StartGameReply;
var AccountInfo = s2c.build('S2C').AccountInfo;
var ChargeInfo = s2c.build('S2C').ChargeInfo;
var RankInfo = s2c.build('S2C').RankInfo;
var GameResult = s2c.build('S2C').GameResult;
var RegisterAccount = c2s.build('C2S').RegisterAccount;
var UnregisterAccount = c2s.build('C2S').UnregisterAccount;
var LoadUserInfo = c2s.build('C2S').LoadUserInfo;
var CheckInCharge = c2s.build('C2S').CheckInCharge;
var StartGame = c2s.build('C2S').StartGame;
var EndGame = c2s.build('C2S').EndGame;
var LoadRankInfo = c2s.build('C2S').LoadRankInfo;
var RequestPointReward = c2s.build('C2S').RequestPointReward;
var AccountLogin = g2l.build('G2L').AccountLogin;
var PayAssistant = g2l.build('G2L').PayAssistant;
var PayCharacter = g2l.build('G2L').PayCharacter;
var PayCoin = g2l.build('G2L').PayCoin;
var PayHeart = g2l.build('G2L').PayHeart;
var PayItem = g2l.build('G2L').PayItem;
var PayMoney = g2l.build('G2L').PayMoney;
var UserGamePlay = g2l.build('G2L').UserGamePlay;
var UserRegister = g2l.build('G2L').UserRegister;
var UserUnregister = g2l.build('G2L').UserUnregister;

exports.VersionInfo = VersionInfo;
exports.VersionInfoReply = VersionInfoReply;
exports.ClientVersionInfo = ClientVersionInfo;
exports.ClientVersionInfoReply = ClientVersionInfoReply;
exports.RegisterAccountReply = RegisterAccountReply;
exports.UnregisterAccountReply = UnregisterAccountReply;
exports.StartGameReply = StartGameReply;
exports.AccountInfo = AccountInfo;
exports.ChargeInfo = ChargeInfo;
exports.RankInfo = RankInfo;
exports.GameResult = GameResult;
exports.RegisterAccount = RegisterAccount;
exports.UnregisterAccount = UnregisterAccount;
exports.LoadUserInfo = LoadUserInfo;
exports.CheckInCharge = CheckInCharge;
exports.StartGame = StartGame;
exports.EndGame = EndGame;
exports.LoadRankInfo = LoadRankInfo;
exports.RequestPointReward = RequestPointReward;
exports.AccountLogin = AccountLogin;
exports.PayAssistant = PayAssistant;
exports.PayCharacter = PayCharacter;
exports.PayCoin = PayCoin;
exports.PayHeart = PayHeart;
exports.PayItem = PayItem;
exports.PayMoney = PayMoney;
exports.UserGamePlay = UserGamePlay;
exports.UserRegister = UserRegister;
exports.UserUnregister = UserUnregister;
