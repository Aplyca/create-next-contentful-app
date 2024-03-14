#!/usr/bin/env node
import pjson from "./package.json";

import path from "path";

import chalk from "chalk";
import { program } from "commander";
import prompts, { type InitialReturnValue } from "prompts";

import executeContentfulStuffs from "./helpers/contentful";
import { validateNpmName } from "./helpers/validate-pkg";
import { cloneNextJsTemplate, createProjectFolder } from "./helpers/structure";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

export const onPromptState = (state: {
  value: InitialReturnValue;
  aborted: boolean;
  exited: boolean;
}) => {
  if (state.aborted) {
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

program
  .name(pjson.name)
  .description(pjson.description)
  .arguments("<project-directory>")
  .action((name) => {
    projectPath = name;
  })
  .usage(`${chalk.grey("[options]")} ${chalk.green("<project-directory>")}`)
  .version(pjson.version, "-v, --version", "output the current version");

program
  .option("--debug", "Output extra debugging", false)
  .option("--cf-space-id <contentful-space-id>", "ID of your Contentful space")
  .option(
    "--cf-cda-token <contentful-cda-token>",
    "Contentful delivery access token to query your contentful space/environment"
  )
  .option(
    "--cf-env <contentful-environment>",
    "Contentful environment identifier"
  )
  .allowUnknownOption();

program.parse(process.argv);

(async () => {
  const options = program.opts();
  const { debug } = options;

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems[0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green(
          "<project-directory>"
        )}\n` +
        "For example:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green("my-next-app")}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const validation = validateNpmName(projectName);
  if (!validation.valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    );

    validation.problems.forEach((p) =>
      console.error(`    ${chalk.red(chalk.bold("*"))} ${p}`)
    );
    process.exit(1);
  }

  if (debug) console.log("Options:", options);

  try {
    const cfVars = await executeContentfulStuffs(options);
    await cloneNextJsTemplate(projectName, cfVars);
  } catch (reason) {
    console.log();
    console.log("Aborting installation.", reason);
    console.log();
  } finally {
    process.exit(0);
  }
})();
