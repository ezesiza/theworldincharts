import {
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Directive({
  selector: '[appContextMenu]'
})
export class ContextMenuDirective {
  @Input() menuOptions: string[] = []; // Menu options to display
  @Output() optionSelected = new EventEmitter<string>(); // Emits the selected option

  private menuElement: HTMLElement;
  private menuVisible = true;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.createMenu(event.pageX, event.pageY);
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.menuVisible) {
      this.destroyMenu();
    }
  }

  private createMenu(x: number, y: number) {
    if (this.menuVisible) this.destroyMenu(); // Ensure no duplicate menus

    this.menuElement = this.renderer.createElement('div');
    this.renderer.addClass(this.menuElement, 'menu');

    // Calculate position including scroll offset
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    let xPos = x + scrollX;
    let yPos = y + scrollY;

    // Prevent overflow on the right
    const viewportWidth = window.innerWidth;
    const menuWidth = 140; // Fixed menu width
    if (xPos + menuWidth > viewportWidth) {
      xPos = viewportWidth - menuWidth;
    }

    // Prevent overflow on the bottom
    const viewportHeight = window.innerHeight;
    const menuHeight = 160; // Approximate menu height based on items
    if (yPos + menuHeight > viewportHeight) {
      yPos = viewportHeight - menuHeight;
    }

    // Set menu position
    this.renderer.setStyle(this.menuElement, 'position', 'absolute');
    this.renderer.setStyle(this.menuElement, 'top', `${yPos}px`);
    this.renderer.setStyle(this.menuElement, 'left', `${xPos}px`);
    this.renderer.setStyle(this.menuElement, 'z-index', '1000');
    this.renderer.setStyle(this.menuElement, 'box-shadow', '0 4px 5px 3px rgba(0, 0, 0, 0.2)');
    this.renderer.setStyle(this.menuElement, 'background', '#fff');
    this.renderer.setStyle(this.menuElement, 'border-radius', '4px');

    // Add menu options
    const ul = this.renderer.createElement('ul');
    this.renderer.addClass(ul, 'menu-options');

    this.menuOptions.forEach(option => {
      const li = this.renderer.createElement('li');
      this.renderer.addClass(li, 'menu-option');
      this.renderer.setStyle(li, 'list-style', 'none');
      this.renderer.setStyle(li, 'padding', '10px 40px 10px 20px');
      this.renderer.setStyle(li, 'cursor', 'pointer');
      this.renderer.setStyle(li, 'font-size', '14px');
      this.renderer.setStyle(li, 'font-weight', '500');

      // Add hover effect
      this.renderer.listen(li, 'mouseover', () => {
        this.renderer.setStyle(li, 'background', 'rgba(0, 0, 0, 0.2)');
      });
      this.renderer.listen(li, 'mouseout', () => {
        this.renderer.removeStyle(li, 'background');
      });

      this.renderer.listen(li, 'click', () => {
        this.optionSelected.emit(option);
        this.destroyMenu();
      });

      const text = this.renderer.createText(option);
      this.renderer.appendChild(li, text);
      this.renderer.appendChild(ul, li);
    });

    this.renderer.appendChild(this.menuElement, ul);
    this.renderer.appendChild(document.body, this.menuElement);

    this.menuVisible = true;
  }

  private destroyMenu() {
    if (this.menuElement) {
      this.renderer.removeChild(document.body, this.menuElement);
      this.menuElement = null;
      this.menuVisible = false;
    }
  }
}
