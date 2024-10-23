import {
  CLOSE_BUTTON_SVG,
  POPUP_BLOCKED_SVG,
  BEAM_LOGO_SVG,
  BEAM_OVERLAY_CLOSE_ID,
  BEAM_OVERLAY_ID,
  BEAM_OVERLAY_TRY_AGAIN_ID,
} from './constants';
import { LinkParams } from './types';

const CLOSE_BUTTON = `
  <button id="${BEAM_OVERLAY_CLOSE_ID}" class="icon-button">
    ${CLOSE_BUTTON_SVG}
  </button>
`;

const BLOCKED_CONTENTS = `
  <div class="popup-blocked">
    ${POPUP_BLOCKED_SVG}
    <p class="text text--error">pop-up blocked</p>
  </div>
  <p class="text">
    please try again below<br />
    if the problem continues, adjust your<br />
    browser settings to allow pop-ups
  </p>
`;

const GENERIC_CONTENTS = `
  <p class="text">
    secure pop-up not showing?<br />try again below
  </p>
`;

const TRY_AGAIN_BUTTON = `
  <button id="${BEAM_OVERLAY_TRY_AGAIN_ID}" class="button">
    try again
  </button>
`;

const getOverlay = (contents: string): string => `
  <div class="overlay">
    ${CLOSE_BUTTON}
    <div class="content">
      ${BEAM_LOGO_SVG}
      ${contents}
      ${TRY_AGAIN_BUTTON}
    </div>
  </div>
`;

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

export const getBlockedOverlay = () => getOverlay(BLOCKED_CONTENTS);

export const getGenericOverlay = () => getOverlay(GENERIC_CONTENTS);
