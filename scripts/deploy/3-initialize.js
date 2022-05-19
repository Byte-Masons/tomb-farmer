async function main() {
  const vaultAddress = '0xDC5716FBe2A8E6a1014B971aca4f38c10777F302';
  const strategyAddress = '0xCb487E30c53127232EB1AdA891c8fbD2678f6e37';

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
