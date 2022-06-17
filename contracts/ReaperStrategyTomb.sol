// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./abstract/ReaperBaseStrategyv2.sol";
import "./interfaces/IMasterChef.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/**
 * @dev Deposit TombSwap LPs (with WFTM underlying) in LShareRewardPool. Harvest LSHARE rewards and compound.
 */
contract ReaperStrategyTomb is ReaperBaseStrategyv2 {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // 3rd-party contract addresses
    address public constant TOMB_ROUTER = address(0x6D0176C5ea1e44b08D3dd001b0784cE42F47a3A7);
    address public constant SPOOKY_ROUTER = address(0xF491e7B69E4244ad4002BC14e878a34207E38c29);
    address public constant LSHARE_REWARD_POOL = address(0x1F832dfBA15346D25438Cf7Ac683b013Ed03E32f);

    /**
     * @dev Tokens Used:
     * {WFTM} - Required for liquidity routing when doing swaps.
     * {LSHARE} - Reward token for depositing LP into LShareRewardPool.
     * {USDC} - Used to route LSHARE to WFTM.
     * {want} - LP token address.
     * {lpToken0} - First token within the LP.
     * {lpToken1} - Second token within the LP.
     */
    address public constant WFTM = address(0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83);
    address public constant LSHARE = address(0xCbE0CA46399Af916784cADF5bCC3aED2052D6C45);
    address public constant USDC = address(0x04068DA6C83AFCFA0e13ba15A6696662335D5B75);
    address public want;
    address public lpToken0;
    address public lpToken1;

    /**
     * @dev Paths used to swap tokens:
     * {lshareToUsdcPath} - to swap {LSHARE} to {USDC}
     * {lshareToWftmPath} - to swap {LSHARE} to {WFTM}, necessary to estimate harvest
     * {usdcToLPTokenPath0} - to swap half of {USDC} to one of the underlying token within the LP.
     * {usdcToLPTokenPath1} - to swap half of {USDC} to the other underlying token within the LP.
     */
    address[] public lshareToUsdcPath;
    address[] public lshareToWftmPath;
    address[] public usdcToLPTokenPath0;
    address[] public usdcToLPTokenPath1;

    /**
     * @dev Tomb variables
     * {poolId} - ID of pool in which to deposit LP tokens
     */
    uint256 public poolId;

    /**
     * @dev Initializes the strategy. Sets parameters and saves routes.
     * @notice see documentation for each variable above its respective declaration.
     */
    function initialize(
        address _vault,
        address[] memory _feeRemitters,
        address[] memory _strategists,
        address _want,
        uint256 _poolId
    ) public initializer {
        __ReaperBaseStrategy_init(_vault, _feeRemitters, _strategists);
        want = _want;
        poolId = _poolId;

        lpToken0 = IUniswapV2Pair(_want).token0();
        lpToken1 = IUniswapV2Pair(_want).token1();

        lshareToUsdcPath = [LSHARE, USDC];
        lshareToWftmPath = [LSHARE, USDC, WFTM];
        usdcToLPTokenPath0 = [USDC, lpToken0];
        usdcToLPTokenPath1 = [USDC, lpToken1];
    }

    function setPathToLPToken(uint256 _lpTokenNum, address[] memory _path) external {
        _onlyStrategistOrOwner();
        require(_path[0] == USDC && (_path[_path.length - 1] == lpToken0 || _path[_path.length - 1] == lpToken1), "path error");
        if(_lpTokenNum == 0) {
            usdcToLPTokenPath0 = _path;
        } else if (_lpTokenNum == 1) {
            usdcToLPTokenPath1 = _path;
        }
    }

    /**
     * @dev Function that puts the funds to work.
     *      It gets called whenever someone deposits in the strategy's vault contract.
     */
    function _deposit() internal override {
        uint256 wantBalance = IERC20Upgradeable(want).balanceOf(address(this));
        if (wantBalance != 0) {
            IERC20Upgradeable(want).safeIncreaseAllowance(LSHARE_REWARD_POOL, wantBalance);
            IMasterChef(LSHARE_REWARD_POOL).deposit(poolId, wantBalance);
        }
    }

    /**
     * @dev Withdraws funds and sends them back to the vault.
     */
    function _withdraw(uint256 _amount) internal override {
        uint256 wantBal = IERC20Upgradeable(want).balanceOf(address(this));
        if (wantBal < _amount) {
            IMasterChef(LSHARE_REWARD_POOL).withdraw(poolId, _amount - wantBal);
        }

        IERC20Upgradeable(want).safeTransfer(vault, _amount);
    }

    /**
     * @dev Core function of the strat, in charge of collecting and re-investing rewards.
     *      1. Claims {LSHARE} from the {LSHARE_REWARD_POOL}.
     *      2. Swaps {LSHARE} to {WFTM}.
     *      3. Claims fees for the harvest caller and treasury.
     *      4. Swaps half of {WFTM} to other LP token.
     *      5. Creates new LP tokens and deposits.
     */
    function _harvestCore() internal override {
        IMasterChef(LSHARE_REWARD_POOL).deposit(poolId, 0); // deposit 0 to claim rewards
        _swap(IERC20Upgradeable(LSHARE).balanceOf(address(this)), lshareToUsdcPath);
        _chargeFees();
        _swap(IERC20Upgradeable(USDC).balanceOf(address(this)) / 2, usdcToLPTokenPath0);
        _swap(IERC20Upgradeable(USDC).balanceOf(address(this)), usdcToLPTokenPath1);
        _addLiquidity();
        deposit();
    }

    /**
     * @dev Helper function to swap tokens given an {_amount} and swap {_path}. It uses either
     *      {TOMB_ROUTER} or {SPOOKY_ROUTER} depending on which one gives better output.
     */
    function _swap(uint256 _amount, address[] memory _path) internal {
        if (_path.length < 2 || _amount == 0) {
            return;
        }

        uint256 fromTombRouter = 0;
        uint256 fromSpookyRouter = 0;

        try IUniswapV2Router02(TOMB_ROUTER).getAmountsOut(_amount, _path) returns (uint256[] memory amounts) {
            fromTombRouter = amounts[_path.length - 1];
        } catch {}
        try IUniswapV2Router02(SPOOKY_ROUTER).getAmountsOut(_amount, _path) returns (uint256[] memory amounts) {
            fromSpookyRouter = amounts[_path.length - 1];
        } catch {}

        address router = fromTombRouter > fromSpookyRouter ? TOMB_ROUTER : SPOOKY_ROUTER;

        IERC20Upgradeable(_path[0]).safeIncreaseAllowance(router, _amount);
        IUniswapV2Router02(router).swapExactTokensForTokensSupportingFeeOnTransferTokens(
            _amount,
            0,
            _path,
            address(this),
            block.timestamp
        );
    }

    /**
     * @dev Core harvest function.
     *      Charges fees based on the amount of USDC gained from reward
     */
    function _chargeFees() internal {
        IERC20Upgradeable usdc = IERC20Upgradeable(USDC);
        uint256 usdcFee = (usdc.balanceOf(address(this)) * totalFee) / PERCENT_DIVISOR;
        if (usdcFee != 0) {
            uint256 callFeeToUser = (usdcFee * callFee) / PERCENT_DIVISOR;
            uint256 treasuryFeeToVault = (usdcFee * treasuryFee) / PERCENT_DIVISOR;
            uint256 feeToStrategist = (treasuryFeeToVault * strategistFee) / PERCENT_DIVISOR;
            treasuryFeeToVault -= feeToStrategist;

            usdc.safeTransfer(msg.sender, callFeeToUser);
            usdc.safeTransfer(treasury, treasuryFeeToVault);
            usdc.safeTransfer(strategistRemitter, feeToStrategist);
        }
    }

    /**
     * @dev Core harvest function. Adds more liquidity using {lpToken0} and {lpToken1}.
     */
    function _addLiquidity() internal {
        uint256 lp0Bal = IERC20Upgradeable(lpToken0).balanceOf(address(this));
        uint256 lp1Bal = IERC20Upgradeable(lpToken1).balanceOf(address(this));

        if (lp0Bal != 0 && lp1Bal != 0) {
            IERC20Upgradeable(lpToken0).safeIncreaseAllowance(TOMB_ROUTER, lp0Bal);
            IERC20Upgradeable(lpToken1).safeIncreaseAllowance(TOMB_ROUTER, lp1Bal);
            IUniswapV2Router02(TOMB_ROUTER).addLiquidity(
                lpToken0,
                lpToken1,
                lp0Bal,
                lp1Bal,
                0,
                0,
                address(this),
                block.timestamp
            );
        }
    }

    /**
     * @dev Function to calculate the total {want} held by the strat.
     *      It takes into account both the funds in hand, plus the funds in the MasterChef.
     */
    function balanceOf() public view override returns (uint256) {
        (uint256 amount, ) = IMasterChef(LSHARE_REWARD_POOL).userInfo(poolId, address(this));
        return amount + IERC20Upgradeable(want).balanceOf(address(this));
    }

    /**
     * @dev Returns the approx amount of profit from harvesting.
     *      Profit is denominated in WFTM, and takes fees into account.
     */
    function estimateHarvest() external view override returns (uint256 profit, uint256 callFeeToUser) {
        uint256 pendingReward = IMasterChef(LSHARE_REWARD_POOL).pendingShare(poolId, address(this));
        uint256 totalRewards = pendingReward + IERC20Upgradeable(LSHARE).balanceOf(address(this));
        uint256 fromTombRouter = 0;
        uint256 fromSpookyRouter = 0;

        if (totalRewards != 0) {
            try IUniswapV2Router02(TOMB_ROUTER).getAmountsOut(totalRewards, lshareToWftmPath) returns (uint256[] memory amounts) {
                fromTombRouter = amounts[lshareToWftmPath.length - 1];
            } catch {}
            try IUniswapV2Router02(SPOOKY_ROUTER).getAmountsOut(totalRewards, lshareToWftmPath) returns (uint256[] memory amounts) {
                fromSpookyRouter = amounts[lshareToWftmPath.length - 1];
            } catch {}
        }

        profit += IERC20Upgradeable(WFTM).balanceOf(address(this));

        uint256 wftmFee = (profit * totalFee) / PERCENT_DIVISOR;
        callFeeToUser = (wftmFee * callFee) / PERCENT_DIVISOR;
        profit -= wftmFee;
    }

    /**
     * @dev Function to retire the strategy. Claims all rewards and withdraws
     *      all principal from external contracts, and sends everything back to
     *      the vault. Can only be called by strategist or owner.
     *
     * Note: this is not an emergency withdraw function. For that, see panic().
     */
    function _retireStrat() internal override {
        IMasterChef(LSHARE_REWARD_POOL).deposit(poolId, 0); // deposit 0 to claim rewards
        _swap(IERC20Upgradeable(LSHARE).balanceOf(address(this)), lshareToUsdcPath);
        _swap(IERC20Upgradeable(USDC).balanceOf(address(this)) / 2, usdcToLPTokenPath0);
        _swap(IERC20Upgradeable(USDC).balanceOf(address(this)), usdcToLPTokenPath1);
        _addLiquidity();

        (uint256 poolBal, ) = IMasterChef(LSHARE_REWARD_POOL).userInfo(poolId, address(this));
        IMasterChef(LSHARE_REWARD_POOL).withdraw(poolId, poolBal);

        uint256 wantBalance = IERC20Upgradeable(want).balanceOf(address(this));
        IERC20Upgradeable(want).safeTransfer(vault, wantBalance);
    }

    /**
     * Withdraws all funds leaving rewards behind.
     */
    function _reclaimWant() internal override {
        IMasterChef(LSHARE_REWARD_POOL).emergencyWithdraw(poolId);
    }
}
