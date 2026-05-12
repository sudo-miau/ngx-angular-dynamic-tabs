import {
  Component,
  ChangeDetectionStrategy,
  ViewContainerRef,
  viewChild,
  signal,
  computed,
  ComponentRef,
  Type,
  input,
  output,
} from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmCloseFn, TabInfo, TabOptions, TabRef, TabsVariant } from './types';

@Component({
  selector: 'ngx-angular-dynamic-tabs',
  standalone: true,
  imports: [DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
  },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;

      /* Theme */
      --ngx-tabs-bg: #f5f5f5;
      --ngx-tabs-bg-hover: #e8e8e8;
      --ngx-tabs-bg-active: #ffffff;
      --ngx-tabs-border: #d0d0d0;
      --ngx-tabs-text: #333333;
      --ngx-tabs-text-muted: #777777;
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

      /* Active indicator */
      --ngx-tabs-indicator-thickness: 2px;
      --ngx-tabs-indicator-color: var(--ngx-tabs-accent);

      /* Close button */
      --ngx-tabs-close-size: 18px;
      --ngx-tabs-close-opacity: 0.55;
      --ngx-tabs-close-hover-bg: rgba(0, 0, 0, 0.08);

      /* Motion */
      --ngx-tabs-transition: 160ms cubic-bezier(0.4, 0, 0.2, 1);

      /* Focus */
      --ngx-tabs-focus-outline: 2px solid var(--ngx-tabs-accent);
    }

    .ngx-tab-strip {
      display: flex;
      overflow-x: auto;
      scrollbar-width: thin;
      border-bottom: 1px solid var(--ngx-tabs-border);
      background: var(--ngx-tabs-bg);
      color: var(--ngx-tabs-text);
      min-height: var(--ngx-tabs-strip-height);
      font-family: var(--ngx-tabs-font-family);
      font-size: var(--ngx-tabs-font-size);
      font-weight: var(--ngx-tabs-font-weight);
    }

    .ngx-tab-item {
      display: inline-flex;
      align-items: center;
      gap: var(--ngx-tabs-gap);
      padding: var(--ngx-tabs-padding-y) var(--ngx-tabs-padding-x);
      cursor: pointer;
      white-space: nowrap;
      border-right: 1px solid var(--ngx-tabs-border);
      transition:
        background var(--ngx-tabs-transition),
        color var(--ngx-tabs-transition),
        box-shadow var(--ngx-tabs-transition);
      user-select: none;
      min-width: var(--ngx-tabs-min-width);
      max-width: var(--ngx-tabs-max-width);
      position: relative;
      border-radius: var(--ngx-tabs-radius);
      outline: none;
    }

    .ngx-tab-item:hover {
      background: var(--ngx-tabs-bg-hover);
    }

    .ngx-tab-item:focus-visible {
      outline: var(--ngx-tabs-focus-outline);
      outline-offset: -2px;
    }

    .ngx-tab-item.active {
      background: var(--ngx-tabs-bg-active);
      font-weight: var(--ngx-tabs-font-weight-active);
    }

    .ngx-tab-item.active::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: var(--ngx-tabs-indicator-thickness);
      background: var(--ngx-tabs-indicator-color);
      transition: opacity var(--ngx-tabs-transition);
    }

    .ngx-tab-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15em;
      line-height: 1;
      flex-shrink: 0;
    }

    .ngx-tab-label {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }

    .ngx-tab-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: var(--ngx-tabs-close-opacity);
      cursor: pointer;
      width: var(--ngx-tabs-close-size);
      height: var(--ngx-tabs-close-size);
      border-radius: 50%;
      font-size: 16px;
      line-height: 1;
      flex-shrink: 0;
      transition:
        opacity var(--ngx-tabs-transition),
        background var(--ngx-tabs-transition);
    }

    .ngx-tab-close:hover {
      opacity: 1;
      background: var(--ngx-tabs-close-hover-bg);
    }

    .ngx-tab-content {
      flex: 1;
      overflow: auto;
      min-height: 0;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.2);
      background: var(--ngx-tabs-bg-active);
      color: var(--ngx-tabs-text);
      display: inline-flex;
      align-items: center;
      gap: var(--ngx-tabs-gap);
      padding: var(--ngx-tabs-padding-y) var(--ngx-tabs-padding-x);
      font-family: var(--ngx-tabs-font-family);
      font-size: var(--ngx-tabs-font-size);
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    /* ===== Variant: PILL ===== */
    :host([data-variant='pill']) {
      --ngx-tabs-radius: 999px;
    }

    :host([data-variant='pill']) .ngx-tab-strip {
      background: transparent;
      border-bottom: none;
      padding: 6px 8px;
      gap: 4px;
    }

    :host([data-variant='pill']) .ngx-tab-item {
      border-right: none;
      min-width: auto;
    }

    :host([data-variant='pill']) .ngx-tab-item.active {
      background: var(--ngx-tabs-accent);
      color: #fff;
    }

    :host([data-variant='pill']) .ngx-tab-item.active::after {
      display: none;
    }

    :host([data-variant='pill']) .ngx-tab-item.active .ngx-tab-close:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* ===== Variant: CHROME ===== */
    :host([data-variant='chrome']) {
      --ngx-tabs-radius: 8px 8px 0 0;
    }

    :host([data-variant='chrome']) .ngx-tab-strip {
      background: transparent;
      border-bottom: none;
      padding-top: 4px;
      gap: 2px;
    }

    :host([data-variant='chrome']) .ngx-tab-item {
      border-right: none;
      background: var(--ngx-tabs-bg);
      margin-top: 4px;
      transition:
        margin var(--ngx-tabs-transition),
        background var(--ngx-tabs-transition);
    }

    :host([data-variant='chrome']) .ngx-tab-item.active {
      background: var(--ngx-tabs-bg-active);
      margin-top: 0;
      box-shadow: 0 -2px 4px -2px rgba(0, 0, 0, 0.15);
    }

    :host([data-variant='chrome']) .ngx-tab-item.active::after {
      display: none;
    }

    :host([data-variant='chrome']) .ngx-tab-content {
      background: var(--ngx-tabs-bg-active);
    }

    /* ===== Variant: UNDERLINE ===== */
    :host([data-variant='underline']) .ngx-tab-strip {
      background: transparent;
      gap: 4px;
      padding: 0 8px;
    }

    :host([data-variant='underline']) .ngx-tab-item {
      border-right: none;
      background: transparent;
      color: var(--ngx-tabs-text-muted);
    }

    :host([data-variant='underline']) .ngx-tab-item:hover {
      background: transparent;
      color: var(--ngx-tabs-text);
    }

    :host([data-variant='underline']) .ngx-tab-item.active {
      background: transparent;
      color: var(--ngx-tabs-accent);
    }

    :host([data-variant='underline']) .ngx-tab-item.active::after {
      height: calc(var(--ngx-tabs-indicator-thickness) + 1px);
    }
  `,
  template: `
    @if (tabs().length > 0) {
      <div
        class="ngx-tab-strip"
        cdkDropList
        cdkDropListOrientation="horizontal"
        (cdkDropListDropped)="onDrop($event)">
        @for (tab of tabs(); track tab.id; let idx = $index) {
          <div
            cdkDrag
            tabindex="0"
            class="ngx-tab-item"
            [class.active]="idx === activeIndex()"
            [attr.title]="tab.label"
            [attr.aria-selected]="idx === activeIndex()"
            role="tab"
            (click)="selectTab(idx)"
            (mouseup)="onMiddleClick($event, idx)"
            (keydown.enter)="selectTab(idx)">
            @if (tab.icon) {
              <span class="ngx-tab-icon">{{ tab.icon }}</span>
            }
            <span class="ngx-tab-label">{{ tab.label }}</span>
            @if (tab.closable) {
              <span
                class="ngx-tab-close"
                role="button"
                [attr.aria-label]="'Close ' + tab.label"
                (click)="closeTab($event, idx)">&times;</span>
            }
          </div>
        }
      </div>
    } @else {
      <ng-content select="[empty]"></ng-content>
    }

    <div class="ngx-tab-content">
      <div #tabContent></div>
    </div>
  `,
})
export class NgxAngularDynamicTabsComponent {
  readonly maxTabs = input(0);
  readonly defaultClosable = input(true);
  readonly variant = input<TabsVariant>('flat');
  readonly confirmClose = input<ConfirmCloseFn | null>(null);

  readonly tabOpened = output<TabInfo>();
  readonly tabClosed = output<TabInfo>();
  readonly activeChange = output<TabInfo | null>();

  private readonly container = viewChild<unknown, ViewContainerRef>('tabContent', { read: ViewContainerRef });
  private readonly componentRefs = signal<ComponentRef<unknown>[]>([]);
  private readonly confirmFns = new Map<number, ConfirmCloseFn>();

  readonly tabs = signal<TabInfo[]>([]);
  readonly activeIndex = signal(0);
  readonly hasReachedLimit = computed(() => {
    const max = this.maxTabs();
    return max > 0 && this.tabs().length >= max;
  });

  private nextId = 0;

  createTab<T>(component: Type<T>, options: TabOptions<T> = {}): TabRef<T> | null {
    if (this.hasReachedLimit()) {
      return null;
    }

    const vcr = this.container();
    if (!vcr) return null;

    const componentRef = vcr.createComponent(component);

    if (options.inputs) {
      this.applyInputs(componentRef as ComponentRef<unknown>, options.inputs as object);
    }

    const id = this.nextId++;
    const info: TabInfo = {
      id,
      label: options.label ?? '',
      icon: options.icon ?? '',
      closable: options.closable ?? this.defaultClosable(),
    };

    if (options.confirmClose) {
      this.confirmFns.set(id, options.confirmClose);
    }

    this.componentRefs.update((refs) => [...refs, componentRef as ComponentRef<unknown>]);
    this.tabs.update((tabs) => [...tabs, info]);

    this.showTab(this.tabs().length - 1);
    this.tabOpened.emit(info);

    return this.buildRef(id, componentRef);
  }

  selectTab(index: number): void {
    this.showTab(index);
  }

  async closeTab(event: Event, index: number): Promise<void> {
    event.stopPropagation();
    await this.tryRemoveTab(index);
  }

  async onMiddleClick(event: MouseEvent, index: number): Promise<void> {
    if (event.button === 1) {
      await this.tryRemoveTab(index);
    }
  }

  onDrop(event: CdkDragDrop<unknown>): void {
    const tabsArr = [...this.tabs()];
    const refsArr = [...this.componentRefs()];
    moveItemInArray(tabsArr, event.previousIndex, event.currentIndex);
    moveItemInArray(refsArr, event.previousIndex, event.currentIndex);
    this.tabs.set(tabsArr);
    this.componentRefs.set(refsArr);
    this.showTab(event.currentIndex);
  }

  private buildRef<T>(id: number, ref: ComponentRef<T>): TabRef<T> {
    return {
      id,
      componentRef: ref,
      close: async () => {
        const idx = this.tabs().findIndex((t) => t.id === id);
        if (idx === -1) return false;
        return this.tryRemoveTab(idx);
      },
      activate: () => {
        const idx = this.tabs().findIndex((t) => t.id === id);
        if (idx !== -1) this.showTab(idx);
      },
      setLabel: (label: string) => {
        this.tabs.update((tabs) =>
          tabs.map((t) => (t.id === id ? { ...t, label } : t)),
        );
      },
      setInputs: (inputs) => this.applyInputs(ref as ComponentRef<unknown>, inputs as object),
    };
  }

  private async tryRemoveTab(index: number): Promise<boolean> {
    const tab = this.tabs()[index];
    if (!tab) return false;

    const fn = this.confirmFns.get(tab.id) ?? this.confirmClose();
    if (fn) {
      const ok = await fn(tab);
      if (!ok) return false;
    }
    this.removeTab(index);
    return true;
  }

  private applyInputs(ref: ComponentRef<unknown>, inputs: object): void {
    for (const [key, value] of Object.entries(inputs)) {
      ref.setInput(key, value);
    }
  }

  private showTab(index: number): void {
    const vcr = this.container();
    if (!vcr) return;

    for (let i = vcr.length - 1; i >= 0; i--) {
      vcr.detach(i);
    }

    const refs = this.componentRefs();
    if (refs[index]) {
      vcr.insert(refs[index].hostView);
      this.activeIndex.set(index);
      this.activeChange.emit(this.tabs()[index]);
    }
  }

  private removeTab(index: number): void {
    const refs = [...this.componentRefs()];
    const tabsArr = [...this.tabs()];
    const closed = tabsArr[index];

    refs[index].destroy();
    refs.splice(index, 1);
    tabsArr.splice(index, 1);

    this.componentRefs.set(refs);
    this.tabs.set(tabsArr);
    this.confirmFns.delete(closed.id);

    if (tabsArr.length === 0) {
      const vcr = this.container();
      vcr?.clear();
      this.activeIndex.set(0);
      this.activeChange.emit(null);
    } else if (this.activeIndex() >= tabsArr.length) {
      this.showTab(tabsArr.length - 1);
    } else if (this.activeIndex() === index) {
      const newIdx = index === tabsArr.length ? index - 1 : index;
      this.showTab(newIdx);
    }

    this.tabClosed.emit(closed);
  }
}