"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
const kit = __importStar(require("@harveyr/github-actions-kit"));
const checks_1 = require("./checks");
const eslint_1 = require("./eslint");
// It appears the setup-node step adds a "problem matcher" that will catch lints
// and create annotations automatically!
const POST_ANNOTATIONS = false;
function postCheckRun(text, lints) {
    return __awaiter(this, void 0, void 0, function* () {
        const annotations = lints.map(checks_1.getAnnotationForLint);
        const conclusion = checks_1.getCheckRunConclusion(lints);
        yield kit.postCheckRun({
            githubToken: core.getInput('github-token'),
            name: 'ESLint',
            conclusion,
            // eslint-disable-next-line @typescript-eslint/camelcase
            summary: `${annotations.length} lints reported`,
            text,
            annotations: POST_ANNOTATIONS ? annotations : [],
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = core.getInput('working-directory');
        const patterns = core
            .getInput('patterns')
            .split(' ')
            .map(p => {
            return p.trim();
        })
            .filter(p => {
            return p.length > 0;
        });
        // Cause the version to be printed to the logs. We want to make sure we're
        // using the version in the repo under test, not the one from this repo.
        yield eslint_1.getEslintVersion({ cwd });
        let lints = [];
        let output = '';
        if (patterns.length) {
            output = yield eslint_1.runEslint(patterns, { cwd });
            lints = eslint_1.parseEslints(output);
        }
        yield postCheckRun(output, lints);
    });
}
run().catch(err => {
    core.setFailed(`${err}`);
});
