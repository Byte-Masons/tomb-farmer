async function main() {
  const vaultAddress = '0x024721884f2E6ffc872F5D3C5eB8d8dF9140091D';
  const strategyAddress = '0x05f87EF8f1Dc92Bd9F0e9D63F91eBC7f673c5393';

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
