import { Transfer } from "../generated/templates/NftContract/ERC721";
import { Nft, NftContract } from "../generated/schema";
import { fetchName, fetchSymbol, handleTransfer } from "./mapping";
import { PopSkullysNFT as PopSkullys } from "../generated/PopSkullys/PopSkullysNFT";
import { POP_NFT, ZERO_ADDRESS } from "./constants";
import { Address, BigInt, log,  } from "@graphprotocol/graph-ts";

export function handleTransferPopSkullys(event: Transfer): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "PopSkullys";
    nftContract.save();
  }

  handleTransfer(event);

  let id = address + "/" + event.params.id.toString();
  let nft = Nft.load(id);
  if (nft.creatorAddress == null) {
    nft.creatorAddress = getAddressOfCreator(event.address, nft.tokenID);
    let zoraContract = PopSkullys.bind(event.address)
    nft.tokenURI = zoraContract.tokenMetadataURI(nft.tokenID);
    nft.save();
  }
}

function getAddressOfCreator(address: Address, tokenId: BigInt): Address {
  if (address == POP_NFT) {
    let contract = PopSkullys.bind(address);
    return contract.tokenCreators(tokenId);
  } else {
    log.warning("PopSkullys contract address {} not found!", [address.toHexString()]);
    return ZERO_ADDRESS;
  }
}