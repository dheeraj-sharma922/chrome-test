"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckCommand = void 0;
class HealthCheckCommand {
    constructor(db) {
        this.db = db;
    }
    async execute() {
        await this.db.listCollections();
        return { success: true };
    }
}
exports.HealthCheckCommand = HealthCheckCommand;
//# sourceMappingURL=health-check.command.js.map