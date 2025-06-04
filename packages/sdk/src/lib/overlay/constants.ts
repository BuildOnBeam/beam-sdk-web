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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="112"
    height="38"
    fill="none"
    viewBox="0 0 146 50"
  >
    <mask
      id="mask0_3478_5282"
      width="50"
      height="50"
      x="0"
      y="0"
      maskUnits="userSpaceOnUse"
      style={{ maskType: 'alpha' }}
    >
      <circle cx="25" cy="25" r="25" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_3478_5282)">
      <path fill="#4066C9" d="M0 0h50v12.5H0z" />
      <path fill="#EC450D" d="M0 12.5h50V25H0z" />
      <path fill="#10A35D" d="M0 37.5h50V50H0z" />
      <path fill="#FFA50A" d="M0 25h50v12.5H0z" />
    </g>
    <path
      fill="#fff"
      d="M56.457 37.523h4.053v-2.266c1.097 1.25 2.657 2.874 6.21 2.874 6.743 0 9.165-6.322 9.165-10.076 0-4.971-3.653-9.942-9.266-9.942-2.06 0-4.217.776-5.747 2.332V12.5h-4.415zm4.154-9.636c0-2.74 2.093-5.647 5.482-5.647 2.791 0 5.381 2.199 5.381 5.848s-2.425 5.92-5.314 5.92c-2.59 0-5.546-1.964-5.546-6.121zM95.481 30.152c.135-.609.265-1.385.265-2.266 0-4.732-3.489-9.774-9.531-9.774s-9.7 4.77-9.7 10.077 4.12 9.941 9.734 9.941c4.351 0 7.837-3.146 8.9-6.527H90.5c-.832 1.557-2.291 2.4-4.25 2.4-3.158 0-4.882-2.639-5.083-3.855H95.48zm-14.45-3.617c.829-3.482 3.422-4.295 5.214-4.295 2.358 0 4.486 1.284 4.982 4.295zM115.767 18.754h-4.053v2.366h-.067c-.135-.269-2.359-3.008-6.113-3.008-5.117 0-9.233 4.158-9.233 9.909 0 6.254 4.217 10.11 8.968 10.11 2.325 0 5.049-1.25 6.445-2.941v2.332h4.053zm-4.184 9.334c0 3.482-2.325 5.919-5.381 5.919s-5.483-2.605-5.483-5.781c0-2.807 1.859-5.986 5.483-5.986 2.623 0 5.381 1.963 5.381 5.848M117.809 37.527h4.418V28.16c0-1.997 0-5.919 3.519-5.919 2.725 0 3.688 2.299 3.688 4.87v10.416h4.418V28.16c0-1.183-.033-3.042.665-4.157a3.58 3.58 0 0 1 3.056-1.758c3.489 0 3.489 3.788 3.489 4.87v10.416h4.419V26.574c0-2.773-.664-4.564-1.396-5.546-.664-.948-2.459-2.907-6.079-2.907-1.295 0-4.019.134-5.945 2.94-1.728-2.705-4.318-2.94-5.314-2.94-3.187 0-4.453 1.623-4.818 2.232h-.068v-1.59h-4.052V37.53z"
    />
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
    padding-block: var(--beam-spacing-1);
    padding-inline: var(--beam-spacing-4);
    font-size: .75rem;
    font-family: var(--beam-fonts-main);
    font-weight: 400;
    line-height: 18px;
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
