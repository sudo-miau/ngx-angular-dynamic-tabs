import { ComponentRef, InputSignal, InputSignalWithTransform } from '@angular/core';

export type ComponentInputs<T> = {
  [K in keyof T as T[K] extends InputSignal<unknown> | InputSignalWithTransform<unknown, unknown>
    ? K
    : never]?: T[K] extends InputSignal<infer U>
    ? U
    : T[K] extends InputSignalWithTransform<infer U, unknown>
      ? U
      : never;
};

type InputsArg<T> = T extends object ? ComponentInputs<T> : Record<string, unknown>;

export type TabsVariant = 'flat' | 'pill' | 'chrome' | 'underline';

export type ConfirmCloseFn = (tab: TabInfo) => boolean | Promise<boolean>;

export interface TabOptions<T = unknown> {
  label?: string;
  icon?: string;
  inputs?: InputsArg<T>;
  closable?: boolean;
  confirmClose?: ConfirmCloseFn;
  data?: unknown;
}

export interface TabRef<T = unknown> {
  readonly id: number;
  readonly componentRef: ComponentRef<T>;
  close(): Promise<boolean>;
  activate(): void;
  setLabel(label: string): void;
  setInputs(inputs: InputsArg<T>): void;
}

export interface TabInfo {
  id: number;
  label: string;
  icon: string;
  closable: boolean;
}