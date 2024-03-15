import { execSync } from "child_process";

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { getContentfulInfo } from "./contentful";

const FILES_TO_UPDATE = [
  "src/app/providers.tsx",
  "src/services/entry-content.service.ts",
  "src/services/page-content.service.ts",
  "docker-compose.yml",
  "README.md",
];

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

const updateTextInFiles = (projectName: string, defaultLocale: string) => {
  const projectNameMin = projectName.toLowerCase();
  const projectNameMax = projectName.toUpperCase().replace("-", "_");

  console.log();
  
  for (const file of FILES_TO_UPDATE) {
    const filePath = path.join(projectName, file);
    console.log('Updating file: ' + filePath);

    let fileContent = fs.readFileSync(filePath, "utf-8");

    fileContent = fileContent.replace(/\[PROJECT_NAME_MIN\]/g, projectNameMin);
    fileContent = fileContent.replace(/\[PROJECT_NAME_MAY\]/g, projectNameMax);
    fileContent = fileContent.replace(/\[DEFAULT_LOCALE\]/g, defaultLocale);
    fileContent = fileContent.replace(/\[PROJECT_NAME\]/g, projectName);

    fs.writeFileSync(filePath, fileContent, "utf8");
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

    const cfOptions = await getContentfulInfo(cfVars);

    const envString = Object.entries(cfOptions)
      .filter(([key]) => key !== "CONTENTFUL_DEFAULT_LOCALE")
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const envFilePath = projectName + "/.env";
    const packageJsonPath = projectName + "/package.json";

    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    packageJson.name = projectName;

    fs.writeFileSync(envFilePath, envString, "utf8");
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");
    updateTextInFiles(projectName, cfOptions.CONTENTFUL_DEFAULT_LOCALE);

    console.log();
    console.log(
      `Project created successfully, please run the following command to run your project:`
    );
    console.log(`   ${chalk.green("cd")} ${chalk.gray(projectName)}`);
    console.log(
      `   ${chalk.green("yarn|npm|bun|pnpm")} ${chalk.gray("install")}`
    );
    console.log(
      `   ${chalk.green("yarn|npm|bun|pnpm")} ${chalk.gray("run dev")}`
    );
    console.log();
    console.log(
      `Remember, the project has Docker implemented and with «${chalk.green(
        "make"
      )}» commands you can manage yor project; see README.md for more.`
    );
  } catch (error) {
    console.error("Error creating the APP project, reason:", error);
  }
};

export { createProjectFolder, cloneNextJsTemplate };
