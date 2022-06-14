/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config/symbols.ts":
/*!*******************************!*\
  !*** ./src/config/symbols.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"defaultSymbol\": () => (/* binding */ defaultSymbol),\n/* harmony export */   \"nameSymbol\": () => (/* binding */ nameSymbol)\n/* harmony export */ });\nconst nameSymbol = Symbol(\"name\");\r\nconst defaultSymbol = Symbol(\"default\");\r\n\n\n//# sourceURL=webpack://bda-engine/./src/config/symbols.ts?");

/***/ }),

/***/ "./src/core/entity.ts":
/*!****************************!*\
  !*** ./src/core/entity.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Entity\": () => (/* binding */ Entity)\n/* harmony export */ });\n/* harmony import */ var _utils_classmap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/classmap */ \"./src/utils/classmap.ts\");\n\r\nclass Entity {\r\n    id;\r\n    /** @internal */\r\n    world;\r\n    components;\r\n    constructor(id) {\r\n        this.id = id;\r\n        this.components = new _utils_classmap__WEBPACK_IMPORTED_MODULE_0__.ClassMap();\r\n    }\r\n    get(key) {\r\n        return this.components.get(key);\r\n    }\r\n    add(instance, name) {\r\n        this.components.add(instance, name);\r\n        this.world?.queryEvent(this, name ? name : instance.class);\r\n        return this;\r\n    }\r\n    has(component) {\r\n        return this.components.has(component);\r\n    }\r\n    remove(name) {\r\n        this.components.delete(name);\r\n        this.world?.queryEvent(this, (0,_utils_classmap__WEBPACK_IMPORTED_MODULE_0__.keyify)(name));\r\n        return this;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://bda-engine/./src/core/entity.ts?");

/***/ }),

/***/ "./src/core/query.ts":
/*!***************************!*\
  !*** ./src/core/query.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"FastQuery\": () => (/* binding */ FastQuery),\n/* harmony export */   \"Query\": () => (/* binding */ Query),\n/* harmony export */   \"QueryContainer\": () => (/* binding */ QueryContainer),\n/* harmony export */   \"QueryManager\": () => (/* binding */ QueryManager)\n/* harmony export */ });\n/* harmony import */ var _utils_classmap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/classmap */ \"./src/utils/classmap.ts\");\n\r\n//#region Query impls\r\nclass QueryContainer {\r\n    checker;\r\n    entities = new Set();\r\n    interestedEvents = new Set();\r\n    constructor(checker) {\r\n        this.checker = checker;\r\n    }\r\n    check(entity) {\r\n        if (this.checker(entity)) {\r\n            this.entities.add(entity);\r\n        }\r\n        else {\r\n            this.entities.delete(entity);\r\n        }\r\n    }\r\n    // Useful for when entity is removed from the world\r\n    remove(entity) {\r\n        this.entities.delete(entity);\r\n    }\r\n}\r\nclass FastQuery extends QueryContainer {\r\n    [Symbol.iterator]() {\r\n        return this.entities.values();\r\n    }\r\n}\r\nclass Foo {\r\n    number = 5;\r\n}\r\nclass Bar {\r\n    str = \"5\";\r\n}\r\nclass Query extends QueryContainer {\r\n    types;\r\n    constructor(types, checker = (ent) => true) {\r\n        super((ent) => this.types.every((comp) => ent.has(comp)) && checker(ent));\r\n        this.types = types.map(_utils_classmap__WEBPACK_IMPORTED_MODULE_0__.keyify);\r\n    }\r\n    *[Symbol.iterator]() {\r\n        for (const entity of this.entities.values()) {\r\n            yield [...this.types.map(entity.get, entity), entity];\r\n        }\r\n    }\r\n}\r\n//#endregion\r\n//#region query manager\r\nclass QueryManager {\r\n    queries = new Map();\r\n    eventsToQueries = new Map();\r\n    add(query, id) {\r\n        this.queries.set(id, query);\r\n        for (const event of query.interestedEvents) {\r\n            if (!this.eventsToQueries.has(event)) {\r\n                this.eventsToQueries.set(event, new Set());\r\n            }\r\n            this.eventsToQueries.get(event).add(id);\r\n        }\r\n    }\r\n    get(queryID) {\r\n        return this.queries.get(queryID);\r\n    }\r\n    remove(queryID) {\r\n        const query = this.queries.get(queryID);\r\n        if (query) {\r\n            for (const event of query.interestedEvents) {\r\n                this.eventsToQueries.get(event).delete(queryID);\r\n            }\r\n        }\r\n        this.queries.delete(queryID);\r\n    }\r\n    clear() {\r\n        this.queries.clear();\r\n        this.eventsToQueries.clear();\r\n    }\r\n    event(event, entity) {\r\n        if (this.eventsToQueries.has(event)) {\r\n            for (const queryID of this.eventsToQueries.get(event)) {\r\n                this.queries.get(queryID).check(entity);\r\n            }\r\n        }\r\n    }\r\n    removeEntity(entity) {\r\n        this.queries.forEach((query) => query.remove(entity));\r\n    }\r\n    addEntity(entity) {\r\n        this.queries.forEach((query) => query.check(entity));\r\n    }\r\n}\r\n//#endregion\r\n\n\n//# sourceURL=webpack://bda-engine/./src/core/query.ts?");

