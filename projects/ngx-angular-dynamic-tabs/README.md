# ngx-angular-dynamic-tabs

Dynamic, multi-instance tabs for Angular with an imperative `createTab()` API. Drop any component into a tab at runtime — no template wiring, no global state, multiple panels per app.

Inspired by the tab UX of IDEs and browsers: open from anywhere, close (with optional confirm), reorder by drag, middle-click to close, keep state when switching tabs.

## Features

- **Imperative API** — `panel.createTab(MyComponent, { label, icon, inputs })`.
- **Multi-instance** — every `<ngx-angular-dynamic-tabs>` is its own world. Multiple panels on the same screen, fully isolated.
- **Typed component inputs** — pass `@Input()` values via the `inputs` option. Autocomplete works (`InputSignal<T>` is unwrapped to `T`).
- **4 style variants** — `flat`, `pill`, `chrome`, `underline`.
- **Optional close confirmation** — sync or async callback at component or per-tab level.
- **Drag-to-reorder** via `@angular/cdk/drag-drop`.
- **Middle-click to close**.
- **State preservation** — switching tabs detaches the view; the component instance stays alive (counters, form state, etc. survive).
- **Accessible** — keyboard navigation, `role="tab"`, `aria-selected`, `focus-visible` outline.
- **No Angular Material dependency** — just CDK + custom CSS variables.
- **Zero hardcoded i18n** — empty state via content projection.

## Installation

```bash
npm install ngx-angular-dynamic-tabs @angular/cdk
```

Peer dependencies:
- `@angular/core` ^19
- `@angular/common` ^19
- `@angular/cdk` ^19

## Quick start

```ts
import { Component, viewChild } from '@angular/core';
import { NgxAngularDynamicTabsComponent } from 'ngx-angular-dynamic-tabs';
import { UsersComponent } from './users.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NgxAngularDynamicTabsComponent],
  template: `
    <button (click)="openUsers()">+ Users</button>
    <ngx-angular-dynamic-tabs #tabs>
      <div empty>No tabs open. Pick something from the menu.</div>
    </ngx-angular-dynamic-tabs>
  `,
})
export class Shell {
  tabs = viewChild.required(NgxAngularDynamicTabsComponent);

  openUsers() {
    this.tabs().createTab(UsersComponent, {
      label: 'Users',
      icon: '👥',
    });
  }
}
```

## Passing inputs to the tab component

If your component uses signal-based inputs:

```ts
@Component({ selector: 'app-user-detail', /* ... */ })
class UserDetailComponent {
  readonly userId = input.required<number>();
  readonly readonly = input(false);
}
```

You pass them with full type safety:

```ts
const ref = this.tabs().createTab(UserDetailComponent, {
  label: 'User #42',
  inputs: { userId: 42, readonly: true },
  //         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ autocompleted, type-checked
});

// Update later
ref?.setInputs({ readonly: false });
```

> **Note**: Only signal inputs (`input()`) are typed in the `inputs` option. Decorator-based `@Input()` properties still work at runtime (the lib calls `ComponentRef.setInput()`), but you'll lose autocomplete for them.

## Style variants

Switch the visual style with the `variant` input:

```html
<ngx-angular-dynamic-tabs [variant]="'pill'" />
```

Available variants:

| Variant | Look |
|---|---|
| `flat` *(default)* | Square tabs, separator lines, bottom-border indicator on active. |
| `pill` | Rounded pill tabs, active tab filled with accent color. |
| `chrome` | Top-rounded corners, active tab "lifts" with subtle shadow. |
| `underline` | No backgrounds — just text with a colored underline on active. |

## Confirming close

Sometimes you want to ask the user before closing a tab (e.g. unsaved changes). The lib doesn't render any modal — it calls your callback. Use whatever dialog system you have (`MatDialog`, SweetAlert, native `confirm()`, etc.).

The callback can return `boolean` (sync) or `Promise<boolean>` (async). Return `true` to close, `false` to cancel.

### Component-level (applies to every tab in this panel)

