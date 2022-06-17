async function main() {
  const vaultAddress = '0xCa491C9F4807f6c334425e96c8dF0835a3eA7813';
  const strategyAddress = '0x80BD129328d56AdeaEEBCa4e4eA7e428D5DD587f';

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
