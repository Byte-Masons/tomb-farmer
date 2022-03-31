async function main() {
  const Vault = await ethers.getContractFactory('ReaperUniV2Zap');

  const vault = await Vault.deploy(
    '0x6D0176C5ea1e44b08D3dd001b0784cE42F47a3A7',
    '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  );

  await vault.deployed();
  console.log('Vault deployed to:', vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
