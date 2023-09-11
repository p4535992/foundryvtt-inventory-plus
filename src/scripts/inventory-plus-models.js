export class Category {
  label;
  items;
  dataset = {
    type: "",
    /* only NPC and Vehicle */
    "weapon-type": "",
    "armor.type": "",
    "activation.type": "",
  };
  /* only NPC and Vehicle */
  hasActions = false;
  crewable = false;
  columns = [
    {
      label: "",
      css: "",
      property: "",
      editable: "",
    },
  ];
  css = "";
  editableName = false;
  /* non default dnd5e */
  sortFlag = 0;
  ignoreWeight = false;
  maxWeight = 0;
  ownWeight = 0;
  collapsed = false;
  explicitTypes = [];
  ignoreBulk = false;
  maxBulk = 0;
  ownBulk = 0;
  customId = "";
}

export const InventoryPlusFlags = {
  CATEGORYS: "categorys",
  CATEGORY: "category",
};

export class EncumbranceDnd5e {
  value = 0;
  max = 0;
  pct = 0;
  encumbered = false; //Vehicle not have this
}

export class EncumbranceData {
  totalWeight = 0;
  totalWeightToDisplay = 0;
  lightMax = 0;
  mediumMax = 0;
  heavyMax = 0;
  encumbranceTier = 0;
  speedDecrease = 0;
  unit = "";
  encumbrance = {};
}

export class EncumbranceBulkData extends EncumbranceData {
  inventorySlot = 0;
  minimumBulk = 0;
}

export const inventoryPlusItemTypeCollectionForCharacter = [
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

export const inventoryPlusItemTypeCollectionForNPC = [
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

export const inventoryPlusItemTypeCollectionForVehicle = [
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

export const inventoryPlusItemTypeCollectionForVehicleCargo = [
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
  id = "";
  name = "";
  img = "";
  isSelected = false;
  isInventory = false;
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
