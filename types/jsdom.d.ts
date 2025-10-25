declare module "jsdom" {
  export interface ConstructorOptions {
    url?: string;
    contentType?: string;
    includeNodeLocations?: boolean;
    storageQuota?: number;
    runScripts?: "dangerously" | "outside-only";
    resources?: "usable" | unknown;
    virtualConsole?: unknown;
    cookieJar?: unknown;
    pretendToBeVisual?: boolean;
    beforeParse?: (window: DOMWindow) => void;
  }

  export interface DOMWindow extends Window {
    document: Document;
    console: Console;
    location: Location;
    navigator: Navigator;
    localStorage: Storage;
    sessionStorage: Storage;
  }

  export class JSDOM {
    constructor(html?: string, options?: ConstructorOptions);
    window: DOMWindow;
  }
}
