async function main() {
  const vaultAddress = '0x88bae7e6905b9606467B79bD874A02f35E4e3Af5';
  const strategyAddress = '0x9665936bbda838De4FaC42A082dDC68f0648f714';

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