/***/ }),

/***/ "./src/core/system.ts":
/*!****************************!*\
  !*** ./src/core/system.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"SystemManager\": () => (/* binding */ SystemManager)\n/* harmony export */ });\n/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/logger */ \"./src/utils/logger.ts\");\n\r\nclass SystemManager {\r\n    world;\r\n    systems = new Set();\r\n    enabledSystems = [];\r\n    logger = new _utils_logger__WEBPACK_IMPORTED_MODULE_0__.Logger(\"Systems\", _utils_logger__WEBPACK_IMPORTED_MODULE_0__.LoggerColors.purple);\r\n    constructor(world) {\r\n        this.world = world;\r\n    }\r\n    addPureSystem(system, enabled = true) {\r\n        this.systems.add(system);\r\n        if (enabled)\r\n            this.enabledSystems.push(system);\r\n        system(this.world, true);\r\n        this.logger.info(`Added system ${system.name}`);\r\n    }\r\n    addSystem(system, enabled = true) {\r\n        // DANGER ZONE\r\n        // Check if the compiler has edited this one (it was marked with @system)\r\n        // @ts-ignore\r\n        if (system(this.world, true) !== \"__system__\") {\r\n            this.logger.error(`Refusing to add a system that was not marked with the \"@system\" tag`);\r\n            return;\r\n        }\r\n        this.systems.add(system);\r\n        if (enabled)\r\n            this.enabledSystems.push(system);\r\n        this.logger.info(`Added system ${system.name}`);\r\n    }\r\n    enableSystem(system) {\r\n        this.enabledSystems.push(system);\r\n        this.logger.log(`Enabled ${system.name} system`);\r\n    }\r\n    disableSystem(system) {\r\n        const index = this.enabledSystems.indexOf(system);\r\n        if (index === -1)\r\n            return this.logger.log(\"Can not disable system that was never enabled\");\r\n        this.enabledSystems.splice(index, 1);\r\n        this.logger.log(`Disabled ${system.name} system`);\r\n    }\r\n    update(...systems) {\r\n        if (systems.length === 0)\r\n            systems = this.enabledSystems;\r\n        systems.forEach((sys) => sys(this.world, false));\r\n    }\r\n    updateComplex(fn, disabled = false) {\r\n        if (disabled) {\r\n            this.systems.forEach((system) => {\r\n                if (fn(system)) {\r\n                    system(this.world, false);\r\n                }\r\n            });\r\n        }\r\n        else {\r\n            this.enabledSystems.forEach((system) => {\r\n                if (fn(system)) {\r\n                    system(this.world, false);\r\n                }\r\n            });\r\n        }\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://bda-engine/./src/core/system.ts?");

/***/ }),

