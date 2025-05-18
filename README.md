# ENreco Archive

## Installation

1. Install dependencies:
    ```bash
    pnpm install
    ```

Note: You might need you install all the shadcn radix dependency manually if it asks you too, I don't know how to get around this yet

2. Start the development server:
    ```bash
    pnpm dev
    ```

Note: You only need to care about the "View" stuff in "./view", the editor stuff is only for developent (it's also gross to look at))

## Stack

- ShadCN (https://ui.shadcn.com/)
- TailwindCSS
- React
- React Flow

## Structure
This is a monorepo, meaning that there are multiple projects contained in this one repo.

### Quick Repo Breakdown
- apps -> contains the built applications.
  - editor -> editor for the data for the website (@enreco-archive/enreco-charts-editor)
  - website -> the actual website itself (@enreco-archive/enreco-charts)
- packages -> contains supporting libraries
  - common -> shared utils/definitions for all apps in the apps folder
  - common-ui -> shared React components (shadcn components should go here). also contains the base theme
  - eslint-config/prettier-config/typescript-config -> project wide configuation for eslint/prettier/typescript
  - vaul-1.1.2-patched -> our own patched version of vaul
- scripts -> contains scripts that are used in the build process
- shared_resources -> contains assets (images, etc) that are shared and copied to all apps in the apps folder
