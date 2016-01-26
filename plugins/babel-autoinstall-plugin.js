'use strict';

const util = require('util');
const execSync = require('child_process').execSync;

const ignoreModules = [
    'react-heatpack-script-alias',
    'babel-runtime'
];

const isModule = (module) => {
    const isModule = !!module[0].match(/\w/);
    return isModule && ignoreModules.indexOf(module) === -1;
};

const anyMissing = (problems) => {
    return problems.some(p => p.match(/missing/));
};

const getInstalledModules = () => {
    try {
        let result = execSync('npm ls -s --depth=0 --json').toString();
        let installedModules = JSON.parse(result).dependencies || {};
        return installedModules;
    } catch (e1) {
        try {
            let result = JSON.parse(e1.stdout.toString());
            if (anyMissing(result.problems || [])) {
                console.log('Some deps in package.json are missing, installing');
                execSync('npm install');
                return getInstalledModules();
            } else {
                return result.dependencies;
            }
        } catch (e2) {
            throw new Error('Error trying to determine installed modules: ' + e1.message);
        }
    }

};

module.exports = function(options) {
    let installedModules = getInstalledModules();

    const isInstalled = (module) => {
        return !!installedModules[module];
    }

    const install = (module) => {
        console.log(`Found missing npm module: ${module}, installing`);
        console.log(execSync(`npm install ${module}`).toString());
        installedModules[module] = {
            byUs: true
        };
    };

    return {
        visitor: {
            ImportDeclaration(path, state) {
                let filename = state.file.opts.filename;
                let module = path.node.source.value.split('/')[0];
                if (isModule(module) && !isInstalled(module)) {
                    install(module);
                }
            }
        }
    }
}
