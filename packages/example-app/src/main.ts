import './styles.css';
import { ClientConfig, Environment } from '@onbeam/sdk/dist/types';
import { BeamClient } from '@onbeam/sdk';
import beamLogo from '/beam-logo.png';

const entityId = import.meta.env.VITE_BEAM_ENTITY_ID;

const config: ClientConfig = {
  environment: Environment.PREVIEW,
  publishableKey: import.meta.env.VITE_BEAM_PUBLISHABLE_KEY,
  debug: true,
};

const client = new BeamClient(config);

document.querySelector<HTMLDivElement>('#root')!.innerHTML = `
  <div>
    <a href="https://docs.onbeam.com/service/sdk" target="_blank">
      <img src="${beamLogo}" class="logo" alt="Beam Docs" />
    </a>
    <h1>Beam SDK Web Example</h1>
    <div class="card">
      <button id="createSessionButton" type="button">Create a session</button>
    </div>
    <p class="read-the-docs">
      Click on the Beam logo to learn more
    </p>
  </div>
`;

document
  .querySelector<HTMLButtonElement>('#createSessionButton')!
  .addEventListener('click', async () => {
    try {
      await client.createSession(entityId, 13337);
    } catch (error) {
      console.error(error);
    }
  });
