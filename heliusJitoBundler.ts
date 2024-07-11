import { Helius } from 'helius-sdk';
import dotenv from 'dotenv';
import { Keypair } from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';
import bs58 from 'bs58';

import secret from './test-ledger/id.json';

dotenv.config();

const wallet = Keypair.fromSecretKey(new Uint8Array(secret));
const helius = new Helius(process.env.HELIUS_API_KEY || '', process.env.HELIUS_CLUSTER || 'testnet');
const jitoApiUrl = `${process.env.BLOCK_ENGINE_URL}/api/v1/bundles`;

const sendHeliusJitoBundle = async () => {
  const sTx1 = bs58.encode(
    (await helius.rpc.createSmartTransaction([createMemoInstruction('Hello, this is sequence 1. To be continued...')], [wallet])).smartTransaction.serialize()
  );
  const sTx2 = bs58.encode(
    (
      await helius.rpc.createSmartTransaction([createMemoInstruction('Hi, this is sequence 2. sending tip <beep> <beep> <beep>')], [wallet])
    ).smartTransaction.serialize()
  );
  const jitoTipTx = (await helius.rpc.createSmartTransactionWithTip([], [wallet], undefined, 100_000)).serializedTransaction;

  const bundleId = await helius.rpc.sendJitoBundle([sTx1, sTx2, jitoTipTx], jitoApiUrl);
  const statuses = await helius.rpc.getBundleStatuses([bundleId], jitoApiUrl);

  console.log('slot:', statuses.context.slot);
  console.log('bundle id:', bundleId);
};

sendHeliusJitoBundle();
