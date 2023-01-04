import { Category, equipmentColumns, inventoryPlusItemTypeCollection } from "../inventory-plus-models";
import { debug, i18n, isStringEquals } from "./lib";

// const inventory = {
//     weapon: { label: "ITEM.TypeWeaponPl", items: [], dataset: {type: "weapon"} },
//     equipment: { label: "ITEM.TypeEquipmentPl", items: [], dataset: {type: "equipment"} },
//     consumable: { label: "ITEM.TypeConsumablePl", items: [], dataset: {type: "consumable"} },
//     tool: { label: "ITEM.TypeToolPl", items: [], dataset: {type: "tool"} },
//     backpack: { label: "ITEM.TypeContainerPl", items: [], dataset: {type: "backpack"} },
//     loot: { label: "ITEM.TypeLootPl", items: [], dataset: {type: "loot"} }
// };

export function initCategoriesForCharacter(flagCategorys) {
	const flagDisableDefaultCategories = false;
	if (flagCategorys === undefined && !flagDisableDefaultCategories) {
		debug(`flagCategory=false && flagDisableDefaultCategories=false`);
		flagCategorys = {
			weapon: <Category>{
				label: "DND5E.ItemTypeWeaponPl",
				items: [],
				dataset: { type: "weapon" },
				sortFlag: 1000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			equipment: <Category>{
				label: "DND5E.ItemTypeEquipmentPl",
				items: [],
				dataset: { type: "equipment" },
				sortFlag: 2000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			consumable: <Category>{
				label: "DND5E.ItemTypeConsumablePl",
				items: [],
				dataset: { type: "consumable" },
				sortFlag: 3000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			tool: <Category>{
				label: "DND5E.ItemTypeToolPl",
				items: [],
				dataset: { type: "tool" },
				sortFlag: 4000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			backpack: <Category>{
				label: "DND5E.ItemTypeContainerPl",
				items: [],
				dataset: { type: "backpack" },
				sortFlag: 5000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			loot: <Category>{
				label: "DND5E.ItemTypeLootPl",
				items: [],
				dataset: { type: "loot" },
				sortFlag: 6000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
		};
	} else if (flagCategorys && !flagDisableDefaultCategories) {
		debug(`flagCategory=true && flagDisableDefaultCategories=false`);
		const categoryWeapon = flagCategorys["weapon"];
		if (!categoryWeapon) {
			flagCategorys["weapon"] = <Category>{
				label: "DND5E.ItemTypeWeaponPl",
				items: [],
				dataset: { type: "weapon" },
				sortFlag: 1000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryEquipment = flagCategorys["equipment"];
		if (!categoryEquipment) {
			flagCategorys["equipment"] = <Category>{
				label: "DND5E.ItemTypeEquipmentPl",
				items: [],
				dataset: { type: "equipment" },
				sortFlag: 2000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryConsumable = flagCategorys["consumable"];
		if (!categoryConsumable) {
			flagCategorys["consumable"] = <Category>{
				label: "DND5E.ItemTypeConsumablePl",
				items: [],
				dataset: { type: "consumable" },
				sortFlag: 3000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryTool = flagCategorys["tool"];
		if (!categoryTool) {
			flagCategorys["tool"] = <Category>{
				label: "DND5E.ItemTypeToolPl",
				items: [],
				dataset: { type: "tool" },
				sortFlag: 4000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryBackpack = flagCategorys["backpack"];
		if (!categoryBackpack) {
			flagCategorys["backpack"] = <Category>{
				label: "DND5E.ItemTypeContainerPl",
				items: [],
				dataset: { type: "backpack" },
				sortFlag: 5000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryLoot = flagCategorys["loot"];
		if (!categoryLoot) {
			flagCategorys["loot"] = <Category>{
				label: "DND5E.ItemTypeLootPl",
				items: [],
				dataset: { type: "loot" },
				sortFlag: 6000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
	} else if (flagCategorys && flagDisableDefaultCategories) {
		debug(`flagCategory=true && flagDisableDefaultCategories=true`);
		for (const key in flagCategorys) {
			const category = <Category>flagCategorys[key];
			if (category && !category?.label) {
				continue;
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.ItemTypeWeaponPl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.ItemTypeEquipmentPl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.ItemTypeConsumablePl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.ItemTypeToolPl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.ItemTypeContainerPl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.ItemTypeLootPl"))) {
				delete flagCategorys[key];
			}
		}
	} else {
		debug(`flagCategory=false && flagDisableDefaultCategories=true`);
		if (!flagCategorys) {
			flagCategorys = {};
		}
	}
	return flagCategorys;
}

// const features = {
//     weapons: { label: game.i18n.localize("DND5E.AttackPl"), items: [], hasActions: true,
//       dataset: {type: "weapon", "weapon-type": "natural"} },
//     actions: { label: game.i18n.localize("DND5E.ActionPl"), items: [], hasActions: true,
//       dataset: {type: "feat", "activation.type": "action"} },
//     passive: { label: game.i18n.localize("DND5E.Features"), items: [], dataset: {type: "feat"} },
//     equipment: { label: game.i18n.localize("DND5E.Inventory"), items: [], dataset: {type: "loot"}}
// };

export function initCategoriesForNPC(flagCategorys) {
	const flagDisableDefaultCategories = false;
	if (flagCategorys === undefined && !flagDisableDefaultCategories) {
		debug(`flagCategory=false && flagDisableDefaultCategories=false`);
		flagCategorys = {
			weapons: <Category>{
				label: game.i18n.localize("DND5E.AttackPl"),
				items: [],
				hasActions: true,
				dataset: { type: "weapon", "weapon-type": "natural" },
				sortFlag: 1000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			actions: <Category>{
				label: game.i18n.localize("DND5E.ActionPl"),
				items: [],
				hasActions: true,
				dataset: { type: "feat", "activation.type": "action" },
				sortFlag: 2000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			passive: <Category>{
				label: game.i18n.localize("DND5E.Features"),
				items: [],
				dataset: { type: "feat" },
				sortFlag: 3000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			equipment: <Category>{
				label: game.i18n.localize("DND5E.Inventory"),
				items: [],
				dataset: { type: "loot" },
				sortFlag: 4000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
		};
	} else if (flagCategorys && !flagDisableDefaultCategories) {
		debug(`flagCategory=true && flagDisableDefaultCategories=false`);
		const categoryWeapons = flagCategorys["weapons"];
		if (!categoryWeapons) {
			flagCategorys["weapons"] = <Category>{
				label: game.i18n.localize("DND5E.AttackPl"),
				items: [],
				hasActions: true,
				dataset: { type: "weapon", "weapon-type": "natural" },
				sortFlag: 1000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryActions = flagCategorys["actions"];
		if (!categoryActions) {
			flagCategorys["actions"] = <Category>{
				label: game.i18n.localize("DND5E.ActionPl"),
				items: [],
				hasActions: true,
				dataset: { type: "feat", "activation.type": "action" },
				sortFlag: 2000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryPassive = flagCategorys["passive"];
		if (!categoryPassive) {
			flagCategorys["passive"] = <Category>{
				label: game.i18n.localize("DND5E.Features"),
				items: [],
				dataset: { type: "feat" },
				sortFlag: 3000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryEquipment = flagCategorys["equipment"];
		if (!categoryEquipment) {
			flagCategorys["equipment"] = <Category>{
				label: game.i18n.localize("DND5E.Inventory"),
				items: [],
				dataset: { type: "loot" },
				sortFlag: 4000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
	} else if (flagCategorys && flagDisableDefaultCategories) {
		debug(`flagCategory=true && flagDisableDefaultCategories=true`);
		for (const key in flagCategorys) {
			const category = <Category>flagCategorys[key];
			if (category && !category?.label) {
				continue;
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.AttackPl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.ActionPl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.Features"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.Inventory"))) {
				delete flagCategorys[key];
			}
		}
	} else {
		debug(`flagCategory=false && flagDisableDefaultCategories=true`);
		if (!flagCategorys) {
			flagCategorys = {};
		}
	}
	return flagCategorys;
}

// const features = {
//     actions: {
//       label: game.i18n.localize("DND5E.ActionPl"),
//       items: [],
//       hasActions: true,
//       crewable: true,
//       dataset: {type: "feat", "activation.type": "crew"},
//       columns: [{
//         label: game.i18n.localize("DND5E.Cover"),
//         css: "item-cover",
//         property: "cover"
//       }]
//     },
//     equipment: {
//       label: game.i18n.localize("ITEM.TypeEquipment"),
//       items: [],
//       crewable: true,
//       dataset: {type: "equipment", "armor.type": "vehicle"},
//       columns: equipmentColumns
//     },
//     passive: {
//       label: game.i18n.localize("DND5E.Features"),
//       items: [],
//       dataset: {type: "feat"}
//     },
//     reactions: {
//       label: game.i18n.localize("DND5E.ReactionPl"),
//       items: [],
//       dataset: {type: "feat", "activation.type": "reaction"}
//     },
//     weapons: {
//       label: game.i18n.localize("ITEM.TypeWeaponPl"),
//       items: [],
//       crewable: true,
//       dataset: {type: "weapon", "weapon-type": "siege"},
//       columns: equipmentColumns
//     }
// };

export function initCategoriesForVehicle(flagCategorys) {
	const flagDisableDefaultCategories = false;
	if (flagCategorys === undefined && !flagDisableDefaultCategories) {
		debug(`flagCategory=false && flagDisableDefaultCategories=false`);
		flagCategorys = {
			actions: <Category>{
				label: game.i18n.localize("DND5E.ActionPl"),
				items: [],
				hasActions: true,
				crewable: true,
				dataset: { type: "feat", "activation.type": "crew" },
				columns: [
					{
						label: game.i18n.localize("DND5E.Cover"),
						css: "item-cover",
						property: "cover",
					},
				],
				sortFlag: 1000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			equipment: <Category>{
				label: game.i18n.localize("ITEM.TypeEquipment"),
				items: [],
				crewable: true,
				dataset: { type: "equipment", "armor.type": "vehicle" },
				columns: <any>equipmentColumns,
				sortFlag: 2000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			passive: <Category>{
				label: game.i18n.localize("DND5E.Features"),
				items: [],
				dataset: { type: "feat" },
				sortFlag: 3000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			reactions: <Category>{
				label: game.i18n.localize("DND5E.ReactionPl"),
				items: [],
				dataset: { type: "feat", "activation.type": "reaction" },
				sortFlag: 4000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
			weapons: <Category>{
				label: game.i18n.localize("ITEM.TypeWeaponPl"),
				crewable: true,
				dataset: { type: "weapon", "weapon-type": "siege" },
				columns: <any>equipmentColumns,
				sortFlag: 5000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				items: [],
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			},
		};
	} else if (flagCategorys && !flagDisableDefaultCategories) {
		debug(`flagCategory=true && flagDisableDefaultCategories=false`);
		const categoryActions = flagCategorys["actions"];
		if (!categoryActions) {
			flagCategorys["actions"] = <Category>{
				label: game.i18n.localize("DND5E.ActionPl"),
				items: [],
				hasActions: true,
				crewable: true,
				dataset: { type: "feat", "activation.type": "crew" },
				columns: [
					{
						label: game.i18n.localize("DND5E.Cover"),
						css: "item-cover",
						property: "cover",
					},
				],
				sortFlag: 1000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryEquipment = flagCategorys["equipment"];
		if (!categoryEquipment) {
			flagCategorys["equipment"] = <Category>{
				label: game.i18n.localize("ITEM.TypeEquipment"),
				items: [],
				crewable: true,
				dataset: { type: "equipment", "armor.type": "vehicle" },
				columns: <any>equipmentColumns,
				sortFlag: 2000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryPassive = flagCategorys["passive"];
		if (!categoryPassive) {
			flagCategorys["passive"] = <Category>{
				label: game.i18n.localize("DND5E.Features"),
				items: [],
				dataset: { type: "feat" },
				sortFlag: 3000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryReactions = flagCategorys["reactions"];
		if (!categoryReactions) {
			flagCategorys["reactions"] = <Category>{
				label: game.i18n.localize("DND5E.ReactionPl"),
				items: [],
				dataset: { type: "feat", "activation.type": "reaction" },
				sortFlag: 4000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
		const categoryWeapons = flagCategorys["weapons"];
		if (!categoryWeapons) {
			flagCategorys["weapons"] = <Category>{
				label: game.i18n.localize("ITEM.TypeWeaponPl"),
				crewable: true,
				dataset: { type: "weapon", "weapon-type": "siege" },
				columns: <any>equipmentColumns,
				sortFlag: 5000,
				ignoreWeight: false,
				maxWeight: 0,
				ownWeight: 0,
				collapsed: false,
				items: [],
				explicitTypes: inventoryPlusItemTypeCollection.filter((t) => {
					return t.isInventory;
				}),
				ignoreBulk: false,
				maxBulk: 0,
				ownBulk: 0,
			};
		}
	} else if (flagCategorys && flagDisableDefaultCategories) {
		debug(`flagCategory=true && flagDisableDefaultCategories=true`);
		for (const key in flagCategorys) {
			const category = <Category>flagCategorys[key];
			if (category && !category?.label) {
				continue;
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.AttackPl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.ActionPl"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.Features"))) {
				delete flagCategorys[key];
			}
			if (isStringEquals(i18n(category?.label), i18n("DND5E.Inventory"))) {
				delete flagCategorys[key];
			}
		}
	} else {
		debug(`flagCategory=false && flagDisableDefaultCategories=true`);
		if (!flagCategorys) {
			flagCategorys = {};
		}
	}
	return flagCategorys;
}
