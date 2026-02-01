# OnChainKit Signature Component Examples

This directory contains examples demonstrating how to use the OnChainKit `Signature` component for both EIP-712 typed data signing and personal message signing.

## Quick Start

The OnChainKit Signature component provides an easy, UI-driven way to let users sign messages and typed data in React applications. This directory includes examples for both signature methods.

## Overview

The examples demonstrate:
1. **EIP-712 Typed Data Signing** - For structured data like EAS attestations
2. **Personal Message Signing** - For simple text message signing

## Files

- **data.ts** - Contains the EIP-712 typed data structure including:
  - `domain`: The EIP-712 domain separator for EAS on Base
  - `types`: The EAS Attest type definition
  - `message`: An example attestation message

- **SignatureExample.tsx** - React component demonstrating EIP-712 signature (EAS attestations)
- **PersonalSignExample.tsx** - React component demonstrating personal message signing

## Prerequisites

To use this example, you need to install the following dependencies:

```bash
npm install @coinbase/onchainkit viem
```

Or with yarn:

```bash
yarn add @coinbase/onchainkit viem
```

## Quick Start Examples

### Example 1: Personal Message Signing

The simplest way to use the Signature component is for personal message signing:

```tsx
import { Signature } from '@coinbase/onchainkit/signature';

<Signature
  message="Hello, OnchainKit!"
  label="Personal Sign"
  onSuccess={(signature: string) => console.log(signature)}
/>
```

This example is implemented in **PersonalSignExample.tsx**.

### Example 2: EIP-712 Typed Data Signing (EAS Attestations)

For more complex structured data like EAS attestations, use the full EIP-712 signing:

```tsx
import { Signature } from '@coinbase/onchainkit/signature';
import { base } from 'viem/chains';

const domain = {
  name: 'EAS Attestation',
  version: '1.0.0',
  chainId: base.id,
  verifyingContract: '0x4200000000000000000000000000000000000021',
};

const types = {
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

const message = {
  schema: '0x...',
  recipient: '0x123...',
  time: BigInt(0),
  revocable: false,
  refUID: '0x0...',
  data: '0x...',
  value: BigInt(0),
};

<Signature
  domain={domain}
  types={types}
  primaryType="Attest"
  message={message}
  label="Sign EIP712"
  onSuccess={(signature: string) => console.log(signature)}
/>
```

This example is implemented in **SignatureExample.tsx** and **data.ts**.

## Usage

### In a React Application

Import and use either example component in your React application:

#### Using Personal Sign:

```tsx
import PersonalSignExample from './examples/eas-signature/PersonalSignExample';

function App() {
  return (
    <div>
      <h1>Personal Message Signing</h1>
      <PersonalSignExample />
    </div>
  );
}
```

#### Using EIP-712 (EAS Attestation):

```tsx
import SignatureExample from './examples/eas-signature/SignatureExample';

function App() {
  return (
    <div>
      <h1>EAS Attestation Signing</h1>
      <SignatureExample />
    </div>
  );
}
```

### Standalone Usage - Personal Sign

For simple message signing, use:

```tsx
import { Signature } from '@coinbase/onchainkit/signature';

<Signature
  message="Your message here"
  label="Sign Message"
  onSuccess={(signature: string) => {
    console.log('Signature received:', signature);
    // Handle the signature
  }}
/>
```

### Standalone Usage - EIP-712

You can also use the Signature component directly in your code:

```tsx
import { Signature } from '@coinbase/onchainkit/signature';
import { domain, types, message } from './data';

<Signature
  domain={domain}
  types={types}
  primaryType="Attest"
  message={message}
  label="Sign EIP712"
  onSuccess={(signature: string) => {
    console.log('Signature received:', signature);
    // Handle the signature, e.g., submit to your backend or blockchain
  }}
/>
```

## EIP-712 Structure

### Domain

The domain separator identifies the signing context:

```typescript
{
  name: 'EAS Attestation',
  version: '1.0.0',
  chainId: base.id,  // Base chain ID (8453)
  verifyingContract: '0x4200000000000000000000000000000000000021',  // EAS contract on Base
}
```

### Types

The Attest type defines the structure of an EAS attestation:

```typescript
{
  Attest: [
    { name: 'schema', type: 'bytes32' },      // Schema identifier
    { name: 'recipient', type: 'address' },   // Attestation recipient
    { name: 'time', type: 'uint64' },         // Attestation timestamp
    { name: 'revocable', type: 'bool' },      // Whether attestation can be revoked
    { name: 'refUID', type: 'bytes32' },      // Reference to another attestation
    { name: 'data', type: 'bytes' },          // ABI-encoded attestation data
    { name: 'value', type: 'uint256' },       // Optional ETH value
  ],
}
```

### Message

An example attestation message:

```typescript
{
  schema: '0xf58b8b212ef75ee8cd7e8d803c37c03e0519890502d5e99ee2412aae1456cafe',
  recipient: '0x1230000000000000000000000000000000000000',
  time: BigInt(0),
  revocable: false,
  refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
  data: encodeAbiParameters([{ type: 'string' }], ['test attestation']),
  value: BigInt(0),
}
```

**Note**: The example values above are for demonstration purposes:
- `recipient`: Replace with the actual Ethereum address that should receive the attestation
- `time`: Set to the current timestamp (e.g., `BigInt(Math.floor(Date.now() / 1000))`) when creating real attestations
- `schema`: Use the appropriate schema ID for your attestation type

## Customization

### Modifying the Attestation Data

To change the attestation data, update the `message.data` field in `data.ts`:

```typescript
import { encodeAbiParameters } from 'viem';

// For a string attestation
const data = encodeAbiParameters(
  [{ type: 'string' }], 
  ['Your attestation message']
);

// For multiple fields
const data = encodeAbiParameters(
  [
    { type: 'string', name: 'field1' },
    { type: 'uint256', name: 'field2' },
    { type: 'bool', name: 'field3' }
  ],
  ['value1', BigInt(123), true]
);
```

### Handling the Signature

The `onSuccess` callback receives the signature string:

```tsx
<Signature
  // ... other props
  onSuccess={(signature: string) => {
    // Submit to your backend
    fetch('/api/submit-attestation', {
      method: 'POST',
      body: JSON.stringify({ signature, message }),
      headers: { 'Content-Type': 'application/json' }
    });
  }}
/>
```

## Resources

- [OnChainKit Documentation](https://onchainkit.xyz/)
- [Ethereum Attestation Service](https://attest.sh/)
- [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)
- [Viem Documentation](https://viem.sh/)
- [EAS on Base](https://base.easscan.org/)

## Notes

- The `chainId` is set to Base (8453). Modify it if you're using a different network.
- The `verifyingContract` address is the EAS contract on Base mainnet.
- Make sure your wallet is connected and on the correct network before attempting to sign.
- The signature is generated client-side and never sent to any server unless you explicitly implement that functionality.