/***/ "./src/core/world.ts":
/*!***************************!*\
  !*** ./src/core/world.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"World\": () => (/* binding */ World)\n/* harmony export */ });\n/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/assert */ \"./src/utils/assert.ts\");\n/* harmony import */ var _utils_classmap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/classmap */ \"./src/utils/classmap.ts\");\n/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/logger */ \"./src/utils/logger.ts\");\n/* harmony import */ var _query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./query */ \"./src/core/query.ts\");\n/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./system */ \"./src/core/system.ts\");\n\r\n\r\n\r\n\r\n\r\n// Holds resources & entities for the world\r\nclass World {\r\n    resources = new _utils_classmap__WEBPACK_IMPORTED_MODULE_1__.ClassMap();\r\n    entities = new Map();\r\n    logger = new _utils_logger__WEBPACK_IMPORTED_MODULE_2__.Logger(\"world\", _utils_logger__WEBPACK_IMPORTED_MODULE_2__.LoggerColors.blue);\r\n    systemManager = new _system__WEBPACK_IMPORTED_MODULE_4__.SystemManager(this);\r\n    queryManager = new _query__WEBPACK_IMPORTED_MODULE_3__.QueryManager();\r\n    constructor() {\r\n        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(!window.GLOBAL_WORLD, \"Multiple worlds not yet supported\");\r\n        //@ts-ignore\r\n        window.GLOBAL_WORLD = this;\r\n    }\r\n    // Entity Stuff\r\n    addEntity(entity) {\r\n        if (this.entities.has(entity.id)) {\r\n            this.logger.warn(`Added entity with ID ${String(entity.id)} twice`);\r\n        }\r\n        this.entities.set(entity.id, entity);\r\n        entity.world = this;\r\n        this.queryManager.addEntity(entity);\r\n    }\r\n    removeEntity(id) {\r\n        const entity = this.entities.get(id);\r\n        (0,_utils_assert__WEBPACK_IMPORTED_MODULE_0__.assert)(entity, \"Can not remove entity that was never added\");\r\n        this.queryManager.removeEntity(entity);\r\n        this.entities.delete(\"id\");\r\n    }\r\n    getEntity(id) {\r\n        return this.entities.get(id);\r\n    }\r\n    // Resource stuff\r\n    addRes(res, key) {\r\n        this.resources.add(res, key);\r\n    }\r\n    removeRes(key) {\r\n        if (!this.resources.delete(key)) {\r\n            this.logger.warn(`Can not remove resource ${String(key)} because it was never added`);\r\n        }\r\n    }\r\n    getRes(key) {\r\n        return this.resources.get(key);\r\n    }\r\n    // System stuff\r\n    addSystem(system, enabled = true) {\r\n        this.systemManager.addSystem(system, enabled);\r\n    }\r\n    addPureSystem(system, enabled = true) {\r\n        this.systemManager.addPureSystem(system, enabled);\r\n    }\r\n    enableSystem(system) {\r\n        this.systemManager.enableSystem(system);\r\n    }\r\n    disableSystem(system) {\r\n        this.systemManager.disableSystem(system);\r\n    }\r\n    update(...systems) {\r\n        this.systemManager.update(...systems);\r\n    }\r\n    updateComplex(fn, disabled = false) {\r\n        this.systemManager.updateComplex(fn, disabled);\r\n    }\r\n    // Query stuff\r\n    addQuery(query, id) {\r\n        this.queryManager.add(query, id);\r\n        this.entities.forEach((ent) => query.check(ent));\r\n    }\r\n    removeQuery(queryID) {\r\n        this.queryManager.remove(queryID);\r\n    }\r\n    getQuery(queryID) {\r\n        return this.queryManager.get(queryID);\r\n    }\r\n    /** @internal */\r\n    queryEvent(entity, event) {\r\n        this.queryManager.event(event, entity);\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://bda-engine/./src/core/world.ts?");

/***/ }),

