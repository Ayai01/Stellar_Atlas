/* 常量 */
const res_catagories = ["energy", "minerals", "food", "influence", "unity", "alloys", "consumer_goods", "volatile_motes", "exotic_gases", "rare_crystals", "sr_living_metal", "sr_zro", "sr_dark_matter", "nanites", "minor_artifacts"];
const all_ethics = ["militarist", "pacifist", "xenophobe", "xenophile", "egalitarian", "authoritarian", "materialist", "spiritualist", "gestalt_consciousness"];
const all_ethics_name = ["军国", "和平", "排外", "亲外", "平等", "威权", "唯物", "唯心", "格式塔意识"];
const origins = ["origin_default", "origin_shattered_ring", "origin_mechanists", "origin_syncretic_evolution", "origin_life_seeded", "origin_post_apocalyptic", "origin_remnants", "origin_void_dwellers", "origin_scion", "origin_galactic_doorstep", "origin_tree_of_life", "origin_shoulders_of_giants", "origin_lithoid", "origin_machine", "origin_doomsday", "origin_necrophage", "origin_fallen_empire", "origin_enlightened", "origin_separatists", "origin_khan_successor", "origin_common_ground", "origin_common_ground_npc", "origin_hegemon", "origin_hegemon_npc", "origin_lost_colony", "origin_clone_army"];
const origin_names = ["繁荣一统", "破碎之环", "机械师", "协同进化", "生命之籽", "后启示录", "复国孑遗", "虚空居者", "先辈子弟", "繁星门阶", "生命之树", "巨人之肩", "降世灾星", "资源统合", "末日将临", "食尸文化", "长者之裔", "启蒙开化", "分离主义者", "可汗继承者", "共同命运", "共同命运(成员)", "一方霸主", "霸主部从", "失落行星", "克隆大军"];

/* 初始化对象 */
var fr = new FileReader();
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var galactic_objects = null;
var realm_px = []; // [i][j] <--> [(i+gr) * (2*gr+1) + (j+gr)]
var countrys = null;
var starbases = null;
var planets = null;
var sp_obj = null; //特殊星系
var cmd_history = null;
var extra_display = [];

/* 初始化变量 */
var savename = "";
var gamestate = "";
var meta = "";
var galaxy_radius = 100.0;

var w = canvas.width = canvas.offsetWidth;
var h = canvas.height = canvas.offsetHeight;
var a = Math.min(w, h);
var scale_center = [w/2, h/2];
var scale_size = 0.5;
var scale_size_f = 1;
var max_victory_rank = 1;

/* 默认设置 */
var show_hyperlane = true;
var show_wormholes = true;
var show_star_id = false;
var show_star_name = false;
var show_country = true;
var border_px = 3;
var show_sp_objs = true;
var edit_mode = false;
var show_star_class = true;

/* 初始化页面 */
init();
function init() {
	sp_obj = new Map();
	cmd_history = [];
	run_cmd();
	sp_obj.set("dyson_sphere_init_01", "戴森球");
	sp_obj.set("science_nexus_init_01", "科研枢纽");
	sp_obj.set("sentry_array_init_01", "哨兵阵列");
	sp_obj.set("ring_world_init_01", "环世界");
	sp_obj.set("megacorp_matter_decompressor_init_01", "物质解压器");
	sp_obj.set("megacorp_strategic_coordination_center_init_01", "战略指挥中心");
	sp_obj.set("megacorp_mega_art_installation_init_01", "巨型艺术设施");
	sp_obj.set("mega_shipyard_init_01", "巨型船坞");
	sp_obj.set("megacorp_interstellar_assembly_init_01", "星际集会");
	sp_obj.set("guardians_init_fortress", "神秘堡垒");
	sp_obj.set("great_wound_system", "大伤口");
	sp_obj.set("living_planet_system", "知觉之海");
	sp_obj.set("hostile_init_07", "水晶球");
	sp_obj.set("guardians_init_technosphere", "巨大黑洞");
	sp_obj.set("relic_system_4", "废弃星球");
	sp_obj.set("hauer_system_initializer", "永不遗忘");
	sp_obj.set("sanctuary_system", "避难所");
	sp_obj.set("ai_system_01", "净化中心001");
	sp_obj.set("ai_system_02", "净化中心002");
	sp_obj.set("ai_system_03", "净化中心003");
	sp_obj.set("ai_system_04", "净化中心004");
	sp_obj.set("ratling_1_1", "鼠人星系");
	sp_obj.set("trappist_initializer", "特拉匹斯特");
	sp_obj.set("distantstars_init_00", "L星门");
	sp_obj.set("distantstars_init_06", "L星门");
	sp_obj.set("ice_system", "三极地");
}

/* 重映射坐标 */
function remap(x, y) {
	var xf = -scale_size * x / galaxy_radius * a + scale_center[0];
	var yf = scale_size * y / galaxy_radius * a + scale_center[1];
	return [xf, yf];
}
function demap(xf, yf) {
	var x = (scale_center[0] - xf) / a * galaxy_radius / scale_size;
	var y = (yf - scale_center[1]) / a * galaxy_radius / scale_size;
	return [x, y];
}

