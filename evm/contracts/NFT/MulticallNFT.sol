// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { FairFightNFT } from "./FFNFT.sol";

contract MulticallNFT {
    
    function callPropertyTokensLength(FairFightNFT NFTContract, address player, uint256[] calldata propertyIds) external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](propertyIds.length);
        for (uint256 i; i < propertyIds.length; i++) {
            uint256 length = NFTContract.getOwnerPropertyTokensLength(player, propertyIds[i]);
            results[i] = length;
        }
        return results;
    }

}