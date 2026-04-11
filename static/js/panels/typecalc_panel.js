import { gameData } from "../data_version.js";
import { e } from "../utils.js";
import { getTypeEffectiveness } from "../weakness.js";

import defensiveAbilities from "../defensiveAbilities.js";

// Build sorted list of all defensive ability names
function getAllDefensiveAbilityNames() {
    const names = new Set();
    for (const [name, entry] of Object.entries(defensiveAbilities.effects)) {
        // Skip if ability only has weather/terrain conditionals
        if (!entry.resists && !entry.addedType) {
            const onlyWeatherTerrain = (entry.conditionalResistances || []).every(
                (cr) => cr.condition.type === "weather" || cr.condition.type === "terrain"
            );
            if (onlyWeatherTerrain) continue;
        }
        names.add(name);
    }
    return [...names].sort();
}

const defensiveAbilityNames = getAllDefensiveAbilityNames();
const DMG_CATEGORIES = new Set(["Physical", "Special", "Contact"]);

// Helper: collect values from a map category for selected abilities
function forEachAbilityIn(category, abilities, collector) {
    for (const abi of abilities) {
        const val = category[abi];
        if (val) collector(val, abi);
    }
}

// Helper: get usable types (filter out None, Stellar, Mystery)
function getUsableTypes() {
    return gameData.typeT.filter(
        (t) => t !== "None" && t !== "Stellar" && t !== "Mystery",
    );
}

// --- Dropdown ---

const dropdownStates = {};

function closeAllDropdowns() {
    $(".tc-dropdown-list").hide();
    for (const id in dropdownStates) dropdownStates[id].isOpen = false;
}

function setupDropdown(btnId, options) {
    const btn = $(`#${btnId}`);
    const list = btn.next(".tc-dropdown-list");
    dropdownStates[btnId] = { isOpen: false };

    function buildList(filter) {
        const frag = document.createDocumentFragment();
        const query = (filter || "").toLowerCase();
        const currentValue = btn[0].dataset.value;
        for (const opt of options) {
            if (query && opt.value && !opt.label.toLowerCase().includes(query)) continue;
            const div = document.createElement("div");
            div.textContent = opt.label;
            div.dataset.value = opt.value;
            if (opt.value && opt.value === currentValue) div.className = "tc-dropdown-selected";
            div.onmousedown = (ev) => {
                ev.preventDefault();
                selectOption(opt);
            };
            frag.append(div);
        }
        list.empty();
        list[0].appendChild(frag);
    }

    function selectOption(opt) {
        btn.val(opt.label);
        btn[0].dataset.value = opt.value;
        closeList();
        btn[0].blur();
        updateReadonly();
        recalculate();
    }

    function openList(filter) {
        closeAllDropdowns();
        buildList(filter);
        list.show();
        dropdownStates[btnId].isOpen = true;
    }

    function closeList() {
        list.hide();
        dropdownStates[btnId].isOpen = false;
    }

    function updateReadonly() {
        btn[0].readOnly = !btn[0].dataset.value;
    }

    buildList();
    updateReadonly();

    btn.off("focus").on("focus", () => {
        if (btn[0].readOnly) return;
        btn.val("");
        openList("");
    });

    btn.off("input").on("input", () => openList(btn.val()));

    btn.off("blur").on("blur", () => {
        closeList();
        const match = options.find((o) => o.value === btn[0].dataset.value);
        btn.val(match ? match.label : "-- None --");
    });

    btn.off("mousedown").on("mousedown", (ev) => {
        if (dropdownStates[btnId].isOpen) {
            ev.preventDefault();
            closeList();
            btn[0].blur();
            return;
        }
        if (btn[0].readOnly) {
            ev.preventDefault();
            btn[0].readOnly = false;
            btn.val("");
            btn[0].focus();
            openList("");
        }
    });
}

// --- Init ---

