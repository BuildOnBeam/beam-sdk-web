/* eslint-disable max-len */

export const BEAM_OVERLAY_ID = 'beam-overlay';
export const BEAM_OVERLAY_CLOSE_ID = `${BEAM_OVERLAY_ID}-close`;
export const BEAM_OVERLAY_TRY_AGAIN_ID = `${BEAM_OVERLAY_ID}-try-again`;

export const CLOSE_BUTTON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="12" width="12">
    <g filter="url(#close_svg__close_svg__filter0_i_83_1559)">
      <path fill="#F1F1F1" fill-rule="evenodd" d="M19.244 5.557v.932L16.98 9.058l-1.641 1.863-.95 1.079.95 1.079 1.641 1.863 2.264 2.57v.93h-2.462l-.331-.375-1.112-1.262-1.642-1.863-1.111-1.262-.168-.19h-.164v-2.98h.164l.167-.19 1.112-1.262 1.642-1.863 1.112-1.262.33-.376h2.463z" clip-rule="evenodd" />
    </g>
    <g filter="url(#close_svg__close_svg__filter1_i_83_1559)">
      <path fill="#F1F1F1" fill-rule="evenodd" d="M4.756 5.557v.932l2.263 2.569 1.642 1.863.95 1.08-.95 1.078-1.641 1.863-2.264 2.57v.93h2.462l.331-.375 1.112-1.262 1.642-1.863 1.111-1.262.168-.19h.163v-2.98h-.164l-.167-.19-1.112-1.262-1.641-1.863-1.112-1.262-.331-.376H4.756z" clip-rule="evenodd" />
    </g>
    <defs>
      <filter id="close_svg__close_svg__filter0_i_83_1559" width="6.99" height="13.65" x="12.25" y="4.79" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
        <feOffset dy="-0.76" />
        <feGaussianBlur stdDeviation="0.38" />
        <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
        <feBlend in2="shape" result="effect1_innerShadow_83_1559" />
      </filter>
      <filter id="close_svg__close_svg__filter1_i_83_1559" width="6.99" height="13.65" x="4.76" y="4.79" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
        <feOffset dy="-0.76" />
        <feGaussianBlur stdDeviation="0.38" />
        <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
        <feBlend in2="shape" result="effect1_innerShadow_83_1559" />
      </filter>
    </defs>
  </svg>
`;

export const POPUP_BLOCKED_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="16" width="16">
    <path stroke="#FF4539" stroke-linecap="round" stroke-width="1.5" d="M15.6 8.4l-7.2 7.2m7.2 0L8.4 8.4" />
    <circle cx="12" cy="12" r="11.25" stroke="#FF4539" stroke-width="1.5" />
  </svg>
`;

