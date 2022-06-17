async function main() {
  const vaultAddress = '0xB866fC187fFC578b6f720387dF2089a9D6C95Ada';
  const strategyAddress = '0xA886c625B7b3b1c6B3D1162d31f4a28ccbAA5ff8';

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
