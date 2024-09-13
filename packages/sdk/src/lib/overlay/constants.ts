/* eslint-disable max-len */

export const BEAM_OVERLAY_ID = 'beam-overlay';
export const BEAM_OVERLAY_CLOSE_ID = `${BEAM_OVERLAY_ID}-close`;
export const BEAM_OVERLAY_TRY_AGAIN_ID = `${BEAM_OVERLAY_ID}-try-again`;

export const CLOSE_BUTTON_SVG = `
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="width: 20px !important;"
    >
      <path
        d="M16.25 5.75833L14.2417 3.75L10 7.99167L5.75833 3.75L3.75 5.75833L7.99167 10L3.75 14.2417L5.75833 16.25L10 12.0083L14.2417 16.25L16.25 14.2417L12.0083 10L16.25 5.75833Z"
        fill="#F3F3F3"
      />
  </svg>
`;

export const POPUP_BLOCKED_SVG = `
  <svg
  viewBox="0 0 17 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="width: 16px !important;"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0.5 14.3333L8.5 0.333336L16.5 14.3333H0.5ZM9.16667 10.6667V12H7.83333V10.6667H9.16667ZM9.16667 5.33334L9.16667 9.33334H7.83333L7.83333 5.33334H9.16667Z"
      fill="#E01A3D"
    />
  </svg>
`;

export const BEAM_LOGO_SVG = `
  <svg width="200" height="80" viewBox="0 0 1000 154" fill="none" xmlns="http://www.w3.org/2000/svg">
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
