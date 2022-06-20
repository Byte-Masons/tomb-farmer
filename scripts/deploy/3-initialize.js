async function main() {
  const vaultAddress = '0x608ED0c514B1CF55f184306b6c4C6B3E81Ef8DD1';
  const strategyAddress = '0x280A1941165C4B6AC279CA2E4D268e2C20C93a24';

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