/* 绘制星图 */
async function show_atlas() {
	ctx.clearRect(0, 0, w, h);
	border_showed = false;
	scale_size_f = Math.sqrt(scale_size * 2);
	show_sp_objs = document.getElementById("show_sp_objs").checked;
	edit_mode = document.getElementById("edit_mode").checked;
	show_country = document.getElementById("show_country").checked;
	show_star_id = document.getElementById("show_star_id").checked;
	show_star_name = document.getElementById("show_star_name").checked;
	show_star_class = document.getElementById("show_star_class").checked;
	if(!load()) {
		return;
	}
	
	/* 显示国家 */
	if(show_country) {
		await show_border(border_px);
	}
	/* 显示所有恒星系 */
	galactic_objects.forEach(function (star, id) {
		[star.xf, star.yf] = remap(star.x, star.y);
		drawStar(star.xf, star.yf, scale_size_f * 2, star.star_class);
		if(show_star_id) {
			drawText(star.xf, star.yf + 10 * scale_size_f, 10 * scale_size_f + "px Arial", "" + id,  "rgba(127,0,1,0.75)");
		} else if (show_star_name) {
			drawText(star.xf, star.yf + 10 * scale_size_f, 8 * scale_size_f + "px Arial", star.name,  "rgba(127,0,1,0.75)");
		}
		/* 显示超空间航道 */
		if(show_hyperlane) {
			for(var i = 0; i < star.hyperlanes.length; i++) {
				var target = star.hyperlanes[i];
				if(target < id) { // 不重复绘制
					var dx = galactic_objects.get(target).xf - star.xf;
					var dy = galactic_objects.get(target).yf - star.yf;
					var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
					drawLine(star.xf + (dx / dist * scale_size_f * 2), star.yf + (dy / dist * scale_size_f * 2), galactic_objects.get(target).xf - (dx / dist * scale_size_f * 2), galactic_objects.get(target).yf - (dy / dist * scale_size_f * 2), "rgba(0,0,0,0.5)", [10,0], scale_size_f);
				}
			}
		}
	});
	/* 显示虫洞对 */
	if(show_wormholes) {
		natural_wormholes.forEach(function (hole, id) {
			var target = hole.connections;
			var ori_1 = galactic_objects.get(hole.origin);
			var ori_2 = galactic_objects.get(natural_wormholes.get(target).origin);
			if(target < id) { // 不重复绘制
				drawLine(ori_1.xf, ori_1.yf, ori_2.xf, ori_2.yf, "hsla(" + Math.round(nextSeed(nextSeed(id))/648) + ",50%,30%,70%)", [10 * scale_size_f, 5  * scale_size_f], scale_size_f);
			}
		});
	}
	/* 显示特殊目标 */
	if(show_sp_objs) {
		mark_sp();
	}
	
	/* 额外显示 */
	for(var i = 0; i < extra_display.length; i++) {
		var obj = extra_display[i];
		[x, y] = remap(obj[1], obj[2]);
		switch(obj[0]) {
			case "circle":
				drawCircle(x, y, obj[3], obj[4]);
				break;
			case "arc":
				drawArc(x, y, obj[3], obj[4], obj[5], obj[6]);
				break;
			case "line":
				drawLine(x, y, remap(obj[3], obj[4])[0], remap(obj[3], obj[4])[1], obj[5], obj[6], obj[7]);
				break;
			case "text":
				drawText(x, y, obj[3], obj[4], obj[5]);
				break;
		} 
	}
}

/* 标出特殊星系 */
function mark_sp() {
	galactic_objects.forEach(function (star) {
		var sp_str = sp_obj.get(star.initializer);
		if(sp_str != null) {
			drawText(star.xf, star.yf + 10 * scale_size_f, 10 * scale_size_f + "px Arial", sp_str, "rgba(0,0,63,0.80)");
			drawArc(star.xf, star.yf, 6 * scale_size_f, "rgba(0,0,63,0.8)", [3 * scale_size_f,2 * scale_size_f], scale_size_f);
		}
	});
}

/* 加载存档 */
var loaded = false;
function load() {
	if(gamestate.length == 0){
		return false;
	}
	if(!loaded) {
		load_starbases(); // must before load_galactic_objects()
		load_galactic_objects();
		load_wormholes();
		load_planets();
		load_country();
	}
	loaded = true;
	return true;
}
/* 加载 */
function load_galactic_objects() {
	galactic_objects = new Map();
	var galactic_object_str = gamestate.substring(gamestate.indexOf("\ngalactic_object") + 18, gamestate.indexOf("}\nstarbase_mgr"));
	var star_str = "";
	for(var i = 0; i < 2000 && galactic_object_str.length > 10; i++) {
		var end = galactic_object_str.substring(2).search(/\n\t\d+=/g);
		end = end == -1 ? galactic_object_str.length - 1 : end + 2;
		star_str = galactic_object_str.substring(0, end);
		var id = parseInt(star_str.substring(2, star_str.indexOf("=")));
		var star = new galactic_object(star_str);
		if(star.str != null) {
			star.init();
			galactic_objects.set(id, star);
		}
		galactic_object_str = galactic_object_str.substring(end);
	}
}

function load_wormholes() {
	var bypasses = new Map();
	natural_wormholes = new Map();
	var bypasses_start = gamestate.indexOf("\nbypasses={\n\t") + 11;
	var bypasses_end = gamestate.indexOf("\nnatural_wormholes={\n\t");
	var natural_wormholes_start = bypasses_end + 20;
	var natural_wormholes_end = gamestate.indexOf("\nsectors={\n\t");
	if(gamestate.indexOf("\ntrade_routes={\n\t") >= 0) {
		natural_wormholes_end = Math.min(natural_wormholes_end, gamestate.indexOf("\ntrade_routes={\n\t"));
	}
	var bypasses_str = gamestate.substring(bypasses_start, bypasses_end).replaceAll(/\t\d+=none\n/g,"");
	var natural_wormholes_str = gamestate.substring(natural_wormholes_start, natural_wormholes_end);
	/* 读取 bypasses */
	for(var i = 0; i < 0x1000 && bypasses_str.length > 10; i++) { 
		var bp_str = "";
		var end = bypasses_str.substring(2).search(/\n\t\d+=/g);
		end = end == -1 ? bypasses_str.length - 1 : end + 2;
		bp_str = bypasses_str.substring(0, end);
		var id = parseInt(bp_str.substring(2, bp_str.indexOf("=")));
		var owner_id = parseInt(/id=\d+/g.exec(bp_str)[0].replace("id=",""));
		if(bp_str.indexOf("type=\"wormhole\"") != -1) { // is wormhole
			var linked_to = parseInt(/linked_to=\d+/g.exec(bp_str)[0].replace("linked_to=",""));
			bypasses.set(id, new bypass(linked_to, owner_id));
		}
		bypasses_str = bypasses_str.substring(end);
	}
	/* 读取虫洞信息 */
	for(var i = 0; i < 0x1000 && natural_wormholes_str.length > 10; i++) { 
		var hole_str = "";
		var end = natural_wormholes_str.substring(2).search(/\n\t\d+=/g);
		end = end == -1 ? natural_wormholes_str.length - 1 : end + 2;
		hole_str = natural_wormholes_str.substring(0, end);
		var id = parseInt(hole_str.substring(2, hole_str.indexOf("=")));
		var origin = parseInt(/origin=\d+/g.exec(hole_str)[0].replace("origin=",""));
		var bp_id = parseInt(/bypass=\d+/g.exec(hole_str)[0].replace("bypass=",""));
		var target = bypasses.get(bypasses.get(bp_id).connections).owner_id;
		natural_wormholes.set(id, new wormhole(origin, bp_id, target))
		natural_wormholes_str = natural_wormholes_str.substring(end);
	}
}

