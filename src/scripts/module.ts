import { getApi, setApi } from "../main";
import API from "./api";
import CONSTANTS from "./constants";
import { InventoryPlus } from "./inventory-plus";
import {
	Category,
	EncumbranceDnd5e,
	InventoryPlusFlags,
	InventoryPlusItemType,
	inventoryPlusItemTypeCollectionForCharacter,
	inventoryPlusItemTypeCollectionForNPC,
	inventoryPlusItemTypeCollectionForVehicle,
	inventoryPlusItemTypeCollectionForVehicleCargo,
	itemTypesDnd5e,
} from "./inventory-plus-models";
import {
	getCSSName,
	debug,
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
	// Do nothing
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
			sheetData.inventory = Object.values(newInventory);
			const encumbrance5e = <EncumbranceDnd5e>API.calculateWeightFromActor(actor);
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
		module.onDropItemInventoryPlus,
		"MIXED" //'OVERRIDE',
	);

	if (game.settings.get(CONSTANTS.MODULE_NAME, "enableForNpc")) {
		//@ts-ignore
		libWrapper.register(
			CONSTANTS.MODULE_NAME,
			"game.dnd5e.applications.actor.ActorSheet5eNPC.prototype.getData",
			async function (wrapper, ...args) {
				const sheetData = await wrapper(...args);

				// let app = this;
				const actor = <Actor>this.actor;
				const newInventory = InventoryPlus.processInventory(this, actor, sheetData.features);
				sheetData.features = Object.values(newInventory);
				const encumbrance5e = <EncumbranceDnd5e>API.calculateWeightFromActor(actor);
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
			"game.dnd5e.applications.actor.ActorSheet5eNPC.prototype._onDropItem",
			module.onDropItemInventoryPlus,
			"MIXED" //'OVERRIDE',
		);
	}

	if (game.settings.get(CONSTANTS.MODULE_NAME, "enableForVehicle")) {
		//@ts-ignore
		libWrapper.register(
			CONSTANTS.MODULE_NAME,
			"game.dnd5e.applications.actor.ActorSheet5eVehicle.prototype.getData",
			async function (wrapper, ...args) {
				const sheetData = await wrapper(...args);

				// let app = this;
				const actor = <Actor>this.actor;
				const newInventory = InventoryPlus.processInventory(this, actor, sheetData.features);
				sheetData.features = Object.values(newInventory);

				// const newInventoryCargo = InventoryPlus.processInventory(this, actor, sheetData.cargo);
				// sheetData.cargo = Object.values(newInventoryCargo);

				const encumbrance5e = <EncumbranceDnd5e>API.calculateWeightFromActor(actor);
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
			"game.dnd5e.applications.actor.ActorSheet5eVehicle.prototype._onDropItem",
			module.onDropItemInventoryPlus,
			"MIXED" //'OVERRIDE',
		);
	}

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

		const actorType = actorEntityTmp.type;
		let inventoryPlusItemTypeCollection = <InventoryPlusItemType[]>[];
		let targetCssInventoryPlus: string | undefined = undefined;
		if (actorType === "character") {
			targetCssInventoryPlus = "inventory";
			inventoryPlusItemTypeCollection = inventoryPlusItemTypeCollectionForCharacter;
			app.inventoryPlus.addInventoryFunctions(
				html,
				actorType,
				targetCssInventoryPlus,
				inventoryPlusItemTypeCollection
			);
		} else if (actorType === "npc" && game.settings.get(CONSTANTS.MODULE_NAME, "enableForNpc")) {
			targetCssInventoryPlus = "features";
			inventoryPlusItemTypeCollection = inventoryPlusItemTypeCollectionForNPC;
			app.inventoryPlus.addInventoryFunctions(
				html,
				actorType,
				targetCssInventoryPlus,
				inventoryPlusItemTypeCollection
			);
		} else if (actorType === "vehicle" && game.settings.get(CONSTANTS.MODULE_NAME, "enableForVehicle")) {
			targetCssInventoryPlus = "features";
			inventoryPlusItemTypeCollection = inventoryPlusItemTypeCollectionForVehicle;
			app.inventoryPlus.addInventoryFunctions(
				html,
				actorType,
				targetCssInventoryPlus,
				inventoryPlusItemTypeCollection
			);

			// SPECIAL CASE CARGO
			// targetCssInventoryPlus = "cargo";
			// inventoryPlusItemTypeCollection = inventoryPlusItemTypeCollectionForVehicleCargo;
			// app.inventoryPlus.addInventoryFunctions(html, actorType, targetCssInventoryPlus);
		} else {
			// Cannot happened
			warn(
				i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.actortypeisnotsupported`, { actorType: actorType }),
				true
			);
			return;
		}
	},
	dropActorSheetDataTransferStuff(targetActor: Actor, sourceActor: Actor, item: Item): boolean {
		if (!item) {
			debug(`The item is itemData not a item object is ignored`);
			return false;
		}
		const targetSheet = <any>targetActor.sheet;
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

		// if (itemData.type === "Item" && itemData.uuid) {
		if (item) {
			if (!targetActor.id) {
				warn(`target has no actorData._id? ${targetActor}`);
				return false;
			}
			//@ts-ignore
			// const item = await Item.implementation.fromDropData(itemData);
			if (targetActor.id === sourceActor.id) {
				return false; // ignore dropping on self
			}
			// let sourceSheet: ActorSheet;
			// if (itemData.tokenId !== null) {
			// 	//game.scenes.get("hyfUtn3VVPnVUpJe").tokens.get("OYwRVJ7crDyid19t").sheet.actor.items
			// 	//@ts-ignore
			// 	sourceSheet = <ActorSheet>game.scenes?.get(itemData.sceneId)!.tokens.get(itemData.tokenId)!.sheet;
			// } else {
			// 	//@ts-ignore
			// 	sourceSheet = <ActorSheet>game.actors?.get(itemData.actorId)!.sheet;
			// }
			//@ts-ignore
			// const sourceActor = game.actors?.get(sourceActorId);
			//@ts-ignore
			const sourceSheet = <ActorSheet>sourceActor?.sheet;
			if (sourceActor) {
				/* if both source and target have the same type then allow deleting original item. this is a safety check because some game systems may allow dropping on targets that don't actually allow the GM or player to see the inventory, making the item inaccessible. */
				if (checkCompatible(sourceActor.type, targetActor.type, item)) {
					//@ts-ignore
					const originalQuantity = item.system.quantity;
					// const targetActorId = targetActor.id;
					//@ts-ignore
					// const sourceActorId = item.parent.actor.id;
					if (
						game.settings.get(CONSTANTS.MODULE_NAME, "enableCurrencyTransfer") &&
						item.name === "Currency"
					) {
						showCurrencyTransferDialog(sourceSheet, targetSheet);
						//@ts-ignore
						return false;
					} else if (originalQuantity >= 1) {
						// game.settings.get(CONSTANTS.MODULE_NAME, 'enableItemTransfer') &&
						showItemTransferDialog(originalQuantity, sourceSheet, targetSheet, <string>item.id, item);
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
		const user = game.user;
		if (!user?.character) {
			debug(`Can't reorder you need to set a actor to the game user`);
			return false;
		}
		if (user.character.id !== (<Actor>item.parent).id) {
			debug(`Can't reorder you can order ONLY the actor connected to the game user`);
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
			return false;
		}
		const user = game.users?.get(userId);
		if (!user?.character) {
			debug(`Can't reorder you need to set a actor to the game user`);
			return false;
		}
		if (user.character.id !== (<Actor>item.parent).id) {
			debug(`Can't reorder you can order ONLY the actor connected to the game user`);
			return false;
		}
		if (userId === game.userId) {
			delayedSort(<Actor>item.parent);
		}
		return true;
	},

	deleteItemInventorySorter(item: Item, options: any, userId: string, ...args): boolean {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableInventorySorter")) {
			return false;
		}
		const user = game.users?.get(userId);
		if (!user?.character) {
			debug(`Can't reorder you need to set a actor to the game user`);
			return false;
		}
		if (user.character.id !== (<Actor>item.parent).id) {
			debug(`Can't reorder you can order ONLY the actor connected to the game user`);
			return false;
		}
		if (userId === game.userId) {
			delayedSort(<Actor>item.parent);
		}
		return true;
	},

	updateItemInventorySorter(item: Item, changes, options: any, userId: string) {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableInventorySorter")) {
			return false;
		}
		const user = game.users?.get(userId);
		if (!user?.character) {
			debug(`Can't reorder you need to set a actor to the game user`);
			return false;
		}
		if (user.character.id !== (<Actor>item.parent).id) {
			debug(`Can't reorder you can order ONLY the actor connected to the game user`);
			return false;
		}
		if (userId === game.userId) {
			if (!options.inventorySorterUpdate) {
				delayedSort(<Actor>item.parent);
			}
		}
		return true;
	},

	renderActorSheetEnableInventorySorter(actorSheet: ActorSheet, html, data) {
		if (!game.settings.get(CONSTANTS.MODULE_NAME, "enableInventorySorter")) {
			return false;
		}
		const user = game.user;
		if (!user?.character) {
			debug(`Can't reorder you need to set a actor to the game user`);
			return false;
		}
		if (user.character.id !== actorSheet.actor.id) {
			debug(`Can't reorder you can order ONLY the actor connected to the game user`);
			return false;
		}
		if (actorSheet?.isEditable) {
			const actor = actorSheet?.actor;
			if (!sortedActors.has(actor.id)) {
				delayedSort(actor);
			}
		}
		return true;
	},

	async onDropItemInventoryPlus(wrapped, ...args) {
		let [event, itemCurrent] = args;
		// const actor = <Actor>this.actor;
		const targetActor = <Actor>this.actor;
		let itemDataToCheck: any | null = null;
		let targetType = "";
		let itemToCheck: Item | null = null;
		let dragAndDropFromCompendium = false;
		let sourceActor: Actor | null = null;
		let sourceActorId: string | null = null;

		// Check is a item data by property
		if (itemCurrent.data && itemTypesDnd5e.includes(itemCurrent.data.type)) {
			targetType = itemCurrent.data.type;
			//@ts-ignore
			itemToCheck = null;
			itemDataToCheck = itemCurrent.data;
			sourceActor = null;
			sourceActorId = null;
		}
		// Check if is a item data directly
		else if (itemTypesDnd5e.includes(itemCurrent.type)) {
			targetType = itemCurrent.type;
			//@ts-ignore
			itemToCheck = null;
			itemDataToCheck = itemCurrent;
			sourceActor = null;
			sourceActorId = null;
		}
		// Check if the item is from a actor some reference uuid
		else {
			const itemTypeCurrent = itemCurrent?.type; // || event.type;

			if (itemTypeCurrent !== "Item") {
				warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemtypecurrent`));
				return;
			}

			dragAndDropFromCompendium = itemCurrent?.uuid.includes("Compendium");
			const itemDropped: Item = <Item>(
				await retrieveItemFromData(
					targetActor,
					itemCurrent.uuid,
					itemCurrent.id,
					"",
					itemCurrent.pack,
					itemCurrent.actorId
				)
			);

			if (!itemDropped) {
				// Start Patch Party Inventory
				//@ts-ignore
				if (itemDropped && itemDropped.type && itemDropped.id) {
					itemDataToCheck = <Item>itemDropped;
					//@ts-ignore
					if (!itemDataToCheck.flags) {
						setProperty(itemDataToCheck, `flags`, {});
					}
					//@ts-ignore
					if (!itemDataToCheck.flags.core) {
						//@ts-ignore
						setProperty(itemDataToCheck.flags, `core`, {});
					}
				}
				// End Patch Party Inventory
				if (!itemDataToCheck) {
					warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemcurrent`));
					return;
				}
			} else {
				itemDataToCheck = <Item>itemDropped;
			}
			if (!itemDataToCheck) {
				warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.itemdata`));
				return;
			}

			// Yea i hate my life
			//@ts-ignore
			sourceActorId = itemDropped.actorId
				? //@ts-ignore
				  itemDropped.actorId
				: //@ts-ignore
				itemDropped.actor
				? //@ts-ignore
				  itemDropped.actor.id
				: //@ts-ignore
				itemDropped.parent && itemDropped.parent instanceof Actor
				? //@ts-ignore
				  itemDropped.parent.id
				: //@ts-ignore
				  undefined;

			sourceActor = sourceActorId ? <Actor>game.actors?.get(sourceActorId) : null;

			// let createdItem: Item | undefined = undefined;

			itemToCheck =
				itemDropped instanceof Item
					? itemDropped
					: //@ts-ignore
					  <Item>await Item.implementation.fromDropData(itemDropped);

			itemDataToCheck = itemToCheck.toObject();
		}
		const isFromSameActor = await _isFromSameActor(targetActor, itemToCheck);
		let createdItem: Item | undefined = undefined;
		// dropping item outside inventory list, but ignore if already owned item
		const targetLi = <HTMLLIElement>$(event.target).parents("li")[0];
		// let targetType = "";
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

			if (!this.actor.isOwner) {
				return false;
			}

			// Handle item sorting within the same Actor
			if (isFromSameActor) {
				return this._onSortItem(event, itemDataToCheck);
			}
			// Create the owned item
			if (
				game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
				!isFromSameActor &&
				!isAlt() &&
				!dragAndDropFromCompendium &&
				// dragAndDropFromActorSource &&
				sourceActor
			) {
				//@ts-ignore
				module.dropActorSheetDataTransferStuff(targetActor, sourceActor, itemDropped);
				return;
			} else {
				return this._onDropItemCreate(itemDataToCheck);
			}
		}

		if (targetType === "feat" || targetType === "spell" || targetType === "class" || targetType === "subclass") {
			if (!this.actor.isOwner) {
				return false;
			}
			//@ts-ignore
			// const item = <Item>await Item.implementation.fromDropData(itemDropped);
			// const item =
			// 	itemDropped instanceof Item
			// 		? itemDropped
			// 		: //@ts-ignore
			// 		  <Item>await Item.implementation.fromDropData(itemDropped);
			// const itemData = item.toObject();

			// Handle item sorting within the same Actor
			if (isFromSameActor) {
				return this._onSortItem(event, itemDataToCheck);
			}
			// Create the owned item
			if (
				game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
				!isFromSameActor &&
				!isAlt() &&
				!dragAndDropFromCompendium &&
				// dragAndDropFromActorSource &&
				sourceActor
			) {
				//@ts-ignore
				module.dropActorSheetDataTransferStuff(targetActor, sourceActor, itemToCheck);
				return;
			} else {
				return this._onDropItemCreate(itemDataToCheck);
			}
		}

		if (!targetLi) {
			debug(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.notargethtml`));

			if (!this.actor.isOwner) {
				return false;
			}

			// Handle item sorting within the same Actor
			if (isFromSameActor) {
				return this._onSortItem(event, itemDataToCheck);
			}
			// Create the owned item
			if (
				game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
				!isFromSameActor &&
				!isAlt() &&
				!dragAndDropFromCompendium &&
				// dragAndDropFromActorSource &&
				sourceActor
			) {
				//@ts-ignore
				module.dropActorSheetDataTransferStuff(targetActor, sourceActor, itemToCheck);
				return;
			} else {
				return this._onDropItemCreate(itemDataToCheck);
			}
		}

		if (!targetType || !this.inventoryPlus.customCategorys[targetType]) {
			warn(
				i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.nocategoryfounded`, { targetType: targetType }),
				true
			);

			if (!this.actor.isOwner) {
				return false;
			}

			// Handle item sorting within the same Actor
			if (isFromSameActor) {
				return this._onSortItem(event, itemDataToCheck);
			}
			// Create the owned item
			if (
				game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
				!isFromSameActor &&
				!isAlt() &&
				!dragAndDropFromCompendium &&
				// dragAndDropFromActorSource &&
				sourceActor
			) {
				//@ts-ignore
				module.dropActorSheetDataTransferStuff(targetActor, sourceActor, itemToCheck);
				return;
			} else {
				return this._onDropItemCreate(itemDataToCheck);
			}
		}

		const categoryRef = <Category>this.inventoryPlus.customCategorys[targetType];

		if (!categoryRef) {
			error(`Could not retrieve a category with the type '${targetType}'`, true);
			return;
		}

		if (!categoryRef.label) {
			error(`Can't find a label on category with the type '${targetType}'`, true);
			if (!this.actor.isOwner) {
				return false;
			}

			// Handle item sorting within the same Actor
			if (isFromSameActor) {
				return this._onSortItem(event, itemDataToCheck);
			}
			// Create the owned item
			if (
				game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
				!isFromSameActor &&
				!isAlt() &&
				!dragAndDropFromCompendium &&
				// dragAndDropFromActorSource &&
				sourceActor
			) {
				//@ts-ignore
				module.dropActorSheetDataTransferStuff(targetActor, sourceActor, itemToCheck);
				return;
			} else {
				return this._onDropItemCreate(itemDataToCheck);
			}
		}
		const categoryName = <string>i18n(categoryRef.label);

		// dropping new item
		if (sourceActorId !== this.object.id || itemDataToCheck === undefined) {
			if (!targetActor.items.get(<string>itemToCheck?.id)) {
				// START WEIGHT CONTROL
				if (API.isCategoryFulled(targetActor, targetType, itemDataToCheck)) {
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
				if (!API.isAcceptableType(categoryRef, itemDataToCheck)) {
					warn(
						i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.noacceptabletype`, {
							categoryName: categoryName,
							itemDataType: itemDataToCheck.type,
						}),
						true
					);
					return;
				}
				// END itemDataType
				if (!this.actor.isOwner) {
					return false;
				}
				// const item = <Item>await Item.implementation.fromDropData(data);
				// const itemData = item.toObject();

				// Handle item sorting within the same Actor
				if (isFromSameActor) {
					// return this._onSortItem(event, itemData);
				} else {
					// Create the owned item
					if (
						game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
						!isFromSameActor &&
						!isAlt() &&
						!dragAndDropFromCompendium &&
						// dragAndDropFromActorSource &&
						sourceActor
					) {
						//@ts-ignore
						module.dropActorSheetDataTransferStuff(targetActor, sourceActor, itemToCheck);
					} else {
						const items: Item[] = await this._onDropItemCreate(itemDataToCheck);
						createdItem = items[0];
					}
				}
			}
		}

		if (targetLi === undefined || targetLi.className === undefined) {
			if (sourceActorId === this.object.id) {
				// Do nothing
				//return;
			} else {
				if (!targetActor.items.get(<string>itemToCheck?.id)) {
					// START WEIGHT CONTROL
					if (API.isCategoryFulled(targetActor, targetType, itemDataToCheck)) {
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
					if (!API.isAcceptableType(categoryRef, itemDataToCheck)) {
						warn(
							i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.noacceptabletype`, {
								categoryName: categoryName,
								itemDataType: itemDataToCheck.type,
							}),
							true
						);
						return;
					}
					// END itemDataType
					if (!this.actor.isOwner) {
						return false;
					}
					// const item = <Item>await Item.implementation.fromDropData(data);
					// const itemData = item.toObject();

					// Handle item sorting within the same Actor
					if (isFromSameActor) {
						// return this._onSortItem(event, itemData);
					} else {
						// Create the owned item
						if (
							game.settings.get(CONSTANTS.MODULE_NAME, "enableItemTransfer") &&
							!isFromSameActor &&
							!isAlt() &&
							!dragAndDropFromCompendium &&
							// dragAndDropFromActorSource &&
							sourceActor
						) {
							//@ts-ignore
							module.dropActorSheetDataTransferStuff(targetActor, sourceActor, itemToCheck);
						} else {
							const items: Item[] = await this._onDropItemCreate(itemDataToCheck);
							createdItem = items[0];
						}
					}
				}
			}
		}

		// const targetLi = <HTMLLIElement>$(event.target).parents('li')[0];
		// doing actual stuff!!!
		// const itemId = itemData._id;
		let dropedItem = <Item>this.object.items.get(itemToCheck?.id);
		if (!dropedItem) {
			if (createdItem) {
				dropedItem = createdItem;
			} else {
				warn(i18n(`${CONSTANTS.MODULE_NAME}.dialogs.warn.nodroppeditem`));
				return;
			}
		}

		// changing item list
		let itemType = this.inventoryPlus.getItemType(itemDataToCheck);
		if (itemType !== targetType) {
			// START WEIGHT CONTROL
			if (API.isCategoryFulled(targetActor, targetType, itemDataToCheck)) {
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
			if (!API.isAcceptableType(categoryRef, itemDataToCheck)) {
				warn(
					i18nFormat(`${CONSTANTS.MODULE_NAME}.dialogs.warn.noacceptabletype`, {
						categoryName: categoryName,
						itemDataType: itemDataToCheck.type,
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
};
