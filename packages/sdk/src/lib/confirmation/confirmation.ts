import { BeamConfiguration } from '../config';
import Overlay from '../overlay';
import { openPopupCenter } from './popup';
import {
  BEAM_EVENT_TYPE,
  ConfirmationResult,
  ReceiveMessage,
  RequestConnectionResult,
  RequestSignatureResult,
} from './types';

const CONFIRMATION_WINDOW_TITLE = 'Confirm this transaction';
const CONFIRMATION_WINDOW_HEIGHT = 720;
const CONFIRMATION_WINDOW_WIDTH = 640;
const CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION = 1000;

export const CONFIRMATION_IFRAME_ID = 'beam-confirm';
export const CONFIRMATION_IFRAME_STYLE =
  'display: none; position: absolute;width:0px;height:0px;border:0;';

type MessageHandler = (arg0: MessageEvent) => void;

export default class ConfirmationScreen {
  private config: BeamConfiguration;

  private confirmationWindow: Window | undefined;

  private popupOptions: { width: number; height: number } | undefined;

  private overlay: Overlay | undefined;
  private overlayClosed: boolean;

  // @ts-ignore
  private timer: NodeJS.Timeout | undefined;

  constructor(config: BeamConfiguration) {
    this.config = config;
    this.overlayClosed = false;
  }

