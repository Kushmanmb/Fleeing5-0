import { Signature } from '@coinbase/onchainkit/signature';

export default function PersonalSignExample() {
  return (
    <Signature
      message="Hello, OnchainKit!"
      label="Personal Sign"
      onSuccess={(signature: string) => console.log(signature)}
    />
  );
}
