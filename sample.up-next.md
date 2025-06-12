The purpose of this file is to outline incremental changes that can be made to the codebase to improve the user experience. 

This checklist breaks down the larger task into bite-sized, sequential tasks.  Knock them out one at a time to avoid big-bang changes.

1. [ ] **Unify Search Field & Button Height**  
   * Replicate the fix proposed in `sample.up-next.md` task 1.  
   * Swap inline `py-*` utilities for the shared height token `h-12` on **both** the input and button.

2. [ ] **Extract Environment & Endpoint Logic**  
   * The `functionPath` and related boolean flags currently live inside the component.  
   * Create `src/utils/getSmartSearchEndpoint.ts` that returns the correct URL based on `import.meta.env`.  
   * Replace inline logic with a single call, e.g. `const functionPath = getSmartSearchEndpoint();`.

3. [ ] **Debounce Search Requests**  
   * Implement a simple `useDebounce` hook (or pull in one from `src/utils/`) to wait ~300 ms after the user stops typing before firing `handleSearch`.  
   * Retain "Enter" key behaviour and the explicit **Search** button as fallbacks.

4. [ ] **Improve Accessibility**  
   * Add `aria-label="Search"` to the button.  
   * Ensure decorative icons have `aria-hidden="true"`.  
   * Confirm the input is properly associated with a `<label>` (can be visually hidden).

5. [ ] **Extract Reusable `SearchTag` Component**  
   * The four quick-search buttons share nearly identical markup.  
   * Create a tiny `SearchTag.tsx` that accepts `label`, `icon`, and `presetQuery` props.  
   * Replace the duplicated buttons with `<SearchTag … />` instances.

6. [ ] **Swap to Consistent Icon Style**  
   * Choose either **outline** or **solid** (per sample task 7).  
   * Update imports accordingly for the main search icon and quick-search tags.

7. [ ] **Split UI & Fetch Logic**  
   * Move `handleSearch` and related state (`results`, `isLoading`, `error`) into a custom hook `useSmartSearch`.  
   * Keeps the component focused on rendering concerns; improves testability.

8. [ ] **Unit Tests with Vitest**  
   * Cover the new hook (`useSmartSearch`) with success & error scenarios.  
   * Snapshot-test the refactored component to catch unintended markup drift.

9. [ ] **Update Storybook / Docs (if applicable)**  
   * If a component library is in use, write a Storybook story showing the default state, loading, and error states.

10. [ ] **Biome & TypeScript Validation**  
    * Run `npm run lint`, `npm run check:typescript`, and `npm run test` to verify the refactor is clean.