```ts
@Component({
  template: `<ngx-angular-dynamic-tabs [confirmClose]="confirmAll" />`,
})
class Shell {
  // Sync
  confirmAll = (tab: TabInfo) => window.confirm(`Close "${tab.label}"?`);

  // Or async — use any dialog system
  // confirmAll = async (tab: TabInfo) => {
  //   const ref = this.dialog.open(ConfirmDialog, { data: tab });
  //   return (await firstValueFrom(ref.afterClosed())) === true;
  // };
}
```

### Per-tab (only this specific tab)

Useful for the "dirty document" pattern — only prompt for tabs with unsaved changes.

```ts
panel.createTab(EditorComponent, {
  label: 'Untitled.md',
  confirmClose: (tab) =>
    window.confirm(`"${tab.label}" has unsaved changes. Close anyway?`),
});
```

Per-tab takes precedence over component-level if both are set.

## Multiple panels per page

Each instance is fully isolated. Two panels = two independent tab systems:

```ts
@Component({
  template: `
    <section>
      <h2>Customers</h2>
      <ngx-angular-dynamic-tabs #customersTabs />
    </section>

    <section>
      <h2>Inventory</h2>
      <ngx-angular-dynamic-tabs #inventoryTabs />
    </section>
  `,
})
class Shell {
  customers = viewChild.required<NgxAngularDynamicTabsComponent>('customersTabs');
  inventory = viewChild.required<NgxAngularDynamicTabsComponent>('inventoryTabs');

  openCustomer() { this.customers().createTab(CustomerListComponent); }
  openProduct()  { this.inventory().createTab(ProductListComponent); }
}
```

No services, no global state. Closing a tab in one panel never affects the other.

## API reference

### Component: `<ngx-angular-dynamic-tabs>`

#### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `maxTabs` | `number` | `0` | Max open tabs. `0` = unlimited. When reached, `createTab()` returns `null`. |
| `defaultClosable` | `boolean` | `true` | Whether new tabs render a close button by default. Override per tab via `closable`. |
| `variant` | `'flat' \| 'pill' \| 'chrome' \| 'underline'` | `'flat'` | Visual variant. |
| `confirmClose` | `(tab: TabInfo) => boolean \| Promise<boolean>` \| `null` | `null` | Called before closing any tab in this panel. Return `true` to allow. |

#### Outputs

| Output | Payload | Description |
|---|---|---|
| `tabOpened` | `TabInfo` | A tab was just opened. |
| `tabClosed` | `TabInfo` | A tab was just closed (after the confirm callback returned `true`). |
| `activeChange` | `TabInfo \| null` | The active tab changed. `null` when no tabs are open. |

#### Public methods

| Method | Returns | Description |
|---|---|---|
| `createTab<T>(component: Type<T>, options?: TabOptions<T>)` | `TabRef<T> \| null` | Open a new tab. Returns `null` if `maxTabs` is reached. |
| `selectTab(index: number)` | `void` | Activate the tab at `index`. |

#### Public signals

| Signal | Type | Description |
|---|---|---|
| `tabs()` | `TabInfo[]` | Currently open tabs (in display order). |
| `activeIndex()` | `number` | Index of the active tab. |
| `hasReachedLimit()` | `boolean` | `true` when `maxTabs > 0` and the limit is hit. |

#### Content projection

Project an element with the `empty` attribute — shown when there are no open tabs:

```html
<ngx-angular-dynamic-tabs>
  <div empty>Nothing open. Pick something from the menu.</div>
</ngx-angular-dynamic-tabs>
```

### `TabOptions<T>`

```ts
interface TabOptions<T> {
  label?: string;
  icon?: string;          // any string — rendered as plain text (emoji, icon-font ligature, letter)
  inputs?: ComponentInputs<T>;  // typed: signal inputs are unwrapped to their value types
  closable?: boolean;     // overrides defaultClosable for this tab
  confirmClose?: (tab: TabInfo) => boolean | Promise<boolean>;  // per-tab override
  data?: unknown;         // free-form metadata for your own use
}
```

### `TabRef<T>`

Returned from `createTab()`. Lets you control the tab after creation.

