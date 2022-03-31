async function main() {
  const vaultAddress = '0xA6423CCF421E591e52124d2E5CD04b00515e6fa2';
  const strategyAddress = '0x9C661130e2c1c43Fc3108a567d5F5C6Ba5a598B0';

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
