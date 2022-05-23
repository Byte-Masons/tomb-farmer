async function main() {
  const vaultAddress = '0x29c638eA952264fBc406e7FD7AAf5647bBb3d23A';
  const strategyAddress = '0xe62CA091CDB126647d939Aa61678b533c39971C7';

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
