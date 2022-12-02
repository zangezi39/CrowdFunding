import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0x11B1f0B258eeD92EFea936504440E271f61d014F'
);

export default instance;
