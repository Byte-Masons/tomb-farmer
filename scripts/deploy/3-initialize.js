async function main() {
  const vaultAddress = '0xc98A3076Ea2123c53304a132278d145E56a2A64A';
  const strategyAddress = '0xe51eF0f7e1F1C31289D7dd77f961ac6483a05437';

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
