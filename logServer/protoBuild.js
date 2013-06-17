var pb = require('protobufjs');
var g2l = pb.protoFromFile('./g2l.proto');

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
