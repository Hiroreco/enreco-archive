# ENreco Archive

A fan project dedicated to archiving (almost) everything that transpired during the events of ENigmatic Recollection.

## Installation

1. Install dependencies:

    ```bash
    pnpm install
    ```

2. Start the development server:
    ```bash
    pnpm dev
    ```

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
