// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IFFNFT {
    function mint(address to, uint256 propertyTypeId) external returns(uint256);
}