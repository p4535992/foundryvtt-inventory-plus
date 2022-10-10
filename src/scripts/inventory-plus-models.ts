import type { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

export class Category {
	label: string;
	dataset: { type: string };
	sortFlag: number;
	ignoreWeight: boolean;
	maxWeight: number;
	ownWeight: number;
	collapsed: boolean;
	items: Item[];
	explicitTypes: InventoryPlusItemType[];
	maxBulk: number;
	ownBulk: number;
}

export enum InventoryPlusFlags {
	CATEGORYS = "categorys",
	CATEGORY = "category",
}

export class EncumbranceDnd5e {
	value: number;
	max: number;
	pct: number;
	encumbered?: boolean; //Vehicle not have this
}

export class EncumbranceData {
	totalWeight: number;
	totalWeightToDisplay: number;
	lightMax: number;
	mediumMax: number;
	heavyMax: number;
	encumbranceTier: number;
	speedDecrease: number;
	unit: string;
	encumbrance: EncumbranceDnd5e;
}

export class EncumbranceBulkData extends EncumbranceData {
	inventorySlot: number;
	minimumBulk: number;
}

export const inventoryPlusItemTypeCollection = <InventoryPlusItemType[]>[
	{
		id: "",
		name: "None",
		namePl: "None",
		img: "",
		isSelected: true,
		isInventory: true,
	},
	{
		id: "weapon",
		name: "DND5E.ItemTypeWeapon",
		namePl: "DND5E.ItemTypeWeaponPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "equipment",
		name: "DND5E.ItemTypeEquipment",
		namePl: "DND5E.ItemTypeEquipmentPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "consumable",
		name: "DND5E.ItemTypeConsumable",
		namePl: "DND5E.ItemTypeConsumablePl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "tool",
		name: "DND5E.ItemTypeTool",
		namePl: "DND5E.ItemTypeToolPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "loot",
		name: "DND5E.ItemTypeLoot",
		namePl: "DND5E.ItemTypeLootPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "background",
		name: "DND5E.ItemTypeBackground",
		namePl: "DND5E.ItemTypeBackgroundPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "class",
		name: "DND5E.ItemTypeClass",
		namePl: "DND5E.ItemTypeClassPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "subclass",
		name: "DND5E.ItemTypeSubclass",
		namePl: "DND5E.ItemTypeSubclassPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "spell",
		name: "DND5E.ItemTypeSpell",
		namePl: "DND5E.ItemTypeSpellPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "feat",
		name: "DND5E.ItemTypeFeat",
		namePl: "DND5E.ItemTypeFeatPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "backpack",
		name: "DND5E.ItemTypeContainer",
		namePl: "DND5E.ItemTypeContainerPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	// {id:'set', name:'Armor set', namePl:'Armor set', img:'', isSelected: false},
];

export class InventoryPlusItemType {
	id: string;
	name: string;
	namePl: string;
	img: string;
	isSelected: boolean;
	isInventory: boolean;
}
