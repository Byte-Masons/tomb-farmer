async function main() {
  const vaultAddress = '0x08D18c880bD844ad0842b8C423763c06770EcC4E';
  const strategyAddress = '0x520245479E8091a1ceE878281aFCD0d2810e7137';

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
