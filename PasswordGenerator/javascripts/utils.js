// Copyright (C) 1999-2019 Siber Systems Inc. All Rights Reserved.
var RfapiJS = RfapiJS || {}
;(function () {
        var zhig = "1.19.04.17";
        var zkfj = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var zhir = "undefined";
        var zwa = {
                "RfItemType_Undefined": 0,
                "RfItemType_Login": 1,
                "RfItemType_Bookmark": 2,
                "RfItemType_SearchCard": 3,
                "RfItemType_BlockingPasscard": 4,
                "RfItemType_Identity": 5,
                "RfItemType_Contact": 6,
                "RfItemType_Safenote": 7,
                "RfItemType_Folder": 8,
                "RfItemType_Generic": 9,
                "RfItemType_Max": 100
            }
        ;var ziea = {
                "enUrlType_Unknown": 0, "enUrlType_HTTP": 1, "enUrlType_FTP": 2, "enUrlType_File": 3
            }
        ;var zieb = {
                "enUrlSchema_Unknown": 0,
                "enUrlSchema_HTTP": 1,
                "enUrlSchema_HTTPS": 2,
                "enUrlSchema_FTP": 3,
                "enUrlSchema_FTPS": 4,
                "enUrlSchema_File": 5,
                "enUrlSchema_MOZPROXY": 6,
                "enUrlSchema_ChromeService": 7
            }
        ;var zawd = {
                "RF_MATCH_TYPE_NULL": 0,
                "RF_MATCH_TYPE_UNKNOWN": 1,
                "RF_MATCH_TYPE_BLOCKING": 2,
                "RF_MATCH_TYPE_DOMAIN": 3,
                "RF_MATCH_TYPE_SERVER": 4,
                "RF_MATCH_TYPE_PAGE": 20,
                "RF_MATCH_TYPE_URL_EXACT": 21
            }
        ;var zkfk = ".rfp";
        var zkfl = ".rfb";
        var zkfm = ".rfq";
        var zkfn = ".rfx";
        var zkfo = ".rfn";
        var zkfp = ".rft";
        var zkfq = ".rfc";
        var zkfr = {
                "regular": 0, "search": 1, "identity": 2
            }
        ;var zkfs = {
            "ParseUrl": function (zafy, ziqh, zkft) {
                if (!zafy || zafy.toLowerCase() == "about:blank") {
                    return undefined;
                }
                zafy = zafy.replace(new RegExp("^mhtml:", "i"), "");

                function zkfu(zkfv) {
                    switch (zkfv.toLowerCase()) {
                        case"http":
                        case"https":
                        case"moz-proxy":
                        case"chrome":
                            return ziea["enUrlType_HTTP"];
                        case"ftp":
                        case"ftps":
                            return ziea["enUrlType_FTP"];
                        case"file":
                            return ziea["enUrlType_File"];
                        default:
                            return ziea["enUrlType_Unknown"];
                    }
                    ;
                }

                function zkfw(zkfv) {
                    switch (zkfv.toLowerCase()) {
                        case"http":
                            return zieb["enUrlSchema_HTTP"];
                        case"https":
                            return zieb["enUrlSchema_HTTPS"];
                        case"ftp":
                            return zieb["enUrlSchema_FTP"];
                        case"ftps":
                            return zieb["enUrlSchema_FTPS"];
                        case"file":
                            return zieb["enUrlSchema_File"];
                        case"moz-proxy":
                            return zieb["enUrlSchema_MOZPROXY"];
                        case"chrome":
                            return zieb["enUrlSchema_ChromeService"];
                        default:
                            return zieb["enUrlSchema_Unknown"];
                    }
                    ;
                }

                var zbdo = 0;
                var type = undefined;
                var schema = undefined;
                if (zafy.length < 2
                    || zafy.search(new RegExp("^/|^[a-z]:", "i")) >= 0) {
                    type = ziea["enUrlType_File"];
                    zkfy = zieb["enUrlSchema_File"];
                } else {
                    zbdo = zafy.indexOf(':');
                    if (zbdo >= 0) {
                        if ((zbdo + 3) <= zafy.length && zafy[zbdo + 1] == '/'
                            && zafy[zbdo + 2] == '/') {
                            var zkfv = zafy.substring(0, zbdo);
                            type = zkfu(zkfv);
                            schema = zkfw(zkfv);
                            zbdo = zbdo + 3;
                        } else {
                            return undefined;
                        }
                    } else {
                        zbdo = 0;
                    }
                }
                if (type != ziea["enUrlType_HTTP"]
                    && type != ziea["enUrlType_FTP"]) {
                    var zjii = zafy.slice(zbdo);
                    if (ziqh) {
                        zjii = decodeURI(zjii);
                    }
                    return {"type": type, "schema": schema, "object": zjii};
                }
                var zkfz = zbdo;
                if (ziqh) {
                    if (zkft) {
                        zafy = decodeURI(zafy);
                    } else {
                        zbdo = zafy.slice(zbdo).search(new RegExp("[;?#]", ""));
                        if (zbdo >= 0) {
                            zafy = decodeURI(zafy.substr(0, zkfz + zbdo + 1)) + zafy.slice(zkfz + zbdo + 1);
                        }
                        zbdo = zkfz;
                    }
                }
                var username = undefined;
                var password = undefined;
                var zgew = zafy.slice(zbdo).search(new RegExp("[@\/;?#]", ""));
                if (zgew >= 0 && zafy[zbdo] == '@') {
                    var zkgb = zafy.slice(zbdo, zbdo + zgew);
                    zbdo = zbdo + zgew + 1;
                    var zkgc = zkgb.search(':');
                    if (zkgc >= 0) {
                        username = zkgb.substr(0, zkgc);
                        password = zkgb.slice(zkgc + 1);
                    } else {
                        username = zkgb;
                    }
                }
                var zkgd = undefined;
                var host = undefined;
                var port = undefined;
                zgew = zafy.slice(zbdo).search(new RegExp("[\/;?#]"));
                if (zgew < 0) {
                    zgew = zafy.length;
                }
                if (zgew >= 0) {
                    zkgf = zafy.slice(zbdo, zbdo + zgew);
                    zbdo = zbdo + zgew;
                    var zkgg = zkgf.search(':');
                    if (zkgg >= 0) {
                        host = zkgf.substr(0, zkgg);
                        port = zkgf.slice(zkgg + 1);
                    } else {
                        host = zkgf;
                    }
                }
                var zjii = undefined;
                if (zbdo < zafy.length && zafy[zbdo] == '/') {
                    var zkgh = zafy.slice(zbdo).search(new RegExp("[;?#]"));
                    if (zkgh >= 0) {
                        zjii = zafy.slice(zbdo + 1, zbdo + zkgh);
                        zbdo = zbdo + zgew;
                    } else {
                        zjii = zafy.slice(zbdo + 1);
                        zbdo = zafy.length;
                    }
                }
                var param = undefined;
                if (zbdo < zafy.length && zafy[zbdo] == ';') {
                    zgew = zafy.slice(zbdo).search(new RegExp("[\?#]"));
                    if (zgew >= 0) {
                        param = zafy.slice(zbdo + 1, zbdo + zgew);
                        zbdo = zbdo + zgew;
                    } else {
                        param = zafy.slice(zbdo + 1);
                        zbdo = zafy.length;
                    }
                }
                var query = undefined;
                if (zbdo < zafy.length && zafy[zbdo] == '?') {
                    zgew = zafy.slice(zbdo).search('#');
                    if (zgew >= 0) {
                        query = zafy.slice(zbdo + 1, zbdo + zgew);
                        zbdo = zbdo + zgew;
                    } else {
                        query = zafy.slice(zbdo + 1);
                        zbdo = zafy.length;
                    }
                }
                var reference = undefined;
                if (zbdo < zafy.length && zafy[zbdo] == '#') {
                    object = zafy.slice(zbdo + 1);
                    zbdo = zafy.length;
                }
                host = host.toLowerCase();

                function zkgj(zkgk) {
                    if (!zkgk) {
                        return false;
                    }
                    if (zkgk.search(new RegExp("[^0-9\.]", "")) >= 0) {
                        return false;
                    }
                    var zkgl = zkgk.match(new RegExp("\\.", "g"));
                    if (zkgl && zkgl.length > 3) {
                        return false;
                    }
                    return true;
                }

                function zkgm(zkgk) {
                    if (zkgk.length < 2) {
                        return false;
                    }
                    if (zkgk[0] == '[') {
                        if (zkgk[zfhe - 1] != ']') {
                            return false;
                        }
                        zkgk = zkgk.slice(1, zfhe - 2);
                    }
                    var zkgn = zkgk.match(new RegExp("\:", "g"));
                    var zkgo = zkgn ? zkgn.length : 0;
                    if (zkgo > 7) {
                        return false;
                    }
                    for (var i = 0; i < zkgo; i++) {
                        var zom = zkgk.indexOf(':');
                        if (zom < 0) {
                            return false;
                        }
                        var zkgp = zkgk.substr(0, zom);
                        if (zkgp.search(new RegExp("[^0-9a-fA-F]", "")) >= 0) {
                            return false;
                        }
                        zkgk = zkgk.slice(zom + 1);
                    }
                    if (zkgk.search(new RegExp("[^0-9a-fA-F]", "")) >= 0) {
                        if (!zkgj(zkgk)) {
                            return false;
                        }
                    }
                    return true;
                }

                var isIP = zkgj(host) || zkgm(host);
                if (host == "127.0.0.1") {
                    host = "localhost";
                }
                if (!port && (type == ziea["enUrlType_HTTP"] || schema == zieb["enUrlSchema_Unknown"])) {
                    port = "80";
                }
                return {
                    "type": type,
                    "schema": schema,
                    "username": username,
                    "password": password,
                    "host": host,
                    "isIP": isIP,
                    "port": port,
                    "object": zjii,
                    "param": param,
                    "query": query,
                    "reference": reference
                }
                    ;
            }, "GetWin32UrlDomain": function (zafy) {
                if (zafy.search(new RegExp("^exe://", "i")) < 0) {
                    return undefined;
                }
                var zkgr = zafy.length;
                var zafc = 6;
                for (; zafc < zkgr && zafy[zafc] == ' '; zafc++) {
                }
                if (zafy[zafc] == '"') {
                    var zkgs = zafy.slice(zafc + 1).indexOf('"');
                    if (zkgs < 0) {
                        return undefined;
                    }
                    var zkgt = zafy.slice(zafc + 1, zkgs - 1);
                    var zkgu = zkgt.indexOf('/');
                    if (zkgu >= 0) {
                        var zkgv = zkgt.substr(0, zkgu);
                    } else {
                        var zkgv = zkgt;
                    }
                } else {
                    var zkgw = zafy.slice(zafc + 1).indexOf('/');
                    if (zkgw < 0) {
                        var zkgx = zafy.indexOf(' ');
                        if (zkgx < 0) {
                            var zkgv = zafy.slice(zafc);
                        } else {
                            var zkgv = zafy.slice(zafc, zkgx - 1);
                        }
                    } else {
                        var zkgv = zafy.slice(zafc, zkgw - 1);
                    }
                }
                zkgv.replace('\\', '/');
                var zkgy = zkgv.lastIndexOf('/');
                if (zkgy >= 0) {
                    zkgv = zkgv.slice(zkgy + 1);
                }
                var zkgz = zkgv.lastIndexOf('.');
                if (zkgz >= 0) {
                    zkgv = zkgv.substr(0, zkgz);
                }
                return zkgv;
            }, "DomainFromUrl": function (zafy, zkha, zkhb, zkhc, zkhd) {
                if (zafy == "{Win32Dlg}") {
                    return "{Win32Dlg}";
                }
                var zafy = zafy.toLowerCase();
                if (zafy.startsWith("about:") || zafy.startsWith("javascript:") || zafy.startsWith("ms-browser-extension://") || zafy.startsWith("chrome-extension://") || zafy.startsWith("chrome://") || zafy === "http://") {
                    return "";
                }
                if (zafy.startsWith("exe://")) {
                    if (zkha && zkhb) {
                        return "exe://" + zkfs["GetWin32UrlDomain"](zafy);
                    } else {
                        return zkfs["GetWin32UrlDomain"](zafy);
                    }
                }
                if (!zkhd) {
                    zkhd = zkfs["ParseUrl"](zafy, true, false);
                    if (!zkhd) {
                        return "(unparsable)";
                    }
                }
                var zkhe = "";
                if (!zkhd["host"] || zkhd["schema"] == zieb["enUrlSchema_Unknown"]) {
                    zkhe = zkhd["object"];
                } else {
                    zkhe = zkhd["host"];
                }
                var zkhf = "";
                if (zkhd["type"] == ziea["enUrlType_File"]) {
                    return (zkha && zkhb) ? "file://(file)"
                        : "(file)";
                } else if (zkhd["type"] == ziea["enUrlType_FTP"]) {
                    zkhf = "ftp://";
                } else {
                    zkhf = "http://";
                }
                if (zkhd["isIP"]) {
                    return (zkha && zkhb) ? zkhf + zkhe : zkhe;
                }
                var zkhg = "";
                var zkhh = "";
                var zbdo = zkhe.indexOf('.');
                if (zbdo >= 0) {
                    if (zkhe.startsWith("www") || zkhe.startsWith("www2.") || zkhe.startsWith("www3.") || zkhe.startsWith("cgi")) {
                        zkhe = zkhe.slice(zbdo + 1);
                    }
                }
                var zkhi = {
                        "com": ["eu", "au", "br", "cn", "de", "gb", "hu", "no", "ru", "sa", "se", "uk", "us", "uy", "za", "amer.csc"],
                        "net": ["gb", "se", "uk", "nobelbiocare"],
                        "org": ["eu"],
                        "int": ["eu"],
                        "uk": ["ltd", "me", "plc"],
                        "ca": ["gc", "ab", "bc", "mb", "nb", "nf", "nl", "ns", "nt", "nu", "on", "pe", "qc", "sk", "yk"],
                        "fr": ["tm", "asso", "nom", "prd", "presse"],
                        "se": ["tm", "pp", "parti", "press"],
                        "jp": ["ad", "ed", "gr", "lg"],
                        "tw": ["idv", "game", "ebiz", "club"],
                        "kr": ["pe", "re", "hs", "ms", "es", "sc", "kg", "seoul", "busan", "daegu", "incheon", "gwangju", "daejeon", "ulsan", "gyeonggi", "gangwon", "chungbuk", "chungnam", "jeonbuk", "jeonnam", "gyeongbuk", "gyeongnam", "jeju"],
                        "ru": ["sp", "pp", "nsc", "mhost", "caravan", "narod", "spb", "msk", "adygeya", "bashkiria", "ulan-ude", "buryatia", "dagestan", "nalchik", "kalmykia", "kchr", "karelia", "ptz", "komi", "mari-el", "joshkar-ola", "mari", "mordovia", "yakutia", "vladikavkaz", "kazan", "tatarstan", "tuva", "udmurtia", "izhevsk", "udm", "khakassia", "grozny", "chuvashia", "altai", "kuban", "krasnoyarsk", "marine", "vladivostok", "stavropol", "stv", "khabarovsk", "khv", "amur", "arkhangelsk", "astrakhan", "belgorod", "bryansk", "vladimir", "volgograd", "tsaritsyn", "vologda", "voronezh", "vrn", "cbg", "ivanovo", "irkutsk", "koenig", "kaluga", "kamchatka", "kemerovo", "kirov", "vyatka", "kostroma", "kurgan", "kursk", "lipetsk", "magadan", "mosreg", "murmansk", "nnov", "nov", "nsk", "novosibirsk", "omsk", "orenburg", "oryol", "penza", "perm", "pskov", "rnd", "ryazan", "samara", "saratov", "sakhalin", "yuzhno-sakhalinsk", "yekaterinburg", "e-burg", "smolensk", "tambov", "tver", "tomsk", "tsk", "tom", "tula", "tyumen", "simbirsk", "chelyabinsk", "chel", "chita", "yaroslavl", "bir", "jar", "palana", "dudinka", "surgut", "chukotka", "yamal", "amursk", "baikal", "cmw", "fareast", "jamal", "kms", "k-uralsk", "kustanai", "kuzbass", "magnitka", "mytis", "nakhodka", "nkz", "norilsk", "snz", "oskol", "pyatigorsk", "rubtsovsk", "syzran", "tagil", "vdonsk", "zgrad"],
                        "in": ["firm", "gen", "ind", "res", "ernet"]
                    }
                ;var zbdo = zkhe.lastIndexOf('.');
                if (zbdo >= 0) {
                    var zkhj = false;
                    var zkhk = zkhe.slice(zbdo + 1);
                    zkhh = "." + zkhk;
                    var zkhl = zkhe.substr(0, zbdo);
                    if (zkhl.length > 0) {
                        var zkhm = zkhl.lastIndexOf('.');
                        if (zkhm >= 0) {
                            var zkhn = zkhl.slice(zkhm + 1);
                            var zkho = zkhi[zkhk];
                            if (zkhn != ""
                                && zkho != undefined && zkho.indexOf(zkhn) >= 0) {
                                zkhh = "." + zkhn + "." + zkhk;
                                zkhe = zkhe.substr(0, zkhe.length - zkhh.length);
                                zkhj = true;
                            } else {
                                var zkhp = zkhl.substr(0, zkhm);
                                var zkhq = zkhp.lastIndexOf('.');
                                if (zkhq > 0) {
                                    var zkhr = zkhl.slice(zkhq + 1);
                                    if (zkho && zkho.indexOf(zkhr) >= 0) {
                                        zkhh = "." + zkhr + "." + zkhk;
                                        zkhe = zkhe.substr(0, zkhe.length - zkhh.length);
                                        zkhj = true;
                                    }
                                }
                            }
                        }
                    }
                    if (!zkhj) {
                        var zkhk = zkhe.slice(zbdo + 1);
                        zkhh = "." + zkhk;
                        zkhe = zkhe.substr(0, zbdo);
                        if (zkhk.length == 2) {
                            zbdo = zkhe.lastIndexOf('.');
                            if (zbdo >= 0) {
                                zkhk = zkhe.slice(zbdo + 1);
                                if (zkhh == "us"
                                    || zkhk == "co"
                                    || zkhk == "ac"
                                    || zkhk == "go"
                                    || zkhk == "or"
                                    || zkhk == "ne"
                                    || zkhk == "com"
                                    || zkhk == "edu"
                                    || zkhk == "gov"
                                    || zkhk == "gouv"
                                    || zkhk == "gob"
                                    || zkhk == "info"
                                    || zkhk == "int"
                                    || zkhk == "mil"
                                    || zkhk == "net"
                                    || zkhk == "org") {
                                    zkhh = "." + zkhk + zkhh;
                                    zkhe = zkhe.substr(0, zbdo);
                                }
                            }
                        }
                    }
                    zbdo = zkhe.lastIndexOf('.');
                    if (zbdo >= 0) {
                        zkhg = zkhe.slice(zbdo + 1);
                        zkhe = zkhe.substr(zbdo);
                    } else {
                        zkhg = zkhe;
                        zkhe = "";
                    }
                } else {
                    zkhg = zkhe;
                    zkhh = "";
                }
                if (zkhg && zkhc) {
                    var zawv = zkhg.substr(0, 1);
                    zkhg = zawv.toUpperCase() + zkhg.slice(1);
                }
                if (zkha) {
                    if (zkhb) {
                        return zkhf + zkhg + zkhh;
                    } else {
                        return zkhg + zkhh;
                    }
                }
                return zkhg;
            }, zafz: function (zauj, zauk) {
                if (!zauj || !zauk) {
                    return false;
                }
                var zaun = zkfs["ParseUrl"](zauj, true, false);
                var zauo = zkfs["ParseUrl"](zauk, true, false);
                if (!zaun || !zauo) {
                    return false;
                }
                if (zaun["host"] == zauo["host"]) {
                    return true;
                }
                var zkhs = zkfs["DomainFromUrl"](zauj, true, false, false);
                var zkht = zkfs["DomainFromUrl"](zauk, true, false, false);
                return zkhs == zkht;
            }
            , "CompareUrls": function (zauj, zauk, znh) {
                zauj = zauj.replace(new RegExp("\/$", "g"), "");
                zauk = zauk.replace(new RegExp("\/$", "g"), "");
                if (zauj.toLowerCase() == zauk.toLowerCase()) {
                    return zawd["RF_MATCH_TYPE_URL_EXACT"];
                }
                var zaul = zauj.search(new RegExp("^exe:\/\/")) >= 0;
                var zaum = zauk.search(new RegExp("^exe:\/\/")) >= 0;
                if (zaul && zaum) {
                    if (zkfs["GetWin32UrlDomain"](zauj).toLowerCase() == zkfs["GetWin32UrlDomain"](zauk).toLowerCase()) {
                        return zawd["RF_MATCH_TYPE_SERVER"];
                    } else {
                        return zawd["RF_MATCH_TYPE_NULL"];
                    }
                }
                var zaun = zkfs["ParseUrl"](zauj, true, false);
                var zauo = zkfs["ParseUrl"](zauk, true, false);
                if (!zaun || !zauo) {
                    return zawd["RF_MATCH_TYPE_NULL"];
                }
                if (zaun["type"] == ziea["enUrlType_File"]
                    && zauo["type"] == ziea["enUrlType_File"]
                    && zaun["object"]
                    && zauo["object"]
                    && zaun["object"].toLowerCase() == zauo["object"].toLowerCase()) {
                    return zawd["RF_MATCH_TYPE_URL_EXACT"];
                }
                if (!zaun["host"] || !zauo["host"]) {
                    return zawd["RF_MATCH_TYPE_NULL"];
                }
                var zkhu = zaun["host"].toLowerCase() == zauo["host"].toLowerCase();
                if (zkhu && zaun["port"] == zauo["port"]
                    && zaun["object"] == zauo["object"]) {
                    return zawd["RF_MATCH_TYPE_PAGE"];
                }
                if (zkhu) {
                    var zkhv = zawd["RF_MATCH_TYPE_SERVER"];
                    if (zaun["port"] == zauo["port"]
                        && zaun["object"]
                        && zauo["object"]) {
                        zkhv++;
                        var zkhw = Math.min(zaun["object"].length, zauo["object"].length);
                        for (var i = 0; i < zkhw && zaun["object"][i] == zauo["object"][i] && zkhv < zawd["RF_MATCH_TYPE_PAGE"] - 1; ++i) {
                            if (zaun["object"][i] == '/') {
                                zkhv++;
                            }
                        }
                    }
                    return zkhv;
                }
                if (zkfs.zafz(zauj, zauk)) {
                    return zawd["RF_MATCH_TYPE_DOMAIN"];
                }
                return zawd["RF_MATCH_TYPE_NULL"];
            }, zeeh: function (zeef) {
                zeef = zeef.toLowerCase();
                if (zeef == zkfk) {
                    return zwa["RfItemType_Login"];
                }
                if (zeef == zkfl) {
                    return zwa["RfItemType_Bookmark"];
                }
                if (zeef == zkfm) {
                    return zwa["RfItemType_SearchCard"];
                }
                if (zeef == zkfo) {
                    return zwa["RfItemType_Safenote"];
                }
                if (zeef == zkfp) {
                    return zwa["RfItemType_Identity"];
                }
                if (zeef == zkfq) {
                    return zwa["RfItemType_Contact"];
                }
                if (zeef == zkfn) {
                    return zwa["RfItemType_BlockingPasscard"];
                }
                return zwa["RfItemType_Undefined"];
            }, zadc: function (zdd) {
                if (zdd == zwa["RfItemType_Login"]) {
                    return zkfk;
                }
                if (zdd == zwa["RfItemType_Bookmark"]) {
                    return zkfl;
                }
                if (zdd == zwa["RfItemType_SearchCard"]) {
                    return zkfm;
                }
                if (zdd == zwa["RfItemType_Safenote"]) {
                    return zkfo;
                }
                if (zdd == zwa["RfItemType_Identity"]) {
                    return zkfp;
                }
                if (zdd == zwa["RfItemType_Contact"]) {
                    return zkfq;
                }
                if (zdd == zwa["RfItemType_BlockingPasscard"]) {
                    return zkfn;
                }
                return "";
            }, zhpb: function (zkhx, zkhy, zkhz, zkia, zok) {
                for (var i = zkhy, zgs = zkia; i < (zkhy + zok); i++, zgs++) {
                    zkhz[zgs] = zkhx[i];
                }
            }, zkib: function (n, b) {
                return (n << b) | (n >>> (32 - b));
            }, zkic: function (n, b) {
                return (n << (32 - b)) | (n >>> b);
            }
            , zkid: function (n) {
                if (n.constructor == Number) {
                    return zkfs.zkib(n, 8) & 0x00FF00FF | zkfs.zkib(n, 24) & 0xFF00FF00;
                }
                for (var i = 0; i < n.length; i++) n[i] = zkfs.zkid(n[i]);
                return n;
            }
            , zhqe: function (zkie) {
                return zkie % 256;
            }, zkif: function (salt) {
                var zkig = new zkih((int)(zkii.zkij.zkik(new zkii(1970, 1, 1))).zkil * 3);
                zkig.zkim(salt);
            }
            , zhqb: function () {
                var crypto = window.crypto || window.msCrypto;
                return !crypto ? Math.floor(Math.random() * 10000000000) : this.zkin(1000000000, crypto);
            }
            , zhpt: function (n) {
                var crypto = window.crypto || window.msCrypto;
                for (var bytes = []; n > 0; n--) {
                    !crypto ? bytes.push(Math.floor(Math.random() * 256)) : bytes.push(this.zkin(255, crypto));
                }
                return bytes;
            }, zkio: function (bytes) {
                for (var zyu = [], i = 0, b = 0; i < bytes.length; i++, b += 8) zyu[b >>> 5] |= (bytes[i] & 0xFF) << (24 - b % 32);
                return zyu;
            }
            , zkip: function (zyu) {
                for (var bytes = [], b = 0; b < zyu.length * 32; b += 8) bytes.push((zyu[b >>> 5] >>> (24 - b % 32)) & 0xFF);
                return bytes;
            }
            , zhjp: function (bytes) {
                for (var hex = [], i = 0; i < bytes.length; i++) {
                    hex.push((bytes[i] >>> 4).toString(16));
                    hex.push((bytes[i] & 0xF).toString(16));
                }
                return hex.join("");
            }, zhjk: function (hex) {
                for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
                return bytes;
            }
            , zexo: function (bytes) {
                for (var base64 = [], i = 0; i < bytes.length; i += 3) {
                    var zkiq = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
                    for (var zgs = 0; zgs < 4; zgs++) {
                        if (i * 8 + zgs * 6 <= bytes.length * 8) base64.push(zkfj.charAt((zkiq >>> 6 * (3 - zgs)) & 0x3F)); else base64.push("=");
                    }
                }
                return base64.join("");
            }, zbpk: function (base64) {
                base64 = base64.replace(new RegExp("[^A-Z0-9+\/]", "ig"), "");
                for (var bytes = [], i = 0, zkir = 0; i < base64.length; zkir = ++i % 4) {
                    if (zkir == 0) continue;
                    bytes.push(((zkfj.indexOf(base64.charAt(i - 1)) & (Math.pow(2, -2 * zkir + 8) - 1)) << (zkir * 2)) | (zkfj.indexOf(base64.charAt(i)) >>> (6 - zkir * 2)));
                }
                return bytes;
            }, zhqt: function (zkis, zkit) {
                if (zkis.length !== zkit.length) {
                    return false;
                }
                var zdfj = zkis.length;
                while (zdfj--) {
                    if (!~zkit.indexOf(zkis[zdfj]) || !~zkis.indexOf(zkit[zdfj])) {
                        return false;
                    }
                }
                return true;
            }, zhnn: function (zaxp, zaxq) {
                if (zaxp === zaxq) {
                    return true;
                }
                if (!zaxp || !zaxq) {
                    return false;
                }
                if (zaxp.length !== zaxq.length) {
                    return false;
                }
                for (var i = 0; i < zaxp.length; i++) {
                    if (zaxp[i] !== zaxq[i]) {
                        return false;
                    }
                }
                return true;
            }, ziaf: function (zezy) {
                if (zezy === undefined || zezy === null) {
                    return zezy;
                }
                var zkiu;
                switch (typeof zezy) {
                    case"object":
                        if (typeof zezy.length !== "undefined") {
                            zkiu = [];
                            for (var i = 0; i < zezy.length; i++) {
                                zkiu[i] = this.ziaf(zezy[i]);
                            }
                        } else {
                            zkiu = {};
                            for (var n in zezy) {
                                zkiu[n] = this.ziaf(zezy[n]);
                            }
                        }
                        break;
                    case"function":
                        break;
                    default:
                        zkiu = zezy;
                        break;
                }
                return zkiu;
            }, zipy: function (zara, zkiv, zgtk) {
                var arr = zara.split(zgtk);
                if (arr.length == 1) {
                    return false;
                }
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i];
                    if (item.indexOf(zkiv) == 0) {
                        return true;
                    }
                }
                return false;
            }, byteLength: function (zara) {
                var s = zara.length;
                for (var i = zara.length - 1; i >= 0; i--) {
                    var code = zara.charCodeAt(i);
                    if (code > 0x7f && code <= 0x7ff) {
                        s++;
                    } else if (code > 0x7ff && code <= 0xffff) {
                        s += 2;
                    }
                    if (code >= 0xDC00 && code <= 0xDFFF) {
                        i--;
                    }
                }
                return s;
            }, zjsp: function () {
                function pad(n) {
                    return n < 10 ? '0' + n : n;
                }

                var zkiw = new Date();
                var zkix = zkiw.getYear() + 1900;
                var zkiy = pad(zkiw.getMonth() + 1);
                var zkiz = pad(zkiw.getDate());
                var zkja = pad(zkiw.getHours());
                var zkjb = pad(zkiw.getMinutes());
                var zkjc = pad(zkiw.getSeconds());
                var zjso = zkix.toString() + zkiy.toString() + zkiz.toString();
                zjso += "_";
                zjso += zkja.toString() + zkjb.toString() + zkjc.toString();
                return zjso;
            }
            , generatePassword: function (zkjd, zkje, zkjf, zkjg, zkjh, zidh, zkji, zkjj, zkjk, zkjl) {
                var crypto = window.crypto || window.msCrypto;
                var zkjm = "";
                var zkjn = "";
                var password = "";
                zkjd = zkjd === undefined ? 8 : zkjd;
                zkjd = parseInt(zkjd);
                zkje = zkje === undefined ? true : zkje;
                zkjf = zkjf === undefined ? true : zkjf;
                zkjg = zkjg === undefined ? true : zkjg;
                zkjj = zkjj === undefined ? false : zkjj;
                zkjk = zkjk === undefined ? true : zkjk;
                zkjh = zkjh === undefined ? false : zkjh;
                zidh = zidh === undefined ? "" : zidh;
                var zkjo;
                if (zkjl === undefined) {
                    zkjo = 0;
                    if (zkje) {
                        zkjo++;
                    }
                    if (zkjf) {
                        zkjo++;
                    }
                    if (zkjh && zidh) {
                        zkjo++;
                    }
                } else {
                    zkjo = parseInt(zkjl);
                }
                var zkjp = 1;
                if (zkjg) {
                    if (zkji !== undefined) {
                        zkjp = parseInt(zkji);
                        if (zkjp > zkjd) {
                            zkjp = zkjd;
                        } else if (zkjp <= 0) {
                            zkjp = 1;
                        }
                    } else {
                        var zkjq = zkjo >= zkjd ? zkjd : (zkjd - zkjo);
                        zkjp = this.zkin(3, crypto);
                        zkjp = !zkjp ? 1 : zkjp;
                    }
                }
                if (zkjo) {
                    zkjo = zkjo > zkjd ? zkjd : zkjo;
                    if (zkjg && zkjp && ((zkjp + zkjo) > zkjd)) {
                        if (zkjd == 1) {
                            zkjp = 0;
                            zkjo = 1;
                        } else if (zkjd == 2) {
                            zkjp = 1;
                            zkjo = 1;
                        } else {
                            zkjp = 1;
                            zkjo = zkjd - 1;
                        }
                    }
                }
                if (zkjj) {
                    if (zkjk) {
                        zkjm = "23456789ABCDEF";
                    } else {
                        zkjm = "0123456789ABCDEF";
                    }
                } else {
                    var zkjr = 0;
                    if (zkje) {
                        var zkjs = zkjk ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                        zkjm += zkjs;
                        var zkjt = this.zkin(zkjs.length, crypto);
                        zkjt = zkjt == zkjs.length ? zkjt - 1 : zkjt;
                        zkjn += zkjs[zkjt];
                        zkjr++;
                    }
                    if (zkjf) {
                        var zkju = zkjk ? "abcdefghijkmnopqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
                        zkjm += zkju;
                        var zkjv = this.zkin(zkju.length, crypto);
                        zkjv = zkjv == zkju.length ? zkjv - 1 : zkjv;
                        zkjn += zkju[zkjv];
                        zkjr++;
                    }
                    if (zkjg) {
                        var zkjw = zkjk ? "23456789" : "0123456789";
                        zkjm += zkjw;
                        var zbna = zkjw.length;
                        for (var i = 0; i < zkjp; i++) {
                            var zkjx = this.zkin(zbna, crypto);
                            zkjx = zkjx == zkjw.length ? zkjx - 1 : zkjx;
                            zkjn += zkjw[zkjx];
                        }
                    }
                    if (zkjh && zidh) {
                        zkjm += zidh;
                        var zkjy = zidh.length;
                        var zkjz = zkjy > 1 ? this.zkin(zkjy, crypto) : 0;
                        zkjz = zkjz == zidh.length ? zkjz - 1 : zkjz;
                        zkjn += zidh[zkjz];
                    }
                    if (zkjo && zkjo > zkjr) {
                        var zkka = zkjo - zkjr;
                        var zkkb = "";
                        if (zkje) {
                            zkkb += zkjk ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                        }
                        if (zkjf) {
                            zkkb += zkjk ? "abcdefghijkmnopqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
                        }
                        if (zkkb.length) {
                            for (var i = 0; i < zkka; i++) {
                                var zkkc = this.zkin(zkkb.length, crypto);
                                zkkc = zkkc == zkkb.length ? zkkc - 1 : zkkc;
                                zkjn += zkkb[zkkc];
                            }
                        }
                    }
                }
                var zkkd = zkjn.length;
                var zkke = zkjm.length;
                if (!zkke && !zkkd) {
                    return password;
                }
                var count;
                for (count = 0; count < zkjd - zkkd; count++) {
                    var zafc = this.zkin(zkke, crypto);
                    zafc = zafc == zkjm.length ? zafc - 1 : zafc;
                    var zkkf = zkjm[zafc];
                    password += zkkf;
                }
                for (var i = 0; i < zkkd && count < zkjd; i++, count++) {
                    var zkkg = zkjn[i];
                    var zkkh = password.length;
                    var zkki = zkkh == 0 ? 0 : this.zkin(zkkh + 1, crypto);
                    password = password.slice(0, zkki) + new String(zkkg) + password.slice(zkki);
                }
                return password;
            }, zkin: function (zkkj, crypto) {
                if (!crypto) {
                    return Math.floor(Math.random() * (zkkj + 1));
                }
                var zkkk;
                var zkkl = new Uint32Array(1);
                zkkj >>>= 0;
                zkkk = (-zkkj >>> 0) % zkkj;
                do {
                    crypto.getRandomValues(zkkl);
                }
                while (zkkl[0] < zkkk);
                return zkkl[0] % zkkj;
            }, zkkm: function (zbop) {
                var zfnh = 0;
                if (zbop == "") {
                    return 0;
                }
                if (zbop.match(new RegExp(".*\\d.*\\d.*\\d"))) {
                    zfnh += 6;
                }
                if (zbop.match(new RegExp("[!,@,#,$,%,^,&,*,?,_,~]"))) {
                    zfnh += 6;
                }
                if (zbop.match(new RegExp(".*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~]"))) {
                    zfnh += 8;
                }
                zfnh += zbop.length * 3;
                if (zbop.match(new RegExp("[a-z]"))) {
                    zfnh += 2;
                }
                if (zbop.match(new RegExp("[A-Z]"))) {
                    zfnh += 5;
                }
                if (zbop.match(new RegExp("(?=.*[a-z])(?=.*[A-Z])"))) {
                    zfnh += 2;
                }
                if (zbop.match(new RegExp("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])"))) {
                    zfnh += 2;
                }
                if (zbop.match(new RegExp("\\d"))) {
                    zfnh += 4;
                }
                if (zbop.match(new RegExp("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!,@,#,$,%,^,&,*,?,_,~])"))) {
                    zfnh += 2;
                }
                zfnh *= 2;
                if (zfnh < 0) {
                    zfnh = 0;
                } else if (zfnh > 100) {
                    zfnh = 100;
                }
                return zfnh;
            }, zbxl: function (zaxz, zabn, zyh, zkkn, zkko) {
                zabn.splice(this.zkkp(zaxz, zabn, zkkn == 0 ? zkkq : (zkkn == 1 ? zkkr : zkks), undefined, undefined, zyh, zkko) + 1, 0, zaxz);
                return zabn;
            }
            , zkkp: function (zaxz, zabn, zkkt, zlw, zkku, zyh, zkkv) {
                if (zabn.length === 0) {
                    return -1;
                }
                zlw = zlw || 0;
                zkku = zkku || zabn.length;
                var zkkw = (zlw + zkku) >> 1;
                var c = zkkt(zaxz, zabn[zkkw], zyh, zkkv);
                if (zkku - zlw <= 1) {
                    return c == -1 ? zkkw - 1 : zkkw;
                }
                switch (c) {
                    case-1:
                        return this.zkkp(zaxz, zabn, zkkt, zlw, zkkw, zyh, zkkv);
                    case 0:
                        return zkkw;
                    case 1:
                        return this.zkkp(zaxz, zabn, zkkt, zkkw, zkku, zyh, zkkv);
                }
                ;
            }, zhkm: function (data, zkkx) {
                return (data[zkkx + 3] << 24) | (data[zkkx + 2] << 16) | (data[zkkx + 1] << 8) | data[zkkx];
            }
            , zkky: function (zkkz, zkla, count) {
                var zklb = zkkz[zkla + 1] ? bigInt(zkkz[zkla + 1]) : bigInt(0);
                var zklc = zkkz[zkla] ? bigInt(zkkz[zkla]) : bigInt(0);
                if (count == 2) {
                    return (zklb.shiftLeft(8).or(zklc)).value;
                }
                var zkld = zkkz[zkla + 3] ? bigInt(zkkz[zkla + 3]) : bigInt(0);
                var zkle = zkkz[zkla + 2] ? bigInt(zkkz[zkla + 2]) : bigInt(0);
                return zkld.shiftLeft(24).or(zkle.shiftLeft(16).or(zklb.shiftLeft(8).or(zklc))).value;
            }
            , zhkd: function (data) {
                var b = new Array(4);
                b[0] = data & 0xFF;
                b[1] = ((data >> 8) & 0xFF);
                b[2] = ((data >> 16) & 0xFF);
                b[3] = ((data >> 24) & 0xFF);
                return b;
            }
            , zklf: function (data, count) {
                var zklg = bigInt(data);
                var bytes = [];
                bytes[0] = zklg.and(0xFF).value;
                bytes[1] = zklg.shiftRight(8).and(0xFF).value;
                if (count == 2) {
                    return bytes;
                }
                bytes[2] = zklg.shiftRight(16).and(0xFF).value;
                bytes[3] = zklg.shiftRight(24).and(0xFF).value;
                return bytes;
            }
            , zjnz: function (params, ziqn, ziqo) {
                var in_bytes = params["in_bytes"];
                if (!in_bytes) {
                    ziqo({"eErr": 6, "sErr": "Missed required parameter: input stream"}
                    );
                    return false;
                }
                var zklh = in_bytes.length;
                var key_pem = params["key_pem"];
                if (!key_pem) {
                    ziqo({"eErr": 6, "sErr": "Missed required parameter:  RSA key"}
                    );
                    return false;
                }
                var is_key_private = params["is_key_private"];
                var zkli = 4;
                var zklj = 2;
                var zklk = 4;
                var zkll = 11;
                var zklm = 128;
                var zkln = zklm - zkll;
                var zklo = [];
                var zklp = 0;

                function zklq() {
                    var zklr = zkls(zklo, zklp);
                    var zklt = RfapiJS["utils"].zklf(zklr, zklk);
                    RfapiJS["utils"].zhpb(zklt, 0, zklo, zklp, zklk);
                    zklp += zklk;
                    ziqn(zklo);
                }

                function zklu() {
                    var zklv = 32;
                    var zklw = 8;
                    var zklx = RfapiJS["utils"].zhpt(zklv + zklw);
                    var zkly = [];
                    RfapiJS["utils"].zhpb(zklx, 0, zkly, 0, zklv);
                    var zklz = [];
                    RfapiJS["utils"].zhpb(zklx, zklv, zklz, 0, zklw);
                    var zkma = RfapiJS["utils"].zkmb(zklz, 1, 64, sjcl.codec.bytes.toBits(zkly));
                    var zkmc = {in_bytes: zklx, key_pem: key_pem, is_key_private: is_key_private, zkmd: true}
                    RfapiJS["utils"].zkme(zkmc, function zkmf(zkmg) {
                            var zkmh = zkmg.length;
                            if (!zkmh) {
                                ziqo({"eErr": 6, "sErr": "RSA encryption failed"}
                                );
                                return false;
                            }
                            var zhb = [115, 114, 115, 50];
                            RfapiJS["utils"].zhpb(zhb, 0, zklo, 0, zkli);
                            zklp += zkli;
                            var zkmi = RfapiJS["utils"].zklf(zkmh, 2);
                            RfapiJS["utils"].zhpb(zkmi, 0, zklo, zklp, zklj);
                            zklp += zklj;
                            RfapiJS["utils"].zhpb(zkmg, 0, zklo, zklp, zkmh);
                            zklp += zkmh;
                            var key = new Array(32);
                            var iv = new Array(16);
                            RfapiJS["utils"].zhpb(zkma, 0, key, 0, 32);
                            RfapiJS["utils"].zhpb(zkma, 32, iv, 0, 16);
                            var zexi = CryptoJS.enc.u8array.parse(key);
                            var zexj = CryptoJS.enc.u8array.parse(iv);
                            var zkmj = {}
                            ;zkmj["iv"] = zexj;
                            zkmj["mode"] = CryptoJS.mode.CBC;
                            zkmj["padding"] = CryptoJS.pad.Pkcs7;
                            var zuc = CryptoJS.algo.AES.createEncryptor(zexi, zkmj);
                            var zkmk = zuc.process(CryptoJS.enc.u8array.parse(in_bytes));
                            var zkml = zuc.finalize();
                            if (zkml.sigBytes >= 0) {
                                zkmk = zkmk.concat(zkml);
                            }
                            var zklx = CryptoJS.enc.u8array.stringify(zkmk);
                            var zkmm = zklx.length;
                            RfapiJS["utils"].zhpb(zklx, 0, zklo, zklp, zkmm);
                            zklp += zkmm;
                            zklq();
                        }
                        , ziqo);
                }

                function zkmn() {
                    var zjgm = new RSAKey();
                    var zkmo = RfapiJS["RF_RSA"].zimq(key_pem, !is_key_private);
                    if (is_key_private) {
                        zjgm.setPrivateEx(zkmo["modulus"], zkmo["exponent"], zkmo["privateexp"], zkmo["P"], zkmo["Q"], zkmo["DP"], zkmo["DQ"], zkmo["InverseQ"]);
                    } else {
                        zjgm.setPublic(zkmo["modulus"], zkmo["exponent"]);
                    }
                    var zkmp = RfapiJS["utils"].zhjk(zjgm.encrypt(in_bytes, true));
                    var zkmh = zkmp.length;
                    if (!zkmh) {
                        ziqo({"eErr": 6, "sErr": "RSA Encryption failed"}
                        );
                        return false;
                    }
                    var zhb = [115, 114, 115, 49];
                    RfapiJS["utils"].zhpb(zhb, 0, zklo, 0, zkli);
                    zklp += zkli;
                    var zkmi = RfapiJS["utils"].zklf(zkmh, 2);
                    RfapiJS["utils"].zhpb(zkmi, 0, zklo, zklp, zklj);
                    zklp += zklj;
                    RfapiJS["utils"].zhpb(zkmp, 0, zklo, zklp, zkmh);
                    zklp += zkmh;
                    zklq();
                }

                zklh <= zkln ? zkmn() : zklu();
            }, zjlk: function (params, ziqn, ziqo) {
                var in_bytes = params["in_bytes"];
                if (!in_bytes) {
                    ziqo({"eErr": 6, "sErr": "Missed required parameter: input stream"}
                    );
                    return false;
                }
                var key_pem = params["key_pem"];
                if (!key_pem) {
                    ziqo({"eErr": 6, "sErr": "Missed required parameter:  RSA key"}
                    );
                    return false;
                }
                var is_key_private = params["is_key_private"];
                var zkli = 4;
                var zklk = 4;
                var zklj = 2;
                var zklh = in_bytes.length;
                if (zklh < zkli + zklj + zklk) {
                    ziqo({"eErr": 6, "sErr": "Corrupted data: stream is too small"}
                    );
                    return false;
                }
                var zhpv;
                var zhb = [];
                RfapiJS["utils"].zhpb(in_bytes, 0, zhb, 0, zkli);
                if (RfapiJS["utils"].zhnn(zhb, [115, 114, 115, 49])) {
                    zhpv = false;
                } else if (RfapiJS["utils"].zhnn(zhb, [115, 114, 115, 50])) {
                    zhpv = true;
                } else {
                    ziqo({"eErr": 6, "sErr": "Unknown data format"});
                    return false;
                }
                var zklr = RfapiJS["CRC32"](in_bytes, zklh - zklk);
                var zkmq = RfapiJS["utils"].zkky(in_bytes, zklh - zklk, zklk);
                if (zklr != zkmq) {
                    ziqo({"eErr": 6, "sErr": "Data CRC error"}
                    );
                    return false;
                }
                var zkmh = RfapiJS["utils"].zkky(in_bytes, zkli, zklj);
                var zkmp = [];
                RfapiJS["utils"].zhpb(in_bytes, zkli + zklj, zkmp, 0, zkmh);
                if (zkmh <= 0 || zkmh > zklh - (zkli + zklj + zklk)) {
                    ziqo({"eErr": 6, "sErr": "Corrupted data: RSA stream is wrong"}
                    );
                    return false;
                }
                var zkmr = zklh - (zkli + zklj + zkmh + zklk);
                var zkms = [];
                RfapiJS["utils"].zhpb(in_bytes, zkli + zklj + zkmh, zkms, 0, zkmr);
                zkmt();

                function zkmu(zkmv) {
                    var zklv = 32;
                    var zklw = 8;
                    if (zkmv.length != zklv + zklw) {
                        ziqo({"eErr": 6, "sErr": "unknown data format"}
                        );
                        return false;
                    }
                    var zkly = [];
                    RfapiJS["utils"].zhpb(zkmv, 0, zkly, 0, zklv);
                    var zklz = [];
                    RfapiJS["utils"].zhpb(zkmv, zklv, zklz, 0, zklw);
                    var zkma = RfapiJS["utils"].zkmb(zklz, 1, 64, sjcl.codec.bytes.toBits(zkly));
                    var key = new Array(32);
                    var iv = new Array(16);
                    RfapiJS["utils"].zhpb(zkma, 0, key, 0, 32);
                    RfapiJS["utils"].zhpb(zkma, 32, iv, 0, 16);
                    var zexi = CryptoJS.enc.u8array.parse(key);
                    var zexj = CryptoJS.enc.u8array.parse(iv);
                    var zkmj = {}
                    ;zkmj["iv"] = zexj;
                    zkmj["mode"] = CryptoJS.mode.CBC;
                    zkmj["padding"] = CryptoJS.pad.Pkcs7;
                    var zuc = CryptoJS.algo.AES.createDecryptor(zexi, zkmj);
                    var zkmk = zuc.process(CryptoJS.enc.u8array.parse(zkms));
                    var zkml = zuc.finalize();
                    if (zkml.sigBytes >= 0) {
                        zkmk = zkmk.concat(zkml);
                    }
                    var zkmw = CryptoJS.enc.u8array.stringify(zkmk);
                    var zkmx = RfapiJS["UTF8"].zbpl(zkmw);
                    ziqn(zkmw);
                }

                function zkmt() {
                    var zkmc = {in_bytes: zkmp, key_pem: key_pem, is_key_private: is_key_private, zkmd: false}
                    RfapiJS["utils"].zkme(zkmc, function zkmy(zkmv) {
                        if (!zkmr) {
                            var zkmx = RfapiJS["UTF8"].zbpl(zkmv);
                            ziqn(zkmv);
                            return;
                        }
                        zkmu(zkmv);
                    }, ziqo);
                }

                return;
            }, zkmb: function (zkmz, zkna, zknb, pwd) {
                var zknc = sjcl.codec.bytes.toBits(zkmz);
                var zknd = sjcl.hash.sha256;
                var zkne = function (key) {
                    var zknf = new sjcl.misc.hmac(key, zknd);
                    this.encrypt = function () {
                        return zknf.encrypt.apply(zknf, arguments);
                    }
                    ;
                };
                var zkng = sjcl.misc.pbkdf2(pwd, zknc, zkna, zknb * 8, zkne);
                var zknh = sjcl.codec.bytes.fromBits(zkng);
                return zknh;
            }
            , zkme: function (params, ziqn, ziqo) {
                var zjgm = new RSAKey();
                var zkmo = RfapiJS["RF_RSA"].zimq(params.key_pem, !params.is_key_private);
                if (params.is_key_private) {
                    zjgm.setPrivateEx(zkmo["modulus"], zkmo["exponent"], zkmo["privateexp"], zkmo["P"], zkmo["Q"], zkmo["DP"], zkmo["DQ"], zkmo["InverseQ"]);
                    var zkni = RfapiJS["utils"].zhjp(params.in_bytes);
                    var zknj = zjgm.decrypt(zkni, true);
                    zknj ? ziqn(zknj) : ziqo({"eErr": 6, "sErr": "Decryption failed"}
                    );
                } else {
                    zjgm.setPublic(zkmo["modulus"], zkmo["exponent"]);
                    var zknk = zjgm.encrypt(params.in_bytes, true);
                    zknk ? ziqn(RfapiJS["utils"].zhjk(zknk)) : ziqo({"eErr": 6, "sErr": "Encryption failed"}
                    );
                }
            }
        };
        var zkks = function (zknl, zknm, zyh) {
            var zknn = zknl[zyh[0]].substring(zknl[zyh[0]].lastIndexOf("/") + 1);
            var zkno = zknl[zyh[0]];
            zknn = zknn.toLowerCase();
            zkno = zkno.toLowerCase();
            var zknp = zknm[zyh[0]].substring(zknm[zyh[0]].lastIndexOf("/") + 1);
            var zknq = zknm[zyh[0]];
            zknp = zknp.toLowerCase();
            zknq = zknq.toLowerCase();

            function zknr(zkns, zknt, zknu, zknv) {
                if (zknu.startsWith("/")) {
                    zknu = zknu.substr(1);
                }
                if (zknv.startsWith("/")) {
                    zknv = zknv.substr(1);
                }
                if (zknu.indexOf("/") == -1 && zknv.indexOf("/") != -1) {
                    return -1;
                }
                if (zknu.indexOf("/") != -1 && zknv.indexOf("/") == -1) {
                    return 1;
                }
                if (zknu.indexOf("/") == -1 && zknv.indexOf("/") == -1) {
                    zkns = zkns.substr(0, zkns.lastIndexOf("."));
                    zknt = zknt.substr(0, zknt.lastIndexOf("."));
                    if (zkns < zknt) {
                        return -1;
                    }
                    if (zkns > zknt) {
                        return 1;
                    }
                    return 0;
                }
                zknu = zknu.substr(0, zknu.lastIndexOf("."));
                zknv = zknv.substr(0, zknv.lastIndexOf("."));
                var zknw = zknu.split("/");
                var zknx = zknv.split("/");
                if (zknw.length < zknx.length) {
                    return -1;
                }
                if (zknw.length > zknx.length) {
                    return 1;
                }
                if (zkns < zknt) {
                    return -1;
                }
                if (zkns > zknt) {
                    return 1;
                }
                return 0;
            }

            var result = zknr(zknn, zknp, zkno, zknq);
            if (result != undefined) {
                return result;
            }
        };
        var zkkr = function (zknl, zknm, zyh, zkkv) {
            var zknn = zknl[zyh[0]].substring(zknl[zyh[0]].lastIndexOf("/") + 1);
            var zkno = zknl[zyh[0]];
            var zkny = zknn.substr(zknn.lastIndexOf("."));
            var zknz = RfapiJS["utils"].zeeh(zkny);
            zknn = zknn.toLowerCase();
            zkno = zkno.toLowerCase();
            var zknp = zknm[zyh[0]].substring(zknm[zyh[0]].lastIndexOf("/") + 1);
            var zknq = zknm[zyh[0]];
            var zkoa = zknp.substr(zknp.lastIndexOf("."));
            var zkob = RfapiJS["utils"].zeeh(zkoa);
            zknp = zknp.toLowerCase();
            zknq = zknq.toLowerCase();

            function zkoc(zkod, zkoe, zkns, zknt, zknu, zknv, zkof) {
                if (zkod != zkof && zkoe == zkof) {
                    return -1;
                }
                if (zkod == zkof && zkoe != zkof) {
                    return 1;
                }
                if (zkod == zkof && zkoe == zkof) {
                    if (zknu.startsWith("/")) {
                        zknu = zknu.substr(1);
                    }
                    if (zknv.startsWith("/")) {
                        zknv = zknv.substr(1);
                    }
                    if (zknu.indexOf("/") == -1 && zknv.indexOf("/") != -1) {
                        return -1;
                    }
                    if (zknu.indexOf("/") != -1 && zknv.indexOf("/") == -1) {
                        return 1;
                    }
                    if (zknu.indexOf("/") == -1 && zknv.indexOf("/") == -1) {
                        zkns = zkns.substr(0, zkns.lastIndexOf("."));
                        zknt = zknt.substr(0, zknt.lastIndexOf("."));
                        if (zkkv) {
                            var zkog = zkns.indexOf(zkkv);
                            var zkoh = zknt.indexOf(zkkv);
                            if (zkog && !zkoh) {
                                return 1;
                            }
                            if (!zkog && zkoh) {
                                return -1;
                            }
                            if ((!zkog && !zkoh) || (zkog && zkoh)) {
                                if (zkns < zknt) {
                                    return -1;
                                }
                                if (zkns > zknt) {
                                    return 1;
                                }
                                return 0;
                            }
                        } else {
                            if (zkns < zknt) {
                                return -1;
                            }
                            if (zkns > zknt) {
                                return 1;
                            }
                            return 0;
                        }
                    }
                    zknu = zknu.substr(0, zknu.lastIndexOf("."));
                    zknv = zknv.substr(0, zknv.lastIndexOf("."));
                    if (zkkv) {
                        var zkog = zkns.indexOf(zkkv);
                        var zkoh = zknt.indexOf(zkkv);
                        if (zkog && !zkoh) {
                            return 1;
                        }
                        if (!zkog && zkoh) {
                            return -1;
                        }
                        if ((!zkog && !zkoh) || (zkog && zkoh)) {
                            if (zknu < zknv) {
                                return -1;
                            }
                            if (zknu > zknv) {
                                return 1;
                            }
                            return 0;
                        }
                    } else {
                        if (zknu < zknv) {
                            return -1;
                        }
                        if (zknu > zknv) {
                            return 1;
                        }
                        return 0;
                    }
                }
                return;
            };var zkoi = zkoc(zkob, zknz, zknn, zknp, zkno, zknq, zwa["RfItemType_Login"]);
            if (zkoi != undefined) {
                return zkoi;
            }
            var zkoj = zkoc(zkob, zknz, zknn, zknp, zkno, zknq, zwa["RfItemType_Bookmark"]);
            if (zkoj != undefined) {
                return zkoj;
            }
            var zkok = zkoc(zkob, zknz, zknn, zknp, zkno, zknq, zwa["RfItemType_Safenote"]);
            if (zkok != undefined) {
                return zkok;
            }
            var zkol = zkoc(zkob, zknz, zknn, zknp, zkno, zknq, zwa["RfItemType_Identity"]);
            if (zkol != undefined) {
                return zkol;
            }
            var zkom = zkoc(zkob, zknz, zknn, zknp, zkno, zknq, zwa["RfItemType_Contact"]);
            if (zkom != undefined) {
                return zkom;
            }
        };
        var zkkq = function (zknl, zknm, zyh) {
            var zknn = zknl[zyh[0]][zyh[1]].substring(zknl[zyh[0]][zyh[1]].lastIndexOf("/") + 1);
            var zknz = typeof zknl[zyh[0]][RfapiJS.ITEM_ISFOLDER_PROP] != zhir ? zwa["RfItemType_Folder"] : 1;
            var zkon = typeof zknl[zyh[0]]["Shared"] != zhir ? true : false;
            zknn = zknn.toLowerCase();
            var zknp = zknm[zyh[0]][zyh[1]].substring(zknm[zyh[0]][zyh[1]].lastIndexOf("/") + 1);
            var zkob = typeof zknm[zyh[0]][RfapiJS.ITEM_ISFOLDER_PROP] != zhir ? zwa["RfItemType_Folder"] : 1;
            var zkoo = typeof zknm[zyh[0]]["Shared"] != zhir ? true : false;
            zknp = zknp.toLowerCase();
            if (zkob != zwa["RfItemType_Folder"] && zknz == zwa["RfItemType_Folder"]) {
                return -1;
            }
            if (zkob == zwa["RfItemType_Folder"] && zknz != zwa["RfItemType_Folder"]) {
                return 1;
            }
            if (zkob == zwa["RfItemType_Folder"] && zknz == zwa["RfItemType_Folder"]) {
                if ((!zkon && !zkoo) || (zkon && zkoo)) {
                    if (zknn < zknp) {
                        return -1;
                    }
                    if (zknn > zknp) {
                        return 1;
                    }
                    return 0;
                }
                if (!zkoo && zkon) {
                    return -1;
                }
                if (zkoo && !zkon) {
                    return 1;
                }
            }
            if (zkob != zwa["RfItemType_Folder"] && zknz != zwa["RfItemType_Folder"]) {
                if (zknn < zknp) {
                    return -1;
                }
                if (zknn > zknp) {
                    return 1;
                }
                return 0;
            }
        };
        var zkop = {
            zise: function (zisc) {
                var zkoq = "qwerty";
                var zaxa = 0;

                function zkor() {
                    zaxa++;
                    var zjgm = new RSAKey();
                    zjgm.generate(parseInt(zisc), "10001");
                    var zkos = zkop.zkot(zjgm);
                    var zivv = zkop.zimq(zkos, true);
                    zjgm.setPublic(zivv["modulus"], zivv["exponent"]);
                    var zkou = zjgm.encrypt(zkoq);
                    var zkov = zkop.zkow(zjgm);
                    var zkox = zkop.zimq(zkov, false);
                    var zkoy = zkox["modulus"];
                    var zkoz = zkox["exponent"];
                    var zkpa = zkox["privateexp"];
                    var zkpb = zkox["P"];
                    var zkpc = zkox["Q"];
                    var zkpd = zkox["DP"];
                    var zkpe = zkox["DQ"];
                    var zkpf = zkox["InverseQ"];
                    zjgm.setPrivateEx(zkoy, zkoz, zkpa, zkpb, zkpc, zkpd, zkpe, zkpf);
                    var zkpg = zjgm.decrypt(zkou);
                    if (!zkpg) {
                        return;
                    }
                    return {"Public_Pem": zkos, "Private_Pem": zkov};
                };var zisd = zkor();
                while (!zisd) {
                    zisd = zkor();
                }
                return zisd;
            }, zkph: function (zisc) {
                var zjgm = new RSAKey();
                zjgm.generate(parseInt(zisc), "10001");
                var zkpi = this.zkot(zjgm);
                var zkpj = this.zkow(zjgm);
                return {"Private_Pem": zkpj, "Public_Pem": zkpi}
                    ;
            }, zkow: function (zjgm) {
                var result = [];
                result.push(0x30);
                var zkpk = [];
                this.zkpl(zkpk, [0]);
                var modulus = zkfs.zhjk(zjgm["n"].toString(16));
                this.zkpl(zkpk, modulus, zjgm["n"].toString(16).length);
                var zkpn = [1, 0, 1];
                this.zkpl(zkpk, zkpn);
                var zkpo = zkfs.zhjk(zjgm["d"].toString(16));
                this.zkpl(zkpk, zkpo, zjgm["d"].toString(16).length);
                var P = zkfs.zhjk(zjgm["p"].toString(16));
                this.zkpl(zkpk, P, zjgm["p"].toString(16).length);
                var Q = zkfs.zhjk(zjgm["q"].toString(16));
                this.zkpl(zkpk, Q, zjgm["q"].toString(16).length);
                var DP = zkfs.zhjk(zjgm["dmp1"].toString(16));
                this.zkpl(zkpk, DP, zjgm["dmp1"].toString(16).length);
                var DQ = zkfs.zhjk(zjgm["dmq1"].toString(16));
                this.zkpl(zkpk, DQ, zjgm["dmq1"].toString(16).length);
                var InverseQ = zkfs.zhjk(zjgm["coeff"].toString(16));
                this.zkpl(zkpk, InverseQ, zjgm["coeff"].toString(16).length);
                var zhmc = zkpk.length;
                this.zkpu(result, zhmc);
                for (var i = 0; i < zkpk.length; i++) {
                    result.push(zkpk[i]);
                }
                var base64 = zkfs.zexo(result);
                var zkpj = "-----BEGIN RSA PRIVATE KEY-----\n";
                zkpj += this.zkpv(base64);
                zkpj += "\n";
                zkpj += "-----END RSA PRIVATE KEY-----\n";
                return zkpj;
            }
            , zkpv: function (zara, width) {
                width = width || 64;
                if (!zara) {
                    return zara;
                }
                var zkpw = '(.{1,' + width + '})( +|$\n?)|(.{1,' + width + '})';
                return zara.match(RegExp(zkpw, 'g')).join('\n');
            }
            , zkpu: function (zkpx, zhmc) {
                if (zhmc < 0) {
                    throw new DOMException("Length must be non-negative");
                }
                if (zhmc < 0x80) {
                    zkpx.push(zhmc);
                } else {
                    var zkpy = zhmc;
                    var zkpz = 0;
                    while (zkpy > 0) {
                        zkpy >>= 8;
                        zkpz++;
                    }
                    zkpx.push((zkpz | 0x80));
                    for (var i = zkpz - 1; i >= 0; i--) {
                        zkpx.push((zhmc >> (8 * i) & 0xff));
                    }
                }
            }, zkqa: function (data, zkqb) {
                var zhmc = data[zkqb["offset"]++];
                if ((zhmc & 0x80) == 0x80) {
                    var zkqc = zhmc & ~0x80;
                    zhmc = 0;
                    for (var zcjr = 0; zcjr < zkqc; zcjr++) {
                        zhmc |= data[zkqb["offset"]++] << ((zkqc - zcjr - 1) * 8);
                    }
                }
                return zhmc;
            }, zkpl: function (zkpx, value, zkqd) {
                var zkqe = true;
                zkpx.push(0x02);
                var zkqf = 0;
                for (var i = 0; i < value.length; i++) {
                    if (value[i] != 0) {
                        break;
                    }
                    zkqf++;
                }
                if (value.length - zkqf == 0) {
                    this.zkpu(zkpx, 1);
                    zkpx.push(0);
                } else {
                    if (zkqe && value[zkqf] > 0x7f) {
                        this.zkpu(zkpx, value.length - zkqf + 1);
                        zkpx.push(0);
                    } else {
                        this.zkpu(zkpx, value.length - zkqf);
                    }
                    for (var i = zkqf; i < value.length; i++) {
                        zkpx.push(value[i]);
                    }
                }
            }, zkot: function (zjgm) {
                var result = [];
                result.push(0x30);
                var zkqg = zjgm["n"].toString(16);
                var zkqh = zkfs.zhjk(zkqg);
                var zkpn = [1, 0, 1];
                var zkpk = [];
                this.zkpl(zkpk, zkqh);
                this.zkpl(zkpk, zkpn);
                var zhmc = zkpk.length;
                this.zkpu(result, zhmc);
                for (var i = 0; i < zkpk.length; i++) {
                    result.push(zkpk[i]);
                }
                var base64 = zkfs.zexo(result);
                var zkpi = "-----BEGIN RSA PUBLIC KEY-----\n";
                zkpi += this.zkpv(base64);
                zkpi += "\n";
                zkpi += "-----END RSA PUBLIC KEY-----\n";
                return zkpi;
            }
            , zimq: function (zkqi, zkqj) {
                if ((zkqi.indexOf("-----BEGIN RSA")) >= 0 && (zkqi.indexOf("-----END") >= 0)) {
                    var zkes = zkqi.substr(30);
                    if (zkes.charCodeAt(0) == 10) {
                        zkes = zkes.substr(1);
                    }
                    var zbkc = zkes.indexOf("-----END");
                    zkes = zkes.substr(0, zbkc);
                    zkes = zkes.replace(new RegExp("[\r\n]", "g"), "");
                    var zkqk = zkfs.zbpk(zkes);
                    var modulus = null;
                    var exponent = null;
                    var zkqm = null;
                    var privateexp = null;
                    var P = null;
                    var Q = null;
                    var DP = null;
                    var DQ = null;
                    var InverseQ = null;
                    var offset = 0;
                    do {
                        var zbwa = zkqk[offset++];
                        var zhmc;
                        if (zbwa == 0x30) {
                            var zkqo = {"offset": offset}
                            ;zhmc = this.zkqa(zkqk, zkqo);
                            offset = zkqo["offset"];
                        } else if (zbwa == 0x02) {
                            var zkqo = {"offset": offset};
                            zhmc = this.zkqa(zkqk, zkqo);
                            offset = zkqo["offset"];
                            if ((zhmc == 17 || zhmc == 33 || zhmc == 65 || zhmc == 129 || zhmc == 257 || zhmc == 513 || zhmc == 1025 || zhmc == 2049) && zkqk[offset] == 0) {
                                zhmc--;
                                offset++;
                            }
                            var value = new Array(zhmc);
                            zkfs.zhpb(zkqk, offset, value, 0, zhmc);
                            offset += zhmc;
                            if (zkqj) {
                                if (modulus == null) {
                                    modulus = value;
                                } else if (exponent == null) {
                                    exponent = value;
                                }
                            } else {
                                if (zkqm == null) {
                                    zkqm = value;
                                } else if (modulus == null) {
                                    modulus = value;
                                } else if (exponent == null) {
                                    exponent = value;
                                } else if (privateexp == null) {
                                    privateexp = value;
                                } else if (P == null) {
                                    P = value;
                                } else if (Q == null) {
                                    Q = value;
                                } else if (DP == null) {
                                    DP = value;
                                } else if (DQ == null) {
                                    DQ = value;
                                } else if (InverseQ == null) {
                                    InverseQ = value;
                                }
                            }
                        } else if (zbwa == 0x03) {
                            var zkqo = {"offset": offset};
                            zhmc = this.zkqa(zkqk, zkqo);
                            offset = zkqo["offset"];
                        } else if (zbwa == 0x04) {
                            var zkqo = {"offset": offset};
                            zhmc = this.zkqa(zkqk, zkqo);
                            offset = zkqo["offset"];
                            if (zhmc != -1) {
                                var value = new Array(zhmc);
                                zkfs.zhpb(zkqk, offset, value, 0, zhmc);
                            }
                            offset += zhmc;
                        } else if (zbwa == 0x05) {
                            zhmc = zkqk[offset++];
                            offset += zhmc;
                        } else if (zbwa == 0x06) {
                            zhmc = zkqk[offset++];
                            var value = new Array(zhmc);
                            zkfs.zhpb(zkqk, offset, value, 0, zhmc);
                            offset += zhmc;
                        }
                    } while (offset < zkqk.length);
                    if (zkqj) {
                        var zkqp = zkfs.zhjp(modulus);
                        var zkqq = zkfs.zhjp(exponent);
                        return {"modulus": zkqp, "exponent": zkqq}
                            ;
                    } else {
                        var zkqp = zkfs.zhjp(modulus);
                        var zkqq = zkfs.zhjp(exponent);
                        var zkqr = zkfs.zhjp(privateexp);
                        var zkqs = zkfs.zhjp(P);
                        var zkqt = zkfs.zhjp(Q);
                        var zkqu = zkfs.zhjp(DP);
                        var zkqv = zkfs.zhjp(DQ);
                        var zkqw = zkfs.zhjp(InverseQ);
                        return {"modulus": zkqp, "exponent": zkqq, "privateexp": zkqr, "P": zkqs, "Q": zkqt, "DP": zkqu, "DQ": zkqv, "InverseQ": zkqw}
                            ;
                    }
                } else {
                    return null;
                }
            }
        };
        var zkqx = {
            zexm: function (zara) {
                for (var bytes = [], i = 0; i < zara.length; i++) {
                    bytes.push(zara.charCodeAt(i) & 0xFF);
                }
                return bytes;
            }, zbpl: function (bytes) {
                for (var zara = [], i = 0; i < bytes.length; i++) {
                    zara.push(String.fromCharCode(bytes[i]));
                }
                return zara.join("");
            }, zkqy: function (bytes) {
                var zkjw = [];
                for (var i = 0, n = bytes.length; i < n;) {
                    zkjw.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
                }
                return String.fromCharCode.apply(null, zkjw);
            }
        };
        var zkqz = {
            zexm: function (zara) {
                var zkra = encodeURIComponent(zara);
                var zkrb = unescape(zkra);
                return zkqx.zexm(zkrb);
            }
            , zbpl: function (bytes) {
                var zkrc = zkqx.zbpl(bytes);
                var zkrd = escape(zkrc);
                return decodeURIComponent(zkrd);
            }
        };

        function zkre() {
            this["password"] = "";
            this["pwdStrength"] = 0;
            this["duplicateKey"] = "";
            this["gotoUrl"] = "";
            this["modTime"] = 0;
            this["path"] = "";
        }
        ;

        function zkrf() {
            this.zjvg = -1, this.zjvh = -1;
            this.zjvi = -1;
            this.zjvj = -1;
            this.zjvk = -1;
            this.zjvl = -1;
        }
        ;zkrf.prototype["GetJSONBase64"] = function () {
            var zjuy = {}
            ;zjuy["weak"] = this.zjvg;
            zjuy["medium"] = this.zjvh;
            zjuy["good"] = this.zjvi;
            zjuy["excellent"] = this.zjvj;
            zjuy["reused"] = this.zjvk;
            zjuy["duplicates"] = this.zjvl;
            zjuy = JSON.stringify(zjuy);
            var zjuz = RfapiJS["UTF8"].zexm(zjuy);
            var zkrg = RfapiJS["utils"].zexo(zjuz);
            return zkrg;
        }
        ;zkrf.prototype["GetStats"] = function () {
            var zjtt = {}
            ;zjtt["weak"] = this.zjvg;
            zjtt["medium"] = this.zjvh;
            zjtt["good"] = this.zjvi;
            zjtt["excellent"] = this.zjvj;
            zjtt["reused"] = this.zjvk;
            zjtt["duplicates"] = this.zjvl;
            return zjtt;
        }
        ;var zkrh = {
            zkri: true, zkrj: false, zkrk: {}, zkrl: [], zkrm: {}
            , zkrn: [], zatv: function (zkro, zkrp) {
                this.zkrm = {};
                this.zkrk = {}
                ;this.zkrn = [];
                this.zkrl = [];
                this.zkri = typeof zkro != "undefined" ? zkro : true;
                this.zkrj = typeof zkrp != "undefined" ? zkrp : false;
                return this;
            }
            , zjty: function () {
                var result = {};
                result["all"] = this.zkrn;
                result["duplicates"] = [];
                for (var zafc in this.zkrm) {
                    var zkrq = this.zkrm[zafc] - 1;
                    if (!zkrq) {
                        continue;
                    }
                    var zkrr = {};
                    zkrr["key"] = zafc;
                    zkrr["items"] = [];
                    for (var i = 0; i < this.zkrl.length; i++) {
                        var zkrs = this.zkrl[i];
                        if (zkrs["duplicateKey"] == zkrr["key"]) {
                            zkrr["items"].push(zkrs);
                            zkrr["gotoUrl"] = zkrs["gotoUrl"];
                        }
                    }
                    result["duplicates"].push(zkrr);
                }
                result["reused"] = [];
                for (var zafc in this.zkrk) {
                    if (this.zkrt(this.zkrk[zafc])) {
                        var zkru = {}
                        ;zkru["password"] = zafc;
                        zkru["items"] = this.zkrk[zafc];
                        result["reused"].push(zkru);
                    }
                }
                return result;
            }, zjub: function (zevi) {
                var fields = zevi["f"];
                if (!fields) {
                    return;
                }
                if (zevi["received"] && !this.zkrj) {
                    return;
                }
                if (zevi["granted"] && !this.zkri) {
                    return;
                }
                var zkrv = "";
                for (var zgs = 0; zgs < fields.length; zgs++) {
                    var zsg = fields[zgs];
                    if (zsg["t"] && zsg["t"] == 2) {
                        var value = zsg["v"];
                        if (value) {
                            zkrv = value;
                            if (zkrv != "$DefaultValue$") {
                                break;
                            }
                        }
                    }
                }
                var zkrs = new zkre();
                zkrs["password"] = zkrv;
                var zbou = RfapiJS["SecurityScore"].zkrw(zkrv);
                zkrs["pwdStrength"] = zbou;
                zkrs["modTime"] = zevi["mod"] ? zevi["mod"] : 0;
                zkrs["path"] = zevi["path"] ? zevi["path"] : "";
                if (zevi["granted"]) {
                    zkrs["granted"] = true;
                }
                if (zevi["received"]) {
                    zkrs["received"] = true;
                }
                if (zevi["accountInfo"]) {
                    zkrs["accountInfo"] = zevi["accountInfo"];
                }
                var zkrx = zevi["g"] ? zevi["g"] : "";
                var zkry = zevi["n"] ? zevi["n"] : "";
                var zkrz = this.zksa(fields, zkrx, zkry);
                zkrs["duplicateKey"] = zkrz;
                var item = this.zkrm[zkrz];
                if (typeof item == "undefined") {
                    this.zkrm[zkrz] = 1;
                } else {
                    this.zkrm[zkrz]++;
                }
                zkrs["gotoUrl"] = zkrx;
                this.zkrl.push(zkrs);
                if (!zkrv) {
                    return;
                }
                this.zkrn.push(zkrs);
                var zcje = this.zkrk[zkrv];
                if (typeof zcje == "undefined") {
                    var zksb = [];
                    zksb.push(zkrs);
                    this.zkrk[zkrv] = zksb;
                } else {
                    this.zkrk[zkrv].push(zkrs);
                }
            }, zksc: function () {
                var zenp = 0;
                for (var zafc in this.zkrk) {
                    zenp++;
                    break;
                }
                if (!zenp) {
                    return true;
                }
                return false;
            }, zjtv: function () {
                if (this.zksc()) {
                    return {"score": 0}
                        ;
                }
                var zksd = 0.0;
                var zenp = 0;
                for (var zafc in this.zkrk) {
                    zenp++;
                    var zgrv = zafc;
                    var zkrq = this.zkrk[zafc].length - 1;
                    var zkse = RfapiJS["SecurityScore"].zkrw(zgrv);
                    var zksf = parseFloat(zkse / (4 * Math.log(Math.exp(1.0) + zkrq)));
                    zksd += zksf;
                }
                zksd /= zenp;
                score = parseInt(100 * zksd + 0.5);
                if (score == 0) {
                    score = 1;
                }
                return {"score": score};
            }, zksa: function (fields, zkrx, zerj) {
                var zara = "";
                for (var i = 0; i < fields.length; i++) {
                    zara += fields[i]["n"];
                    zara += fields[i]["v"];
                }
                zara += zkrx;
                zara += zerj;
                var hash = CryptoJS.MD5(zara);
                hash = hash.toString();
                return hash;
            }
            , zkrt: function (arr) {
                var zksg = true;
                if (arr.length <= 1) {
                    return false;
                }
                for (var i = 1; i != arr.length; i++) {
                    var zksh = arr[i - 1];
                    var zksi = arr[i];
                    if (!zksh["gotoUrl"] || !zksi["gotoUrl"]) {
                        return false;
                    }
                    if (!RfapiJS["utils"].zafz(zksh["gotoUrl"], zksi["gotoUrl"])) {
                        zksg = false;
                        break;
                    }
                }
                if (zksg) {
                    return false;
                }
                return true;
            }, zjtu: function (zitc) {
                zitc.zjvg = 0;
                zitc.zjvh = 0;
                zitc.zjvi = 0;
                zitc.zjvj = 0;
                zitc.zjvk = 0;
                zitc.zjvl = 0;
                for (var i = 0; i < this.zkrn.length; i++) {
                    var zkrs = this.zkrn[i];
                    switch (zkrs["pwdStrength"]) {
                        case 4:
                            zitc.zjvj++;
                            break;
                        case 3:
                            zitc.zjvi++;
                            break;
                        case 2:
                            zitc.zjvh++;
                            break;
                        case 1:
                        case 0:
                            zitc.zjvg++;
                            break;
                        default:
                            break;
                    }
                }
                for (var zafc in this.zkrk) {
                    if (this.zkrt(this.zkrk[zafc])) {
                        zitc.zjvk++;
                    }
                }
                for (var zafc in this.zkrm) {
                    var zkrq = this.zkrm[zafc] - 1;
                    if (!zkrq) {
                        continue;
                    }
                    zitc.zjvl++;
                }
            }
        };
        var zksj = undefined;
        var zksk = undefined;
        var zksl = {
            zksm: 60 * 60 * 24 * 1, zksn: {
                "Weak": 0, "Medium": 1, "Good": 2, "Strong": 3
            }
            , zkso: {
                "enDictionary": 0, "enRepeat": 1, "enSequence": 2, "enBrutForce": 3
            }
            , zksp: function (zksq, zksr, data, zhqc, zkss) {
                this.zkst = typeof zksq == "undefined" ? -1 : zksq;
                this.zksu = typeof zksr == "undefined" ? -1 : zksr;
                this.zksv = typeof zhqc == "undefined" ? 3 : zhqc;
                this.zksw = typeof data == "undefined" ? "" : data;
                this.zksx = typeof zkss == "undefined" ? 0 : zkss;
                this.zksy = 0;
            }
            , GetScoreLevel: function (score) {
                var zbot = parseInt(score);
                if (isNaN(zbot)) {
                    return -1;
                }
                if (zbot <= 25) {
                    return this.zksn.Weak;
                }
                if (25 < zbot && zbot <= 50) {
                    return this.zksn.Medium;
                }
                if (50 < zbot && zbot <= 75) {
                    return this.zksn.Good;
                }
                if (zbot > 75) {
                    return this.zksn.Strong;
                }
            }, zjvu: function (accountInfo) {
                if (!accountInfo) {
                    return false;
                }
                var zcga = accountInfo["oneFile"];
                zcga = typeof (zcga) == "undefined" ? false : zcga;
                if (!zcga) {
                    return false;
                }
                var zksz = accountInfo["securityStats"];
                if (zksz) {
                    var zjuz = RfapiJS["utils"].zbpk(zksz);
                    var zjvw = RfapiJS["UTF8"].zbpl(zjuz);
                    zksz = JSON.parse(zjvw);
                }
                if (!zksz) {
                    return true;
                }
                var zkta = zksz["scoreUpdatedTime"];
                if (!zkta) {
                    return true;
                }
                if (typeof zhdy == "undefined") {
                    console.log("could not load pwd-dict.js");
                    return false;
                }
                var zdos = Math.round(new Date() / 1000);
                if ((zdos - zkta) > this.zksm) {
                    return true;
                }
                return false;
            }, zktb: function (callback) {
                if (typeof zhdy == "undefined") {
                    console.log("could not load pwd-dict.js");
                } else {
                    callback();
                }
            }, zkrw: function (zgrv, zktc) {
                var matches = [];
                var zktd = parseInt((this.CalcPasswordStrength(zgrv, zktc, matches) + 0.5));
                var zkte = [0, 20, 40, 52, 79];
                var zbou;
                for (zbou = zkte.length - 1; zbou > 0; zbou--) {
                    if (zktd >= zkte[zbou]) {
                        break;
                    }
                }
                return zbou;
            }, CalcPasswordStrength: function (password, zktf, zktg) {
                zktg = zktg || [];
                if (!password) {
                    return 0.0;
                }
                var zgrv = password.length < 100 ? password : password.substr(0, 99);
                var matches = [];
                var zkth = -1;
                var zkti = -1;
                for (var i = 0; i < zgrv.length - 1; i++) {
                    if (zgrv[i] == zgrv[i + 1]) {
                        if (zkth == -1) {
                            zkth = i;
                        }
                    } else {
                        if (zkth != -1) {
                            zkti = i + 1;
                            var zktj = new this.zksp(zkth, zkti - 1, this.zgqu(zgrv, zkth, zkti - zkth), this.zkso.enRepeat);
                            matches.push(zktj);
                            zkth = -1;
                            zkti = -1;
                        }
                    }
                }
                if (zkth != -1) {
                    var zktk = new this.zksp(zkth, zgrv.length - 1, this.zgqu(zgrv, zkth, zgrv.length - zkth), this.zkso.enRepeat);
                    matches.push(zktk);
                }
                var zktl = [];
                for (var i = 0; i < zgrv.length - 1; i++) {
                    zktl.push(zgrv[i].charCodeAt(0) - zgrv[i + 1].charCodeAt(0));
                }
                var zktm = -1;
                var zktn = -1;
                for (var i = 0; i < zktl.length - 1; ++i) {
                    if (zktl[i] == zktl[i + 1]) {
                        if (zktm == -1) {
                            zktm = i;
                        }
                    } else {
                        if (zktm != -1) {
                            zktn = i + 1;
                            var zkto = new this.zksp(zktm, zktn, this.zgqu(zgrv, zktm, zktn + 1 - zktm), this.zkso.enSequence);
                            matches.push(zkto);
                            zktm = -1;
                            zktn = -1;
                        }
                    }
                }
                if (zktm != -1) {
                    var zkto = new this.zksp(zktm, zgrv.length - 1, this.zgqu(zgrv, zktm, zgrv.length - zktm), this.zkso.enSequence);
                    matches.push(zkto);
                }
                var zktp = zgrv;
                zktp = zktp.toLowerCase();
                var zktq = zktp;
                var zktr = this.zkts();
                for (var i = 0; i != zgrv.length; ++i) {
                    for (var zgs = i + 1; zgs <= zgrv.length; ++zgs) {
                        var zktt = this.zgqu(zktq, i, zgs - i);
                        var zkss = 0;
                        var item = zktr[zktt];
                        if (item) {
                            zkss = item;
                            var zktu = new this.zksp(i, zgs - 1, this.zgqu(zgrv, i, zgs - i), this.zkso.enDictionary, zkss);
                            matches.push(zktu);
                        }
                    }
                }
                for (var i = 0; i != matches.length; ++i) {
                    matches[i].zksy = this.zktv(matches[i]);
                }
                var zktw = 0.0;
                var zktx = new Array(zgrv.length);
                var zkty = new Array(zgrv.length);
                for (var i = 0; i != zktx.length; ++i) {
                    zktw += 6.53;
                    for (var zahd = 0; zahd != matches.length; ++zahd) {
                        if (matches[zahd].zksu == i) {
                            var match = matches[zahd];
                            var zktz = matches[zahd].zkst > 0 ? zktx[matches[zahd].zkst - 1] : 0;
                            if (matches[zahd].zksy + zktz < zktw) {
                                zktw = matches[zahd].zksy + zktz;
                                zkty[i] = matches[zahd];
                            }
                        }
                    }
                    zktx[i] = zktw;
                }
                var zkua = [];
                var i = zgrv.length - 1;
                while (i > 0) {
                    if (zkty[i]) {
                        var match = zkty[i];
                        zkua.unshift(match);
                        i = match.zkst;
                    }
                    i--;
                }
                zktg.length = 0;
                var zahd = 0;
                for (var zafc = 0; zafc < zkua.length; zafc++) {
                    var match = zkua[zafc];
                    if (match.zkst - zahd > 0) {
                        var zkub = new this.zksp(zahd, match.zkst - 1, this.zgqu(zgrv, zahd, match.zkst - zahd), this.zkso.enBrutForce);
                        zkub.zksy = this.zktv(zkub);
                        zktg.push(zkub);
                    }
                    zktg.push(match);
                    zahd = match.zksu + 1;
                }
                if (zahd < zgrv.length) {
                    var zkub = new this.zksp(zahd, zgrv.length - 1, this.zgqu(zgrv, zahd, zgrv.length - zahd), this.zkso.enBrutForce);
                    zkub.zksy = this.zktv(zkub);
                    zktg.push(zkub);
                }
                var zkuc = 0.0;
                for (var i = 0; i != zktg.length; ++i) {
                    zkuc += zktg[i].zksy;
                }
                return zkuc;
            }, zktv: function (match) {
                var zkud = 65408;
                var score = 0.0;
                switch (match.zksv) {
                    case this.zkso.enDictionary:
                        score = Math.log(match.zksx) / Math.log(2.0);
                        break;
                    case this.zkso.enRepeat:
                        var zkue = match.zksw[0];
                        var zkuf = 0;
                        if (this.zkug(zkue)) {
                            zkuf = 10;
                        } else if (this.zawu(zkue)) {
                            zkuf = 26;
                        } else if (this.zkuh(zkue)) {
                            zkuf = 33;
                        } else {
                            zkuf = zkud;
                        }
                        score = Math.log(zkuf * match.zksw.length) / Math.log(2.0);
                        break;
                    case this.zkso.enSequence:
                        var zkue = match.zksw[0];
                        var zkuf = 0;
                        if (this.zkug(zkue)) {
                            zkuf = 10;
                        } else if (this.zawu(zkue)) {
                            zkuf = 26;
                        } else if (this.zkuh(zkue)) {
                            zkuf = 33;
                        } else {
                            zkuf = zkud;
                        }
                        score = Math.log(zkuf * match.zksw.length) / Math.log(2.0);
                        break;
                    case this.zkso.enBrutForce:
                    default: {
                        var zkuf = 0;
                        var zkui = this.zkuj(match.zksw, this.zkug);
                        var zkuk = this.zkuj(match.zksw, this.zkul);
                        var zkum = this.zkuj(match.zksw, this.zkun);
                        var zkuo = this.zkuj(match.zksw, this.zkuh);
                        zkuf += zkui ? 10 : 0;
                        zkuf += zkuk ? 26 : 0;
                        zkuf += zkum ? 26 : 0;
                        zkuf += zkuo ? 33 : 0;
                        if (zkuf == 0) {
                            zkuf = zkud;
                        }
                        score = Math.log(zkuf) * match.zksw.length / Math.log(2.0);
                        break;
                    }
                }
                return score;
            }, zkts: function () {
                if (zksk) {
                    return zksk;
                }
                zksk = {};
                var zkup = [];
                zkup.push(zhdy);
                zkup.push(zhdx);
                zkup.push(zhdw);
                zkup.push(zhdv);
                zkup.push(zhdu);
                var zkuq = [];
                zkuq.push(zhdy.length);
                zkuq.push(zhdx.length);
                zkuq.push(zhdw.length);
                zkuq.push(zhdv.length);
                zkuq.push(zhdu.length);
                for (var i = 0; i != zkup.length; ++i) {
                    for (var zgs = 0; zgs != zkuq[i]; ++zgs) {
                        var zkss = zgs + 1;
                        var zbdi = zkup[i][zgs];
                        var item = zksk[zbdi];
                        if (item) {
                            if (item > zgs + 1) {
                                zkss = zgs + 1;
                            } else {
                                zkss = item;
                            }
                        }
                        zksk[zbdi] = zkss;
                    }
                }
                return zksk;
            }, zkun: function (c) {
                c = c.charCodeAt(0);
                if (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) {
                    return true;
                }
                return false;
            }, zkul: function (c) {
                c = c.charCodeAt(0);
                if (c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) {
                    return true;
                }
                return false;
            }, zkug: function (c) {
                c = c.charCodeAt(0);
                if (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0)) {
                    return true;
                }
                return false;
            }, zawu: function (c) {
                c = c.charCodeAt(0);
                if (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) {
                    return true;
                }
                if (c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) {
                    return true;
                }
                return false;
            }, zkuh: function (c) {
                var zkur = " `!@$%^&*()_+-={}[]:\";',.<>/?\\|#";
                if (zkur.indexOf(c) >= 0) {
                    return true;
                }
                return false;
            }, zkuj: function (zara, zme) {
                for (var i = 0; i != zara.length; ++i) {
                    var c = zara[i];
                    if (zme(c)) {
                        return true;
                    }
                }
                return false;
            }, zgqu: function (zara, zlw, zdfj) {
                if (zlw < 0 || zdfj < 0) {
                    return "";
                }
                var zgqv, zgqw = String(zara).length;
                if (zlw + zdfj > zgqw) {
                    zgqv = zgqw;
                } else {
                    zgqv = zlw + zdfj;
                }
                return String(zara).substring(zlw, zgqv);
            }
            ,
        };
        var Base64 = {
            zidb: function (zara) {
                var zkus = window.atob(zara);
                var zkut = Array.prototype.map.call(zkus, function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }
                ).join('');
                var result = "{}";
                try {
                    result = decodeURIComponent(zkut);
                } catch (zdw) {
                    result = this.zkuu(zkus);
                }
                return result;
            }
            , zicx: function (zkuv) {
                var base64 = '';
                var zkuw = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var bytes = new Uint8Array(zkuv);
                var byteLength = bytes.byteLength;
                var zkux = byteLength % 3;
                var zkuy = byteLength - zkux;
                var a;
                var b;
                var c;
                var zkuz;
                var zzj;
                for (var i = 0; i < zkuy; i = i + 3) {
                    zzj = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
                    a = (zzj & 16515072) >> 18;
                    b = (zzj & 258048) >> 12;
                    c = (zzj & 4032) >> 6;
                    zkuz = zzj & 63;
                    base64 += zkuw[a] + zkuw[b] + zkuw[c] + zkuw[zkuz];
                }
                if (zkux == 1) {
                    zzj = bytes[zkuy];
                    a = (zzj & 252) >> 2;
                    b = (zzj & 3) << 4;
                    base64 += zkuw[a] + zkuw[b] + '==';
                } else if (zkux == 2) {
                    zzj = (bytes[zkuy] << 8) | bytes[zkuy + 1];
                    a = (zzj & 64512) >> 10;
                    b = (zzj & 1008) >> 4;
                    c = (zzj & 15) << 2;
                    base64 += zkuw[a] + zkuw[b] + zkuw[c] + '=';
                }
                return base64;
            }, zkuu: function (zhdk) {
                var zgpk = "";
                var i = 0;
                var c = zhdr = zhdm = 0;
                while (i < zhdk.length) {
                    c = zhdk.charCodeAt(i);
                    if (c < 128) {
                        zgpk += String.fromCharCode(c);
                        i++;
                    } else if ((c > 191) && (c < 224)) {
                        zhdm = zhdk.charCodeAt(i + 1);
                        zgpk += String.fromCharCode(((c & 31) << 6) | (zhdm & 63));
                        i += 2;
                    } else {
                        zhdm = zhdk.charCodeAt(i + 1);
                        zhdl = zhdk.charCodeAt(i + 2);
                        zgpk += String.fromCharCode(((c & 15) << 12) | ((zhdm & 63) << 6) | (zhdl & 63));
                        i += 3;
                    }
                }
                return zgpk;
            }
        };
        var zkva = {
            zicy: function (zgpk, ziqn, zhnv) {
                var zkvb = new Blob([zgpk]);
                var zkvc = new FileReader();
                zkvc.onload = function (event) {
                    ziqn(event.target.result);
                }
                ;zkvc.onerror = function (event) {
                    zhnv(event.target.error);
                }
                ;zkvc.readAsArrayBuffer(zkvb);
            }, zhnt: function (zkuv, ziqn, zhnv) {
                var zkvb = new Blob([zkuv]);
                var zkvc = new FileReader();
                zkvc.onload = function (event) {
                    ziqn(event.target.result);
                }
                ;zkvc.onerror = function (event) {
                    zhnv(event.target.error);
                }
                ;zkvc.readAsText(zkvb);
            }
        };

        function zkls(in_bytes, zdfj) {
            var zkvd = [0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3, 0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91, 0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7, 0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5, 0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B, 0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F, 0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D, 0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433, 0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01, 0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457, 0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65, 0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9, 0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F, 0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683, 0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7, 0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5, 0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B, 0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79, 0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D, 0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713, 0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777, 0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB, 0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9, 0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF, 0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
            ];
            var zkve = [0x00000000, 0x191b3141, 0x32366282, 0x2b2d53c3, 0x646cc504, 0x7d77f445, 0x565aa786, 0x4f4196c7, 0xc8d98a08, 0xd1c2bb49, 0xfaefe88a, 0xe3f4d9cb, 0xacb54f0c, 0xb5ae7e4d, 0x9e832d8e, 0x87981ccf, 0x4ac21251, 0x53d92310, 0x78f470d3, 0x61ef4192, 0x2eaed755, 0x37b5e614, 0x1c98b5d7, 0x05838496, 0x821b9859, 0x9b00a918, 0xb02dfadb, 0xa936cb9a, 0xe6775d5d, 0xff6c6c1c, 0xd4413fdf, 0xcd5a0e9e, 0x958424a2, 0x8c9f15e3, 0xa7b24620, 0xbea97761, 0xf1e8e1a6, 0xe8f3d0e7, 0xc3de8324, 0xdac5b265, 0x5d5daeaa, 0x44469feb, 0x6f6bcc28, 0x7670fd69, 0x39316bae, 0x202a5aef, 0x0b07092c, 0x121c386d, 0xdf4636f3, 0xc65d07b2, 0xed705471, 0xf46b6530, 0xbb2af3f7, 0xa231c2b6, 0x891c9175, 0x9007a034, 0x179fbcfb, 0x0e848dba, 0x25a9de79, 0x3cb2ef38, 0x73f379ff, 0x6ae848be, 0x41c51b7d, 0x58de2a3c, 0xf0794f05, 0xe9627e44, 0xc24f2d87, 0xdb541cc6, 0x94158a01, 0x8d0ebb40, 0xa623e883, 0xbf38d9c2, 0x38a0c50d, 0x21bbf44c, 0x0a96a78f, 0x138d96ce, 0x5ccc0009, 0x45d73148, 0x6efa628b, 0x77e153ca, 0xbabb5d54, 0xa3a06c15, 0x888d3fd6, 0x91960e97, 0xded79850, 0xc7cca911, 0xece1fad2, 0xf5facb93, 0x7262d75c, 0x6b79e61d, 0x4054b5de, 0x594f849f, 0x160e1258, 0x0f152319, 0x243870da, 0x3d23419b, 0x65fd6ba7, 0x7ce65ae6, 0x57cb0925, 0x4ed03864, 0x0191aea3, 0x188a9fe2, 0x33a7cc21, 0x2abcfd60, 0xad24e1af, 0xb43fd0ee, 0x9f12832d, 0x8609b26c, 0xc94824ab, 0xd05315ea, 0xfb7e4629, 0xe2657768, 0x2f3f79f6, 0x362448b7, 0x1d091b74, 0x04122a35, 0x4b53bcf2, 0x52488db3, 0x7965de70, 0x607eef31, 0xe7e6f3fe, 0xfefdc2bf, 0xd5d0917c, 0xcccba03d, 0x838a36fa, 0x9a9107bb, 0xb1bc5478, 0xa8a76539, 0x3b83984b, 0x2298a90a, 0x09b5fac9, 0x10aecb88, 0x5fef5d4f, 0x46f46c0e, 0x6dd93fcd, 0x74c20e8c, 0xf35a1243, 0xea412302, 0xc16c70c1, 0xd8774180, 0x9736d747, 0x8e2de606, 0xa500b5c5, 0xbc1b8484, 0x71418a1a, 0x685abb5b, 0x4377e898, 0x5a6cd9d9, 0x152d4f1e, 0x0c367e5f, 0x271b2d9c, 0x3e001cdd, 0xb9980012, 0xa0833153, 0x8bae6290, 0x92b553d1, 0xddf4c516, 0xc4eff457, 0xefc2a794, 0xf6d996d5, 0xae07bce9, 0xb71c8da8, 0x9c31de6b, 0x852aef2a, 0xca6b79ed, 0xd37048ac, 0xf85d1b6f, 0xe1462a2e, 0x66de36e1, 0x7fc507a0, 0x54e85463, 0x4df36522, 0x02b2f3e5, 0x1ba9c2a4, 0x30849167, 0x299fa026, 0xe4c5aeb8, 0xfdde9ff9, 0xd6f3cc3a, 0xcfe8fd7b, 0x80a96bbc, 0x99b25afd, 0xb29f093e, 0xab84387f, 0x2c1c24b0, 0x350715f1, 0x1e2a4632, 0x07317773, 0x4870e1b4, 0x516bd0f5, 0x7a468336, 0x635db277, 0xcbfad74e, 0xd2e1e60f, 0xf9ccb5cc, 0xe0d7848d, 0xaf96124a, 0xb68d230b, 0x9da070c8, 0x84bb4189, 0x03235d46, 0x1a386c07, 0x31153fc4, 0x280e0e85, 0x674f9842, 0x7e54a903, 0x5579fac0, 0x4c62cb81, 0x8138c51f, 0x9823f45e, 0xb30ea79d, 0xaa1596dc, 0xe554001b, 0xfc4f315a, 0xd7626299, 0xce7953d8, 0x49e14f17, 0x50fa7e56, 0x7bd72d95, 0x62cc1cd4, 0x2d8d8a13, 0x3496bb52, 0x1fbbe891, 0x06a0d9d0, 0x5e7ef3ec, 0x4765c2ad, 0x6c48916e, 0x7553a02f, 0x3a1236e8, 0x230907a9, 0x0824546a, 0x113f652b, 0x96a779e4, 0x8fbc48a5, 0xa4911b66, 0xbd8a2a27, 0xf2cbbce0, 0xebd08da1, 0xc0fdde62, 0xd9e6ef23, 0x14bce1bd, 0x0da7d0fc, 0x268a833f, 0x3f91b27e, 0x70d024b9, 0x69cb15f8, 0x42e6463b, 0x5bfd777a, 0xdc656bb5, 0xc57e5af4, 0xee530937, 0xf7483876, 0xb809aeb1, 0xa1129ff0, 0x8a3fcc33, 0x9324fd72
            ];
            var zkvf = [0x00000000, 0x01c26a37, 0x0384d46e, 0x0246be59, 0x0709a8dc, 0x06cbc2eb, 0x048d7cb2, 0x054f1685, 0x0e1351b8, 0x0fd13b8f, 0x0d9785d6, 0x0c55efe1, 0x091af964, 0x08d89353, 0x0a9e2d0a, 0x0b5c473d, 0x1c26a370, 0x1de4c947, 0x1fa2771e, 0x1e601d29, 0x1b2f0bac, 0x1aed619b, 0x18abdfc2, 0x1969b5f5, 0x1235f2c8, 0x13f798ff, 0x11b126a6, 0x10734c91, 0x153c5a14, 0x14fe3023, 0x16b88e7a, 0x177ae44d, 0x384d46e0, 0x398f2cd7, 0x3bc9928e, 0x3a0bf8b9, 0x3f44ee3c, 0x3e86840b, 0x3cc03a52, 0x3d025065, 0x365e1758, 0x379c7d6f, 0x35dac336, 0x3418a901, 0x3157bf84, 0x3095d5b3, 0x32d36bea, 0x331101dd, 0x246be590, 0x25a98fa7, 0x27ef31fe, 0x262d5bc9, 0x23624d4c, 0x22a0277b, 0x20e69922, 0x2124f315, 0x2a78b428, 0x2bbade1f, 0x29fc6046, 0x283e0a71, 0x2d711cf4, 0x2cb376c3, 0x2ef5c89a, 0x2f37a2ad, 0x709a8dc0, 0x7158e7f7, 0x731e59ae, 0x72dc3399, 0x7793251c, 0x76514f2b, 0x7417f172, 0x75d59b45, 0x7e89dc78, 0x7f4bb64f, 0x7d0d0816, 0x7ccf6221, 0x798074a4, 0x78421e93, 0x7a04a0ca, 0x7bc6cafd, 0x6cbc2eb0, 0x6d7e4487, 0x6f38fade, 0x6efa90e9, 0x6bb5866c, 0x6a77ec5b, 0x68315202, 0x69f33835, 0x62af7f08, 0x636d153f, 0x612bab66, 0x60e9c151, 0x65a6d7d4, 0x6464bde3, 0x662203ba, 0x67e0698d, 0x48d7cb20, 0x4915a117, 0x4b531f4e, 0x4a917579, 0x4fde63fc, 0x4e1c09cb, 0x4c5ab792, 0x4d98dda5, 0x46c49a98, 0x4706f0af, 0x45404ef6, 0x448224c1, 0x41cd3244, 0x400f5873, 0x4249e62a, 0x438b8c1d, 0x54f16850, 0x55330267, 0x5775bc3e, 0x56b7d609, 0x53f8c08c, 0x523aaabb, 0x507c14e2, 0x51be7ed5, 0x5ae239e8, 0x5b2053df, 0x5966ed86, 0x58a487b1, 0x5deb9134, 0x5c29fb03, 0x5e6f455a, 0x5fad2f6d, 0xe1351b80, 0xe0f771b7, 0xe2b1cfee, 0xe373a5d9, 0xe63cb35c, 0xe7fed96b, 0xe5b86732, 0xe47a0d05, 0xef264a38, 0xeee4200f, 0xeca29e56, 0xed60f461, 0xe82fe2e4, 0xe9ed88d3, 0xebab368a, 0xea695cbd, 0xfd13b8f0, 0xfcd1d2c7, 0xfe976c9e, 0xff5506a9, 0xfa1a102c, 0xfbd87a1b, 0xf99ec442, 0xf85cae75, 0xf300e948, 0xf2c2837f, 0xf0843d26, 0xf1465711, 0xf4094194, 0xf5cb2ba3, 0xf78d95fa, 0xf64fffcd, 0xd9785d60, 0xd8ba3757, 0xdafc890e, 0xdb3ee339, 0xde71f5bc, 0xdfb39f8b, 0xddf521d2, 0xdc374be5, 0xd76b0cd8, 0xd6a966ef, 0xd4efd8b6, 0xd52db281, 0xd062a404, 0xd1a0ce33, 0xd3e6706a, 0xd2241a5d, 0xc55efe10, 0xc49c9427, 0xc6da2a7e, 0xc7184049, 0xc25756cc, 0xc3953cfb, 0xc1d382a2, 0xc011e895, 0xcb4dafa8, 0xca8fc59f, 0xc8c97bc6, 0xc90b11f1, 0xcc440774, 0xcd866d43, 0xcfc0d31a, 0xce02b92d, 0x91af9640, 0x906dfc77, 0x922b422e, 0x93e92819, 0x96a63e9c, 0x976454ab, 0x9522eaf2, 0x94e080c5, 0x9fbcc7f8, 0x9e7eadcf, 0x9c381396, 0x9dfa79a1, 0x98b56f24, 0x99770513, 0x9b31bb4a, 0x9af3d17d, 0x8d893530, 0x8c4b5f07, 0x8e0de15e, 0x8fcf8b69, 0x8a809dec, 0x8b42f7db, 0x89044982, 0x88c623b5, 0x839a6488, 0x82580ebf, 0x801eb0e6, 0x81dcdad1, 0x8493cc54, 0x8551a663, 0x8717183a, 0x86d5720d, 0xa9e2d0a0, 0xa820ba97, 0xaa6604ce, 0xaba46ef9, 0xaeeb787c, 0xaf29124b, 0xad6fac12, 0xacadc625, 0xa7f18118, 0xa633eb2f, 0xa4755576, 0xa5b73f41, 0xa0f829c4, 0xa13a43f3, 0xa37cfdaa, 0xa2be979d, 0xb5c473d0, 0xb40619e7, 0xb640a7be, 0xb782cd89, 0xb2cddb0c, 0xb30fb13b, 0xb1490f62, 0xb08b6555, 0xbbd72268, 0xba15485f, 0xb853f606, 0xb9919c31, 0xbcde8ab4, 0xbd1ce083, 0xbf5a5eda, 0xbe9834ed
            ];
            var zkvg = [0x00000000, 0xb8bc6765, 0xaa09c88b, 0x12b5afee, 0x8f629757, 0x37def032, 0x256b5fdc, 0x9dd738b9, 0xc5b428ef, 0x7d084f8a, 0x6fbde064, 0xd7018701, 0x4ad6bfb8, 0xf26ad8dd, 0xe0df7733, 0x58631056, 0x5019579f, 0xe8a530fa, 0xfa109f14, 0x42acf871, 0xdf7bc0c8, 0x67c7a7ad, 0x75720843, 0xcdce6f26, 0x95ad7f70, 0x2d111815, 0x3fa4b7fb, 0x8718d09e, 0x1acfe827, 0xa2738f42, 0xb0c620ac, 0x087a47c9, 0xa032af3e, 0x188ec85b, 0x0a3b67b5, 0xb28700d0, 0x2f503869, 0x97ec5f0c, 0x8559f0e2, 0x3de59787, 0x658687d1, 0xdd3ae0b4, 0xcf8f4f5a, 0x7733283f, 0xeae41086, 0x525877e3, 0x40edd80d, 0xf851bf68, 0xf02bf8a1, 0x48979fc4, 0x5a22302a, 0xe29e574f, 0x7f496ff6, 0xc7f50893, 0xd540a77d, 0x6dfcc018, 0x359fd04e, 0x8d23b72b, 0x9f9618c5, 0x272a7fa0, 0xbafd4719, 0x0241207c, 0x10f48f92, 0xa848e8f7, 0x9b14583d, 0x23a83f58, 0x311d90b6, 0x89a1f7d3, 0x1476cf6a, 0xaccaa80f, 0xbe7f07e1, 0x06c36084, 0x5ea070d2, 0xe61c17b7, 0xf4a9b859, 0x4c15df3c, 0xd1c2e785, 0x697e80e0, 0x7bcb2f0e, 0xc377486b, 0xcb0d0fa2, 0x73b168c7, 0x6104c729, 0xd9b8a04c, 0x446f98f5, 0xfcd3ff90, 0xee66507e, 0x56da371b, 0x0eb9274d, 0xb6054028, 0xa4b0efc6, 0x1c0c88a3, 0x81dbb01a, 0x3967d77f, 0x2bd27891, 0x936e1ff4, 0x3b26f703, 0x839a9066, 0x912f3f88, 0x299358ed, 0xb4446054, 0x0cf80731, 0x1e4da8df, 0xa6f1cfba, 0xfe92dfec, 0x462eb889, 0x549b1767, 0xec277002, 0x71f048bb, 0xc94c2fde, 0xdbf98030, 0x6345e755, 0x6b3fa09c, 0xd383c7f9, 0xc1366817, 0x798a0f72, 0xe45d37cb, 0x5ce150ae, 0x4e54ff40, 0xf6e89825, 0xae8b8873, 0x1637ef16, 0x048240f8, 0xbc3e279d, 0x21e91f24, 0x99557841, 0x8be0d7af, 0x335cb0ca, 0xed59b63b, 0x55e5d15e, 0x47507eb0, 0xffec19d5, 0x623b216c, 0xda874609, 0xc832e9e7, 0x708e8e82, 0x28ed9ed4, 0x9051f9b1, 0x82e4565f, 0x3a58313a, 0xa78f0983, 0x1f336ee6, 0x0d86c108, 0xb53aa66d, 0xbd40e1a4, 0x05fc86c1, 0x1749292f, 0xaff54e4a, 0x322276f3, 0x8a9e1196, 0x982bbe78, 0x2097d91d, 0x78f4c94b, 0xc048ae2e, 0xd2fd01c0, 0x6a4166a5, 0xf7965e1c, 0x4f2a3979, 0x5d9f9697, 0xe523f1f2, 0x4d6b1905, 0xf5d77e60, 0xe762d18e, 0x5fdeb6eb, 0xc2098e52, 0x7ab5e937, 0x680046d9, 0xd0bc21bc, 0x88df31ea, 0x3063568f, 0x22d6f961, 0x9a6a9e04, 0x07bda6bd, 0xbf01c1d8, 0xadb46e36, 0x15080953, 0x1d724e9a, 0xa5ce29ff, 0xb77b8611, 0x0fc7e174, 0x9210d9cd, 0x2aacbea8, 0x38191146, 0x80a57623, 0xd8c66675, 0x607a0110, 0x72cfaefe, 0xca73c99b, 0x57a4f122, 0xef189647, 0xfdad39a9, 0x45115ecc, 0x764dee06, 0xcef18963, 0xdc44268d, 0x64f841e8, 0xf92f7951, 0x41931e34, 0x5326b1da, 0xeb9ad6bf, 0xb3f9c6e9, 0x0b45a18c, 0x19f00e62, 0xa14c6907, 0x3c9b51be, 0x842736db, 0x96929935, 0x2e2efe50, 0x2654b999, 0x9ee8defc, 0x8c5d7112, 0x34e11677, 0xa9362ece, 0x118a49ab, 0x033fe645, 0xbb838120, 0xe3e09176, 0x5b5cf613, 0x49e959fd, 0xf1553e98, 0x6c820621, 0xd43e6144, 0xc68bceaa, 0x7e37a9cf, 0xd67f4138, 0x6ec3265d, 0x7c7689b3, 0xc4caeed6, 0x591dd66f, 0xe1a1b10a, 0xf3141ee4, 0x4ba87981, 0x13cb69d7, 0xab770eb2, 0xb9c2a15c, 0x017ec639, 0x9ca9fe80, 0x241599e5, 0x36a0360b, 0x8e1c516e, 0x866616a7, 0x3eda71c2, 0x2c6fde2c, 0x94d3b949, 0x090481f0, 0xb1b8e695, 0xa30d497b, 0x1bb12e1e, 0x43d23e48, 0xfb6e592d, 0xe9dbf6c3, 0x516791a6, 0xccb0a91f, 0x740cce7a, 0x66b96194, 0xde0506f1
            ];

            function zkvh(item, zkvi) {
                item = item.xor(zkvi);
                var zhdl = bigInt(zkvg[item.and(0xff)]);
                var zhdm = bigInt(zkvf[item.shiftRight(8).and(0xff)]);
                var zhdr = bigInt(zkve[item.shiftRight(16).and(0xff)]);
                var zkvj = bigInt(zkvd[item.shiftRight(24)]);
                item = zhdl.xor(zhdm.xor(zhdr.xor(zkvj)));
                return item;
            }

            function zkvk(item, zabn, zkla) {
                for (var i = 0; i < 8; i++) {
                    var zkvl = RfapiJS["utils"].zkky(zabn, zkla, 4);
                    item = zkvh(item, zkvl);
                    zkla += 4;
                }
                return item;
            }

            var zkvm = bigInt(0xffffffff);
            var zkla = 0;
            while (zdfj >= 32) {
                zkvm = zkvk(zkvm, in_bytes, zkla);
                zkla += 32;
                zdfj -= 32;
            }
            while (zdfj >= 4) {
                var zkvl = RfapiJS["utils"].zkky(in_bytes, zkla, 4);
                zkvm = zkvh(zkvm, zkvl);
                zkla += 4;
                zdfj -= 4;
            }
            if (zdfj) do {
                var zkvn = zkvm.shiftRight(8);
                var zkvo = zkvm.xor(in_bytes[zkla]);
                var zkvp = zkvo.and(0xff);
                var zkvq = bigInt(zkvd[zkvp]);
                zkvm = zkvq.xor(zkvn);
                zkla++;
            }
            while (--zdfj);
            return 0xffffffff - zkvm.value;
        };RfapiJS["utils"] = zkfs;
        RfapiJS["CRC32"] = zkls;
        RfapiJS["UTF8"] = zkqz;
        RfapiJS["Binary"] = zkqx;
        RfapiJS["Base64"] = Base64;
        RfapiJS["RF_RSA"] = zkop;
        RfapiJS["SecurityScore"] = zksl;
        RfapiJS["StringConverter"] = zkva;
        RfapiJS["RfPasswordAudit"] = zkrh;
        RfapiJS["CSecurityStats"] = zkrf;
    }
).apply(RfapiJS);
