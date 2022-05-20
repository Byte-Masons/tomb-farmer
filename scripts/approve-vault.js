async function main() {
  const vaultAddress = '0xB41bb697893fdF54cef37Dfc451e6f5faD021E77';
  const ERC20 = await ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20');
  const wantAddress = '0xDEc1259188E6c5273AcD1e84d5B4b58897CA013e';
  const want = await ERC20.attach(wantAddress);
  await want.approve(vaultAddress, ethers.utils.parseEther('9999999999999999999999'));
  console.log('want approved');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
