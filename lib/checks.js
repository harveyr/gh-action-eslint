"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const kit = __importStar(require("@harveyr/github-actions-kit"));
function getAnnotationLevel(severity) {
    if (severity === 'error') {
        return 'failure';
    }
    // not sure what the actual string is yet
    if (severity === 'warning') {
        return 'warning';
    }
    return 'notice';
}
function getAnnotationForLint(lint) {
    const { filePath, line, message, severity } = lint;
    const path = filePath.substring(kit.getWorkspace().length + 1);
    return {
        path,
        startLine: line,
        level: getAnnotationLevel(severity),
        message,
    };
}
exports.getAnnotationForLint = getAnnotationForLint;
function getCheckRunConclusion(lints) {
    if (!lints.length) {
        return 'success';
    }
    const errorLint = lints.find(lint => {
        return lint.severity === 'error';
    });
    if (errorLint) {
        return 'failure';
    }
    return 'neutral';
}
exports.getCheckRunConclusion = getCheckRunConclusion;