/***/ "./src/exports.ts":
/*!************************!*\
  !*** ./src/exports.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ClassMap\": () => (/* reexport safe */ _utils_classmap__WEBPACK_IMPORTED_MODULE_7__.ClassMap),\n/* harmony export */   \"Entity\": () => (/* reexport safe */ _core_entity__WEBPACK_IMPORTED_MODULE_1__.Entity),\n/* harmony export */   \"FastQuery\": () => (/* reexport safe */ _core_query__WEBPACK_IMPORTED_MODULE_2__.FastQuery),\n/* harmony export */   \"Logger\": () => (/* reexport safe */ _utils_logger__WEBPACK_IMPORTED_MODULE_9__.Logger),\n/* harmony export */   \"LoggerColors\": () => (/* reexport safe */ _utils_logger__WEBPACK_IMPORTED_MODULE_9__.LoggerColors),\n/* harmony export */   \"PluginManager\": () => (/* reexport safe */ _utils_plugin_manager__WEBPACK_IMPORTED_MODULE_10__.PluginManager),\n/* harmony export */   \"Query\": () => (/* reexport safe */ _core_query__WEBPACK_IMPORTED_MODULE_2__.Query),\n/* harmony export */   \"QueryContainer\": () => (/* reexport safe */ _core_query__WEBPACK_IMPORTED_MODULE_2__.QueryContainer),\n/* harmony export */   \"QueryManager\": () => (/* reexport safe */ _core_query__WEBPACK_IMPORTED_MODULE_2__.QueryManager),\n/* harmony export */   \"SystemManager\": () => (/* reexport safe */ _core_system__WEBPACK_IMPORTED_MODULE_3__.SystemManager),\n/* harmony export */   \"World\": () => (/* reexport safe */ _core_world__WEBPACK_IMPORTED_MODULE_4__.World),\n/* harmony export */   \"assert\": () => (/* reexport safe */ _utils_assert__WEBPACK_IMPORTED_MODULE_6__.assert),\n/* harmony export */   \"defaultSymbol\": () => (/* reexport safe */ _config_symbols__WEBPACK_IMPORTED_MODULE_0__.defaultSymbol),\n/* harmony export */   \"generateID\": () => (/* reexport safe */ _utils_id__WEBPACK_IMPORTED_MODULE_8__.generateID),\n/* harmony export */   \"isKey\": () => (/* reexport safe */ _utils_classmap__WEBPACK_IMPORTED_MODULE_7__.isKey),\n/* harmony export */   \"keyify\": () => (/* reexport safe */ _utils_classmap__WEBPACK_IMPORTED_MODULE_7__.keyify),\n/* harmony export */   \"name\": () => (/* reexport safe */ _utils_plugin_manager__WEBPACK_IMPORTED_MODULE_10__.name),\n/* harmony export */   \"nameSymbol\": () => (/* reexport safe */ _config_symbols__WEBPACK_IMPORTED_MODULE_0__.nameSymbol),\n/* harmony export */   \"type\": () => (/* reexport safe */ _utils_type_id__WEBPACK_IMPORTED_MODULE_11__.type),\n/* harmony export */   \"typeID\": () => (/* reexport safe */ _utils_type_id__WEBPACK_IMPORTED_MODULE_11__.typeID),\n/* harmony export */   \"typeName\": () => (/* reexport safe */ _utils_type_id__WEBPACK_IMPORTED_MODULE_11__.typeName)\n/* harmony export */ });\n/* harmony import */ var _config_symbols__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config/symbols */ \"./src/config/symbols.ts\");\n/* harmony import */ var _core_entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/entity */ \"./src/core/entity.ts\");\n/* harmony import */ var _core_query__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/query */ \"./src/core/query.ts\");\n/* harmony import */ var _core_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/system */ \"./src/core/system.ts\");\n/* harmony import */ var _core_world__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./core/world */ \"./src/core/world.ts\");\n/* harmony import */ var _types_class__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./types/class */ \"./src/types/class.ts\");\n/* harmony import */ var _utils_assert__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/assert */ \"./src/utils/assert.ts\");\n/* harmony import */ var _utils_classmap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils/classmap */ \"./src/utils/classmap.ts\");\n/* harmony import */ var _utils_id__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils/id */ \"./src/utils/id.ts\");\n/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./utils/logger */ \"./src/utils/logger.ts\");\n/* harmony import */ var _utils_plugin_manager__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils/plugin_manager */ \"./src/utils/plugin_manager.ts\");\n/* harmony import */ var _utils_type_id__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./utils/type_id */ \"./src/utils/type_id.ts\");\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\n\n//# sourceURL=webpack://bda-engine/./src/exports.ts?");

/***/ }),

/***/ "./src/types/class.ts":
/*!****************************!*\
  !*** ./src/types/class.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n\r\n\n\n//# sourceURL=webpack://bda-engine/./src/types/class.ts?");

/***/ }),

/***/ "./src/utils/assert.ts":
/*!*****************************!*\
  !*** ./src/utils/assert.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"assert\": () => (/* binding */ assert)\n/* harmony export */ });\n/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ \"./src/utils/logger.ts\");\n\r\nconst logger = new _logger__WEBPACK_IMPORTED_MODULE_0__.Logger(\"assert\", _logger__WEBPACK_IMPORTED_MODULE_0__.LoggerColors.red);\r\nconst assert = (condition, message) => {\r\n    if (!condition) {\r\n        logger.error(\"Assertion Failed: \", message);\r\n        throw new Error(message);\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack://bda-engine/./src/utils/assert.ts?");

