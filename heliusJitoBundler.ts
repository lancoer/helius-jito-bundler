import { Helius } from 'helius-sdk';
import dotenv from 'dotenv';
import { Keypair } from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';
import bs58 from 'bs58';

import secretA from './test-ledger/id1.json';
import secretB from './test-ledger/id2.json';

dotenv.config();

const walletA = Keypair.fromSecretKey(new Uint8Array(secretA));
const walletB = Keypair.fromSecretKey(new Uint8Array(secretB));
const helius = new Helius(process.env.HELIUS_API_KEY || '', process.env.HELIUS_CLUSTER || 'testnet');
const jitoApiUrl = `${process.env.BLOCK_ENGINE_URL}/api/v1/bundles`;

const sendHeliusJitoBundle = async () => {
  const sTx1 = bs58.encode(
    (
      await helius.rpc.createSmartTransaction([createMemoInstruction('Hello, this is sequence 1. last message from Ishymura...')], [walletA])
    ).smartTransaction.serialize()
  );
  const sTx2 = bs58.encode(
    (
      await helius.rpc.createSmartTransaction([createMemoInstruction('Hi, this is sequence 2. sending lyrics via radio channel #12.31')], [walletA])
    ).smartTransaction.serialize()
  );
  const sTx3 = bs58.encode(
    (
      await helius.rpc.createSmartTransaction([createMemoInstruction('Hi, this is sequence 3. twinkle, twinkle, little star')], [walletA])
    ).smartTransaction.serialize()
  );
  const sTx4 = bs58.encode(
    (
      await helius.rpc.createSmartTransaction(
        [createMemoInstruction("Hi, this is sequence 4. i don't want to be one of them good bye, Issac...")],
        [walletB],
        undefined
      )
    ).smartTransaction.serialize()
  );
  const jitoTipTx = (await helius.rpc.createSmartTransactionWithTip([], [walletA], undefined, 100_000)).serializedTransaction;

  const bundleId = await helius.rpc.sendJitoBundle([sTx1, sTx2, sTx3, sTx4, jitoTipTx], jitoApiUrl);
  const statuses = await helius.rpc.getBundleStatuses([bundleId], jitoApiUrl);

  console.log('slot:', statuses.context.slot);
  console.log('bundle id:', bundleId);
};

sendHeliusJitoBundle();
