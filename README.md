# ngx-angular-dynamic-tabs

[![npm version](https://img.shields.io/npm/v/ngx-angular-dynamic-tabs.svg)](https://www.npmjs.com/package/ngx-angular-dynamic-tabs)
[![license](https://img.shields.io/npm/l/ngx-angular-dynamic-tabs.svg)](LICENSE)

Dynamic, multi-instance tabs for Angular with an imperative `createTab()` API. Drop any component into a tab at runtime — no template wiring, no global state, multiple panels per app.

> 📖 **Full documentation, API reference, theming and examples**: [projects/ngx-angular-dynamic-tabs/README.md](projects/ngx-angular-dynamic-tabs/README.md)

## Install

```bash
npm install ngx-angular-dynamic-tabs @angular/cdk
```

## Quick example

```ts
import { Component, viewChild } from '@angular/core';
import { NgxAngularDynamicTabsComponent } from 'ngx-angular-dynamic-tabs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NgxAngularDynamicTabsComponent],
  template: `
    <button (click)="open()">+ Users</button>
    <ngx-angular-dynamic-tabs #tabs />
  `,
})
export class Shell {
  tabs = viewChild.required(NgxAngularDynamicTabsComponent);
  open() { this.tabs().createTab(UsersComponent, { label: 'Users', icon: '👥' }); }
}
```

## Repository layout

```
ngx-angular-dynamic-tabs/        ← this folder (the workspace root)
├── projects/
│   └── ngx-angular-dynamic-tabs/  ← the published library
│       ├── src/
│       ├── package.json
│       └── README.md              ← published npm README
├── package.json                   ← workspace (dev tooling)
└── ng-package config
```

## Developing locally

```bash
npm install                # install dev deps
npm run build              # build the library to ./dist
```

To test in a consumer app, point its `package.json` to the local tarball:

```bash
cd dist/ngx-angular-dynamic-tabs
npm pack                   # generates a .tgz
# then in your consumer app:
npm install /path/to/ngx-angular-dynamic-tabs/dist/ngx-angular-dynamic-tabs/ngx-angular-dynamic-tabs-0.1.0.tgz
```

**Tip**: when iterating on the library and reinstalling the tarball, clear the Vite dep cache in the consumer app before restarting the dev server — otherwise it serves the stale pre-bundled version:

```bash
rm -rf .angular/cache
```

## License

MIT © 2026 sudo-miau