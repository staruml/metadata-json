/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, browser: true */
/*global require, global, __dirname, _*/
var fs      = require('fs');
var mdjson  = require("../metadata-json");
var Unicode = mdjson.Unicode;
var Font    = mdjson.Font;

var fonts = [], data;

data = fs.readFileSync(__dirname + "/../../staruml/src/styles/fonts/NotoSans/font.json", {encoding: "utf8"});
fonts = fonts.concat(JSON.parse(data));
data = fs.readFileSync(__dirname + "/../../staruml/src/styles/fonts/Liberation/font.json", {encoding: "utf8"});
fonts = fonts.concat(JSON.parse(data));

_.each(fonts, function (font) {
    Font.registerFont(font);
});

console.log("---------------------");
console.log(Font.userFonts);
console.log("---------------------");
console.log(Font.defaultFonts);
console.log("---------------------");
console.log(Font.getDefaultFontInfo());
console.log("---------------------");

var line1 = "Core English Font. Why? 한글만 안나오는 이유가 뭐죠? 午汉字是迄今为止连 and 续使用时间最长的主要文字 そこで求められていたものは字 with の本義と解字を探ることであり";
var line2 = "English Font. 한글만 안나옴? 午汉字是迄今 and そこで求められていた мягкий знак";
var line3 = "한편 전택부 역시 윤치호가 애국가의 유력 작사자라 주장하였다.[8] 그 근거로는 첫째로, 1907년 윤치호의 역술로 출판된 <찬미가>중에 현재 우리가 쓰고 있는 애국가가 들어 있다는 사실, 둘째로 미국에서 살고 있는 양주은이 소장한 국민가 중에 애국가가 윤치호의 작사로 되어 있다는 사실, 셋째로 해방 후 윤치호가 친필로써 ‘윤치호 작’ 애국가(사진 10번)를 쓴 것이 있다는 사실이다. 이러한 사실은 이미 1955년 벌써 밝혀졌던 사실[8] 이라는 것이다.";
var line4 = "中华人民共和国陆地总面積约960萬平方公里[16][17][18]，是世界陆地面积第二大国家，总面积第三或者第四大的国家。中国地域广阔，地形多样，北方有森林、草原、戈壁和干旱的塔克拉玛干沙漠，南方则有湿润的亚热带雨林。喜马拉雅山脉、喀喇昆仑山脉、帕米爾高原和天山山脉从中将中国和南亚、中亚分开。发源自青藏高原流经东部人口密集区域的两条河流——长江、黄河分别为世界第三长、第六长河流。中国领海由渤海（内海）和黄海、东海、南海三大边海组成，东部和南部大陆海岸线长1.8万千米。内海和边海的水域面积约470万平方千米。海域分布有大小岛屿7600个，其中台湾岛（未实际控制）最大，面积35798平方千米。[19]它实际管辖22个省、5个自治区、4个直辖市和2个特别行政区。除此之外，中华人民共和国还宣称中華民國实际管辖的臺灣地區为其领土一部分，其中包括台湾省的台灣島，福建省的金門群島、馬祖列島，和中華民國控制的一部分属于海南省的南海岛屿。由于台湾政治地位的复杂性，这些说法是有争议的。[20]";

var tokens = Unicode.tokenize(line1);
_.each(tokens, function (t) {
    console.log(t, "\t " + Font.getFontInfo('Arial', t).regular);
});
