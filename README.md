# Create Next Contentful App

The easiest way to get started with Next.js + Contenful is by using `create-next-contentful-app`. This CLI tool enables you to quickly start building a new Next.js + Contentful application, with everything set up for you. To get started, use the following command:

### Interactive

You can create a new project interactively by running:

```bash
npx create-next-contentful-app@latest
# or
yarn create next-contentful-app
# or
pnpm create next-contentful-app
# or
bunx create-next-contentful-app
```

You will be asked for the name of your project, and then whether you want to
create a TypeScript project:

```bash
✔ Would you like to create the content model and import the initial data to your Contentful space? … No / Yes
```

Select **Yes** to install the initial contentful model and content examples.

### Non-interactive

You can also pass command line arguments to set up a new project
non-interactively. See `create-next-app --help`:

```bash
Usage: create-next-contentful-app <project-directory> [options]

Options:
  -v, --version                          Output the current version

  --debug                                Output extra debugging (default: false)

  --cf-space-id <contentful-space-id>    ID of your Contentful space
  
  --cf-cda-token <contentful-cda-token>  Contentful delivery access token to query your contentful space/environment

  --cf-env <contentful-environment>      Contentful environment identifier

  -h, --help                             display help for command
```

### Why use Create Next App?

`create-next-contentful-app` allows you to create a new Next.js + Contentful app within seconds. It is updated periodically maintained the lastest stable versions of Next.js and the packages needed for the project to run correctly, and includes a number of benefits:

- **Interactive Experience**: Running `npx create-next-contentful-app@latest` (with no arguments) launches an interactive experience that guides you through setting up a project.
