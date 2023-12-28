// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract NftNode is ERC721URIStorage {
    constructor(address initialOwner) ERC721('TestoweNft', 'TNFT') {}

    function mint(
        address _to,
        uint256 _tokenId,
        string calldata _uri
    ) external {
        _mint(_to, _tokenId);
        _setTokenURI(_tokenId, _uri);
    }
}
