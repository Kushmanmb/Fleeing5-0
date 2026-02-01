import { Signature } from '@coinbase/onchainkit/signature';
import { domain, types, message } from './data';

export default function SignatureExample() {
  return (
    <Signature
      domain={domain}
      types={types}
      primaryType="Attest"
      message={message}
      label="Sign EIP712"
      onSuccess={(signature: string) => console.log(signature)}
    />
  );
}
