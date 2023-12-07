/* 常量 */
const res_catagories = ["energy", "minerals", "food", "influence", "unity", "alloys", "consumer_goods", "volatile_motes", "exotic_gases", "rare_crystals", "sr_living_metal", "sr_zro", "sr_dark_matter", "nanites", "minor_artifacts"];
const all_ethics = ["militarist", "pacifist", "xenophobe", "xenophile", "egalitarian", "authoritarian", "materialist", "spiritualist", "gestalt_consciousness"];
const all_ethics_name = ["军国", "和平", "排外", "亲外", "平等", "威权", "唯物", "唯心", "格式塔意识"];
const origins = ["origin_default", "origin_shattered_ring", "origin_mechanists", "origin_syncretic_evolution", "origin_life_seeded", "origin_post_apocalyptic", "origin_remnants", "origin_void_dwellers", "origin_scion", "origin_galactic_doorstep", "origin_tree_of_life", "origin_shoulders_of_giants", "origin_lithoid", "origin_machine", "origin_doomsday", "origin_necrophage", "origin_fallen_empire", "origin_enlightened", "origin_separatists", "origin_khan_successor", "origin_common_ground", "origin_common_ground_npc", "origin_hegemon", "origin_hegemon_npc", "origin_lost_colony", "origin_clone_army", "origin_here_be_dragons", "origin_ocean_paradise", "origin_progenitor_hive", "origin_subterranean", "origin_star_slingshot", "origin_shroudwalker_apprentice", "origin_imperial_vassal", "origin_overtuned", "origin_toxic_knights"];
const origin_names = ["繁荣一统", "破碎之环", "机械师", "协同进化", "生命之籽", "后启示录", "复国孑遗", "虚空居者", "先辈子弟", "繁星门阶", "生命之树", "巨人之肩", "降世灾星", "资源统合", "末日将临", "食尸文化", "长者之裔", "启蒙开化", "分离主义者", "可汗继承者", "共同命运", "共同命运(成员)", "一方霸主", "霸主部从", "失落行星", "克隆大军", "与龙共舞", "海洋天堂", "始祖蜂巢", "地底人", "射向星际", "虚境导师", "帝国封邑", "强夺天工", "毒圣骑士"];
const sp_obj = new Map([
	["dyson_sphere_init_01", "戴森球"],
	["science_nexus_init_01", "科研枢纽"],
	["sentry_array_init_01", "哨兵阵列"],
	["ring_world_init_01", "环世界"],
	["megacorp_matter_decompressor_init_01", "物质解压器"],
	["megacorp_strategic_coordination_center_init_01", "战略指挥中心"],
	["megacorp_mega_art_installation_init_01", "巨型艺术设施"],
	["mega_shipyard_init_01", "巨型船坞"],
	["megacorp_interstellar_assembly_init_01", "星际集会"],
	["guardians_init_fortress", "神秘堡垒"],
	["great_wound_system", "大伤口"],
	["living_planet_system", "知觉之海"],
	["hostile_init_07", "水晶球"],
	["guardians_init_technosphere", "巨大黑洞"],
	["relic_system_4", "废弃星球"],
	["hauer_system_initializer", "永不遗忘"],
	["sanctuary_system", "避难所"],
	["ai_system_01", "净化中心001"],
	["ai_system_02", "净化中心002"],
	["ai_system_03", "净化中心003"],
	["ai_system_04", "净化中心004"],
	["ratling_1_1", "鼠人星系"],
	["trappist_initializer", "特拉匹斯特"],
	["distantstars_init_00", "L星门"],
	["distantstars_init_06", "L星门"],
	["ice_system", "三极地"]
]); //特殊星系

const habitable = ["pc_gaia", "pc_ringworld_habitable", "pc_cybrex", "pc_habitat", "pc_city", "pc_relic", "pc_desert", "pc_arid", "pc_savannah", "pc_tropical", "pc_continental", "pc_ocean", "pc_tundra", "pc_arctic", "pc_alpine", "pc_nuked"];
const habitable_name = ["盖亚星球", "环形世界", "环形世界", "轨道居住站", "都市星球", "遗落星球", "沙漠星球", "干旱星球", "草原星球", "热带星球", "陆地星球", "海洋星球", "苔原星球", "极地星球", "高山星球", "死寂星球"];