import { PopupOverlayOptions } from './types';
import {
  BEAM_OVERLAY_CLOSE_ID,
  BEAM_OVERLAY_ID,
  BEAM_OVERLAY_TRY_AGAIN_ID,
  STYLE_SHEET,
} from './constants';
import { addLink, getBlockedOverlay, getGenericOverlay } from './elements';

export default class Overlay {
  private disableGenericPopupOverlay: boolean;

  private disableBlockedPopupOverlay: boolean;

  private overlay: HTMLDivElement | undefined;

  private isBlockedOverlay: boolean;

  private tryAgainListener: (() => void) | undefined;

  private onCloseListener: (() => void) | undefined;

  constructor(
    popupOverlayOptions: PopupOverlayOptions,
    isBlockedOverlay = false,
  ) {
    this.disableBlockedPopupOverlay =
      popupOverlayOptions.disableBlockedPopupOverlay || false;
    this.disableGenericPopupOverlay =
      popupOverlayOptions.disableGenericPopupOverlay || false;
    this.isBlockedOverlay = isBlockedOverlay;
  }

  append(tryAgainOnClick: () => void, onCloseClick: () => void) {
    if (!this.shouldAppendOverlay()) return;
    this.appendOverlay();
    this.updateTryAgainButton(tryAgainOnClick);
    this.updateCloseButton(onCloseClick);
  }

  update(tryAgainOnClick: () => void) {
    this.updateTryAgainButton(tryAgainOnClick);
  }

  remove() {
    if (!this.overlay) return;
    this.overlay.remove();
  }

  private shouldAppendOverlay(): boolean {
    if (this.disableGenericPopupOverlay && this.disableBlockedPopupOverlay)
      return false;
    if (this.disableGenericPopupOverlay && !this.isBlockedOverlay) return false;
    if (this.disableBlockedPopupOverlay && this.isBlockedOverlay) return false;
    return true;
  }

  private appendOverlay() {
    if (this.overlay) return;
    addLink({ id: 'link-googleapis', href: 'https://fonts.googleapis.com' });
    addLink({
      id: 'link-gstatic',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    });
    addLink({
      id: 'link-roboto',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap',
      rel: 'stylesheet',
    });

    const overlay = document.createElement('div');
    overlay.setAttribute('id', BEAM_OVERLAY_ID);
    const shadow = overlay.attachShadow({ mode: 'open' });
    shadow.innerHTML = this.isBlockedOverlay
      ? getBlockedOverlay()
      : getGenericOverlay();
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(STYLE_SHEET);
    shadow.adoptedStyleSheets = [styleSheet];
    document.body.insertAdjacentElement('beforeend', overlay);
    this.overlay = overlay;
  }

  private updateTryAgainButton(tryAgainOnClick: () => void) {
    const tryAgainButton = this.overlay?.shadowRoot?.getElementById(
      BEAM_OVERLAY_TRY_AGAIN_ID,
    );
    if (!tryAgainButton) return;
    if (this.tryAgainListener) {
      tryAgainButton.removeEventListener('click', this.tryAgainListener);
    }
    this.tryAgainListener = tryAgainOnClick;
    tryAgainButton.addEventListener('click', tryAgainOnClick);
  }

  private updateCloseButton(onCloseClick: () => void) {
    const closeButton = this.overlay?.shadowRoot?.getElementById(
      BEAM_OVERLAY_CLOSE_ID,
    );
    if (!closeButton) return;
    if (this.onCloseListener) {
      closeButton.removeEventListener('click', this.onCloseListener);
    }
    this.onCloseListener = onCloseClick;
    closeButton.addEventListener('click', onCloseClick);
  }
}
