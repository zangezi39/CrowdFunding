const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
//const scrypt = require('scrypt.js');

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  await factory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe('Campaign', () => {

  it('Deploys a factory and a campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
    console.log(campaign.options.address)
  });

  it('Identifies caller as campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert(accounts[0] == manager);
  });

  it('Allows people to donate money and become approvers' , async () => {
    await campaign.methods.contribute().send({
      value: 200,
      from: accounts[1]
    });
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('Requires a minimum contribution' , async () => {
    try {
      await campaign.methods.contribute().send({
        value: 10,
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Allows a manager to make a payment request', async () => {
    await campaign.methods
      .createRequest('Buy cocaine and hire some hookers', '1500', accounts[1])
      .send({
        from: accounts[0],
        gas: '1000000'
      });
    const request = await campaign.methods.requests(0).call();

    assert.equal('Buy cocaine and hire some hookers', request.description);
  });

  it('Processes requests', async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether')
    });

    await campaign.methods
      .createRequest('Buy a Ferari', web3.utils.toWei('5', 'ether'), accounts[1])
      .send({ from: accounts[0], gas: '1000000'});

    await campaign.methods.approveRequest(0)
      .send({ from: accounts[0], gas: '1000000'});

    await campaign.methods.finalizeRequest(0)
      .send({ from: accounts[0], gas: '1000000'});

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.toWei(balance, 'ether');
    balance = parseFloat(balance);
    console.log(balance);
    assert(balance > 104);
  });

});