/* 加载星球 */
function load_planets() {
	/* fixed, but not perfectly solved */
	var planets_str = gamestate.substring(gamestate.indexOf("\n\tplanet={") + 10, gamestate.indexOf("\ncountry")).replaceAll(/\t\t\d+=none\n/g,"");
	planets = new Map();
	var pl_str = "";
	for(var i = 0; i < 65536 && planets_str.length > 10; i++) { 
		var end = planets_str.substring(2).search(/\n\t\t\d+=/g);
		end = end == -1 ? planets_str.length - 1 : end + 2;
		pl_str = planets_str.substring(0, end);
		var id = parseInt(pl_str.substring(2, pl_str.indexOf("=")));
		var pl = new planet(pl_str);
		pl.init();
		planets.set(id, pl);
		planets_str = planets_str.substring(end);
	}
}

/* 加载国家 */
function load_country() {
	var country_str =  gamestate.substring(gamestate.indexOf("\ncountry") + 10, gamestate.indexOf("}\nconstruction")).replaceAll(/\t{3}strategy=[{]\n\t{4}id=\d{1,}\n\t{4}target=\d{1,}\n\t{4}value=\d{1,}\n\t{4}type=\d{1,}\n\t{3}[}]\n/g,"").replaceAll(/\t\d+=none\n/g,"");
	countrys = new Map();
	var cty_str = "";
	for(var i = 0; i < 0x100 && country_str.length > 10; i++) { 
		var end = country_str.substring(2).search(/\n\t\d+=/g);
		end = end == -1 ? country_str.length - 1 : end + 2;
		cty_str = country_str.substring(0, end);
		var id = parseInt(cty_str.substring(2, cty_str.indexOf("=")));
		var cty = new empire(cty_str);
		cty.init();
		countrys.set(id, cty);
		country_str = country_str.substring(end);
	}
}

/* 加载恒星基地 */
function load_starbases() {
	starbases = new Map();
	var starbases_start = gamestate.indexOf("\n\tstarbases={\n\t") + 13;
	var starbases_end = gamestate.indexOf("\nplanets={\n\t");
	var starbases_str = gamestate.substring(starbases_start, starbases_end).replaceAll(/\t\d+=none\n/g,"");
	/* 读取 starbases */
	var base_str = "";
	for(var i = 0; i < 0x10000 && starbases_str.length > 10; i++) { 
		var end = starbases_str.substring(3).search(/\n\t\t\d+=/g);
		end = end == -1 ? starbases_str.length - 1 : end + 3;
		base_str = starbases_str.substring(0, end);
		var id = parseInt(base_str.substring(3, base_str.indexOf("=")));
		var owner = parseInt(/owner=\d+/g.exec(base_str)[0].replace("owner=",""));
		starbases_str = starbases_str.substring(end);
		starbases.set(id, owner);
	}
}

/* 加载国家边界 */
function load_border(px) {
	realm_px = [];
	var gr = Math.round(galaxy_radius);
	for(var i = -gr; i <= gr; i += px) {
		for(var j = -gr; j <= gr; j += px) {
			var closest = -1;
			var dis_min2 = gr * gr;
			galactic_objects.forEach(function (star, id) {
				var dx = Math.abs(star.x - i);
				var dy = Math.abs(star.y - j);
				var dis2 = Math.pow(dx, 2) + Math.pow(dy, 2);
				if(dis2 < dis_min2) {
					closest = id;
					dis_min2 = dis2;
				}
			});
			if(closest != -1) {
				var owner = galactic_objects.get(closest).owner;
			}
			if(owner >= 0 && dis_min2 < 1024) {
				realm_px[(i+gr) * (2*gr+1) + (j+gr)] = "hsla(" + (((owner % 12 + owner / max_victory_rank * 2)* 30) % 360) + ",70%,50%," + (0.4 - Math.sqrt(dis_min2) / 100).toFixed(3) + ")";
			}
		}
	}
}
/* 绘制国家范围 */
var border_showed = false;
var border_loaded = -1;
// var realm_px = []; // [i][j] <--> [(i+gr) * (2*gr+1) + (j+gr)]
function show_border(px) {
	if(border_loaded != px) {
		setTimeout(function() {
			if(!border_showed) {
				load_border(px);
				border_loaded = px;
				var gr = Math.round(galaxy_radius);
				scale_size_f = Math.sqrt(scale_size * 2);
				countrys.forEach(function (empire, id) {
					if(empire.str.indexOf("primitive=yes") == -1) {
						drawText(remap(empire.cap_system.x,empire.cap_system.y)[0], remap(empire.cap_system.x,empire.cap_system.y)[1], 12 * scale_size_f + "px Arial", "(" + id + ")" + empire.name, "rgba(127,0,1,0.75)");
					}
				});
				for(var i = 0; i < realm_px.length; i++) {
					if(realm_px[i] != undefined && realm_px[i] != null) {
						ctx.fillStyle = realm_px[i];
						var xy = remap(i / (2*gr+1) - gr, (i % (2*gr+1)) - gr);
						if (xy[0] > 0 && xy[0] < w && xy[1] > 0 && xy[1] < h) {
							var xy_next = remap(i / (2*gr+1) - gr + px, (i % (2*gr+1)) - gr + px);
							var xy_next_1 = remap(i / (2*gr+1) - gr - px, (i % (2*gr+1)) - (gr - px));
							ctx.fillRect(Math.floor(xy[0]), Math.floor(xy[1]), Math.floor(xy_next_1[0]) - Math.floor(xy[0]), Math.floor(xy_next_1[1]) - Math.floor(xy[1]));
						}
					}
				}
				border_showed = true;
			}
		}, 50);
	} else {
		if(!border_showed) {
			var gr = Math.round(galaxy_radius);
			scale_size_f = Math.sqrt(scale_size * 2);
			countrys.forEach(function (empire, id) {
				if(empire.str.indexOf("primitive=yes") == -1) {
					drawText(remap(empire.cap_system.x,empire.cap_system.y)[0], remap(empire.cap_system.x,empire.cap_system.y)[1], 12 * scale_size_f + "px Arial", "(" + id + ")" + empire.name, "rgba(127,0,1,0.75)");
				}
			});
			for(var i = 0; i < realm_px.length; i++) {
				if(realm_px[i] != undefined && realm_px[i] != null) {
					ctx.fillStyle = realm_px[i];
					var xy = remap(i / (2*gr+1) - gr, (i % (2*gr+1)) - gr);
					if (xy[0] > -px * scale_size * 2 && xy[0] < w && xy[1] > -px * scale_size * 2 && xy[1] < h) {
						var xy_next = remap(i / (2*gr+1) - gr + px, (i % (2*gr+1)) - gr + px);
						var xy_next_1 = remap(i / (2*gr+1) - gr - px, (i % (2*gr+1)) - (gr - px));
						ctx.fillRect(Math.floor(xy[0]), Math.floor(xy[1]), Math.floor(xy_next_1[0]) - Math.floor(xy[0]), Math.floor(xy_next_1[1]) - Math.floor(xy[1]));
					}
				}
			}
			border_showed = true;
		}
	}
}


