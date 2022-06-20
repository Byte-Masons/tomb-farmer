async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x38fF5377A42D0A45C829de45801481869087d22C';
  const tokenName = 'FUSD-USDC Tomb Crypt';
  const tokenSymbol = 'rf-FUSD-USDC';
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
