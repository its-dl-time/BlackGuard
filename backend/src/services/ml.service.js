import { spawn } from 'child_process';
import path from 'path';
export class MLService {
    scriptPath;
    timeoutMs;
    constructor(scriptPath = path.join(process.cwd(), '..', 'ml', 'run_risk_with_template.py'), timeoutMs = 10000) {
        this.scriptPath = scriptPath;
        this.timeoutMs = timeoutMs;
    }
    async getRiskScore(input) {
        try {
            const output = await this.callPythonScript(input);
            const parsed = JSON.parse(output);
            if (typeof parsed.risk_score === 'number' && parsed.risk_score >= 0 && parsed.risk_score <= 1) {
                return parsed.risk_score;
            }
            else {
                console.warn('Malformed ML output, using mock data');
                return 0.5;
            }
        }
        catch (error) {
            console.error('ML service error:', error);
            return 0.5; // Mock data
        }
    }
    async callPythonScript(input) {
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [this.scriptPath, input.strategy, input.market, input.orderType], {
                cwd: path.dirname(this.scriptPath),
            });
            let stdout = '';
            let stderr = '';
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout.trim());
                }
                else {
                    reject(new Error(`Python script exited with code ${code}: ${stderr}`));
                }
            });
            pythonProcess.on('error', (error) => {
                reject(error);
            });
            // Timeout
            setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('ML script timeout'));
            }, this.timeoutMs);
        });
    }
}
//# sourceMappingURL=ml.service.js.map