```ts
interface TabRef<T> {
  readonly id: number;
  readonly componentRef: ComponentRef<T>;   // direct access to the mounted component instance
  close(): Promise<boolean>;                 // resolves to whether the close actually happened (confirm may cancel)
  activate(): void;
  setLabel(label: string): void;
  setInputs(inputs: ComponentInputs<T>): void;
}
```

Example — reacting to events from the mounted component:

```ts
const ref = this.tabs().createTab(EditorComponent, { label: 'Untitled' });
ref?.componentRef.instance.saved.subscribe((name: string) => {
  ref.setLabel(name);  // rename the tab when the editor saves
});
```

### `TabInfo`

```ts
interface TabInfo {
  id: number;
  label: string;
  icon: string;
  closable: boolean;
}
```

## Theming

All styles are CSS custom properties on the host element. Override any of them at any level — host, ancestor, or `:root`.

```css
ngx-angular-dynamic-tabs {
  /* Theme colors */
  --ngx-tabs-bg: #f5f5f5;
  --ngx-tabs-bg-hover: #e8e8e8;
  --ngx-tabs-bg-active: #ffffff;
  --ngx-tabs-border: #d0d0d0;
  --ngx-tabs-text: #333;
  --ngx-tabs-text-muted: #777;
  --ngx-tabs-accent: #1976d2;

  /* Typography */
  --ngx-tabs-font-family: inherit;
  --ngx-tabs-font-size: 13px;
  --ngx-tabs-font-weight: 400;
  --ngx-tabs-font-weight-active: 600;

  /* Sizing */
  --ngx-tabs-strip-height: 38px;
  --ngx-tabs-padding-y: 6px;
  --ngx-tabs-padding-x: 12px;
  --ngx-tabs-gap: 8px;
  --ngx-tabs-radius: 0px;
  --ngx-tabs-min-width: 80px;
  --ngx-tabs-max-width: 220px;

  /* Active indicator (the underline bar) */
  --ngx-tabs-indicator-thickness: 2px;
  --ngx-tabs-indicator-color: var(--ngx-tabs-accent);

  /* Close button */
  --ngx-tabs-close-size: 18px;
  --ngx-tabs-close-opacity: 0.55;
  --ngx-tabs-close-hover-bg: rgba(0, 0, 0, 0.08);

  /* Motion + accessibility */
  --ngx-tabs-transition: 160ms cubic-bezier(0.4, 0, 0.2, 1);
  --ngx-tabs-focus-outline: 2px solid var(--ngx-tabs-accent);
}
```

### Dark theme example

```css
ngx-angular-dynamic-tabs.dark {
  --ngx-tabs-bg: #1e1e1e;
  --ngx-tabs-bg-hover: #2a2a2a;
  --ngx-tabs-bg-active: #313131;
  --ngx-tabs-border: #444;
  --ngx-tabs-text: #ddd;
  --ngx-tabs-text-muted: #888;
  --ngx-tabs-accent: #4ec9b0;
}
```

```html
<ngx-angular-dynamic-tabs class="dark" />
```

## Icons

The `icon` option is a plain string. It's rendered as-is inside a `<span>`. You can pass:

- An emoji: `'👥'`
- A Material Icons ligature: `'person'` *(consumer must load the font globally)*
- A single letter: `'A'`
- Anything else: HTML is not parsed; just text content.

The component does not bundle any icon set — that's the consumer's choice.

## Accessibility

- Tabs render with `role="tab"` and `aria-selected`.
- Close buttons have `aria-label="Close <tab label>"`.
- Tab items are focusable (`tabindex="0"`) and respond to `Enter`.
- `focus-visible` outline is themable via `--ngx-tabs-focus-outline`.

## Behavior notes

- **State preservation**: When you switch tabs, the previous tab's view is `detach`-ed from the DOM but **not destroyed**. Component instance, signals, form values, etc. all survive until the tab is actually closed.
- **Async close**: The close button, middle-click, and `TabRef.close()` are all async-aware — they `await` your `confirmClose` callback before removing the tab.
- **`createTab` returns `null` when**: the panel hasn't initialized its view container yet (rare), or `maxTabs` is set and reached.
- **Reordering**: The internal `componentRefs` array stays in sync with the `tabs` order — no surprises after a drag.

## License

MIT