export function populateTypeCalc() {
    const types = getUsableTypes();
    const typeOptions = types.map((t) => ({ label: t, value: t }));
    const noneOption = { label: "-- None --", value: "" };

    setupDropdown("typecalc-type1", typeOptions);
    $("#typecalc-type1").val(types[0]);
    $("#typecalc-type1")[0].dataset.value = types[0];

    setupDropdown("typecalc-type2", [noneOption, ...typeOptions]);
    $("#typecalc-type2")[0].dataset.value = "";

    const abilityOptions = [noneOption, ...defensiveAbilityNames.map((n) => ({ label: n, value: n }))];
    for (let i = 0; i < 4; i++) {
        setupDropdown(`typecalc-abi${i}`, abilityOptions);
        $(`#typecalc-abi${i}`)[0].dataset.value = "";
    }

    $(document).off("click.typecalc").on("click.typecalc", (ev) => {
        if (!$(ev.target).closest(".tc-dropdown-wrap").length) closeAllDropdowns();
    });

    recalculate();
}

// --- Calculation ---

function getSelectedAbilities() {
    const seen = new Set();
    const result = [];
    for (let i = 0; i < 4; i++) {
        const val = $(`#typecalc-abi${i}`)[0].dataset.value;
        if (val && !seen.has(val)) {
            seen.add(val);
            result.push(val);
        }
    }
    return result;
}

function recalculate() {
    const type1 = $("#typecalc-type1")[0].dataset.value;
    if (!type1) {
        $("#typecalc-result").empty();
        return;
    }
    const type2 = $("#typecalc-type2")[0].dataset.value || "";
    const defTypes = [type1];
    if (type2 && type2 !== type1) defTypes.push(type2);

    const abilities = getSelectedAbilities();

    // Collect added types from effects
    const addedTypes = [];
    forEachAbilityIn(defensiveAbilities.effects, abilities, (entry) => {
        if (entry.addedType && !defTypes.includes(entry.addedType) && !addedTypes.includes(entry.addedType)) {
            addedTypes.push(entry.addedType);
        }
    });

    // Collect all resist modifiers from unified effects map
    const typeMultipliers = {};
    const dmgMods = { Physical: 100, Special: 100, Contact: 100 };
    const allDefTypes = [...defTypes, ...addedTypes];
    const attackTypes = getUsableTypes();

    function applyResistance(resistances) {
        for (const r of resistances) {
            if (DMG_CATEGORIES.has(r.damageSource)) {
                dmgMods[r.damageSource] *= r.multiplier;
            } else if (r.damageSource !== "SE") {
                // TODO: apply SE resist to calculation
                typeMultipliers[r.damageSource] = (typeMultipliers[r.damageSource] ?? 1) * r.multiplier;
            }
        }
    }

    forEachAbilityIn(defensiveAbilities.effects, abilities, (entry) => {
        if (entry.resists) applyResistance(entry.resists);
        if (entry.conditionalResistances) {
            for (const cr of entry.conditionalResistances) {
                if (cr.condition.type === "type" && allDefTypes.includes(cr.condition.value)) {
                    applyResistance(cr.resistance);
                }
                // TODO: add weather/terrain conditional resistance calcualtion
            }
        }
    });

    // Calculate type effectiveness
    const coverage = {};

    for (const atkT of attackTypes) {
        let eff = 1;
        for (const defT of allDefTypes) {
            eff *= getTypeEffectiveness(atkT, defT);
        }
        if (typeMultipliers[atkT] !== undefined) eff *= typeMultipliers[atkT];
        (coverage[eff] ??= []).push(atkT);
    }

    // Build ability effect summaries
    const abilityEffects = buildAbilityEffects(abilities);

    renderResult(coverage, defTypes, addedTypes, abilityEffects, dmgMods);
}

// --- Effect Summary ---

