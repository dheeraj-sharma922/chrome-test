"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_functions_1 = require("firebase-functions");
const rest_1 = require("../../express/rest");
const firebase_1 = require("../firebase");
// Initialize Rest API
const express = rest_1.rest(firebase_1.db);
const settings = {
    timeoutSeconds: 30,
    memory: '512MB'
};
exports = module.exports = firebase_functions_1.runWith(settings).https.onRequest(express);
//# sourceMappingURL=api.js.map