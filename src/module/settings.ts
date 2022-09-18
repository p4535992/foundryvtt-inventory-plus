import CONSTANTS from "./constants";
import { dialogWarning, i18n, warn } from "./lib/lib";

export const registerSettings = function (): void {
	game.settings.registerMenu(CONSTANTS.MODULE_NAME, "resetAllSettings", {
		name: `${CONSTANTS.MODULE_NAME}.setting.reset.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.reset.hint`,
		icon: "fas fa-coins",
		type: ResetSettingsDialog,
		restricted: true,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "hideButtonDefaultCategories", {
		name: `${CONSTANTS.MODULE_NAME}.setting.hideButtonDefaultCategories.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.hideButtonDefaultCategories.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});

	// ===================================================================

	// =================================
	// INTEGRATION VARIANT ENCUMBRANCE
	// =================================

	game.settings.register(CONSTANTS.MODULE_NAME, "enableIntegrationWithVariantEncumbrance", {
		name: `${CONSTANTS.MODULE_NAME}.setting.enableIntegrationWithVariantEncumbrance.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.enableIntegrationWithVariantEncumbrance.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});

	// =================================
	// INTEGRATION ITEM COLLECTION
	// =================================

	game.settings.register(CONSTANTS.MODULE_NAME, "useEquippedUnequippedItemCollectionFeature", {
		name: `${CONSTANTS.MODULE_NAME}.setting.useEquippedUnequippedItemCollectionFeature.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.useEquippedUnequippedItemCollectionFeature.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});

	// =================================
	// INTEGRATION TRANSFER STUFF
	// =================================

	game.settings.register(CONSTANTS.MODULE_NAME, "enableItemTransfer", {
		name: `${CONSTANTS.MODULE_NAME}.setting.enableItemTransfer.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.enableItemTransfer.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "enableCurrencyTransfer", {
		name: `${CONSTANTS.MODULE_NAME}.setting.enableCurrencyTransfer.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.enableCurrencyTransfer.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "actorTransferSame", {
		name: `${CONSTANTS.MODULE_NAME}.setting.actorTransferSame.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.actorTransferSame.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "actorTransferPairs", {
		name: `${CONSTANTS.MODULE_NAME}.setting.actorTransferPairs.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.actorTransferPairs.hint`,
		scope: "world",
		config: true,
		type: String,
		default: "",
		onChange: (value: string) => {
			try {
				JSON.parse("{" + value + "}");
			} catch (err: any) {
				ui.notifications.error(err.message);
				throw err;
			}
		},
	});

	// =================================
	// INTEGRATION SORTER 5E
	// =================================

	game.settings.register(CONSTANTS.MODULE_NAME, "enableInventorySorter", {
		name: `${CONSTANTS.MODULE_NAME}.setting.enableInventorySorter.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.enableInventorySorter.hint`,
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});

	// =====================================
	// ENCUMBRANCE EQUIPPED MULTIPLIER
	// ======================================

	game.settings.register(CONSTANTS.MODULE_NAME, "enableEquipmentMultiplier", {
		name: `${CONSTANTS.MODULE_NAME}.setting.enableEquipmentMultiplier.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.enableEquipmentMultiplier.hint`,
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "equipmentMultiplier", {
		name: `${CONSTANTS.MODULE_NAME}.setting.equipmentMultiplier.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.equipmentMultiplier.hint`,
		scope: "client",
		config: true,
		default: 1,
		type: Number,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "doNotIncreaseWeightByQuantityForNoAmmunition", {
		name: `${CONSTANTS.MODULE_NAME}.setting.doNotIncreaseWeightByQuantityForNoAmmunition.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.doNotIncreaseWeightByQuantityForNoAmmunition.hint`,
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});

	// ===================================================================

	game.settings.register(CONSTANTS.MODULE_NAME, "debug", {
		name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});

	// game.settings.register(CONSTANTS.MODULE_NAME, 'debugHooks', {
	//   name: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.name`,
	//   hint: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.hint`,
	//   scope: 'world',
	//   config: false,
	//   default: false,
	//   type: Boolean,
	// });

	// const settings = defaultSettings();
	// for (const [name, data] of Object.entries(settings)) {
	//   game.settings.register(CONSTANTS.MODULE_NAME, name, <any>data);
	// }
	// // for (const [name, data] of Object.entries(otherSettings)) {
	// //     game.settings.register(CONSTANTS.MODULE_NAME, name, data);
	// // }
};

class ResetSettingsDialog extends FormApplication<FormApplicationOptions, object, any> {
	constructor(...args) {
		//@ts-ignore
		super(...args);
		//@ts-ignore
		return new Dialog({
			title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.title`),
			content:
				'<p style="margin-bottom:1rem;">' +
				game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.content`) +
				"</p>",
			buttons: {
				confirm: {
					icon: '<i class="fas fa-check"></i>',
					label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.confirm`),
					callback: async () => {
						await applyDefaultSettings();
						window.location.reload();
					},
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.cancel`),
				},
			},
			default: "cancel",
		});
	}

	async _updateObject(event: Event, formData?: object): Promise<any> {
		// do nothing
	}
}

async function applyDefaultSettings() {
	// const settings = defaultSettings(true);
	// for (const [name, data] of Object.entries(settings)) {
	//   //@ts-ignore
	//   await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
	// }
	const settings2 = otherSettings(true);
	for (const [name, data] of Object.entries(settings2)) {
		//@ts-ignore
		await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
	}
}

// function defaultSettings(apply = false) {
//   return {

//   };
// }

function otherSettings(apply = false) {
	return {
		hideButtonDefaultCategories: {
			name: `${CONSTANTS.MODULE_NAME}.setting.hideButtonDefaultCategories.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.hideButtonDefaultCategories.hint`,
			scope: "world",
			config: true,
			type: Boolean,
			default: false,
		},

		// =================================
		// INTEGRATION VARIANT ENCUMBRANCE
		// =================================

		enableIntegrationWithVariantEncumbrance: {
			name: `${CONSTANTS.MODULE_NAME}.setting.enableIntegrationWithVariantEncumbrance.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.enableIntegrationWithVariantEncumbrance.hint`,
			scope: "world",
			config: true,
			type: Boolean,
			default: true,
		},

		// =================================
		// INTEGRATION ITEM COLLECTION
		// =================================

		useEquippedUnequippedItemCollectionFeature: {
			name: `${CONSTANTS.MODULE_NAME}.setting.useEquippedUnequippedItemCollectionFeature.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.useEquippedUnequippedItemCollectionFeature.hint`,
			scope: "world",
			config: true,
			type: Boolean,
			default: true,
		},

		// =================================
		// INTEGRATION TRANSFER STUFF
		// =================================

		enableItemTransfer: {
			name: `${CONSTANTS.MODULE_NAME}.setting.enableItemTransfer.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.enableItemTransfer.hint`,
			scope: "world",
			config: true,
			type: Boolean,
			default: false,
		},

		enableCurrencyTransfer: {
			name: `${CONSTANTS.MODULE_NAME}.setting.enableCurrencyTransfer.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.enableCurrencyTransfer.hint`,
			scope: "world",
			config: true,
			type: Boolean,
			default: true,
		},

		actorTransferSame: {
			name: `${CONSTANTS.MODULE_NAME}.setting.actorTransferSame.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.actorTransferSame.hint`,
			scope: "world",
			config: true,
			type: Boolean,
			default: true,
		},

		actorTransferPairs: {
			name: `${CONSTANTS.MODULE_NAME}.setting.actorTransferPairs.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.actorTransferPairs.hint`,
			scope: "world",
			config: true,
			type: String,
			default: "",
			onChange: (value: string) => {
				try {
					JSON.parse("{" + value + "}");
				} catch (err: any) {
					ui.notifications.error(err.message);
					throw err;
				}
			},
		},

		// =================================
		// INTEGRATION SORTER 5E
		// =================================

		enableInventorySorter: {
			name: `${CONSTANTS.MODULE_NAME}.setting.enableInventorySorter.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.enableInventorySorter.hint`,
			scope: "client",
			config: true,
			default: false,
			type: Boolean,
		},

		// =====================================
		// ENCUMBRANCE EQUIPPED MULTIPLIER
		// ======================================

		enableEquipmentMultiplier: {
			name: `${CONSTANTS.MODULE_NAME}.setting.enableEquipmentMultiplier.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.enableEquipmentMultiplier.hint`,
			scope: "client",
			config: true,
			default: false,
			type: Boolean,
		},

		equipmentMultiplier: {
			name: `${CONSTANTS.MODULE_NAME}.setting.equipmentMultiplier.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.equipmentMultiplier.hint`,
			scope: "client",
			config: true,
			default: 1,
			type: Number,
		},

		doNotIncreaseWeightByQuantityForNoAmmunition: {
			name: `${CONSTANTS.MODULE_NAME}.setting.doNotIncreaseWeightByQuantityForNoAmmunition.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.doNotIncreaseWeightByQuantityForNoAmmunition.hint`,
			scope: "client",
			config: true,
			default: false,
			type: Boolean,
		},

		// ===================================================================
		debug: {
			name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
			hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
			scope: "client",
			config: true,
			default: false,
			type: Boolean,
		},

		// debugHooks: {
		//   name: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.name`,
		//   hint: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.hint`,
		//   scope: 'world',
		//   config: false,
		//   default: false,
		//   type: Boolean,
		// },
	};
}