function formatResistance(resistances) {
    const typeResists = resistances.filter((r) => !DMG_CATEGORIES.has(r.damageSource));
    const dmgResists = resistances.filter((r) => DMG_CATEGORIES.has(r.damageSource));
    const parts = [];
    if (typeResists.length) {
        const sorted = [...typeResists].sort((a, b) => a.multiplier - b.multiplier);
        for (const r of sorted) {
            let text = r.multiplier === 0 ? `${r.damageSource} immune` : `${r.damageSource} x ${r.multiplier}`;
            if (r.bonusEffect) text += `, ${r.bonusEffect}`;
            parts.push(text);
        }
    }
    if (dmgResists.length) {
        const allSame = dmgResists.length > 1 && dmgResists.every((r) => r.multiplier === dmgResists[0].multiplier);
        if (allSame) {
            parts.push(`All moves x ${dmgResists[0].multiplier}`);
        } else {
            for (const r of dmgResists) {
                let text = `${r.damageSource} moves x ${r.multiplier}`;
                if (r.bonusEffect) text += `, ${r.bonusEffect}`;
                parts.push(text);
            }
        }
    }
    return parts.join(" | ");
}

const effectFormatters = [
    ["effects", (v) => {
        const parts = [];
        if (v.addedType) parts.push(`+${v.addedType} type`);
        if (v.resists) parts.push(formatResistance(v.resists));
        if (v.conditionalResistances) {
            for (const cr of v.conditionalResistances) {
                parts.push(`${formatResistance(cr.resistance)} (if ${cr.condition.value})`);
            }
        }
        return parts.join(" | ");
    }],
];

function buildAbilityEffects(abilities) {
    const results = [];
    for (const abi of abilities) {
        const effects = [];
        for (const [key, fmt] of effectFormatters) {
            const val = defensiveAbilities[key][abi];
            if (val) effects.push(fmt(val));
        }
        if (effects.length) results.push({ name: abi, effects });
    }
    return results;
}

// --- Render ---
// TODO: add weather/terrain selector for global type modifiers and apply conditional resistances calcualtion
function renderResult(coverage, baseTypes, addedTypes, abilityEffects, dmgMods) {
    const container = $("#typecalc-result");
    container.empty();

    // Effective typing row
    const infoRow = e("div", "typecalc-info-row");
    for (const t of baseTypes) {
        const badge = e("div", `${t.toLowerCase()} type`);
        badge.append(e("span", "span-align", t));
        infoRow.append(badge);
    }
    for (const t of addedTypes) {
        const badge = e("div", `${t.toLowerCase()} type`);
        badge.append(e("span", "span-align", "+" + t));
        infoRow.append(badge);
    }
    container.append(infoRow);

    // Ability effect rows
    abilityEffects.forEach((abi, i) => {
        const row = e("div", "typecalc-abi-info");
        row.append(e("div", "typecalc-abi-name color" + (i % 2 ? "A" : "B"), abi.name));
        row.append(e("div", "typecalc-abi-effects color" + (i % 2 ? "C" : "D"), abi.effects.join(" | ")));
        container.append(row);
    });

    // Physical / Special / Contact modifiers
    const modRow = e("div", "typecalc-dmg-mods");
    for (const category of ["Physical", "Special", "Contact"]) {
        const percentage = dmgMods[category];
        const mod = e("div", "typecalc-dmg-mod");
        mod.append(e("div", "typecalc-dmg-label", category));
        const valClass = percentage < 100 ? "typecalc-dmg-val resist" : "typecalc-dmg-val";
        mod.append(e("div", valClass, Math.round(percentage) + "%"));
        modRow.append(mod);
    }
    container.append(modRow);

    // Coverage rows
    const frag = document.createDocumentFragment();
    for (const mult of Object.keys(coverage).sort((a, b) => Number(a) - Number(b))) {
        const row = e("div", "typecalc-coverage-row");
        const mulDiv = e("div", "typecalc-coverage-mul");
        mulDiv.append(e("span", "span-align", mult));
        row.append(mulDiv);

        const typeList = e("div", "typecalc-coverage-list");
        for (const type of coverage[mult]) {
            const colorDiv = e("div", `${type.toLowerCase()} type`);
            colorDiv.append(e("span", "span-align", type.substr(0, 5)));
            typeList.append(colorDiv);
        }
        row.append(typeList);
        frag.append(row);
    }
    container.append(frag);
}
