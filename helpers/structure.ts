import { execSync } from "child_process";

import fs from "fs";
import path from "path";
import chalk from "chalk";

const createProjectFolder = (projectName: string) => {
  const currentPath = process.cwd();
  const projectPath = path.join(currentPath, projectName);

  try {
    fs.mkdirSync(projectPath);
    console.log(
      `The folder «${chalk.green(projectPath)}» was created successfully.`
    );
  } catch (err: any) {
    if (err.code === "EEXIST") {
      console.log(
        `The folder «${chalk.yellow(
          projectName
        )}» already exists in the current directory, please give it another name.`
      );
    } else {
      console.log(chalk.red(err.message));
    }

    process.exit(1);
  }
};

const cloneNextJsTemplate = async (
  projectName: string,
  cfVars: Record<string, string>
) => {
  try {
    console.log(`Creating Next.js + Contentful APP`);
    console.log();

    await execSync(
      `npx degit github:Aplyca/next-contentful-template ${projectName}`,
      {
        stdio: "inherit",
      }
    );

    const envString = Object.entries(cfVars)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const envFilePath = projectName + "/.env";
    const packageJsonPath = projectName + "/package.json";

    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    packageJson.name = projectName;

    fs.writeFileSync(envFilePath, envString);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(`Project created successfully, please run the following command to run your project:`);
    console.log(`   ${chalk.green('cd')} ${chalk.gray(projectName)}`);
    console.log(`   ${chalk.green('yarn|npm|bun|pnpm')} ${chalk.gray('install')}`);
    console.log(`   ${chalk.green('yarn|npm|bun|pnpm')} ${chalk.gray('run dev')}`);
    console.log();
    console.log(`Remember, the project has Docker implemented and with «${chalk.green('make')}» commands you can manage yor project; see README.md for more.`);
  } catch (error) {
    console.error("Error creating the APP project, reason:", error);
  }
};

export { createProjectFolder, cloneNextJsTemplate };
