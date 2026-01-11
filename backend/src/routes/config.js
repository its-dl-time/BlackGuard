import { getContracts } from '../config/contracts.js';
export function configHandler(req, res) {
    const contracts = getContracts();
    res.json({ contracts });
}
//# sourceMappingURL=config.js.map