/***/ }),

/***/ "./src/utils/classmap.ts":
/*!*******************************!*\
  !*** ./src/utils/classmap.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ClassMap\": () => (/* binding */ ClassMap),\n/* harmony export */   \"isKey\": () => (/* binding */ isKey),\n/* harmony export */   \"keyify\": () => (/* binding */ keyify)\n/* harmony export */ });\n/* harmony import */ var _type_id__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./type_id */ \"./src/utils/type_id.ts\");\n\r\nconst isKey = (key) => {\r\n    return (typeof key === \"string\" ||\r\n        typeof key === \"number\" ||\r\n        typeof key === \"symbol\");\r\n};\r\nfunction keyify(key) {\r\n    return isKey(key) ? key : (0,_type_id__WEBPACK_IMPORTED_MODULE_0__.typeID)(key);\r\n}\r\nclass ClassMap {\r\n    map = new Map();\r\n    get size() {\r\n        return this.map.size;\r\n    }\r\n    get(key) {\r\n        return this.map.get(keyify(key));\r\n    }\r\n    has(key) {\r\n        return this.map.has(keyify(key));\r\n    }\r\n    add(instance, name) {\r\n        this.map.set(name === undefined ? (0,_type_id__WEBPACK_IMPORTED_MODULE_0__.typeID)(instance) : name, instance);\r\n        return this;\r\n    }\r\n    delete(key) {\r\n        return this.map.delete(keyify(key));\r\n    }\r\n    clear() {\r\n        this.map.clear();\r\n    }\r\n    forEach(callbackfn, thisArg) {\r\n        this.map.forEach(callbackfn, thisArg);\r\n    }\r\n    *entries() {\r\n        for (const [key, value] of this.map.entries()) {\r\n            yield [key, value];\r\n        }\r\n    }\r\n    *keys() {\r\n        for (const key of this.map.keys()) {\r\n            yield key;\r\n        }\r\n    }\r\n    *values() {\r\n        for (const value of this.map.values()) {\r\n            yield value;\r\n        }\r\n    }\r\n    [Symbol.iterator]() {\r\n        return this.entries();\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://bda-engine/./src/utils/classmap.ts?");

/***/ }),

/***/ "./src/utils/id.ts":
/*!*************************!*\
  !*** ./src/utils/id.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"generateID\": () => (/* binding */ generateID)\n/* harmony export */ });\nlet currentID = 0;\r\nconst generateID = () => (++currentID).toString(36);\r\n\n\n//# sourceURL=webpack://bda-engine/./src/utils/id.ts?");

/***/ }),

/***/ "./src/utils/logger.ts":
/*!*****************************!*\
  !*** ./src/utils/logger.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Logger\": () => (/* binding */ Logger),\n/* harmony export */   \"LoggerColors\": () => (/* binding */ LoggerColors)\n/* harmony export */ });\nvar LoggerColors;\r\n(function (LoggerColors) {\r\n    LoggerColors[\"red\"] = \"#E05267\";\r\n    LoggerColors[\"orange\"] = \"#E06552\";\r\n    LoggerColors[\"teal\"] = \"#52E0C4\";\r\n    LoggerColors[\"blue\"] = \"#5273E0\";\r\n    LoggerColors[\"blurple\"] = \"#5865F2\";\r\n    LoggerColors[\"purple\"] = \"#B852E0\";\r\n})(LoggerColors || (LoggerColors = {}));\r\nclass Logger {\r\n    tag;\r\n    color;\r\n    static tagPadding = 30;\r\n    constructor(tag, color) {\r\n        this.tag = tag;\r\n        this.color = color;\r\n    }\r\n    group(...info) {\r\n        console.groupCollapsed(...this.getEmojiStyleArr(\" \"), ...info);\r\n    }\r\n    groupEnd() {\r\n        console.groupEnd();\r\n    }\r\n    log(...info) {\r\n        console.log(...this.getEmojiStyleArr(\" \"), ...info);\r\n    }\r\n    info(...info) {\r\n        console.info(...this.getEmojiStyleArr(\"💬\"), ...info);\r\n    }\r\n    warn(...info) {\r\n        console.warn(...this.getEmojiStyleArr(\"⚠\"), ...info);\r\n    }\r\n    error(...info) {\r\n        console.error(...this.getEmojiStyleArr(\"❌\"), ...info);\r\n    }\r\n    getEmojiStyleArr(emoji) {\r\n        return [\r\n            `%c ${emoji}  %c ${this.tag.padEnd(Logger.tagPadding, \" \")} `,\r\n            `background: ${this.color ? this.color : \"#44484a\"}; color: #aaa; padding: 0 5px; border-top-left-radius: 4px; border-bottom-left-radius: 5px;`,\r\n            `background: ${this.color ? this.color + \"7f\" : \"#333438\"}; color: #aaa; border-top-right-radius: 4px; border-bottom-right-radius: 4px;`,\r\n        ];\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://bda-engine/./src/utils/logger.ts?");