export const BEAM_LOGO_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="30.8" viewBox="0 0 1000 154" fill="none">
    <path d="M530.747 62.725H1000V91.8059H533.566L530.747 62.725Z" fill="url(#paint0_linear_1_38)"/>
    <path d="M489.184 33.6442H999.999V62.725H530.59L489.184 33.6442Z" fill="url(#paint1_linear_1_38)"/>
    <path d="M533.566 120.887H1000V149.968H533.566V120.887Z" fill="url(#paint2_linear_1_38)"/>
    <path d="M533.566 91.8058H1000V120.887H533.566V91.8058Z" fill="url(#paint3_linear_1_38)"/>
    <path d="M0 149.99H24.2937V136.411C30.8704 143.905 40.221 153.636 61.5171 153.636C101.939 153.636 116.458 115.742 116.458 93.2376C116.458 63.4409 94.5574 33.6443 60.9131 33.6443C48.565 33.6443 35.6352 38.2972 26.4635 47.6254V0H0V149.99ZM24.8977 92.2309C24.8977 75.8115 37.4471 58.3853 57.759 58.3853C74.4916 58.3853 90.0163 71.5612 90.0163 93.4389C90.0163 115.317 75.4759 128.918 58.1616 128.918C42.637 128.918 24.92 117.151 24.92 92.2309H24.8977Z" fill="white"/>
    <path d="M233.967 105.809C234.772 102.163 235.555 97.5102 235.555 92.2309C235.555 63.8659 214.639 33.6442 178.422 33.6442C142.206 33.6442 120.283 62.2329 120.283 94.0429C120.283 125.853 144.98 153.636 178.624 153.636C204.707 153.636 225.601 134.778 231.976 114.511H204.103C199.115 123.84 190.368 128.895 178.624 128.895C159.699 128.895 149.364 113.08 148.156 105.787H233.967V105.809ZM147.351 84.133C152.317 63.2619 167.864 58.3853 178.601 58.3853C192.739 58.3853 205.49 66.0805 208.465 84.133H147.351Z" fill="white"/>
    <path d="M355.546 37.4918H331.253V51.6743H330.85C330.045 50.0637 316.712 33.6442 294.208 33.6442C263.539 33.6442 238.865 58.5643 238.865 93.0362C238.865 130.528 264.143 153.636 292.62 153.636C306.556 153.636 322.886 146.142 331.253 136.009V149.99H355.546V37.4918ZM330.47 93.4389C330.47 114.31 316.533 128.917 298.212 128.917C279.892 128.917 265.351 113.303 265.351 94.2665C265.351 77.4444 276.491 58.3853 298.212 58.3853C313.938 58.3853 330.47 70.1518 330.47 93.4389Z" fill="white"/>
    <path d="M367.716 149.99H394.202V93.8416C394.202 81.8737 394.202 58.363 415.296 58.363C431.626 58.363 437.398 72.1428 437.398 87.5556V149.99H463.884V93.8416C463.884 86.7503 463.683 75.6101 467.866 68.9215C471.646 62.4343 478.827 58.3853 486.187 58.3853C507.102 58.3853 507.102 81.0907 507.102 87.578V150.012H533.588V84.3344C533.588 67.7136 529.606 56.976 525.222 51.0927C521.24 45.4108 510.48 33.6666 488.782 33.6666C481.019 33.6666 464.689 34.4719 453.146 51.2941C442.789 35.0759 427.264 33.6666 421.292 33.6666C402.188 33.6666 394.604 43.3975 392.412 47.0438H392.009V37.5142H367.716V150.012V149.99Z" fill="white"/>
    <defs>
      <linearGradient id="paint0_linear_1_38" x1="765.385" y1="77.9813" x2="765.385" y2="110.418" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FF6B6B"/>
        <stop offset="0.33" stop-color="#FE1414"/>
        <stop offset="0.6" stop-color="#8E0900"/>
      </linearGradient>
      <linearGradient id="paint1_linear_1_38" x1="744.603" y1="48.9005" x2="744.603" y2="81.3368" gradientUnits="userSpaceOnUse">
        <stop stop-color="#BBDBFF"/>
        <stop offset="0.33" stop-color="#139EDD"/>
        <stop offset="0.6" stop-color="#B9F7EA"/>
      </linearGradient>
      <linearGradient id="paint2_linear_1_38" x1="766.795" y1="136.143" x2="766.795" y2="168.579" gradientUnits="userSpaceOnUse">
        <stop stop-color="#BBFFCA"/>
        <stop offset="0.33" stop-color="#48DD13"/>
        <stop offset="0.6" stop-color="#008805"/>
      </linearGradient>
      <linearGradient id="paint3_linear_1_38" x1="766.795" y1="107.062" x2="766.795" y2="139.498" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F1E869"/>
        <stop offset="0.33" stop-color="#FEA514"/>
        <stop offset="0.6" stop-color="#FF4539"/>
      </linearGradient>
    </defs>
  </svg>
