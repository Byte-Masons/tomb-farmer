async function main() {
  const vaultAddress = '0x08A49f456D385e4FA212D30C5973cDe6db7f98AD';
  const strategyAddress = '0x32582BE37f7FCbBE93a9A1B5a2b686c425794bF7';

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
