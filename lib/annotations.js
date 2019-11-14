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
const GITHUB_WORKSPACE = kit.getWorkspace();
function getAnnotationLevel(severity) {
    if (severity === 'error') {
        return 'failure';
    }
    // not sure what the actual string is yet
    if (severity.indexOf('warn') === 0) {
        return 'warning';
    }
    return 'notice';
}
function getAnnotationForLint(lint) {
    const { filePath, line, message, severity } = lint;
    const path = filePath.substring(GITHUB_WORKSPACE.length + 1);
    return {
        path,
        // eslint-disable-next-line @typescript-eslint/camelcase
        startLine: line,
        // eslint-disable-next-line @typescript-eslint/camelcase
        level: getAnnotationLevel(severity),
        message,
    };
}
exports.getAnnotationForLint = getAnnotationForLint;
