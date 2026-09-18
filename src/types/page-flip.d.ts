declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, setting: Record<string, any>);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    loadFromImages(images: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    updateFromImages(images: string[]): void;
    destroy(): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    turnToPage(pageNum: number): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    flip(pageNum: number, corner?: "top" | "bottom"): void;
    getPage(index: number): any;
    getFlipController(): any;
    getPageCollection(): any;
    getRender(): any;
    getUI(): any;
    getState(): string;
    on(event: string, callback: (e: any) => void): this;
    off(event: string): void;
  }
}