`;

// PandaCSS' default CSS reset
export const CSS_RESET = `
 :host {
    all: initial;
    --font-fallback: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -moz-tab-size: 4;
    tab-size: 4;
    -webkit-tap-highlight-color: transparent;
    line-height: 1.5;
    font-family: var(--global-font-body,var(--font-fallback))
  }

  *,::backdrop,::file-selector-button,:after,:before {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      border-width: 0px;
      border-style: solid;
      border-color: var(--global-color-border,currentColor)
  }

  hr {
      height: 0px;
      color: inherit;
      border-top-width: 1px
  }

  body {
      height: 100%;
      line-height: inherit
  }

  img {
      border-style: none
  }

  audio,canvas,embed,iframe,img,object,svg,video {
      display: block;
      vertical-align: middle
  }

  img,video {
      max-width: 100%;
      height: auto
  }

  h1,h2,h3,h4,h5,h6 {
      text-wrap: balance;
      font-size: inherit;
      font-weight: inherit
  }

  h1,h2,h3,h4,h5,h6,p {
      overflow-wrap: break-word
  }

  menu,ol,ul {
      list-style: none
  }

  ::file-selector-button,button,input: where([type=button],[type=reset],[type=submit]) {
      -moz-appearance:button;
      appearance: button;
      -webkit-appearance: button
  }

  ::file-selector-button,button,input,optgroup,select,textarea {
      font: inherit;
      font-feature-settings: inherit;
      font-variation-settings: inherit;
      letter-spacing: inherit;
      color: inherit;
      background: transparent
  }

  ::placeholder {
      opacity: 1;
      --placeholder-fallback: color-mix(in srgb,currentColor 50%,transparent);
      color: var(--global-color-placeholder,var(--placeholder-fallback))
  }

  textarea {
      resize: vertical
  }

  table {
      text-indent: 0px;
      border-collapse: collapse;
      border-color: inherit
  }

  summary {
      display: list-item
  }

  small {
      font-size: 80%
  }

  sub,sup {
      position: relative;
      vertical-align: baseline;
      font-size: 75%;
      line-height: 0
  }

  sub {
      bottom: -.25em
  }

  sup {
      top: -.5em
  }

  dialog {
      padding: 0
  }

  a {
      color: inherit;
      text-decoration: inherit
  }

  abbr: where([title]) {
      text-decoration:underline dotted
  }

  b,strong {
      font-weight: bolder
  }

  code,kbd,pre,samp {
      --font-mono-fallback: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New";
      font-feature-settings: normal;
      font-variation-settings: normal;
      font-family: var(--global-font-mono,var(--font-mono-fallback));
      font-size: 1em
  }

  progress {
      vertical-align: baseline
  }

  ::-webkit-search-cancel-button,::-webkit-search-decoration {
      -webkit-appearance: none
  }

  ::-webkit-inner-spin-button,::-webkit-outer-spin-button {
      height: auto
  }

  :-moz-ui-invalid {
      box-shadow: none
  }

  :-moz-focusring {
      outline: auto
  }

  [hidden] {
      display: none!important
  }
