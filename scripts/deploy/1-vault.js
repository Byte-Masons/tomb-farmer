async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0xd840aF68b35469eC3478c9b0CBCDdc6dc80Dd98C';
  const tokenName = 'USDC-MIM Tomb Crypt';
  const tokenSymbol = 'rf-USDC-MIM';
  const depositFee = 25;
  const tvlCap = ethers.constants.MaxUint256;

  const vault = await Vault.deploy(wantAddress, tokenName, tokenSymbol, depositFee, tvlCap);

  await vault.deployed();
  console.log('Vault deployed to:', vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
