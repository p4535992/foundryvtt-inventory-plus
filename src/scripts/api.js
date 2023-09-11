import CONSTANTS from "./constants.js";
import { InventoryPlus } from "./inventory-plus.js";
import {
  Category,
  EncumbranceData,
  EncumbranceDnd5e,
  InventoryPlusFlags,
  InventoryPlusItemType,
} from "./inventory-plus-models.js";
import {
  calcWeight,
  calcWeightItemCollection,
  debug,
  is_real_number,
  retrieveSectionIdFromItemType,
  warn,
} from "./lib/lib.js";

const API = {
  inventoryPlus: {},

  calculateWeightFromActorId(actorIdOrName) {
    const actorEntity = game.actors?.get(actorIdOrName) || game.actors?.getName(actorIdOrName);
    if (!actorEntity) {
      warn(`No actor found for id '${actorIdOrName}'`, true);
      return undefined;
    }
    return this.calculateWeightFromActor(actorEntity);
  },

  calculateWeightFromActor(actorEntity) {
    if (!actorEntity) {
      warn(`No actor is passed`, true);
      return undefined;
    }
    // Integration with Variant Encumbrance
    if (
      game.modules.get("variant-encumbrance-dnd5e")?.active &&
      game.settings.get(CONSTANTS.MODULE_NAME, "enableIntegrationWithVariantEncumbrance")
    ) {
      const encumbranceData = game.modules.get("variant-encumbrance-dnd5e")?.api.calculateWeightOnActor(actorEntity);
      const encumbrane5e = encumbranceData.encumbrance;
      return encumbrane5e;
    }

    const inventoryItems = [];
    // const isAlreadyInActor = <Item>actorEntity.items?.find((itemTmp: Item) => itemTmp.id === currentItemId);
    const physicalItems = ["weapon", "equipment", "consumable", "tool", "backpack", "loot"];
    for (const im of actorEntity.items.contents) {
      if (im && physicalItems.includes(im.type)) {
        inventoryItems.push(im);
      }
    }

    const invPlusActive = true;

    // =====================================================
    // THIS CODE IS FROM THE MODULE 'Variant Encumbrance'
    // =====================================================

    const invPlusCategoriesWeightToAdd = new Map();

    // START TOTAL WEIGHT
    // Get the total weight from items
    // const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
    // let totalWeight = actorEntity.items.reduce((weight, item) => {
    let totalWeight = inventoryItems.reduce((weight, item) => {
      if (!physicalItems.includes(item.type)) {
        return weight;
      }

      let itemQuantity = getItemQuantity(item);
      let itemWeight = getItemWeight(item);

      let backpackManager = retrieveBackPackManagerItem(item);
      if (backpackManager) {
        // Does the weight of the items in the container carry over to the actor?
        const weightless = getProperty(item, "system.capacity.weightless") ?? false;
        // const backpackManagerWeight =
        // 	API.calculateWeightOnActor(backpackManager)?.totalWeight ?? itemWeight;
        const backpackManagerWeight = calculateBackPackManagerWeight(item, backpackManager, ignoreCurrency);
        itemWeight = weightless ? itemWeight : itemWeight + backpackManagerWeight;

        debug(
          `Is BackpackManager! Actor '${actorEntity.name}', Item '${item.name}' : Quantity = ${itemQuantity}, Weight = ${itemWeight}`
        );
        mapItemEncumbrance[item.id] = itemQuantity * itemWeight;
        return weight + itemQuantity * itemWeight;
      }

      const isEquipped =
        //@ts-ignore
        item.system.equipped ? true : false;
      const isProficient =
        //@ts-ignore
        item.system.proficient ? item.system.proficient : false;

      debug(`Actor '${actorEntity.name}', Item '${item.name}' : Quantity = ${itemQuantity}, Weight = ${itemWeight}`);

      // let ignoreEquipmentCheck = false;

      // External modules calculation
      let ignoreQuantityCheckForItemCollection = false;
      // Start Item container check
      if (hasProperty(item, `flags.itemcollection`) && itemContainerActive) {
        itemWeight = calcWeightItemCollection(
          item,
          useEquippedUnequippedItemCollectionFeature,
          doNotApplyWeightForEquippedArmor,
          ignoreCurrency,
          doNotIncreaseWeightByQuantityForNoAmmunition
        );
        ignoreQuantityCheckForItemCollection = true;
      }
      // End Item container check
      else {
        // Does the weight of the items in the container carry over to the actor?
        // TODO  wait for 2.2.0
        const weightless = getProperty(item, "system.capacity.weightless") ?? false;

        const itemArmorTypes = ["clothing", "light", "medium", "heavy", "natural"];
        if (
          isEquipped &&
          doNotApplyWeightForEquippedArmor &&
          //@ts-ignore
          itemArmorTypes.includes(item.system.armor?.type)
        ) {
          const applyWeightMultiplierForEquippedArmorClothing =
            game.settings.get(CONSTANTS.MODULE_NAME, "applyWeightMultiplierForEquippedArmorClothing") || 0;
          const applyWeightMultiplierForEquippedArmorLight =
            game.settings.get(CONSTANTS.MODULE_NAME, "applyWeightMultiplierForEquippedArmorLight") || 0;
          const applyWeightMultiplierForEquippedArmorMedium =
            game.settings.get(CONSTANTS.MODULE_NAME, "applyWeightMultiplierForEquippedArmorMedium") || 0;
          const applyWeightMultiplierForEquippedArmorHeavy =
            game.settings.get(CONSTANTS.MODULE_NAME, "applyWeightMultiplierForEquippedArmorHeavy") || 0;
          const applyWeightMultiplierForEquippedArmorNatural =
            game.settings.get(CONSTANTS.MODULE_NAME, "applyWeightMultiplierForEquippedArmorNatural") || 0;
          //@ts-ignore
          if (item.system.armor?.type === "clothing") {
            itemWeight *= applyWeightMultiplierForEquippedArmorClothing;
          }
          //@ts-ignore
          else if (item.system.armor?.type === "light") {
            itemWeight *= applyWeightMultiplierForEquippedArmorLight;
          }
          //@ts-ignore
          else if (item.system.armor?.type === "medium") {
            itemWeight *= applyWeightMultiplierForEquippedArmorMedium;
          }
          //@ts-ignore
          else if (item.system.armor?.type === "heavy") {
            itemWeight *= applyWeightMultiplierForEquippedArmorHeavy;
          }
          //@ts-ignore
          else if (item.system.armor?.type === "natural") {
            itemWeight *= applyWeightMultiplierForEquippedArmorNatural;
          }
          //@ts-ignore
          else {
            itemWeight *= 0;
          }
        } else if (isEquipped) {
          if (isProficient) {
            itemWeight *= game.settings.get(CONSTANTS.MODULE_NAME, "profEquippedMultiplier");
          } else {
            const applyWeightMultiplierForEquippedContainer =
              item.type === "backpack"
                ? game.settings.get(CONSTANTS.MODULE_NAME, "applyWeightMultiplierForEquippedContainer") || -1
                : -1;
            if (applyWeightMultiplierForEquippedContainer > -1) {
              itemWeight *= applyWeightMultiplierForEquippedContainer;
            } else {
              itemWeight *= game.settings.get(CONSTANTS.MODULE_NAME, "equippedMultiplier");
            }
          }
        } else {
          itemWeight *= game.settings.get(CONSTANTS.MODULE_NAME, "unequippedMultiplier");
        }

        // Feature: Do Not increase weight by quantity for no ammunition item
        if (doNotIncreaseWeightByQuantityForNoAmmunition) {
          //@ts-ignore
          if (item.system?.consumableType !== "ammo") {
            itemQuantity = 1;
          }
        }
      }
      // Start inventory+ module is active
      if (invPlusActiveTmp) {
        // Retrieve flag 'categorys' from inventory plus module
        const inventoryPlusCategories = actorEntity.getFlag(CONSTANTS.MODULE_NAME, "categorys");
        if (inventoryPlusCategories) {
          // "weapon", "equipment", "consumable", "tool", "backpack", "loot"
          let actorHasCustomCategories = false;
          for (const categoryId in inventoryPlusCategories) {
            const section = inventoryPlusCategories[categoryId];
            if (
              // This is a error from the inventory plus developer flags stay on 'item' not on the 'item'
              //@ts-ignore
              item.flags &&
              //@ts-ignore
              item.flags[CONSTANTS.MODULE_NAME]?.category === categoryId
            ) {
              // Ignore weight
              if (section?.ignoreWeight === true) {
                itemWeight = 0;
                // ignoreEquipmentCheck = true;
              }
              // EXIT FOR
              actorHasCustomCategories = true;
            }

            // Inherent weight
            if (Number(section?.ownWeight) > 0) {
              if (!invPlusCategoriesWeightToAdd.has(categoryId)) {
                invPlusCategoriesWeightToAdd.set(categoryId, Number(section.ownWeight));
              }
            }
            if (actorHasCustomCategories) {
              break;
            }
          }
          if (!actorHasCustomCategories) {
            for (const categoryId in inventoryPlusCategories) {
              if (item.type === categoryId) {
                const section = inventoryPlusCategories[categoryId];
                // Ignore weight
                if (section?.ignoreWeight === true) {
                  itemWeight = 0;
                  // ignoreEquipmentCheck = true;
                }
                // Inherent weight
                if (Number(section?.ownWeight) > 0) {
                  if (!invPlusCategoriesWeightToAdd.has(categoryId)) {
                    invPlusCategoriesWeightToAdd.set(categoryId, Number(section.ownWeight));
                  }
                }
                // EXIT FOR
                break;
              }
            }
          }
        }
      }
      // End Inventory+ module is active

      // End External modules calculation

      let appliedWeight = 0;
      if (ignoreQuantityCheckForItemCollection) {
        appliedWeight = itemWeight;
      } else {
        appliedWeight = itemQuantity * itemWeight;
      }

      debug(
        `Actor '${actorEntity.name}', Item '${item.name}', Equipped '${isEquipped}', Proficient ${isProficient} :
                 ${itemQuantity} * ${itemWeight} = ${appliedWeight} on total ${weight} => ${weight + appliedWeight}`
      );
      mapItemEncumbrance[item.id] = appliedWeight;
      return weight + appliedWeight;
    }, 0);

    // Start inventory+ module is active 2
    if (invPlusActive) {
      for (const [key, value] of invPlusCategoriesWeightToAdd) {
        totalWeight = totalWeight + value;
      }
    }
    // End inventory+ module is active 2
    // END TOTAL WEIGHT

    // [Optional] add Currency Weight (for non-transformed actors)
    //@ts-ignore
    if (game.settings.get("dnd5e", "currencyWeight") && actorEntity.system.currency) {
      //@ts-ignore
      const currency = actorEntity.system.currency;
      const numCoins = Object.values(currency).reduce((val, denom) => (val += Math.max(denom, 0)), 0);

      let currencyPerWeight = 0;
      if (game.settings.get("dnd5e", "metricWeightUnits")) {
        //@ts-ignore
        currencyPerWeight = CONFIG.DND5E.encumbrance.currencyPerWeight.metric;
      } else {
        //@ts-ignore
        currencyPerWeight = CONFIG.DND5E.encumbrance.currencyPerWeight.imperial;
      }

      totalWeight += numCoins / currencyPerWeight;
    }

    // Compute Encumbrance percentage
    //@ts-ignore
    const max = actorEntity.system.attributes.encumbrance.max;
    const pct = Math.clamped((totalWeight * 100) / max, 0, 100);
    const value = totalWeight && is_real_number(totalWeight) ? totalWeight.toNearest(0.1) : 0;
    const encumbered = pct > 200 / 3;

    //@ts-ignore
    return (actorEntity.system.attributes.encumbrance = {
      value: value,
      //@ts-ignore
      max: max,
      pct: pct,
      encumbered: encumbered,
    });
  },

  isCategoryFulled(actor, categoryType, itemData) {
    //@ts-ignore
    const inventoryPlus = actor.sheet?.inventoryPlus;
    const currentCategory = inventoryPlus.customCategorys[categoryType];
    if (currentCategory.maxWeight > 0) {
      return this.isCategoryFulledByWeight(actor, categoryType, itemData);
    } else if (currentCategory.maxBulk > 0) {
      return this.isCategoryFulledByBulk(actor, categoryType, itemData);
    } else {
      return false;
    }
  },

  isCategoryFulledByWeight(actor, categoryType, itemData) {
    //@ts-ignore
    const inventoryPlus = actor.sheet?.inventoryPlus;
    const categoryWeight = inventoryPlus.getCategoryItemWeight(categoryType);
    //@ts-ignore
    const itemWeight = itemData.system.weight * itemData.system.quantity;
    const maxWeight = Number(
      inventoryPlus.customCategorys[categoryType].maxWeight ? inventoryPlus.customCategorys[categoryType].maxWeight : 0
    );

    if (isNaN(maxWeight) || maxWeight <= 0 || maxWeight >= categoryWeight + itemWeight) {
      return false;
    } else {
      return true;
    }
  },

  isCategoryFulledByBulk(actor, categoryType, itemData) {
    //@ts-ignore
    const inventoryPlus = actor.sheet?.inventoryPlus;
    const categoryBulk = inventoryPlus.getCategoryItemBulk(categoryType);
    //@ts-ignore
    const itemBulk = itemData.system.bulk * itemData.system.quantity;
    const maxBulk = Number(
      inventoryPlus.customCategorys[categoryType].maxBulk ? inventoryPlus.customCategorys[categoryType].maxBulk : 0
    );

    if (isNaN(maxBulk) || maxBulk <= 0 || maxBulk >= categoryBulk + itemBulk) {
      return false;
    } else {
      return true;
    }
  },

  isAcceptableType(categoryRef, itemData) {
    if (categoryRef.explicitTypes && categoryRef.explicitTypes.length > 0) {
      const acceptableTypes = categoryRef.explicitTypes.filter((i) => {
        return i.isSelected;
      });
      if (acceptableTypes && acceptableTypes.length === 0) {
        return true;
      }
      if (acceptableTypes && acceptableTypes.length === 1 && acceptableTypes[0]?.id === "") {
        return true;
      }
      let isOk = false;
      for (const acc of acceptableTypes) {
        if (acc.id === itemData.type) {
          isOk = true;
          break;
        }
      }
      return isOk;
    } else {
      return true;
    }
  },

  getItemsFromCategory(actor, categoryDatasetType, customCategorys) {
    return actor.items.filter((item) => {
      // Ripreso da getItemType
      let sectionCategoryId = getProperty(item, `flags.${CONSTANTS.MODULE_NAME}.${InventoryPlusFlags.CATEGORY}`);
      // if (!sectionCategoryId) {
      // 	sectionCategoryId = getProperty(item, `flags.${CONSTANTS.MODULE_NAME}.${InventoryPlusFlags.CATEGORY}`);
      // }
      if (sectionCategoryId === undefined || customCategorys[sectionCategoryId] === undefined) {
        sectionCategoryId = categoryDatasetType;
      }
      if (sectionCategoryId === undefined || customCategorys[sectionCategoryId] === undefined) {
        sectionCategoryId = item.type;
      }
      // return categoryDatasetType === type;
      let sectionId = retrieveSectionIdFromItemType(
        actor.type,
        customCategorys,
        item.type,
        undefined,
        sectionCategoryId
      );
      return categoryDatasetType === sectionId;
    });
  },

  async addCategory(
    actorId,
    categoryLabel,
    ignoreWeight,
    maxWeight,
    ownWeight,
    items,
    explicitTypes,
    ignoreBulkd,
    maxBulkd,
    ownBulk
  ) {
    if (!actorId) {
      warn(`No actor id is been passed`);
      return;
    }
    const actorEntityTmp = game.actors?.get(actorId);
    if (!actorEntityTmp) {
      warn(`No actor found with id '${actorId}'`);
      return;
    }
    if (!categoryLabel) {
      warn(`No category label is been passed`);
      return;
    }
    const inventoryPlus = new InventoryPlus();
    inventoryPlus.init(actorEntityTmp);

    const key = inventoryPlus.generateCategoryId();
    const newCategory = new Category();
    newCategory.label = categoryLabel;
    newCategory.dataset = { type: key };
    newCategory.ignoreWeight = ignoreWeight ?? false;
    newCategory.maxWeight = maxWeight ?? 0;
    newCategory.ownWeight = ownWeight ?? 0;
    newCategory.collapsed = false;
    newCategory.sortFlag = inventoryPlus.getHighestSortFlag() + 1000;
    if (explicitTypes) {
      newCategory.explicitTypes = explicitTypes;
    }
    newCategory.ignoreBulk = ignoreBulk ?? false;
    newCategory.maxBulk = maxBulk ?? 0;
    newCategory.ownBulk = ownBulk ?? 0;
    inventoryPlus.customCategorys[key] = newCategory;
    inventoryPlus.saveCategorys();
    if (items && items.length > 0) {
      for (const itmData of items) {
        let itemOnActor = actorEntityTmp.items.find((itemEntity) => {
          return itemEntity.id === itmData.id;
        });
        if (!itemOnActor) {
          //@ts-ignore
          itemOnActor = await actorEntityTmp?.createEmbeddedDocuments("Item", [itmData]);
        }
        await itemOnActor.setFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORY, key);
      }
      //newCategory.items = items;
    }
  },
};

export default API;
