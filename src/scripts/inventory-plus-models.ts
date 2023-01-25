export class Category {
	label: string;
	items: Item[];
	dataset: {
		type: string;
		/* only NPC and Vehicle */
		"weapon-type"?: string;
		"armor.type"?: string;
		"activation.type"?: string;
	};
	/* only NPC and Vehicle */
	hasActions?: boolean;
	crewable?: boolean;
	columns?: [
		{
			label: string;
			css: string;
			property: string;
			editable?: string;
		}
	];
	css?: string;
	editableName?: boolean;
	/* non default dnd5e */
	sortFlag: number;
	ignoreWeight: boolean;
	maxWeight: number;
	ownWeight: number;
	collapsed: boolean;
	explicitTypes: InventoryPlusItemType[];
	ignoreBulk: boolean;
	maxBulk: number;
	ownBulk: number;
	customId: string;
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

export const inventoryPlusItemTypeCollectionForCharacter = <InventoryPlusItemType[]>[
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
		name: "ITEM.TypeWeapon",
		// namePl: "ITEM.TypeWeaponPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "equipment",
		name: "ITEM.TypeEquipment",
		// namePl: "ITEM.TypeEquipmentPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "consumable",
		name: "ITEM.TypeConsumable",
		// namePl: "ITEM.TypeConsumablePl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "tool",
		name: "ITEM.TypeTool",
		// namePl: "ITEM.TypeToolPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "loot",
		name: "ITEM.TypeLoot",
		// namePl: "ITEM.TypeLootPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "background",
		name: "ITEM.TypeBackground",
		// namePl: "ITEM.TypeBackgroundPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "class",
		name: "ITEM.TypeClass",
		// namePl: "ITEM.TypeClassPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "subclass",
		name: "ITEM.TypeSubclass",
		// namePl: "ITEM.TypeSubclassPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "spell",
		name: "ITEM.TypeSpell",
		// namePl: "ITEM.TypeSpellPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "feat",
		name: "ITEM.TypeFeat",
		// namePl: "ITEM.TypeFeatPl",
		img: "",
		isSelected: false,
		isInventory: false,
	},
	{
		id: "backpack",
		name: "ITEM.TypeContainer",
		// namePl: "ITEM.TypeContainerPl,
		img: "",
		isSelected: false,
		isInventory: true,
	},
	// {id:'set', name:'Armor set', namePl:'Armor set', img:'', isSelected: false},
];

export const inventoryPlusItemTypeCollectionForNPC = <InventoryPlusItemType[]>[
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
		name: "DND5E.AttackPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "feat",
		name: "DND5E.ActionPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "feat",
		name: "DND5E.Features",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "loot",
		name: "DND5E.Inventory",
		img: "",
		isSelected: false,
		isInventory: true,
	},
];

export const inventoryPlusItemTypeCollectionForVehicle = <InventoryPlusItemType[]>[
	{
		id: "",
		name: "None",
		namePl: "None",
		img: "",
		isSelected: true,
		isInventory: true,
	},
	{
		id: "feat",
		name: "DND5E.ActionPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "equipment",
		name: "ITEM.TypeEquipment",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "feat",
		name: "DND5E.Features",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "feat",
		name: "DND5E.ReactionPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "weapon",
		name: "ITEM.TypeWeaponPl",
		img: "",
		isSelected: false,
		isInventory: true,
	},
];

export const inventoryPlusItemTypeCollectionForVehicleCargo = <InventoryPlusItemType[]>[
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
		name: "ITEM.TypeWeapon",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "equipment",
		name: "ITEM.TypeEquipment",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "consumable",
		name: "ITEM.TypeConsumable",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "tool",
		name: "ITEM.TypeTool",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "loot",
		name: "ITEM.TypeLoot",
		img: "",
		isSelected: false,
		isInventory: true,
	},
	{
		id: "backpack",
		name: "ITEM.TypeContainer",
		img: "",
		isSelected: false,
		isInventory: true,
	},
];

export class InventoryPlusItemType {
	id: string;
	name: string;
	img: string;
	isSelected: boolean;
	isInventory: boolean;
}

export const itemTypesDnd5e = [
	"weapon",
	"equipment",
	"consumable",
	"tool",
	"loot",
	"background",
	"class",
	"subclass",
	"spell",
	"feat",
	"backpack",
];
