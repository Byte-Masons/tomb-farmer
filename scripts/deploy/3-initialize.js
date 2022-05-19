async function main() {
  const vaultAddress = '0x0Fade1D48df47f9A2ea7D1189409C784e47Cc0dA';
  const strategyAddress = '0xE2A708A6Af09297A01E2Bb81aAbBb377C9D0aF58';

  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');
  const vault = Vault.attach(vaultAddress);

  await vault.initialize(strategyAddress);
  console.log('Vault initialized');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
