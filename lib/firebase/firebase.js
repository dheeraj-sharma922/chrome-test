"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const admin = require("firebase-admin");
// Initialize our project application
admin.initializeApp();
// Set up database connection
const firestoreDb = admin.firestore();
firestoreDb.settings({ timestampsInSnapshots: true, ignoreUndefinedProperties: true });
// Export our references
exports.db = firestoreDb;
//# sourceMappingURL=firebase.js.map