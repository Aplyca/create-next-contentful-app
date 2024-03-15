import pjson from "../package.json";

import { exec, execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import chalk from "chalk";
import prompts from "prompts";
import { onPromptState } from "..";

const starter =
  process.platform == "darwin"
    ? "open"
    : process.platform == "win32"
    ? "start"
    : "xdg-open";

const getInfoData = async (
  message: string,
  initial: string = ""
): Promise<string> => {
  const prompInfo = await prompts({
    onState: onPromptState,
    type: "text",
    name: "value",
    message,
    initial,
    validate: (text) => {
      if (text.trim()) {
        return true;
      }

      return "Can't be empty";
    },
  });

  return prompInfo.value.trim();
};

const checkUrlManagerInstall = async () => {
  try {
    const confirmUrlManager = await prompts({
      onState: onPromptState,
      type: "confirm",
      name: "value",
      message: `Have you installed the Contentful's app named ${chalk.blue(
        "«URL manager»"
      )} in your space?`,
      initial: false,
    });

    if (!confirmUrlManager.value) {
      console.log(
        `Please install and enable the ${chalk.blue(
          "«URL manager»"
        )} ${chalk.grey("(opening browser)...")}`
      );

      exec(
        `${starter} https://app.contentful.com/deeplink\?link\=apps\&id\=kLjkQFK44rW7yaGJq4vQj`
      );

      await prompts({
        onState: onPromptState,
        type: "invisible",
        name: "value",
        message: `Once you installed it in your Contentful space, press enter to continue.`,
        initial: false,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const createContentfulModel = async (
  spaceId: string,
  envromentId: string,
  cmaToken: string,
  contentfulLocale: string = "en-US"
) => {
  console.log("Creating initial content model...");
  console.log();

  const errorLogFile = path.join(os.tmpdir(), `${pjson.name}_error.log.json`);

  try {
    const currentPath = process.cwd();

    const fileName = "templates/contentful-export.json";
    const newFileName = `templates/contentful-export_${contentfulLocale}.json`;
    const newFileNamePath = path.join(currentPath, newFileName);

    const data = fs.readFileSync(fileName, "utf8");
    const newData = data.replace(/\[CF_LOCALE\]/g, contentfulLocale);
    fs.writeFileSync(newFileNamePath, newData);

    await execSync(
      `npx contentful space import --space-id ${spaceId} --environment-id ${envromentId} --management-token ${cmaToken} --content-file ${newFileNamePath} --error-log-file ${errorLogFile}`,
      {
        stdio: "inherit",
      }
    );
  } catch (err: any) {
    console.error(
      `Someting went wrong creating importing contenful data, check the error log file «${chalk.red(
        errorLogFile
      )}»`
    );
    process.exit(1);
  }
};

const executeContentfulStuffs = async (
  options: Record<string, string>
): Promise<Record<string, string>> => {
  const confirmContentfulInstall = await prompts({
    onState: onPromptState,
    type: "confirm",
    name: "value",
    message: `Would you like to create the content model and import the initial data to your Contentful space?`,
    initial: false,
  });

  if (confirmContentfulInstall.value) {
    const contentfulCMAToken = await getInfoData(
      `Please, provide the ${chalk.blue(
        "Contentful CMA Token"
      )} to create the content model and import data:`
    );
    const contentfulLocale = await getInfoData(
      `Please provide the ${chalk.blue(
        "Contentful default locale"
      )} to create the content model and import data:`,
      "en-US"
    );

    const contentfulCDAToken =
      options?.cfCdaToken ??
      (await getInfoData(
        `Please provide the ${chalk.blue(
          "Contentful CDA Token"
        )} to add it to your project:`
      ));
    const contentfulPreviewToken =
      options?.cfCdaToken ??
      (await getInfoData(
        `Please provide the ${chalk.blue(
          "Contentful Preview Token"
        )} token to add it to your project:`
      ));
    const contentfulEnv =
      options?.cfEnv ??
      (await getInfoData(
        `Please provide the ${chalk.blue(
          "Contentful Environment"
        )} id to add it to your project:`,
        "master"
      ));
    const contentfulSpaceId =
      options?.cfSpaceId ??
      (await getInfoData(
        `Please provide the ${chalk.blue(
          "Contentful Space ID"
        )} to add it to your project:`
      ));

    await checkUrlManagerInstall();
    await createContentfulModel(
      contentfulSpaceId,
      contentfulEnv,
      contentfulCMAToken,
      contentfulLocale
    );

    return {
      CONTENTFUL_DELIVERY_API_TOKEN: contentfulCDAToken,
      CONTENTFUL_ENVIRONMENT: contentfulEnv,
      CONTENTFUL_SPACE_ID: contentfulSpaceId,
      CONTENTFUL_PREVIEW_API_TOKEN: contentfulPreviewToken,
      CONTENTFUL_DEFAULT_LOCALE: contentfulLocale,
    };
  }

  return {};
};

export default executeContentfulStuffs;
