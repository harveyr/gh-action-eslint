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
const eslint = __importStar(require("eslint"));
const core = __importStar(require("@actions/core"));
// TODO: Use a TS import once this is fixed: https://github.com/actions/toolkit/issues/199
// import * as github from '@actions/github'
const github = require('@actions/github');
const { GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_WORKSPACE } = process.env;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!GITHUB_WORKSPACE) {
            core.setFailed('GITHUB_WORKSPACE not set. This should happen automatically.');
            return;
        }
        if (!GITHUB_REPOSITORY) {
            return core.setFailed('GITHUB_REPOSITORY was not set');
        }
        if (!GITHUB_SHA) {
            return core.setFailed('GITHUB_SHA was not set');
        }
        const patterns = core
            .getInput('patterns')
            .split(' ')
            .map(p => {
            return p.trim();
        })
            .filter(p => {
            return p.length > 0;
        });
        const workingDir = core.getInput('working-directory');
        console.log(`Running ESLint against ${patterns} from dir ${workingDir ? workingDir : 'cwd'}`);
        const opts = {};
        if (workingDir) {
            opts.cwd = workingDir;
        }
        const cli = new eslint.CLIEngine(opts);
        const report = cli.executeOnFiles(patterns);
        const { results } = report;
        const annotations = [];
        for (const result of results) {
            const { filePath, messages } = result;
            const path = filePath.substring(GITHUB_WORKSPACE.length + 1);
            for (const msg of messages) {
                const { line, severity, ruleId, message } = msg;
                annotations.push({
                    path,
                    start_line: line,
                    end_line: line,
                    annotation_level: getAnnotationLevel(severity),
                    message: `[${ruleId}] ${message}`,
                });
            }
        }
        const repoData = github.context.payload.repository;
        if (!repoData) {
            return core.setFailed('repository not found');
        }
        const [owner, repo] = GITHUB_REPOSITORY.split('/');
        core.debug(`Found Github owner ${owner}, repo ${repo}`);
        const githubToken = core.getInput('github-token');
        if (!githubToken) {
            return core.setFailed('github-token is required');
        }
        const client = new github.GitHub(githubToken);
        console.log(`Posting ${annotations.length} annotations`);
        return client.checks.create({
            name: 'ESLint',
            conclusion: annotations.length ? 'failure' : 'success',
            head_sha: GITHUB_SHA,
            owner,
            repo,
            output: {
                title: 'ESLint',
                summary: `${annotations.length} lints reported`,
                annotations,
            },
        });
    });
}
function getAnnotationLevel(severity) {
    if (severity === 1) {
        return 'warning';
    }
    if (severity === 2) {
        return 'failure';
    }
    return 'notice';
}
run().catch(err => {
    core.error(err);
    core.setFailed(`${err}`);
});
