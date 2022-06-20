async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0xd702D7495b010936EBc53a1efeE42D97996Ca5Ee';
  const tokenName = 'TSHARE-WETH Tomb Crypt';
  const tokenSymbol = 'rf-TSHARE-WETH';
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
