This `ui` folder includes all the UI components fetched from https://universal-design.vercel.app/.
The idea is to keep the modular components separated from the main app logic.

Components from the library are added using the command:

```bash
npx shadcn@latest add @universal-components/<component-name>
```

For example, to add a Select component, you would run:

```bash
npx shadcn@latest add @universal-components/select
```

It will check against the registry (set in `components.json`), install dependencies and generate the necessary files to use the Select component in the project.

For exmaple, for the Select component, it will:
- install `lucide-react` if not already installed.
- create `src/components/ui/select.tsx`: The main Select component file.
- create `src/components/ui/button.tsx`: The Button component needed to the Select.

Be careful it might generate files with incomplete imports, so you might need to fix paths and import missing/required components manually.

Find the list of available components at https://universal-design.vercel.app/docs/components.

Make sure to check the [Universal Design documentation](https://universal-design-docs.vercel.app/) for more details.
