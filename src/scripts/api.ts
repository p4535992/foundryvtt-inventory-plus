import type { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import CONSTANTS from "./constants";
import { InventoryPlus } from "./inventory-plus";
import {
	Category,
	EncumbranceData,
	EncumbranceDnd5e,
	InventoryPlusFlags,
	InventoryPlusItemType,
} from "./inventory-plus-models";
import { calcWeight, debug, is_real_number, warn } from "./lib/lib";

const API = {
	inventoryPlus: <InventoryPlus>{},

	calculateWeightFromActorId(actorIdOrName: string): EncumbranceDnd5e | undefined {
		const actorEntity = game.actors?.get(actorIdOrName) || game.actors?.getName(actorIdOrName);
		if (!actorEntity) {
			warn(`No actor found for id '${actorIdOrName}'`, true);
			return undefined;
		}
		return this.calculateWeightFromActor(actorEntity);
	},

	calculateWeightFromActor(actorEntity: Actor): EncumbranceDnd5e | undefined {
		if (!actorEntity) {
			warn(`No actor is passed`, true);
			return undefined;
		}
		// Integration with Variant Encumbrance
		if (
			game.modules.get("variant-encumbrance-dnd5e")?.active &&
			game.settings.get(CONSTANTS.MODULE_NAME, "enableIntegrationWithVariantEncumbrance")
		) {
			const encumbranceData =
				//@ts-ignore
				<EncumbranceData>game.modules.get("variant-encumbrance-dnd5e")?.api.calculateWeightOnActor(actorEntity);
			const encumbrane5e = encumbranceData.encumbrance;
			return encumbrane5e;
		}

		const inventoryItems: Item[] = [];
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

		const invPlusCategoriesWeightToAdd = new Map<string, number>();

		// START TOTAL WEIGHT
		// Get the total weight from items
		// const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
		// let totalWeight: number = actorEntity.items.reduce((weight, item) => {
		let totalWeight: number = inventoryItems.reduce((weight, item) => {
			if (!physicalItems.includes(item.type)) {
				return weight;
			}

			let itemQuantity =
				//@ts-ignore
				is_real_number(item.system.quantity) ? item.system.quantity : 0;

			let itemWeight =
				//@ts-ignore
				is_real_number(item.system.weight) ? item.system.weight : 0;

			let ignoreEquipmentCheck = false;

			// External modules calculation

			// Start Item container check
			if (
				getProperty(item, "flags.itemcollection.bagWeight") !== null &&
				getProperty(item, "flags.itemcollection.bagWeight") !== undefined
			) {
				const weightless = getProperty(item, "system.capacity.weightless") ?? false;
				if (weightless) {
					itemWeight = getProperty(item, "flags.itemcollection.bagWeight");
				} else {
					// itemWeight = calcItemWeight(item) + getProperty(item, 'data.flags.itemcollection.bagWeight');
					// MOD 4535992 Removed variant encumbrance take care of this
					const useEquippedUnequippedItemCollectionFeature = <boolean>(
						game.settings.get(CONSTANTS.MODULE_NAME, "useEquippedUnequippedItemCollectionFeature")
					);
					itemWeight = calcWeight(item, useEquippedUnequippedItemCollectionFeature, false);
					//@ts-ignore
					if (useEquippedUnequippedItemCollectionFeature) {
						ignoreEquipmentCheck = true;
					}
				}
			}
			// End Item container check
			// Start inventory+ module is active
			if (invPlusActive) {
				// Retrieve flag 'categorys' from inventory plus module
				const inventoryPlusCategories = <any[]>(
					actorEntity.getFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORYS)
				);
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
								ignoreEquipmentCheck = true;
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
									ignoreEquipmentCheck = true;
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

			if (game.settings.get(CONSTANTS.MODULE_NAME, "doNotIncreaseWeightByQuantityForNoAmmunition")) {
				//@ts-ignore
				if (item.system.consumableType !== "ammo") {
					itemQuantity = 1;
				}
			}

			let appliedWeight = itemQuantity * itemWeight;
			if (ignoreEquipmentCheck) {
				return weight + appliedWeight;
			}
			const isEquipped: boolean =
				//@ts-ignore
				item.system.equipped ? true : false;
			if (isEquipped) {
				let eqpMultiplyer = 1;
				if (game.settings.get(CONSTANTS.MODULE_NAME, "enableEquipmentMultiplier")) {
					eqpMultiplyer = <number>game.settings.get(CONSTANTS.MODULE_NAME, "equipmentMultiplier") || 1;
				}
				//@ts-ignore
				appliedWeight *= eqpMultiplyer;
			} else {
				appliedWeight *= 1; //<number>game.settings.get(CONSTANTS.MODULE_NAME, 'unequippedMultiplier');
			}
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
			const numCoins = <number>(
				Object.values(currency).reduce((val: any, denom: any) => (val += Math.max(denom, 0)), 0)
			);

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
		return ((<EncumbranceDnd5e>actorEntity.system.attributes.encumbrance) = {
			value: value,
			//@ts-ignore
			max: max,
			pct: pct,
			encumbered: encumbered,
		});
	},

	isCategoryFulled(actor: Actor, categoryType: string, itemData: Item): boolean {
		//@ts-ignore
		const inventoryPlus = actor.sheet?.inventoryPlus;
		const categoryWeight = inventoryPlus.getCategoryItemWeight(categoryType);
		//@ts-ignore
		const itemWeight = itemData.system.weight * itemData.system.quantity;
		const maxWeight = Number(
			inventoryPlus.customCategorys[categoryType].maxWeight
				? inventoryPlus.customCategorys[categoryType].maxWeight
				: 0
		);

		if (isNaN(maxWeight) || maxWeight <= 0 || maxWeight >= categoryWeight + itemWeight) {
			return false;
		} else {
			return true;
		}
	},

	isAcceptableType(categoryRef: Category, itemData: Item) {
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

	getItemsFromCategory(actor: Actor, categoryDatasetType: string, customCategorys: Record<string, any>): Item[] {
		return actor.items.filter((item) => {
			// Ripreso da getItemType
			let type = getProperty(item, `flags.${CONSTANTS.MODULE_NAME}.${InventoryPlusFlags.CATEGORY}`);
			// if (!type) {
			// 	type = getProperty(item, `flags.${CONSTANTS.MODULE_NAME}.${InventoryPlusFlags.CATEGORY}`);
			// }
			if (type === undefined || customCategorys[type] === undefined) {
				type = item.type;
			}
			return categoryDatasetType === type;
		});
	},

	async addCategory(
		actorId: string,
		categoryLabel: string,
		ignoreWeight: boolean | undefined,
		maxWeight: number | undefined,
		ownWeight: number | undefined,
		items: Item[] | undefined,
		explicitTypes: InventoryPlusItemType[] | undefined
	): Promise<void> {
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
		inventoryPlus.customCategorys[key] = newCategory;
		inventoryPlus.saveCategorys();
		if (items && items.length > 0) {
			for (const itmData of items) {
				let itemOnActor = <Item>actorEntityTmp.items.find((itemEntity: Item) => {
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
