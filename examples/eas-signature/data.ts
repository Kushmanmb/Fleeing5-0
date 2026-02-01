import { encodeAbiParameters } from 'viem';
import { base } from 'viem/chains';

export const domain = {
  name: 'EAS Attestation',
  version: '1.0.0',
  chainId: base.id,
  verifyingContract: '0x4200000000000000000000000000000000000021',
};

export const types = {
  Attest: [
    { name: 'schema', type: 'bytes32' },
    { name: 'recipient', type: 'address' },
    { name: 'time', type: 'uint64' },
    { name: 'revocable', type: 'bool' },
    { name: 'refUID', type: 'bytes32' },
    { name: 'data', type: 'bytes' },
    { name: 'value', type: 'uint256' },
  ],
};

export const message = {
  schema: '0xf58b8b212ef75ee8cd7e8d803c37c03e0519890502d5e99ee2412aae1456cafe',
  recipient: '0x1230000000000000000000000000000000000000', // Example recipient address
  time: BigInt(0), // Attestation timestamp - set to current time in production
  revocable: false,
  refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
  data: encodeAbiParameters([{ type: 'string' }], ['test attestation']),
  value: BigInt(0),
};
