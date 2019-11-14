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
const core = __importStar(require("@actions/core"));
const exec_1 = require("./exec");
const ESLINT_PATH = 'node_modules/.bin/eslint';
const ESLINT_REGEXP = /(\S+): line (\d+), col (\d+), (\w+) - (.+)/;
function parseEslintLine(line) {
    line = line.trim();
    if (!line) {
        return null;
    }
    const match = ESLINT_REGEXP.exec(line);
    if (!match || !match.length) {
        core.warning(`No match found for line: ${line}`);
        return null;
    }
    return {
        filePath: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        severity: match[4].toLowerCase(),
        message: match[5],
    };
}
exports.parseEslintLine = parseEslintLine;
function getEslintVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const { stdout } = yield exec_1.captureOutput('node', [ESLINT_PATH, '--version'], {
            failOnStdErr: true,
        });
        return stdout;
    });
}
exports.getEslintVersion = getEslintVersion;
function runEslint(patterns, opt = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        opt.failOnStdErr = false;
        const args = [ESLINT_PATH, '--format=compact', '--quiet'].concat(patterns);
        const { stdout, stderr } = yield exec_1.captureOutput('node', args, opt);
        const lines = stderr.split('\n');
        const lints = [];
        for (const line of lines) {
            const lint = parseEslintLine(line);
            if (lint) {
                lints.push(lint);
            }
        }
        return stdout + stderr;
    });
}
exports.runEslint = runEslint;
function parseEslints(output) {
    const lines = output.split('\n');
    const lints = [];
    for (const line of lines) {
        const lint = parseEslintLine(line);
        if (lint) {
            lints.push(lint);
        }
    }
    return lints;
}
exports.parseEslints = parseEslints;