/* 对象 */
function galactic_object(str) {
	if(str.length > 10) {
		this.str = str;
	} else {
		this.str = "none";
		return;
	}
	this.x = parseFloat(/\n\t\t\tx=[-.\d]{1,10}/g.exec(str)[0].replace("\n\t\t\tx=",""));
	this.y = parseFloat(/\n\t\t\ty=[-.\d]{1,10}/g.exec(str)[0].replace("\n\t\t\ty=",""));
	if(Math.pow(galaxy_radius + 10, 2) < Math.pow(this.x, 2) + Math.pow(this.y, 2)) {
		galaxy_radius = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)) + 10;
	}
	[this.xf, this.yf] = remap(this.x, this.y); //fixed
	this.name = /\n\t\tname=.+\n/g.exec(str)[0].replace("\n\t\tname=","").replaceAll(/[\"\n]/g,"");
	this.star_class = /\n\t\tstar_class=.+\n/g.exec(str)[0].replace("\n\t\tstar_class=","").replaceAll(/[\"\n]/g,"");
	this.initializer = /\n\t\tinitializer=.+\n/g.exec(str)[0].replace("\n\t\tinitializer=","").replaceAll(/[\"\n]/g,"");
	this.hyperlanes = [];
	this.owner = -1;
	this.starbase = -1;
	this.init = init;
	function init() {
		var hyperlanes_i = str.split(/.+\n\t\t\t\tto=/g);
		for(var j = 1; j < hyperlanes_i.length; j++) {
			var target = parseInt(hyperlanes_i[j].replaceAll(/\n.+/g,""));
			this.hyperlanes.push(target);
		}
		if(str.indexOf("starbase=") != 0) {
			this.starbase = parseInt(/\n\t\tstarbase=\d+/g.exec(str)[0].replace("\n\t\tstarbase=",""));
			this.owner = starbases.get(this.starbase);
		}
	}
}
/* --国家 */
function empire(str) {
	if(str.length > 10) {
		this.str = str;
	} else {
		this.str = "none";
		return;
	}
	this.name = /\n\t\tname=.+\n/g.exec(str)[0].replace("\n\t\tname=","").replaceAll(/[\"\n]/g,"");
	this.origin = (/\n\t\t\torigin=.+\n/g.exec(str) || [""])[0].replace("\n\t\t\torigin=","").replaceAll(/[\"\n]/g,"");
	if(origins.indexOf(this.origin) != -1) {
		this.origin = origin_names[origins.indexOf(this.origin)];
	}
	this.victory_rank = /\n\t\tvictory_rank=\d+/g.exec(str)[0].replace("\n\t\tvictory_rank=","");
	this.capital = str.indexOf("capital=") < 0 ? -1 : parseInt(/\n\t\tcapital=\d+/g.exec(str)[0].replace("\n\t\tcapital=",""));
	this.cap_system = -1;
	this.init = init;
	this.resources = new Map();
	this.ethos = [];
	this.military_power = parseInt(/\n\t\tmilitary_power=\d+/g.exec(str)[0].replace("\n\t\tmilitary_power=",""));
	var res_str = str.substring(str.indexOf("standard_economy_module"), str.indexOf("standard_leader_module"));
	function init() {
		for(var i = 0; i < res_catagories.length; i++) {
			this.resources.set(res_catagories[i], parseInt((new RegExp(res_catagories[i] + "=\\d+","g").exec(res_str) || [""])[0].replace(res_catagories[i] + "=","")) || 0);
		}
		for(var i = 0; i < all_ethics.length - 1; i++) {
			if(str.indexOf("\n\t\t\tethic=\"ethic_" + all_ethics[i]) != -1) {
				this.ethos.push(all_ethics_name[i] + "主义");
			} else if(str.indexOf("\n\t\t\tethic=\"ethic_fanatic_" + all_ethics[i]) != -1) {
				this.ethos.push("极端" + all_ethics_name[i] + "主义");
			}
		}
		if(str.indexOf("\n\t\t\tethic=\"ethic_gestalt_consciousness") != -1) {
			if(str.indexOf("\n\t\t\tauthority=\"auth_hive_mind") != -1) {
				this.ethos.push("格式塔意识(蜂巢思维)");
			} else if(str.indexOf("\n\t\t\tauthority=\"auth_machine_intelligence") != -1) {
				this.ethos.push("格式塔意识(机械智能)");
			}
		}
		max_victory_rank = Math.max(max_victory_rank, this.victory_rank);
		if(this.capital != -1) {
			if(planets.get(this.capital)==undefined) {
				console.log(this.capital);
			}
			this.cap_system = galactic_objects.get(planets.get(this.capital).origin);
		}
	}
}
/* --bypass */
function bypass(connections, owner_id) {
	this.connections = connections;
	this.owner_id = owner_id;
}
/* --虫洞 */
function wormhole(origin, bypass_id, connections) {
	this.origin = origin;
	this.bypass_id = bypass_id;
	this.connections = connections;
}
/* --星球 */
function planet(str) {
	this.name = /\n\t{3}name=.+\n/g.exec(str)[0].replace("\n\t\t\tname=","").replaceAll(/[\"\n]/g,"");
	this.origin = parseInt(/\n\t{4}origin=\d+/g.exec(str)[0].replace("\n\t\t\t\torigin=",""));
	this.owner = -1;
	this.init = init;
	function init() {
		if(str.indexOf("\n\t\t\towner=") != -1) {
			this.owner = parseInt(/\n\t{3}owner=\d+/g.exec(str)[0].replace("\n\t\t\towner=",""));
		}
	}
}

/* 操作 */
/* 添加超空间航道 */
function add_hyperlane(id1, id2) {
	var star1 = galactic_objects.get(id1);
	var star2 = galactic_objects.get(id2);
	if(star1 == null || star2 == null) {
		return "恒星系id不存在";
	}
	var text_above = gamestate.substring(0, gamestate.indexOf("\ngalactic_object") + 18);
	var galactic_object_str = "";
	var text_below = gamestate.substring(gamestate.indexOf("\n}\nstarbase_mgr"));
	if(star1.hyperlanes.indexOf(id2) != -1 || star2.hyperlanes.indexOf(id1) != -1) {
		return "超空间航道已存在";
	}
	var dis = Math.sqrt(Math.pow(star1.x-star2.x,2)+Math.pow(star1.y-star2.y,2));
	var star1_str = star1.str.replaceAll(/\n\t\thyperlane={\n\t\t\t/g,"\n\t\thyperlane={\n\t\t\t{\n\t\t\t\tto="+id2+"\n\t\t\t\tlength="+dis+"\n\t\t\t}\n ")
	var star2_str = star2.str.replaceAll(/\n\t\thyperlane={\n\t\t\t/g,"\n\t\thyperlane={\n\t\t\t{\n\t\t\t\tto="+id1+"\n\t\t\t\tlength="+dis+"\n\t\t\t}\n ")
	galactic_objects.set(id1, new galactic_object(star1_str));
	galactic_objects.set(id2, new galactic_object(star2_str));
	galactic_objects.forEach(function (star, id) {
		galactic_object_str += star.str;
	});
	gamestate = text_above + galactic_object_str + text_below;
	load_galactic_objects();
	return "已添加超空间航道";
}

/* 删除超空间航道 */
function remove_hyperlane(id1, id2) {
	var star1 = galactic_objects.get(id1);
	var star2 = galactic_objects.get(id2);
	if(star1 == null || star2 == null) {
		return "恒星系id不存在\n";
	}
	var text_above = gamestate.substring(0, gamestate.indexOf("\ngalactic_object") + 18);
	var galactic_object_str = "";
	var text_below = gamestate.substring(gamestate.indexOf("\n}\nstarbase_mgr"));
	if(star1.hyperlanes.indexOf(id2) == -1 && star2.hyperlanes.indexOf(id1) == -1) {
		return "超空间航道不存在\n";
	}
	var star1_str = star1.str.replaceAll(new RegExp("{\\n\\t\\t\\t\\tto=" + id2 + "\\n\\t\\t\\t\\tlength=[\\s\\S]+?\\n\\t\\t\\t}\\n ","g"),"");
	var star2_str = star2.str.replaceAll(new RegExp("{\\n\\t\\t\\t\\tto=" + id1 + "\\n\\t\\t\\t\\tlength=[\\s\\S]+?\\n\\t\\t\\t}\\n ","g"),"");
	galactic_objects.set(id1, new galactic_object(star1_str));
	galactic_objects.set(id2, new galactic_object(star2_str));
	galactic_objects.forEach(function (star, id) {
		galactic_object_str += star.str;
	});
	gamestate = text_above + galactic_object_str + text_below;
	load_galactic_objects();
	return "已删除超空间航道:(" + id1 + "<->" + id2 + ")\n";
}

/* 移动星系 */
function move_star(id, x, y) {
	var star = galactic_objects.get(id);
	if(star == null) {
		return "恒星系id不存在\n";
	}
	var text_above = gamestate.substring(0, gamestate.indexOf("\ngalactic_object") + 18);
	var galactic_object_str = "";
	var text_below = gamestate.substring(gamestate.indexOf("\n}\nstarbase_mgr"));
	var star_str = star.str.replaceAll(/\n\t\t\tx=[-.\d]{1,10}/g, "\n\t\t\tx=" + x);
	var star_str = star_str.replaceAll(/\n\t\t\ty=[-.\d]{1,10}/g, "\n\t\t\ty=" + y);
	galactic_objects.set(id, new galactic_object(star_str));
	galactic_objects.forEach(function (star, id) {
		galactic_object_str += star.str;
	});
	gamestate = text_above + galactic_object_str + text_below;
	load_galactic_objects();
	return "已更改恒星系坐标\n";
}


/* 封装绘制函数 */
function drawStar(x, y, r, star_class) {
	if(show_star_class && star_class.indexOf("sc_black_hole") != -1) {
		drawArc(x, y, 3 * scale_size_f, "rgba(0,0,0,1)", [10,0], scale_size_f * 2);
	} else if(show_star_class && star_class.indexOf("sc_binary") != -1) {
		drawCircle(x - r * 0.7, y - r * 0.7, r * 0.9, "rgba(0,0,0,0.70)");
		drawCircle(x + r * 0.7, y + r * 0.7, r * 0.9, "rgba(0,0,0,0.70)");
	} else if(show_star_class && star_class.indexOf("sc_trinary") != -1) {
		drawCircle(x + r, y - r * 0.6, r * 0.9, "rgba(0,0,0,0.65)");
		drawCircle(x - r, y - r * 0.6, r * 0.9, "rgba(0,0,0,0.65)");
		drawCircle(x, y + r * 1.1, r * 0.9, "rgba(0,0,0,0.65)");
	} else if(show_star_class && star_class.indexOf("sc_pulsar") != -1) {
		drawCircle(x, y, r, "rgba(0,0,255,0.75)");
		ctx.beginPath();
		ctx.lineWidth = scale_size_f * 0.8;
		ctx.strokeStyle = "rgba(0,127,255,0.75)";
		ctx.setLineDash([10, 0]);
		ctx.moveTo(x + r , y + r); ctx.lineTo(x + r * 2.5, y + r * 2.5);
		ctx.moveTo(x - r , y - r); ctx.lineTo(x - r * 2.5, y - r * 2.5);
		ctx.moveTo(x + r , y + r); ctx.lineTo(x + r * 1, y + r * 3);
		ctx.moveTo(x - r , y - r); ctx.lineTo(x - r * 1, y - r * 3);
		ctx.moveTo(x + r , y + r); ctx.lineTo(x + r * 3, y + r * 1);
		ctx.moveTo(x - r , y - r); ctx.lineTo(x - r * 3, y - r * 1);
		ctx.stroke();
	} else if(show_star_class && star_class.indexOf("sc_neutron_star") != -1) {
		drawCircle(x, y, r*0.8, "rgba(0,0,255,0.75)");
		ctx.beginPath();
		ctx.lineWidth = scale_size_f * 0.6;
		ctx.strokeStyle = "rgba(0,127,255,0.60)";
		ctx.setLineDash([10, 0]);
		ctx.arc(x - 3 * r, y, r * 3, -Math.PI / 4, Math.PI / 4);
		ctx.moveTo(x , y - 2 * r); ctx.lineTo(x, y + 2 * r);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(x + 3 * r, y, r * 3, Math.PI * 3 / 4, Math.PI * 5 / 4);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = "rgba(0,127,255,0.45)";
		ctx.arc(x - 1.2 * r, y, r, -Math.PI / 2, Math.PI / 2);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(x + 1.2 * r, y, r, Math.PI / 2, Math.PI * 3 / 2);
		ctx.stroke();
	} else {
		drawCircle(x, y, r, "rgba(0,0,0,0.75)");
	}
}
function drawCircle(x, y, r, color) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 360);
	ctx.fillStyle = color;
	ctx.fill();
}
function drawLine(x1, y1, x2, y2, color, LineDash, lineWidth) {
	ctx.lineWidth = lineWidth;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.setLineDash(LineDash);
	ctx.strokeStyle = color;
	ctx.stroke();
}
function drawText(x, y, font, text, color) {
	ctx.font = font;
	ctx.textAlign = "center"
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
}
function drawArc(x, y, r, color, LineDash, lineWidth) {
	ctx.lineWidth = lineWidth;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.setLineDash(LineDash);
	ctx.strokeStyle = color;
	ctx.stroke();
}

/* console */

/* 运行指令 */
function run_cmd() {
	var cmd = document.getElementById("console_input").value;
	if(cmd != null && cmd != "")
		cmd_history.push(cmd);
	var output = "";
	var cmds = cmd.split(" ");
	switch(cmds[0]) {
		case "help":
			switch(cmds[1]) {
				case undefined:
					output += "help : 显示此信息\n";
					output += "add_hyperlane <id1> <id2> : 添加超空间航道(编辑模式下点击两星系)\n";
					output += "remove_hyperlane <id1> <id2> : 删除超空间航道(编辑模式下点击两星系)\n";
					output += "move_star <id> <x> <y> : 移动恒星系(编辑模式下点击星系,再点击目标)\n";
					output += "total_war 将所有进行中的战争改为全面战争\n";
					output += "info <type> [[id] <item>] : 查找内容(输入\"help info\" 查看更多)\n";
					break;
				case "info":
					output += "info country <id>: 查看国家信息\n";
					output += "info lgate : 查看L星团\n";
					output += "info fme : 查看机械堕落帝国\n";
					break;
				default:
					output += "不支持查询此内容\n";
			}
			break;
		case "add_hyperlane":
			output += add_hyperlane(parseInt(cmds[1]), parseInt(cmds[2]));
			show_atlas();
			break;
		case "remove_hyperlane":
			if(cmds[1] == "x" && cmds[2] == "x") {
				gamestate = gamestate.replaceAll(/\n\t\thyperlane={[\s\S]+?\n\t\t}\n/g, "\n\t\thyperlane={}\n");
				output += "已删除所有超空间航道";
			} else if(cmds[2] == "x") {
				var star1 = galactic_object.get(parseInt(cmds[1]));
				if(star1 == null) {
					output +=  "恒星系id不存在\n";
					break;
				}
				for(var i = 0; i < star1.hyperlanes.length; i++) {
					output += remove_hyperlane(parseInt(cmds[1]), star1.hyperlanes[i]);
				}
			} else if(cmds[1] == "x") {
				var star1 = galactic_object.get(parseInt(cmds[2]));
				if(star1 == null) {
					output +=  "恒星系id不存在\n";
					break;
				}
				for(var i = 0; i < star1.hyperlanes.length; i++) {
					output += remove_hyperlane(star1.hyperlanes[i], parseInt(cmds[2]));
				}
			} else {
				output += remove_hyperlane(parseInt(cmds[1]), parseInt(cmds[2]));
			}
			show_atlas();
			break;
		case "move":
		case "move_star":
			var x = parseFloat(cmds[2]);
			var y = parseFloat(cmds[3]);
			if(Math.abs(x) < galaxy_radius && Math.abs(y) < galaxy_radius) {
				output += move_star(parseInt(cmds[1]), x, y);
			} else {
				output += "坐标范围无效(超出银河半径:" + galaxy_radius.toFixed(2) + "或NaN)\n";
			}
			show_atlas();
			break;
		case "total_war":
			gamestate = gamestate.replaceAll(/\n\t\tattacker_war_goal={[\s\S]+?}/g, "\n\t\tattacker_war_goal={\n\t\t\ttype=\"wg_colossus\"\n\t\t}");
			gamestate = gamestate.replaceAll(/\n\t\tdefender_war_goal={[\s\S]+?}/g, "\n\t\tdefender_war_goal={\n\t\t\ttype=\"wg_end_threat_colossus\"\n\t\t}");
			output += "已改为全面战争(存在防守方未设置战争目标时会出现bug(单方面全面战争))";
			break;
		case "info":
			output += get_info(cmds);
			break;
		default:
			output += "指令格式有误\n";
	}
	document.getElementById("console_output").innerHTML =  "<textarea id=\"txta\">" + output + "</textarea>";
	cmd_pointer = cmd_history.length - 1;
	document.getElementById("console_input").value = "";
}
function get_info(cmds) {
	if(gamestate.length < 100)  {
		return "请先上传游戏存档\n";
	}
	var output = "";
	switch(cmds[1]) {
		case undefined:
			return "info <type> [[id] <item>] : 查找内容(输入\"help info\" 查看更多)\n";
		case "country":
			var country = countrys.get(parseInt(cmds[2]));
			if(country == undefined) {
				return "国家不存在";
			}
			output += "国家名称: " + country.name + "\n资源: ";
			output += " 电" + " = " +country.resources.get("energy");
			output += ", 矿" + " = " +country.resources.get("minerals");
			output += ", 合金" + " = " +country.resources.get("alloys");
			output += ", 消费品" + " = " +country.resources.get("consumer_goods");
			output += "\n起源: " + country.origin + "\n";
			output += "思潮: "
			for(var i = 0; i < country.ethos.length; i++) {
				output += country.ethos[i] + (i == country.ethos.length-1 ? "\n" : ", ");
			}
			if(country.military_power < 1000) {
				output += "海军实力: " + country.military_power;
			} else if(country.military_power < 1000000) {
				output += "海军实力: " + (country.military_power/1000).toFixed(1) + 'k';
			} else {
				output += "海军实力: " + (country.military_power/1000000).toFixed(1) + 'm';
			}
			return output;
		case "star":
			var star = galactic_objects.get(parseInt(cmds[2]));
			if(star != null) {
				output += "星系名称: " + star.name + "\n";
				output += "星系id: " + cmds[2] + "\n";
			}
			return output;
		case "lgate":
			if(gamestate.indexOf("\n\tgray_goo_crisis_set") != -1) {
			   return "L星团为: 灰蛊风暴\n";
			} else if (gamestate.indexOf("\n\tdragon_season") != -1) {
				return "L星团为: L星龙\n";
			} else if (gamestate.indexOf("\n\tgray_goo_empire_set") != -1) {
				return "L星团为: 纳米帝国\n";
			} else {
				return "L星团是空的\n";
			}
		case "fme":
		case "fallen_machine_empire":
			if(gamestate.indexOf("\n\t\t\tfallen_machine_empire_awaken_1") != -1) {
			   return "机械堕落帝国: 最终防御单位\n";
			} else if (gamestate.indexOf("\n\t\t\tfallen_machine_empire_awaken_2") != -1) {
				return "机械堕落帝国: 失控监护者\n";
			} else {
				return "不存在机械堕落帝国";
			}
		default:
			return "不支持此查找内容\n";
	}
}

/* 上传游戏存档 */
function upload_gamestate() {
	var objFile = document.getElementById("fileId");
	if(objFile.value == "") {
		alert("文件不能为空");
		return "";
	}
	var files = $('#fileId').prop('files');//获取到文件列表
	if(files.length == 0){
		alert('文件不能为空');
		return "";
	} else {
		upload_files(files);
		savename = files[0].name;
		loaded = false; // file is new, need to load gamestate again
		border_loaded = -1;
	}
}
async function upload_files(files) {
	var zipReader = new zip.ZipReader(new zip.BlobReader(files[0]));
	var entries = await zipReader.getEntries();
	for(var i = 0; i < entries.length; i++) {
		if(entries[i].filename == "gamestate") {
			gamestate = await entries[i].getData(new zip.TextWriter(), {useWebWorkers: false});
			show_atlas();
		} else if(entries[i].filename == "meta") {
			meta = await entries[i].getData(new zip.TextWriter(), {useWebWorkers: false});
		}
	}
	zipReader.close();
}

/* 下载生成的游戏存档 */
function download_gamestate() {
	if(gamestate.length == 0){
		alert("请先上传存档");
		return;
	}
	download_file(savename, gamestate);
}
async function download_file(fileName, content){
	var blobWriter = new zip.BlobWriter("application/zip");
	var writer = new zip.ZipWriter(blobWriter);
	await writer.add("gamestate", new zip.TextReader(gamestate));
	await writer.add("meta", new zip.TextReader(meta));
	await writer.close();
	var blob = await blobWriter.getData();
	var aLink = document.createElement('a');
	aLink.download = fileName;
	aLink.href = URL.createObjectURL(blob);
	aLink.click();
	URL.revokeObjectURL(blob);
}

/* 键盘事件 */
var cmd_pointer = 0;
function console_onkeydown(e) {
	var key_event = window.event || e;
	switch(key_event.keyCode) {
		case 13: //enter
			run_cmd();
			break;
		case 38: // ↑
			if(cmd_pointer > -1) {
				document.getElementById("console_input").value = cmd_history[cmd_pointer] || "";
				cmd_pointer--;
			}
			break;
		case 40: // ↓
			if(cmd_pointer < cmd_history.length - 1) {
				cmd_pointer++;
				document.getElementById("console_input").value = cmd_history[cmd_pointer + 1] || "";
			}
			break;
	}
}

/* 拖动,缩放 */
var mouse_start = [];
var mouse_end = [];
var mouse_down = false;
var moved = false;
canvas.onmousedown = function(e) {
	mouse_down = true;
	var move_event = window.event || e;
	mouse_start = [move_event.clientX, move_event.clientY];
}
canvas.onmouseup = function(e) {
	mouse_down = false;
	if (!moved) {
		clickmap(mouse_end[0], mouse_end[1]);
	}
	moved = false;
}
canvas.onmousemove = function(e) {
	var move_event = window.event || e;
	if(move_event.clientX <= 10 || move_event.clientX >= w-10 || move_event.clientY <= 10 || move_event.clientY >= h-10) {
	   mouse_down = false;
	}
	mouse_end = [move_event.clientX, move_event.clientY];
	if(mouse_down) {
		var dx =  mouse_end[0] - mouse_start[0];
		var dy =  mouse_end[1] - mouse_start[1];
		if (Math.pow(dx,2) + Math.pow(dy,2) < 400) {
			return;
		}
		scale_center[0] += dx;
		scale_center[1] += dy;
		moved = true;
		if(gamestate.length != 0){
			show_atlas();
		}		
	}
	mouse_start = [move_event.clientX, move_event.clientY];
}
var output = "";
var operating = false;
var buf_id = -1;
function clickmap(xf, yf) {
	if(!loaded) {
		return;
	}
	[x, y] = demap(xf, yf);
	
	var gr = Math.round(galaxy_radius);
	var closest = -1;
	var dis_min2 = gr * gr;
	galactic_objects.forEach(function (star, id) {
		var dx = Math.abs(star.x - x);
		var dy = Math.abs(star.y - y);
		var dis2 = Math.pow(dx, 2) + Math.pow(dy, 2);
		if(dis2 < dis_min2) {
			closest = id;
			dis_min2 = dis2;
		}
	});
	if(edit_mode) {
		if(operating) {
			if(dis_min2 < 20) {
				extra_display = [];
				if (buf_id != -1 && closest != buf_id) {
					var star1 = galactic_objects.get(closest);
					var star2 = galactic_objects.get(buf_id);
					console.log(star1.hyperlanes);
					if(star1.hyperlanes.indexOf(buf_id) == -1 && star2.hyperlanes.indexOf(closest) == -1) {	
						console.log(add_hyperlane(closest, buf_id));
					} else {
						console.log(remove_hyperlane(closest, buf_id));
					}
				}	
			} else if(dis_min2 > 40 && (Math.pow(x, 2) + Math.pow(y, 2) < gr * gr)) {
				move_star(buf_id, x, y);
				extra_display = [];
			}
			show_atlas();
			operating = false;
		} else {
			if(dis_min2 < 20) {
				document.getElementById("console_output").innerHTML = "<textarea id=\"txta\">" + get_info(["info", "star", closest]) + "</textarea>";
				extra_display.push(["arc", galactic_objects.get(closest).x, galactic_objects.get(closest).y, 15 * scale_size_f, "rgba(255,0,0,0.80)", [6 * scale_size_f, 4 * scale_size_f], 2 * scale_size_f]);
				buf_id = closest;
			} else if(dis_min2 < 1024 && galactic_objects.get(closest).owner >= 0) {
				document.getElementById("console_output").innerHTML = "<textarea id=\"txta\">" + get_info(["info", "country", galactic_objects.get(closest).owner]) + "</textarea>";
			}
			show_atlas();
			operating = true;
		}
	} else {
		extra_display = [];
		if(dis_min2 < 20) {
			document.getElementById("console_output").innerHTML = "<textarea id=\"txta\">" + get_info(["info", "star", closest]) + "</textarea>";
		} else if(dis_min2 < 1024 && galactic_objects.get(closest).owner >= 0) {
			document.getElementById("console_output").innerHTML = "<textarea id=\"txta\">" + get_info(["info", "country", galactic_objects.get(closest).owner]) + "</textarea>";
		}
	}
	
}
canvas.onmousewheel = function(e) {
	var delta = (e.wheelDelta / 120);
	scale_size *= delta > 0 ? 1.1 : 0.9;
	if(gamestate.length != 0){
		show_atlas();
	}
}

function reset_scale() {
	scale_center = [w/2, h/2];
	scale_size = 0.5;
	scale_size_f = 1;
	document.getElementById("slider_scale").value = 100;
	document.getElementById("slider_value_scale").innerHTML = "100.00";
	if(gamestate.length != 0){
		show_atlas();
	}
}

/* 其他 */
window.onresize = function() {
	w = canvas.width = canvas.offsetWidth;
	h = canvas.height = canvas.offsetHeight;
	a = Math.min(w, h);
	scale_center = [w/2, h/2];
	if(gamestate.length != 0){
		show_atlas();
	}
}

function show_star_id_f() {
	show_star_id = document.getElementById("show_star_id").checked;
	document.getElementById("show_star_name").checked &= !show_star_id;
	if(gamestate.length != 0){
		show_atlas();
	}
}
function show_star_name_f() {
	show_star_name = document.getElementById("show_star_name").checked;
	document.getElementById("show_star_id").checked &= !show_star_name;
	if(gamestate.length != 0){
		show_atlas();
	}
}

/* LCG */
function nextSeed(seed) {
	if(seed < 0)
		seed = -seed;
	return (seed * 9301 + 49297) % 233280;
}


























