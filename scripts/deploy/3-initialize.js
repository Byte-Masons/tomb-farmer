async function main() {
  const vaultAddress = '0xb7576815647549474A02736E0e639Fbc40eA163A';
  const strategyAddress = '0xA5DefF59cfe8C766840e5FeD8D674A7D4bB2fc76';

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
