import {
  CLOSE_BUTTON_SVG,
  POPUP_BLOCKED_SVG,
  BEAM_LOGO_SVG,
  BEAM_OVERLAY_CLOSE_ID,
  BEAM_OVERLAY_ID,
  BEAM_OVERLAY_TRY_AGAIN_ID,
} from './constants';

const getCloseButton = (): string => `
    <button
      id="${BEAM_OVERLAY_CLOSE_ID}"
      style="
        background: #f3f3f326 !important;
        border: none !important;
        border-radius: 50% !important;
        width: 48px !important;
        height: 48px !important;
        position: absolute !important;
        top: 40px !important;
        right: 40px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-shadow: none !important;
      "
    >
      ${CLOSE_BUTTON_SVG}
    </button>
  `;

const getBlockedContents = () => `
    <div
      style="
        color: #e01a3d !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        margin-bottom: 10px !important;
        text-shadow: none !important;
      "
    >
      ${POPUP_BLOCKED_SVG}
      Pop-up blocked
    </div>
    <p style="
        color: #b6b6b6 !important;
        text-align: center !important;
        margin: 0 !important;
        text-shadow: none !important;
      "
    >
      Please try again below.<br />
      If the problem continues, adjust your<br />
      browser settings to allow pop-ups.
    </p>
  `;

const getGenericContents = () => `
    <p style="
        color: #b6b6b6 !important;
        text-align: center !important;
        margin: 0 !important;
        text-shadow: none !important;
      "
    >
      Secure pop-up not showing?<br />Try again below.
    </p>
  `;

const getTryAgainButton = () => `
    <button
      id="${BEAM_OVERLAY_TRY_AGAIN_ID}"
      style="
        margin-top: 27px !important;
        color: #dee7e1 !important;
        background: transparent !important;
        padding: 12px 24px !important;
        border-radius: 30px !important;
        border: 1px solid #dee7e1 !important;
        font-size: 1em !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        text-shadow: none !important;
      "
    >
      Try again
    </button>
  `;

const getOverlay = (contents: string): string => `
    <div
      id="${BEAM_OVERLAY_ID}"
      style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(13, 13, 13, 0.48) !important;
        backdrop-filter: blur(28px) !important;
        -webkit-backdrop-filter: blur(28px) !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
        font-family: Roboto !important;
        font-style: normal !important;
        font-weight: 400 !important;
        font-feature-settings: 'clig' off, 'liga' off !important;
        z-index: 2147483647 !important;
      "
    >
      ${getCloseButton()}
      <div
        style="
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          max-width: 400px !important;
        "
      >
        ${BEAM_LOGO_SVG}
        ${contents}
        ${getTryAgainButton()}
      </div>
    </div>
  `;

type LinkParams = {
  id: string;
  href: string;
  rel?: string;
  crossOrigin?: string;
};
export function addLink({ id, href, rel, crossOrigin }: LinkParams): void {
  const fullId = `${BEAM_OVERLAY_ID}-${id}`;
  if (!document.getElementById(fullId)) {
    const link: HTMLLinkElement = document.createElement('link');
    link.id = fullId;
    link.href = href;
    if (rel) link.rel = rel;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
  }
}

export const getBlockedOverlay = () => getOverlay(getBlockedContents());
export const getGenericOverlay = () => getOverlay(getGenericContents());
