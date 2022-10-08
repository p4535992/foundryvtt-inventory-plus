import type { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import { getApi, setApi } from "../main";
import API from "./api";
import CONSTANTS from "./constants";
import { InventoryPlus } from "./inventory-plus";
import { Category, EncumbranceDnd5e, InventoryPlusFlags } from "./inventory-plus-models";
import {
	getCSSName,
	i18n,
	warn,
	i18nFormat,
	retrieveItemFromData,
	checkCompatible,
	showCurrencyTransferDialog,
	isAlt,
	showItemTransferDialog,
	error,
	delayedSort,
	sortedActors,
	getItemSorts,
	_isFromSameActor,
} from "./lib/lib";

export const initHooks = async (): Promise<void> => {
	// registerSettings();
	// registerLibwrappers();
	// Hooks.once('socketlib.ready', registerSocket);
	// if (game.settings.get(CONSTANTS.MODULE_NAME, 'debugHooks')) {
	//   for (const hook of Object.values(HOOKS)) {
	//     if (typeof hook === 'string') {
	//       Hooks.on(hook, (...args) => debug(`Hook called: ${hook}`, ...args));
	//       debug(`Registered hook: ${hook}`);
	//     } else {
	//       for (const innerHook of Object.values(hook)) {
	//         Hooks.on(<string>innerHook, (...args) => debug(`Hook called: ${innerHook}`, ...args));
	//         debug(`Registered hook: ${innerHook}`);
	//       }
	//     }
	//   }
	// }
};

export const setupHooks = async (): Promise<void> => {
	setApi(API);
};

export const readyHooks = async (): Promise<void> => {
	// checkSystem();
	// registerHotkeys();
	// Hooks.callAll(HOOKS.READY);

	// Add any additional hooks if necessary

	//@ts-ignore
	libWrapper.register(
		CONSTANTS.MODULE_NAME,
		"game.dnd5e.applications.actor.ActorSheet5eCharacter.prototype.getData",
		async function (wrapper, ...args) {
			const sheetData = await wrapper(...args);

			// let app = this;
			const actor = <Actor>this.actor;
			const newInventory = InventoryPlus.processInventory(this, actor, sheetData.inventory);
			sheetData.inventory = newInventory;
			const encumbrance5e = <EncumbranceDnd5e>API.calculateWeightFromActor(actor);
			/*
      if (
        game.modules.get('variant-encumbrance-dnd5e')?.active &&
        game.settings.get(CONSTANTS.MODULE_NAME, 'enableIntegrationWithVariantEncumbrance')
      ) {
        // DO NOTHING
      } else {
        if (encumbrance5e) {
          sheetData.system.attributes.encumbrance = encumbrance5e;
        }
      }
      */
			if (encumbrance5e) {
				sheetData.system.attributes.encumbrance = encumbrance5e;
			}
			return sheetData;
		},
		"WRAPPER"
	);

	//@ts-ignore
	libWrapper.register(
		CONSTANTS.MODULE_NAME,
		"game.dnd5e.applications.actor.ActorSheet5eCharacter.prototype._onDropItem",
		async function (wrapped, ...args) {
			const [event, itemDropped] = args;
			const actor = <Actor>this.actor;
			const targetActor = actor;
			const itemTypeCurrent = itemDropped?.type; // || event.type;

			if (itemTypeCurrent !== "Item") {
				warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemtypecurrent`));
				return;
			}
			/*
			const itemId = itemDropped?.uuid
				? itemDropped?.uuid.includes("Item.")
					? itemDropped?.uuid.split('.').pop()
					: itemDropped?.uuid
				: itemDropped?.id;
			if (!itemId) {
				warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemid`));
				return;
			}
			const dragAndDropFromCompendium = itemDropped.pack ? true : false;
			const dragAndDropFromActorSource = itemDropped.actorId ? true : false;
			*/
			const dragAndDropFromCompendium = itemDropped?.uuid.includes("Compendium");
			const itemCurrent = await retrieveItemFromData(
				actor,
				itemDropped.uuid,
				itemDropped.id,
				"",
				itemDropped.pack,
				itemDropped.actorId
			);
			const dragAndDropFromActorSource = itemDropped?.actorId === actor.id ? true : false;
			const itemId = itemCurrent.id;
			let itemData: Item | null = null;
			if (!itemCurrent) {
				// Start Patch Party Inventory
				if (itemDropped && itemDropped.type && itemDropped.id) {
					itemData = <Item>itemDropped;
					//@ts-ignore
					if (!itemData.flags) {
						setProperty(itemData, `flags`, {});
					}
					//@ts-ignore
					if (!itemData.flags.core) {
						//@ts-ignore
						setProperty(itemData.flags, `core`, {});
					}
				}
				// End Patch Party Inventory
				if (!itemData) {
					warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemcurrent`));
					return;
				}
			} else {
				itemData = <Item>itemCurrent;
			}
			if (!itemData) {
				warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemdata`));
				return;
			}

			// Yea i hate my life
			const actorId = itemDropped.actorId;
			let createdItem: Item | undefined = undefined;

			// dropping item outside inventory list, but ignore if already owned item
			const targetLi = <HTMLLIElement>$(event.target).parents("li")[0];
			let targetType = "";
			const targetCss = getCSSName("sub-header");
			if (targetLi && targetLi.className) {
				if (targetLi.className.trim().indexOf(<string>targetCss) !== -1) {
					targetType = <string>$(targetLi).find(".item-control")[0]?.dataset.type;
				} else if (targetLi.className.trim().indexOf("item") !== -1) {
					const itemId = <string>targetLi.dataset.itemId;
					const item = <Item>this.object.items.get(itemId);
					targetType = this.inventoryPlus.getItemType(item);
				}
			}

			if (!targetType) {
				// No type founded use standard system

				if (!this.actor.isOwner) return false;
				//@ts-ignore
				const item = <Item>await Item.implementation.fromDropData(itemDropped);
				const itemData = item.toObject();

				// Handle item sorting within the same Actor
				if (await _isFromSameActor(actor, itemDropped)) return this._onSortItem(event, itemData);

				// Create the owned item
				if (
					game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
					!(await _isFromSameActor(actor, itemDropped)) &&
					!isAlt() &&
					!dragAndDropFromCompendium &&
					dragAndDropFromActorSource
				) {
					//@ts-ignore
					module.dropActorSheetDataTransferStuff(targetActor, targetActor.sheet, itemDropped);
					return;
				} else {
					return this._onDropItemCreate(itemData);
				}
			}

			if (
				targetType === "feat" ||
				targetType === "spell" ||
				targetType === "class" ||
				targetType === "subclass"
			) {
				if (!this.actor.isOwner) return false;
				//@ts-ignore
				const item = <Item>await Item.implementation.fromDropData(itemDropped);
				const itemData = item.toObject();

				// Handle item sorting within the same Actor
				if (await _isFromSameActor(actor, itemDropped)) return this._onSortItem(event, itemData);

				// Create the owned item
				if (
					game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
					!(await _isFromSameActor(actor, itemDropped)) &&
					!isAlt() &&
					!dragAndDropFromCompendium &&
					dragAndDropFromActorSource
				) {
					//@ts-ignore
					module.dropActorSheetDataTransferStuff(targetActor, targetActor.sheet, itemDropped);
					return;
				} else {
					return this._onDropItemCreate(itemData);
				}
			}

			if (!targetLi) {
				warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.notargethtml`), true);

				if (!this.actor.isOwner) return false;
				//@ts-ignore
				const item = <Item>await Item.implementation.fromDropData(itemDropped);
				const itemData = item.toObject();

				// Handle item sorting within the same Actor
				if (await _isFromSameActor(actor, itemDropped)) return this._onSortItem(event, itemData);

				// Create the owned item
				if (
					game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
					!(await _isFromSameActor(actor, itemDropped)) &&
					!isAlt() &&
					!dragAndDropFromCompendium &&
					dragAndDropFromActorSource
				) {
					//@ts-ignore
					module.dropActorSheetDataTransferStuff(targetActor, targetActor.sheet, itemDropped);
					return;
				} else {
					return this._onDropItemCreate(itemData);
				}
			}

			if (!targetType || !this.inventoryPlus.customCategorys[targetType]) {
				warn(
					i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.nocategoryfounded`, { targetType: targetType }),
					true
				);

				if (!this.actor.isOwner) return false;
				//@ts-ignore
				const item = <Item>await Item.implementation.fromDropData(itemDropped);
				const itemData = item.toObject();

				// Handle item sorting within the same Actor
				if (await _isFromSameActor(actor, itemDropped)) return this._onSortItem(event, itemData);

				// Create the owned item
				if (
					game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
					!(await _isFromSameActor(actor, itemDropped)) &&
					!isAlt() &&
					!dragAndDropFromCompendium &&
					dragAndDropFromActorSource
				) {
					//@ts-ignore
					module.dropActorSheetDataTransferStuff(targetActor, targetActor.sheet, itemDropped);
					return;
				} else {
					return this._onDropItemCreate(itemData);
				}
			}

			const categoryRef = <Category>this.inventoryPlus.customCategorys[targetType];

			if (!categoryRef) {
				error(`Could not retrieve a category with the type '${targetType}'`, true);
				return;
			}

			if (!categoryRef.label) {
				error(`Can't find a label on category with the type '${targetType}'`, true);
				if (!this.actor.isOwner) return false;
				//@ts-ignore
				const item = <Item>await Item.implementation.fromDropData(itemDropped);
				const itemData = item.toObject();

				// Handle item sorting within the same Actor
				if (await _isFromSameActor(actor, itemDropped)) return this._onSortItem(event, itemData);

				// Create the owned item
				if (
					game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
					!(await _isFromSameActor(actor, itemDropped)) &&
					!isAlt() &&
					!dragAndDropFromCompendium &&
					dragAndDropFromActorSource
				) {
					//@ts-ignore
					module.dropActorSheetDataTransferStuff(targetActor, targetActor.sheet, itemDropped);
					return;
				} else {
					return this._onDropItemCreate(itemData);
				}
			}
			const categoryName = <string>i18n(categoryRef.label);
			// const headerElement = $(<HTMLElement>targetLi.parentElement?.parentElement).find(`h3:contains("${categoryName}")`);

			// dropping new item
			if (actorId !== this.object.id || itemData === undefined) {
				if (!actor.items.get(<string>itemId)) {
					// START WEIGHT CONTROL
					if (API.isCategoryFulled(actor, targetType, itemData)) {
						warn(
							i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.exceedsmaxweight`, {
								categoryName: categoryName,
							}),
							true
						);
						return;
					}
					// END WEIGHT CONTROL
					// START ACCEPTABLE TYPE
					if (!API.isAcceptableType(categoryRef, itemData)) {
						warn(
							i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.noacceptabletype`, {
								categoryName: categoryName,
								itemDataType: itemData.type,
							}),
							true
						);
						return;
					}
					// END itemDataType
					if (!this.actor.isOwner) return false;
					// const item = <Item>await Item.implementation.fromDropData(data);
					// const itemData = item.toObject();

					// Handle item sorting within the same Actor
					if (await _isFromSameActor(actor, itemDropped)) {
						// return this._onSortItem(event, itemData);
					} else {
						// Create the owned item
						if (
							game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
							!(await _isFromSameActor(actor, itemDropped)) &&
							!isAlt() &&
							!dragAndDropFromCompendium &&
							dragAndDropFromActorSource
						) {
							//@ts-ignore
							module.dropActorSheetDataTransferStuff(targetActor, targetActor.sheet, itemDropped);
						} else {
							const items: Item[] = await this._onDropItemCreate(itemData);
							createdItem = items[0];
						}
					}
				}
			}

			if (targetLi === undefined || targetLi.className === undefined) {
				if (actorId === this.object.id) {
					// Do nothing
					//return;
				} else {
					if (!actor.items.get(<string>itemId)) {
						// START WEIGHT CONTROL
						if (API.isCategoryFulled(actor, targetType, itemData)) {
							warn(
								i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.exceedsmaxweight`, {
									categoryName: categoryName,
								}),
								true
							);
							return;
						}
						// END WEIGHT CONTROL
						// START ACCEPTABLE TYPE
						if (!API.isAcceptableType(categoryRef, itemData)) {
							warn(
								i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.noacceptabletype`, {
									categoryName: categoryName,
									itemDataType: itemData.type,
								}),
								true
							);
							return;
						}
						// END itemDataType
						if (!this.actor.isOwner) return false;
						// const item = <Item>await Item.implementation.fromDropData(data);
						// const itemData = item.toObject();

						// Handle item sorting within the same Actor
						if (await _isFromSameActor(actor, itemDropped)) {
							// return this._onSortItem(event, itemData);
						} else {
							// Create the owned item
							if (
								game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
								!(await _isFromSameActor(actor, itemDropped)) &&
								!isAlt() &&
								!dragAndDropFromCompendium &&
								dragAndDropFromActorSource
							) {
								//@ts-ignore
								module.dropActorSheetDataTransferStuff(targetActor, targetActor.sheet, itemDropped);
							} else {
								const items: Item[] = await this._onDropItemCreate(itemData);
								createdItem = items[0];
							}
						}
					}
				}
			}

			// const targetLi = <HTMLLIElement>$(event.target).parents('li')[0];
			// doing actual stuff!!!
			// const itemId = itemData._id;
			let dropedItem = <Item>this.object.items.get(itemId);
			if (!dropedItem) {
				if (createdItem) {
					dropedItem = createdItem;
				} else {
					warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.nodroppeditem`));
					return;
				}
			}

			// changing item list
			let itemType = this.inventoryPlus.getItemType(itemData);
			if (itemType !== targetType) {
				// START WEIGHT CONTROL
				if (API.isCategoryFulled(actor, targetType, itemData)) {
					warn(
						i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.exceedsmaxweight`, {
							categoryName: categoryName,
						}),
						true
					);
					return;
				}
				// END WEIGHT CONTROL
				// START ACCEPTABLE TYPE
				if (!API.isAcceptableType(categoryRef, itemData)) {
					warn(
						i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.noacceptabletype`, {
							categoryName: categoryName,
							itemDataType: itemData.type,
						}),
						true
					);
					return;
				}
				// END itemDataType
				await dropedItem.setFlag(CONSTANTS.MODULE_NAME, InventoryPlusFlags.CATEGORY, targetType);
				itemType = targetType;
			}

			// reordering items

			// Get the drag source and its siblings

			const siblings = <Item[]>this.object.items.filter((i: Item) => {
				const type = <string>this.inventoryPlus.getItemType(i);
				return type === itemType && i.id !== dropedItem.id;
			});
			// Get the drop target
			const dropTarget = event.target.closest(".item");
			const targetId: string | null = dropTarget ? <string>dropTarget.dataset.itemId : null;
			const target = <Item>siblings.find((s) => s.id === targetId);

			// Perform the sort
			const sortUpdates = SortingHelpers.performIntegerSort(dropedItem, { target: target, siblings });
			let updateData: any[] = sortUpdates.map((u) => {
				const update: any = u.update;
				update._id = u.target.id;
				return update;
			});

			updateData = updateData.filter((i) => {
				return i._id !== null && i._id !== undefined && i._id !== "";
			});

			// Perform the update
			this.object.updateEmbeddedDocuments("Item", updateData);
		},
		"MIXED" //'OVERRIDE',
	);

	// Hooks.on(`renderActorSheet5eCharacter`, (app, html, data) => {
	Hooks.on(`renderActorSheet`, (app, html, data) => {
		module.renderActorSheet5eCharacterInventoryPlus(app, html, data);
		module.renderActorSheetEnableInventorySorter(app, html, data);
	});
	Hooks.on("dropActorSheetData", (targetActor: Actor, targetSheet: ActorSheet, futureItem: any) => {
		// module.dropActorSheetDataTransferStuff(targetActor, targetSheet, futureItem);
	});

	Hooks.on("preUpdateItem", (item, changes, options, ...args) => {
		module.preUpdateItemInventorySorter(item, changes, options, ...args);
	});

	Hooks.on("createItem", (item, options, userId, ...args) => {
		module.createItemInventorySorter(item, options, userId, ...args);
	});

	Hooks.on("deleteItem", (item, options, userId, ...args) => {
		module.deleteItemInventorySorter(item, options, userId, ...args);
	});

	Hooks.on("updateItem", (item, changes, options, userId) => {
		module.updateItemInventorySorter(item, changes, options, userId);
	});
};

const module = {
	async manageInventoryPlus(targetActor: Actor, targetSheet: ActorSheet, actorData: any) {
		// TODO THE HOOK IS BETTER OF THE WRAPPER INTERCEPTOR...
	},
	async renderActorSheet5eCharacterInventoryPlus(...args) {
		const [app, html, actorData] = args;
		const actorEntityTmp: any = <Actor>game.actors?.get(actorData.actor._id);
		// if (!app.inventoryPlus) {
		app.inventoryPlus = new InventoryPlus();
		app.inventoryPlus.init(actorEntityTmp);
		// }
		app.inventoryPlus.addInventoryFunctions(html);
	},
	dropActorSheetDataTransferStuff(targetActor: Actor, targetSheet: ActorSheet, actorData: any): boolean {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer")) {
			return false;
		}
		// if (isAlt()) {
		//   return false; // ignore when Alt is pressed to drop.
		// }

		if (targetActor.permission !== 3) {
			error("You don't have the permissions to transfer items here", true);
			return false;
		}

		if (actorData.type === "Item" && actorData.actorId) {
			if (!targetActor.id) {
				warn(`target has no actorData._id? ${targetActor}`);
				return false;
			}
			if (targetActor.id === actorData.actorId) {
				return false; // ignore dropping on self
			}
			let sourceSheet: ActorSheet;
			if (actorData.tokenId !== null) {
				//game.scenes.get("hyfUtn3VVPnVUpJe").tokens.get("OYwRVJ7crDyid19t").sheet.actor.items
				//@ts-ignore
				sourceSheet = <ActorSheet>game.scenes?.get(actorData.sceneId)!.tokens.get(actorData.tokenId)!.sheet;
			} else {
				//@ts-ignore
				sourceSheet = <ActorSheet>game.actors?.get(actorData.actorId)!.sheet;
			}
			const sourceActor = game.actors?.get(actorData.actorId);
			if (sourceActor) {
				/* if both source and target have the same type then allow deleting original item. this is a safety check because some game systems may allow dropping on targets that don't actually allow the GM or player to see the inventory, making the item inaccessible. */
				if (checkCompatible(sourceActor.type, targetActor.type, actorData)) {
					const originalQuantity = actorData.system.quantity;
					const targetActorId = targetActor.id;
					const sourceActorId = actorData.actorId;
					if (
						game.settings.get(CONSTANTS.MODULE_NAME, "enableCurrencyTransfer") &&
						actorData.name === "Currency"
					) {
						showCurrencyTransferDialog(sourceSheet, targetSheet);
						return false;
					} else if (originalQuantity >= 1) {
						// game.settings.get(CONSTANTS.MODULE_NAME, 'enableItemTransfer') &&
						showItemTransferDialog(originalQuantity, sourceSheet, targetSheet, actorData.id, actorData);
						return false;
					}
				}
			}
			return true;
		}
		warn(`You can't transfer no items document here"`);
		return false;
	},

	preUpdateItemInventorySorter(item: Item, changes: any, options: any, ...args): boolean {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableInventorySorter")) {
			return false;
		}
		if (changes.sort !== undefined) {
			if (!options.inventorySorterUpdate) {
				const itemSorts = getItemSorts(<Actor>item.parent);
				const itemSort = itemSorts.get(changes._id);
				if (itemSort) {
					changes.sort = itemSort.sort;
				}
			}
			//@ts-ignore
			if (item.sort === changes.sort && Object.keys(changes).length === 2) {
				return false;
			}
		}
		return true;
	},

	createItemInventorySorter(item: Item, options: any, userId: string, ...args) {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableInventorySorter")) {
			return;
		}
		if (userId === game.userId) {
			delayedSort(<Actor>item.parent);
		}
	},

	deleteItemInventorySorter(item: Item, options: any, userId: string, ...args) {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableInventorySorter")) {
			return;
		}
		if (userId === game.userId) {
			delayedSort(<Actor>item.parent);
		}
	},

	updateItemInventorySorter(item: Item, changes, options: any, userId: string) {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableInventorySorter")) {
			return;
		}
		if (userId === game.userId) {
			if (!options.inventorySorterUpdate) {
				delayedSort(<Actor>item.parent);
			}
		}
	},

	renderActorSheetEnableInventorySorter(actorSheet: ActorSheet, html, data) {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableInventorySorter")) {
			return;
		}
		if (actorSheet?.isEditable) {
			const actor = actorSheet?.actor;
			if (!sortedActors.has(actor.id)) {
				delayedSort(actor);
			}
		}
	},
};