  requestConnection(
    url: string,
  ): Promise<RequestSignatureResult | RequestConnectionResult> {
    return new Promise((resolve, reject) => {
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.getChainConfig().authUrl ||
          data.eventType !== BEAM_EVENT_TYPE
        ) {
          return;
        }

        switch (data.messageType as ReceiveMessage) {
          case ReceiveMessage.REQUEST_CONNECTION_CONFIRMED: {
            this.closeWindow();
            const { address } = data.payload;
            resolve({ address });
            break;
          }
          case ReceiveMessage.REQUEST_MESSAGE_SIGNATURE_CONFIRMED: {
            this.closeWindow();
            const { signature, address, ownerAddress } = data.payload;
            resolve({ signature, address, ownerAddress });
            break;
          }
          case ReceiveMessage.REQUEST_MESSAGE_SIGNATURE_ERROR: {
            this.closeWindow();
            reject(new Error('Error during connection request'));
            break;
          }
          case ReceiveMessage.REQUEST_MESSAGE_SIGNATURE_REJECTED: {
            this.closeWindow();
            reject(new Error('User rejected connection request'));
            break;
          }
          default:
            this.closeWindow();
            reject(new Error('Unsupported message type'));
        }
      };
      window.addEventListener('message', messageHandler);
      this.showConfirmationScreen(url, messageHandler, resolve);
    });
  }

  requestSession(url: string): Promise<ConfirmationResult> {
    return new Promise((resolve, reject) => {
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.getChainConfig().authUrl ||
          data.eventType !== BEAM_EVENT_TYPE
        ) {
          return;
        }

        switch (data.messageType as ReceiveMessage) {
          case ReceiveMessage.REQUEST_SESSION_CONFIRMED: {
            this.closeWindow();
            resolve({ confirmed: true });
            break;
          }
          case ReceiveMessage.REQUEST_SESSION_ERROR: {
            this.closeWindow();
            reject(new Error('Error during session request confirmation'));
            break;
          }
          case ReceiveMessage.REQUEST_SESSION_REJECTED: {
            this.closeWindow();
            reject(new Error('User rejected session request'));
            break;
          }
          default:
            this.closeWindow();
            reject(new Error('Unsupported message type'));
        }
      };
      window.addEventListener('message', messageHandler);
      this.showConfirmationScreen(url, messageHandler, resolve);
    });
  }

  signOperation(url: string): Promise<ConfirmationResult> {
    return new Promise((resolve, reject) => {
      const messageHandler = ({ data, origin }: MessageEvent) => {
        if (
          origin !== this.config.getChainConfig().authUrl ||
          data.eventType !== BEAM_EVENT_TYPE
        ) {
          return;
        }

        switch (data.messageType as ReceiveMessage) {
          case ReceiveMessage.SIGN_OPERATION_CONFIRMED: {
            this.closeWindow();
            resolve({ confirmed: true });
            break;
          }
          case ReceiveMessage.SIGN_OPERATION_ERROR: {
            this.closeWindow();
            reject(new Error('Error during operation signing'));
            break;
          }
          case ReceiveMessage.SIGN_OPERATION_REJECTED: {
            this.closeWindow();
            reject(new Error('User rejected operation signing'));
            break;
          }
          default:
            this.closeWindow();
            reject(new Error('Unsupported message type'));
        }
      };
      window.addEventListener('message', messageHandler);
      this.showConfirmationScreen(url, messageHandler, resolve);
    });
  }

  loading(popupOptions?: { width: number; height: number }) {
    // Do not recreate the popup if it already exists
    if (this.overlay && this.confirmationWindow) {
      return;
    }

    this.popupOptions = popupOptions;

    const url = `${this.config.getChainConfig().authUrl}/loading`;

    const popupOverlayOptions = {
      disableGenericPopupOverlay: false,
      disableBlockedPopupOverlay: false,
    };

    try {
      this.confirmationWindow = openPopupCenter({
        url,
        title: CONFIRMATION_WINDOW_TITLE,
        width: popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
        height: popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
      });
      this.overlay = new Overlay(popupOverlayOptions);
    } catch {
      // If an error is thrown here then the popup is blocked
      this.overlay = new Overlay(popupOverlayOptions, true);
    }

    this.overlay.append(
      () => {
        try {
          this.confirmationWindow?.close();
          this.confirmationWindow = openPopupCenter({
            url,
            title: CONFIRMATION_WINDOW_TITLE,
            width: this.popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
            height: this.popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
          });
        } catch {
          /* Empty */
        }
      },
      () => {
        this.overlayClosed = true;
        this.closeWindow();
      },
    );
  }

  closeWindow() {
    this.confirmationWindow?.close();
    this.confirmationWindow = undefined;
    this.overlay?.remove();
    this.overlay = undefined;
  }

  showConfirmationScreen(
    href: string,
    messageHandler: MessageHandler,
    resolve: Function,
  ) {
    // If popup blocked, the confirmation window will not exist
    if (this.confirmationWindow) {
      this.confirmationWindow.location.href = href;
    }

    // This indicates the user closed the overlay so the transaction should be rejected
    if (!this.overlay) {
      this.overlayClosed = false;
      resolve({ confirmed: false });
      return;
    }

    // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
    const timerCallback = () => {
      if (this.confirmationWindow?.closed || this.overlayClosed) {
        clearInterval(this.timer);
        window.removeEventListener('message', messageHandler);
        resolve({ confirmed: false });
        this.overlayClosed = false;
        this.confirmationWindow = undefined;
      }
    };
    this.timer = setInterval(
      timerCallback,
      CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION,
    );

    this.overlay.update(() => {
      return this.recreateConfirmationWindow(href, timerCallback);
    });
  }

  private recreateConfirmationWindow(href: string, timerCallback: () => void) {
    try {
      // Clears and recreates the timer to ensure when the confirmation window
      // is closed and recreated the transaction is not rejected.
      clearInterval(this.timer);
      this.confirmationWindow?.close();
      this.confirmationWindow = openPopupCenter({
        url: href,
        title: CONFIRMATION_WINDOW_TITLE,
        width: this.popupOptions?.width || CONFIRMATION_WINDOW_WIDTH,
        height: this.popupOptions?.height || CONFIRMATION_WINDOW_HEIGHT,
      });
      this.timer = setInterval(
        timerCallback,
        CONFIRMATION_WINDOW_CLOSED_POLLING_DURATION,
      );
    } catch {
      /* Empty */
    }
  }
}
