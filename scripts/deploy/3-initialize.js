async function main() {
  const vaultAddress = '0x96592E8c8534656642dBbD22403a4fbdaA2E3fCa';
  const strategyAddress = '0x30BC269d535298Dd515cb31B4E7769efd0B1D815';

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