`;

export const STYLE_SHEET = `
  ${CSS_RESET}

  :host {
    --beam-colors-mono-0: #ffffff;
    --beam-colors-mono-100: #f1f1f1;
    --beam-colors-mono-550: #242424;
    --beam-colors-mono-900: #131313;
    --beam-colors-red-500: #ff4539;
    --beam-durations-normal: .3s;
    --beam-fonts-main: 'Suisse Intl',-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
    --beam-spacing-1: 0.25rem;
    --beam-spacing-2: 0.5rem;
    --beam-spacing-4: 1rem;
    --beam-spacing-8: 2rem;
    --beam-radii-full: 999rem;
    --beam-shadows-border: inset 0 0 0 1px #131313;
    --beam-shadows-md: 0px 4px 4px rgba(0,0,0,.25),inset 0px -2px 2px rgba(255,255,255,.07);
    --beam-shadows-border-active: inset 0 0 0 1px rgba(255,255,255,.65);
  }

  .overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    position: fixed;
    z-index: 2147483647;
    --mix-background: color-mix(in srgb, var(--beam-colors-mono-900) 70%, transparent);
    background: var(--mix-background, var(--beam-colors-mono-900));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    inset: 0;
    animation-name: fadeIn;
    animation-duration: var(--beam-durations-normal);
    font-family: var(--beam-fonts-main);
    color: var(--beam-colors-mono-100);
  }

  .button {
    background: linear-gradient(178deg,color-mix(in srgb,var(--beam-colors-mono-0) 11%,transparent) 1.34%,color-mix(in srgb,var(--beam-colors-mono-0) 25%,transparent) 5.7%,transparent 45.31%,transparent 77.57%),var(--beam-colors-mono-550);
    padding-inline: var(--beam-spacing-8);
    padding-block: var(--beam-spacing-2);
    font-size: 1rem;
    font-family: var(--beam-fonts-main);
    font-weight: 400;
    line-height: 28px;
    display: flex;
    gap: var(--beam-spacing-1);
    position: relative;
    cursor: pointer;
    color: var(--beam-colors-mono-100);
    text-align: center;
    border-radius: var(--beam-radii-full);
    box-shadow: var(--beam-shadows-border), var(--beam-shadows-md);
    background-blend-mode: overlay, normal;
    outline: 2px solid transparent;
    outline-offset: 2px;
    -webkit-user-select: none;
    user-select: none;
    justify-content: center;
    align-items: center;
  }
  .button:hover {
    background: linear-gradient(178.42deg, 
      color-mix(in srgb, var(--beam-colors-mono-0) 24%, transparent) 1.34%, 
      color-mix(in srgb, var(--beam-colors-mono-0) 55%, transparent) 5.7%, transparent 45.31%, transparent 77.57%), var(--beam-colors-mono-550);
  }
  .button:focus-visible {
    box-shadow: var(--beam-shadows-border-active), var(--beam-shadows-border), var(--beam-shadows-md);
  }
  .button:active {
    box-shadow: var(--beam-shadows-border-active), var(--beam-shadows-border), var(--beam-shadows-md);
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 400px;
    gap: var(--beam-spacing-4);
  }

  .text {
    font-size: .875rem;
    line-height: 20px;
    font-family: var(--beam-fonts-main);
    font-weight: 400;
    text-align: center;
  }

  .text--error {
    color: var(--beam-colors-red-500);
  }

  .popup-blocked {
    display: flex;
    align-items: center;
    gap: var(--beam-spacing-1);
  }

  .icon-button {
    position: absolute;
    right: var(--beam-spacing-4);
    top: var(--beam-spacing-4);
    width: 34px;
    height: 34px;
    display: flex;
    cursor: pointer;
    color: var(--beam-colors-mono-100);
    border-radius: var(--beam-radii-full);
    box-shadow: var(--beam-shadows-border), var(--beam-shadows-md);
    background: radial-gradient(111.24% 111.24% at 50.36% -11.23%, 
      color-mix(in srgb, var(--beam-colors-mono-0) 29%, transparent) 0%, 
      color-mix(in srgb, var(--beam-colors-mono-0) 65%, transparent) 4.48%, transparent 45.18%, transparent 78.33%), var(--beam-colors-mono-550);
    background-blend-mode: overlay, normal;
    outline: 2px solid transparent;
    outline-offset: 2px;
    justify-content: center;
    align-items: center;
  }
  .icon-button:hover {
    background: radial-gradient(111.24% 111.24% at 50.36% -11.23%, 
      color-mix(in srgb, var(--beam-colors-mono-0) 44%, transparent) 0%, var(--beam-colors-mono-0) 4.48%, transparent 45.18%, transparent 78.33%), var(--beam-colors-mono-550);
  }
  .icon-button:active {
    box-shadow: var(--beam-shadows-border-active), var(--beam-shadows-border), var(--beam-shadows-md);
  }
  .icon-button:focus-visible {
    box-shadow: var(--beam-shadows-border-active), var(--beam-shadows-border), var(--beam-shadows-md);
  }
`;
