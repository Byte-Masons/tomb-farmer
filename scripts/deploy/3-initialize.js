async function main() {
  const vaultAddress = '0x3483B512EbA6F0600Ea7A312efe150FCDCD921A7';
  const strategyAddress = '0x88523148eDd7e2c60f15a35067e0a8E1F96c6a6c';

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
