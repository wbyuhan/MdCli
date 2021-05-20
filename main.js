#!/usr/bin/env node

const { program } = require('commander')
const path = require('path');
const Handlebars = require('handlebars');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const fs = require('fs');
const ora = require('ora');
const chalk = require("chalk");
const { runInstall } = require('./utils/addDepence');
const { queryArr } = require('./utils/inquireArr');
const { projectSuccess, noPackageJSON, pullFailed, queryError, info } = require('./utils/outPutFun');

const version = '1.0.1';
program
    .command("info")
    .description("描述包")
    .action(() => {
        info();
    })

program
    .version(version)
    .command('init <name>')
    .description('初始化模版')
    .action((projectName) => {
        const targetPath = path.resolve(process.cwd(), projectName);
        if (fs.existsSync(targetPath)) {
            console.log(chalk.red("当前文件名已存在! 请重新输入!"));
            return;
        }
        inquirer.prompt(queryArr).then((paramater) => {
            console.log("paramater", paramater)
            const spinner = ora("模板下载中^.^ 请稍后")
            spinner.start();
            paramater = {...paramater, version }
            download('direct:https://github.com/wbyuhan/egg-ts-cloud.git', targetPath, { clone: true }, (err) => {
                console.error(err)
                if (!err) {
                    spinner.succeed()
                    const packagePath = path.join(targetPath, 'package.json');
                    if (fs.existsSync(packagePath)) {
                        const content = fs.readFileSync(packagePath).toString();
                        const template = Handlebars.compile(content);
                        const result = template(paramater);
                        fs.writeFileSync(packagePath, result);
                    } else {
                        spinner.fail();
                        noPackageJSON()
                        return
                    }
                    console.log(chalk.green("success！ 项目初始化成功") + '\n');
                    runInstall(targetPath, () => projectSuccess(projectName));
                } else {
                    pullFailed();
                    return;
                }
            })
        }).catch((error) => {
            queryError(error);
            return;
        })
    })
program.parse(process.argv)