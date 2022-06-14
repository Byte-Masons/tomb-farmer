async function main() {
  const vaultAddress = '0xdAB69F11d14f54F08a540748C6748CE0Faa647eF';
  const strategyAddress = '0x8a36f97BEDC02cb68CB3aD684A408a832E7bBf95';

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
