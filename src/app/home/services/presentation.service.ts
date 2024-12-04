import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent } from 'rxjs';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PresentationService {

  public windowSize: Observable<any>;
  private largeMatchMedia: MediaQueryList = window.matchMedia('(min-width: 53.8rem)');
  private extendedMatchMedia: MediaQueryList = window.matchMedia('(min-width: 100rem)');
  private windowSize$: BehaviorSubject<any>;

  constructor() {
    this.windowSize$ = new BehaviorSubject(this.getWindowSize());
    this.windowSize = (this.windowSize$ as Observable<any>).pipe(
      distinctUntilChanged()
    );

    fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe((s) => this.onResize());
  }

  isLargePresentation(): boolean {
    return this.largeMatchMedia.matches;
  }

  isExtendedPresentation(): boolean {
    return this.extendedMatchMedia.matches;
  }

  triggerResize() {
    this.onResize();
  }

  onResize() {
    this.windowSize$.next(this.getWindowSize());
  }

  private getWindowSize(): any {
    return {
      height: window.innerHeight,
      width: window.innerWidth
    }
  }

  serialize = (svgS: any) => {

    const xmlns = "http://www.w3.org/2000/xmlns/";
    const xlinkns = "http://www.w3.org/1999/xlink";
    const svgns = "http://www.w3.org/2000/svg";
    return this.serialize = (svg: any) => {

      svg = svgS.cloneNode(true);
      const fragment = window.location.href + "#";
      const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT) as any;
      while (walker.nextNode()) {
        for (const attr of walker.currentNode.attributes) {
          if (attr.value.includes(fragment)) {
            attr.value = attr.value.replace(fragment, "#");
          }
        }
      }
      svgS.setAttributeNS(xmlns, "xmlns", svgns);
      svgS.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
      const serializer = new window.XMLSerializer;
      const string = serializer.serializeToString(svgS);
      return new Blob([string], { type: "image/svg+xml;base64" });
    }
  }

  rasterize(svg: any) {
    let resolve: (value: unknown) => void, reject;
    const promise = new Promise((y, n) => (resolve = y, reject = n));
    const image = new Image;
    image.onerror = reject;
    image.onload = (d) => {
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, 150, 150);
      context.canvas.toBlob(resolve);
    };
    // if (window.URL && window.URL.createObjectURL) {
    image.src = URL.createObjectURL(this.serialize(svg) as any);

    return promise

  }

  saveSvgToImage() {
    const waitForImage = (imgElem: any) => new Promise<void>(resolve => imgElem.complete ? resolve() : imgElem.onload = imgElem.onerror = resolve);
    const svgToImgDownload = (ext: any) => {
      // if (!['png', 'jpg', 'webp'].includes(ext))
      //   return;
      const _svg = document.querySelector("#svg_container").querySelector('svg');
      const xmlSerializer = new XMLSerializer();
      let _svgStr = xmlSerializer.serializeToString(_svg);

      const img = document.createElement('img');
      img.src = 'data:image/svg+xml;charset=utf-8;base64,' + btoa(unescape(encodeURI(_svgStr)));
      waitForImage(img).then(_ => {
        const canvas = document.createElement('canvas');
        canvas.width = _svg.clientWidth;
        canvas.height = _svg.clientHeight;
        canvas.style.background = "#FFFFFF";
        canvas.style.backgroundColor = 'white';

        const context = canvas.getContext('2d').drawImage(img, 0, 0, _svg.clientWidth, _svg.clientHeight);
        return canvas.toDataURL('image/' + (ext), 4.0);
      }).then(dataURL => {
        document.getElementById("img").setAttribute("src", dataURL)
        document.getElementById("img").setAttribute("background-color", "white")
        document.getElementById("anchor").setAttribute("href", dataURL)
        document.getElementById("anchor").setAttribute("background-color", "white")
        // document.querySelector("#img_download_btn")!.innerHTML = `<a href="${dataURL}" download="img.${ext}">Download</a>`;
        URL.revokeObjectURL("anchor");
      })
        .catch(console.error);
    }
    document.querySelector('#map2Jpg').addEventListener('click', _ => svgToImgDownload('jpg'));
  }


}
