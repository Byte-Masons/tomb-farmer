async function main() {
  const vaultAddress = '0x7723be1cDA671c8e1EB367B525D1cF1C0BF2Aac8';
  const strategyAddress = '0xa98F1d1cE977A23d060D93C0DBB1c0718a81AEBf';

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
