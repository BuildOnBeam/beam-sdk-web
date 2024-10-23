export interface PopupOverlayOptions {
  disableGenericPopupOverlay?: boolean;
  disableBlockedPopupOverlay?: boolean;
}

export type LinkParams = {
  id: string;
  href: string;
  rel?: string;
  crossOrigin?: string;
};
