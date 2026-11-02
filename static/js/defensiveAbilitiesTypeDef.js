/**
 * @typedef { "Normal" | "Fighting" | "Fire"| "Ice" | "Electric" | "Bug" | "Flying" | "Steel" | "Grass" | "Ground" | "Poison" | "Dark" | "Water" | "Psychic" | "Rock" | "Dragon" | "Ghost" | "Fairy" | "Mystery" | "None" | "Stellar" } PokeTypes
 */

/**
 * @typedef { "Physical" | "Special" | "Contact"} DamageSource
 */

/**
 * @typedef DefensiveAbilityAddedTypes
 * @property {PokeTypes} addedType
 */

/**
 * @typedef DefensiveAbilityConditionalCondition
 * @property {string} type
 * @property {string} value
 */
/**
 * @typedef DefensiveAbilityConditional
 * @property {DefensiveAbilityConditionalCondition} condition
 * @property {DefensiveAbilityResist} resistance
 */

/**
 * @typedef DefensiveAbilityConditionalArray
 * @property {Array.<DefensiveAbilityConditional>} conditionalResistances
 */
/**
 * @typedef {Object} DefensiveAbilityResist
 * @property {PokeTypes | DamageSource} damageSource
 * @property {number} multiplier
 * @property {string} [bonusEffect]
 */

/**
 * @typedef {Object} DefensiveAbilityResistArray
 * @property {Array.<DefensiveAbilityResist>} resists
 */
/**
 * @typedef {DefensiveAbilityResistArray | DefensiveAbilityConditionalArray | DefensiveAbilityAddedTypes } DefensiveAbility
 */
/**
 * @typedef {Object} DefensiveAbilitiesExport
 * @property {Object.<string, DefensiveAbility>} effects
 */
