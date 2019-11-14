"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec = __importStar(require("@actions/exec"));
function captureOutput(command, args, opt = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { cwd, failOnStdErr } = opt;
        if (cwd) {
            console.log('Running in subdir: %s', cwd);
        }
        let stdout = '';
        let stderr = '';
        yield exec.exec(command, args, {
            cwd,
            failOnStdErr,
            ignoreReturnCode: failOnStdErr === false,
            listeners: {
                stdout: (data) => {
                    stdout += data.toString();
                },
                stderr: (data) => {
                    stderr += data.toString();
                },
            },
        });
        stdout = stdout.trim();
        stderr = stderr.trim();
        return { stdout, stderr };
    });
}
exports.captureOutput = captureOutput;