/***/ }),

/***/ "./src/utils/plugin_manager.ts":
/*!*************************************!*\
  !*** ./src/utils/plugin_manager.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"PluginManager\": () => (/* binding */ PluginManager),\n/* harmony export */   \"name\": () => (/* binding */ name)\n/* harmony export */ });\n/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ \"./src/utils/logger.ts\");\n/* harmony import */ var _config_symbols__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config/symbols */ \"./src/config/symbols.ts\");\n\r\n\r\nconst name = (name) => (target) => {\r\n    target[_config_symbols__WEBPACK_IMPORTED_MODULE_1__.nameSymbol] = name;\r\n    return target;\r\n};\r\nclass PluginManager {\r\n    plugins = [];\r\n    static logger = new _logger__WEBPACK_IMPORTED_MODULE_0__.Logger(\"PluginManager\", _logger__WEBPACK_IMPORTED_MODULE_0__.LoggerColors.blue);\r\n    addPlugin(plugin) {\r\n        try {\r\n            PluginManager.logger.group(`Adding plugin ${plugin[_config_symbols__WEBPACK_IMPORTED_MODULE_1__.nameSymbol] || plugin.name}`);\r\n            plugin(this);\r\n            PluginManager.logger.groupEnd();\r\n            this.plugins.push(plugin);\r\n        }\r\n        catch (e) {\r\n            PluginManager.logger.error(`Failed to load plugin ${plugin[_config_symbols__WEBPACK_IMPORTED_MODULE_1__.nameSymbol] || plugin.name}: `);\r\n            PluginManager.logger.error(e);\r\n        }\r\n    }\r\n    addPlugins(plugins) {\r\n        PluginManager.logger.group(`Adding plugins ${plugins[_config_symbols__WEBPACK_IMPORTED_MODULE_1__.nameSymbol] || \"\"}`.trim());\r\n        plugins.forEach((plugin) => this.addPlugin(plugin));\r\n        PluginManager.logger.groupEnd();\r\n    }\r\n    hasPlugin(plugin) {\r\n        return this.plugins.includes(plugin);\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://bda-engine/./src/utils/plugin_manager.ts?");

/***/ }),

/***/ "./src/utils/type_id.ts":
/*!******************************!*\
  !*** ./src/utils/type_id.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"type\": () => (/* binding */ type),\n/* harmony export */   \"typeID\": () => (/* binding */ typeID),\n/* harmony export */   \"typeName\": () => (/* binding */ typeName)\n/* harmony export */ });\n/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ \"./src/utils/logger.ts\");\n\r\nconst type = Symbol(\"type\");\r\nconst logger = new _logger__WEBPACK_IMPORTED_MODULE_0__.Logger(\"TypeId\");\r\nlet currentType = 0;\r\nconst typeName = (id) => (target) => {\r\n    target[type] = id;\r\n    return target;\r\n};\r\nconst typeID = (object) => {\r\n    if (typeof object === \"function\") {\r\n        return classID(object);\r\n    }\r\n    if (object.constructor[type] === undefined) {\r\n        object.constructor[type] = (currentType++).toString();\r\n        logger.info(`Created type id for ${object.constructor.name}`);\r\n    }\r\n    return object.constructor[type];\r\n};\r\nconst classID = (constructor) => {\r\n    if (constructor[type] === undefined) {\r\n        constructor[type] = (currentType++).toString();\r\n        logger.info(`Created type id for ${constructor.name}`);\r\n    }\r\n    return constructor[type];\r\n};\r\n\n\n//# sourceURL=webpack://bda-engine/./src/utils/type_id.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/exports.ts");
/******/ 	
/******/ })()
;