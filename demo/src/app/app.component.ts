import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  NgxAngularDynamicTabsComponent,
  TabsVariant,
} from 'ngx-angular-dynamic-tabs';

@Component({
  selector: 'app-counter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; padding: 24px; }
    h3 { margin: 0 0 12px; }
    p { color: #555; margin: 0 0 16px; }
    button {
      padding: 8px 16px; border-radius: 6px; border: 1px solid #ccc;
      cursor: pointer; background: #fff; font-size: 14px;
    }
    button:hover { background: #f5f5f5; }
  `,
  template: `
    <h3>Counter component</h3>
    <p>Tab content is a real Angular component. Try switching tabs and coming back — the counter state survives.</p>
    <button (click)="count.set(count() + 1)">Clicked {{ count() }} times</button>
  `,
})
class CounterComponent {
  readonly count = signal(0);
}

@Component({
  selector: 'app-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: block; padding: 24px; }
    h3 { margin: 0 0 12px; }
    pre {
      background: #f4f4f4; padding: 12px; border-radius: 6px;
      font-family: ui-monospace, monospace; font-size: 13px;
      white-space: pre-wrap; margin: 0;
    }
  `,
  template: `
    <h3>{{ title() }}</h3>
    <pre>{{ text() }}</pre>
  `,
})
class EditorComponent {
  readonly title = input('Editor');
  readonly text = input('Hello!');
}

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxAngularDynamicTabsComponent],
  styles: `
    :host {
      display: flex; flex-direction: column;
      height: 100vh; background: #fafafa;
    }
    header {
      padding: 16px 24px; background: #1e1e2e; color: #fff;
      display: flex; gap: 20px; align-items: center; flex-wrap: wrap;
    }
    header h1 { margin: 0; font-size: 18px; font-weight: 500; flex: 1; }
    header a {
      color: #a3e3ff; text-decoration: none; font-size: 13px;
    }
    header a:hover { text-decoration: underline; }
    .controls {
      padding: 12px 24px; background: #fff; border-bottom: 1px solid #e0e0e0;
      display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
    }
    .controls strong { font-size: 13px; color: #444; }
    .variant-btn {
      padding: 4px 12px; border-radius: 4px; border: 1px solid #ccc;
      background: #fff; cursor: pointer; font-size: 13px;
    }
    .variant-btn.active { background: #1976d2; color: #fff; border-color: #1976d2; }
    .open-btn {
      padding: 6px 14px; border-radius: 4px; border: 1px solid #1976d2;
      background: #1976d2; color: #fff; cursor: pointer; font-size: 13px;
    }
    .open-btn:hover { background: #1565c0; }
    .tabs-host {
      flex: 1; margin: 16px; background: #fff;
      border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      overflow: hidden; min-height: 0;
    }
    .empty {
      display: flex; align-items: center; justify-content: center;
      height: 100%; color: #aaa; font-style: italic;
    }
  `,
  template: `
    <header>
      <h1>ngx-angular-dynamic-tabs · live demo</h1>
      <a href="https://www.npmjs.com/package/ngx-angular-dynamic-tabs" target="_blank" rel="noopener">npm</a>
      <a href="https://github.com/sudo-miau/ngx-angular-dynamic-tabs" target="_blank" rel="noopener">GitHub</a>
    </header>

    <div class="controls">
      <strong>Style variant:</strong>
      @for (v of variants; track v) {
        <button
          class="variant-btn"
          [class.active]="variant() === v"
          (click)="variant.set(v)">{{ v }}</button>
      }
      <span style="flex: 1"></span>
      <button class="open-btn" (click)="openCounter()">+ Counter</button>
      <button class="open-btn" (click)="openEditor()">+ Editor</button>
      <button class="open-btn" (click)="openEditorWithConfirm()">+ Editor with confirm</button>
    </div>

    <div class="tabs-host">
      <ngx-angular-dynamic-tabs
        #tabs
        [variant]="variant()"
        [maxTabs]="8">
        <div empty class="empty">
          Open a tab using the buttons above ☝️
        </div>
      </ngx-angular-dynamic-tabs>
    </div>
  `,
})
export class AppComponent {
  readonly tabs = viewChild.required(NgxAngularDynamicTabsComponent);

  readonly variants: TabsVariant[] = ['flat', 'pill', 'chrome', 'underline'];
  readonly variant = signal<TabsVariant>('flat');

  private editorN = 0;

  openCounter() {
    this.tabs().createTab(CounterComponent, { label: 'Counter', icon: '🔢' });
  }

  openEditor() {
    this.editorN++;
    this.tabs().createTab(EditorComponent, {
      label: `Doc ${this.editorN}`,
      icon: '📝',
      inputs: {
        title: `Document ${this.editorN}`,
        text: `Inputs are passed via setInput() — fully typed.\nLine ${this.editorN}.`,
      },
    });
  }

  openEditorWithConfirm() {
    this.editorN++;
    this.tabs().createTab(EditorComponent, {
      label: `Dirty doc ${this.editorN}`,
      icon: '⚠️',
      inputs: {
        title: `Document ${this.editorN} (unsaved)`,
        text: 'This tab asks for confirmation before closing.',
      },
      confirmClose: (tab) =>
        window.confirm(`"${tab.label}" has unsaved changes. Close anyway?`),
    });
  }
}