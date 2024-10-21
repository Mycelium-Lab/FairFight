import { NftItem } from "../../../wrappers/Lootbox";
/* 
    item types
    characters = 0
    armors = 1
    boots = 2
    weapons = 3
    */
type ItemType = {
    id: bigint;
    item: NftItem
};
export function getBasicRarityItems(): Array<ItemType> {
    const items: Array<ItemType> = [
        {   
            id: BigInt(0), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 0n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/0.json'
            } as NftItem
        },
        {   
            id: BigInt(1), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 1n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/1.json'
            } as NftItem
        },
        {   
            id: BigInt(2), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 23n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/23.json'
            } as NftItem
        },
        {   
            id: BigInt(3), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 33n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/33.json'
            } as NftItem
        },
        {   
            id: BigInt(4), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 0n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/0.json'
            } as NftItem
        },
        {   
            id: BigInt(5), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 41n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/41.json'
            } as NftItem
        },
        {   
            id: BigInt(6), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 65n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/65.json'
            } as NftItem
        },
        {   
            id: BigInt(7), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 71n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/71.json'
            } as NftItem
        },
        {   
            id: BigInt(8), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 72n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/72.json'
            } as NftItem
        },
        {   
            id: BigInt(9), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 85n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/85.json'
            } as NftItem
        },
        {   
            id: BigInt(10), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 86n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/86.json'
            } as NftItem
        },
        {   
            id: BigInt(11), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 88n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/88.json'
            } as NftItem
        },
        {   
            id: BigInt(12), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 89n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/89.json'
            } as NftItem
        },
        {   
            id: BigInt(13), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 90n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/90.json'
            } as NftItem
        },
        {   
            id: BigInt(14), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 91n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/91.json'
            } as NftItem
        },
        {   
            id: BigInt(15), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 0n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/0.json'
            } as NftItem
        },
        {   
            id: BigInt(16), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 93n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/93.json'
            } as NftItem
        },
        {   
            id: BigInt(17), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 94n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/94.json'
            } as NftItem
        },
        {   
            id: BigInt(18), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 97n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/97.json'
            } as NftItem
        },
        {   
            id: BigInt(19), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 113n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/113.json'
            } as NftItem
        },
        {   
            id: BigInt(20), 
            item: {
                $$type: 'NftItem',
                type: 0n,
                index: 0n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/0.json'
            } as NftItem
        },
        {   
            id: BigInt(21), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 116n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/116.json'
            } as NftItem
        },
        {   
            id: BigInt(22), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 117n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/117.json'
            } as NftItem
        },
        {   
            id: BigInt(23), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 119n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/119.json'
            } as NftItem
        },
        {   
            id: BigInt(24), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 12n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/12.json'
            } as NftItem
        },
        {   
            id: BigInt(25), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 13n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/13.json'
            } as NftItem
        },
        {   
            id: BigInt(26), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 17n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/17.json'
            } as NftItem
        },
        {   
            id: BigInt(27), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 22n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/22.json'
            } as NftItem
        },
        {   
            id: BigInt(28), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 25n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/25.json'
            } as NftItem
        },
        {   
            id: BigInt(29), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 27n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/27.json'
            } as NftItem
        },
        {   
            id: BigInt(30), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 29n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/29.json'
            } as NftItem
        },
        {   
            id: BigInt(31), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 8n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/8.json'
            } as NftItem
        }
    ];    
    return items
}

export function getSpecialRarityItems(): Array<ItemType> {
    const items: Array<ItemType> = [
        {   
            id: BigInt(0), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 2n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/2.json'
            } as NftItem
        },
        {   
            id: BigInt(1), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 3n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/3.json'
            } as NftItem
        },
        {   
            id: BigInt(2), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 17n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/17.json'
            } as NftItem
        },
        {   
            id: BigInt(3), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 2n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/2.json'
            } as NftItem
        },
        {   
            id: BigInt(4), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 20n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/20.json'
            } as NftItem
        },
        {   
            id: BigInt(5), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 26n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/26.json'
            } as NftItem
        },
        {   
            id: BigInt(6), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 29n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/29.json'
            } as NftItem
        },
        {   
            id: BigInt(7), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 30n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/30.json'
            } as NftItem
        },
        {   
            id: BigInt(8), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 31n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/31.json'
            } as NftItem
        },
        {   
            id: BigInt(9), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 34n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/34.json'
            } as NftItem
        },
        {   
            id: BigInt(10), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 37n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/37.json'
            } as NftItem
        },
        {   
            id: BigInt(11), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 39n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/39.json'
            } as NftItem
        },
        {   
            id: BigInt(12), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 40n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/40.json'
            } as NftItem
        },
        {   
            id: BigInt(13), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 1n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/1.json'
            } as NftItem
        },
        {   
            id: BigInt(14), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 43n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/43.json'
            } as NftItem
        },
        {   
            id: BigInt(15), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 44n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/44.json'
            } as NftItem
        },
        {   
            id: BigInt(16), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 45n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/45.json'
            } as NftItem
        },
        {   
            id: BigInt(17), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 46n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/46.json'
            } as NftItem
        },
        {   
            id: BigInt(18), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 52n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/52.json'
            } as NftItem
        },
        {   
            id: BigInt(19), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 53n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/53.json'
            } as NftItem
        },
        {   
            id: BigInt(20), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 1n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/1.json'
            } as NftItem
        },
        {   
            id: BigInt(21), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 56n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/56.json'
            } as NftItem
        },
        {   
            id: BigInt(22), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 57n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/57.json'
            } as NftItem
        },
        {   
            id: BigInt(23), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 58n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/58.json'
            } as NftItem
        },
        {   
            id: BigInt(24), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 59n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/59.json'
            } as NftItem
        },
        {   
            id: BigInt(25), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 60n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/60.json'
            } as NftItem
        },
        {   
            id: BigInt(26), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 63n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/63.json'
            } as NftItem
        },
        {   
            id: BigInt(27), 
            item: {
                $$type: 'NftItem',
                type: 4n,
                index: 1n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/1.json'
            } as NftItem
        },
        {   
            id: BigInt(28), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 64n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/64.json'
            } as NftItem
        },
        {   
            id: BigInt(29), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 66n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/66.json'
            } as NftItem
        },
        {   
            id: BigInt(30), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 73n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/73.json'
            } as NftItem
        },
        {   
            id: BigInt(31), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 74n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/74.json'
            } as NftItem
        },
        {   
            id: BigInt(32), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 77n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/77.json'
            } as NftItem
        },
        {   
            id: BigInt(33), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 82n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/82.json'
            } as NftItem
        },
        {   
            id: BigInt(34), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 87n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/87.json'
            } as NftItem
        },
        {   
            id: BigInt(35), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 92n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/92.json'
            } as NftItem
        },
        {   
            id: BigInt(36), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 95n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/95.json'
            } as NftItem
        },
        {   
            id: BigInt(37), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 96n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/96.json'
            } as NftItem
        },
        {   
            id: BigInt(38), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 101n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/101.json'
            } as NftItem
        },
        {   
            id: BigInt(39), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 107n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/107.json'
            } as NftItem
        },
        {   
            id: BigInt(40), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 111n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/111.json'
            } as NftItem
        },
        {   
            id: BigInt(41), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 114n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/114.json'
            } as NftItem
        },
        {   
            id: BigInt(42), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 118n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/118.json'
            } as NftItem
        },
        {   
            id: BigInt(43), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 122n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/122.json'
            } as NftItem
        },
        {   
            id: BigInt(44), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 124n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/124.json'
            } as NftItem
        },
        {   
            id: BigInt(45), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 125n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/125.json'
            } as NftItem
        },
        {   
            id: BigInt(46), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 127n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/127.json'
            } as NftItem
        },
        {   
            id: BigInt(47), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 128n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/128.json'
            } as NftItem
        },
        {   
            id: BigInt(48), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 8n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/8.json'
            } as NftItem
        },
        {   
            id: BigInt(49), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 9n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/9.json'
            } as NftItem
        },
        {   
            id: BigInt(50), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 14n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/14.json'
            } as NftItem
        },
        {   
            id: BigInt(51), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 15n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/15.json'
            } as NftItem
        },
        {   
            id: BigInt(52), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 21n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/21.json'
            } as NftItem
        },
        {   
            id: BigInt(53), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 10n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/10.json'
            } as NftItem
        },
        {   
            id: BigInt(54), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 22n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/22.json'
            } as NftItem
        },
        {   
            id: BigInt(55), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 23n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/23.json'
            } as NftItem
        },
        {   
            id: BigInt(56), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 24n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/24.json'
            } as NftItem
        },
        {   
            id: BigInt(57), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 25n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/25.json'
            } as NftItem
        },
        {   
            id: BigInt(58), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 31n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/31.json'
            } as NftItem
        }
    ];
    return items    
}

export function getRareRarityItems(): Array<ItemType> {
    const items: Array<ItemType> = [
        {   
            id: BigInt(0), 
            item: {
                $$type: 'NftItem',
                type: 0n, // characters
                index: 2n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/2.json'
            } as NftItem
        },
        {   
            id: BigInt(1), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 4n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/4.json'
            } as NftItem
        },
        {   
            id: BigInt(2), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 5n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/5.json'
            } as NftItem
        },
        {   
            id: BigInt(3), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 6n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/6.json'
            } as NftItem
        },
        {   
            id: BigInt(4), 
            item: {
                $$type: 'NftItem',
                type: 1n, // armors
                index: 5n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/5.json'
            } as NftItem
        },
        {   
            id: BigInt(5), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 7n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/7.json'
            } as NftItem
        },
        {   
            id: BigInt(6), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 8n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/8.json'
            } as NftItem
        },
        {   
            id: BigInt(7), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 9n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/9.json'
            } as NftItem
        },
        {   
            id: BigInt(8), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 14n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/14.json'
            } as NftItem
        },
        {   
            id: BigInt(9), 
            item: {
                $$type: 'NftItem',
                type: 1n, // armors
                index: 4n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/4.json'
            } as NftItem
        },
        {   
            id: BigInt(10), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 15n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/15.json'
            } as NftItem
        },
        {   
            id: BigInt(11), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 16n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/16.json'
            } as NftItem
        },
        {   
            id: BigInt(12), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 18n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/18.json'
            } as NftItem
        },
        {   
            id: BigInt(13), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 21n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/21.json'
            } as NftItem
        },
        {   
            id: BigInt(14), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 24n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/24.json'
            } as NftItem
        },
        {   
            id: BigInt(15), 
            item: {
                $$type: 'NftItem',
                type: 1n, // armors
                index: 3n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/3.json'
            } as NftItem
        },
        {   
            id: BigInt(16), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 27n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/27.json'
            } as NftItem
        },
        {   
            id: BigInt(17), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 35n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/35.json'
            } as NftItem
        },
        {   
            id: BigInt(18), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 36n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/36.json'
            } as NftItem
        },
        {   
            id: BigInt(19), 
            item: {
                $$type: 'NftItem',
                type: 3n, // weapons
                index: 50n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/50.json'
            } as NftItem
        },
        {   
            id: BigInt(20), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 54n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/54.json'
            }
        },
        {   
            id: BigInt(21), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 55n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/55.json'
            }
        },
        {   
            id: BigInt(22), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 3n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/3.json'
            }
        },
        {   
            id: BigInt(23), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 61n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/61.json'
            }
        },
        {   
            id: BigInt(24), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 69n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/69.json'
            }
        },
        {   
            id: BigInt(25), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 70n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/70.json'
            }
        },
        {   
            id: BigInt(26), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 75n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/75.json'
            }
        },
        {   
            id: BigInt(27), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 81n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/81.json'
            }
        },
        {   
            id: BigInt(28), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 2n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/2.json'
            }
        },
        {   
            id: BigInt(29), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 98n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/98.json'
            }
        },
        {   
            id: BigInt(30), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 99n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/99.json'
            }
        },
        {   
            id: BigInt(31), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 104n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/104.json'
            }
        },
        {   
            id: BigInt(32), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 109n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/109.json'
            }
        },
        {   
            id: BigInt(33), 
            item: {
                $$type: 'NftItem',
                type: 0n,
                index: 3n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/3.json'
            }
        },
        {   
            id: BigInt(34), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 123n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/123.json'
            }
        },
        {   
            id: BigInt(35), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 130n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/130.json'
            }
        },
        {   
            id: BigInt(36), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 131n,    data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/131.json'
            }
        },
        {   
            id: BigInt(37), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 10n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/10.json'
            }
        },
        {   
            id: BigInt(38), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 11n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/11.json'
            }
        },
        {   
            id: BigInt(39), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 18n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/18.json'
            }
        },
        {   
            id: BigInt(40), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 28n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/28.json'
            }
        },
        {   
            id: BigInt(41), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 30n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/30.json'
            }
        },
        {   
            id: BigInt(42), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 12n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/12.json'
            }
        },
        {   
            id: BigInt(43), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 14n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/14.json'
            }
        },
        {   
            id: BigInt(44), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 19n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/19.json'
            }
        },
        {   
            id: BigInt(45), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 20n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/20.json'
            }
        },
        {   
            id: BigInt(46), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 21n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/21.json'
            }
        },
        {   
            id: BigInt(47), 
            item: {
                $$type: 'NftItem',
                type: 0n,
                index: 7n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/7.json'
            }
        },
        {   
            id: BigInt(48), 
            item: {
                $$type: 'NftItem',
                type: 0n,
                index: 8n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/8.json'
            }
        },
        {   
            id: BigInt(49), 
            item: {
                $$type: 'NftItem',
                type: 0n,
                index: 9n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/9.json'
            }
        }
    ]
    return items
}

export function getEpicRarityItems(): Array<ItemType> {
    const items: Array<ItemType> = [
        {   
            id: BigInt(0), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 12n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/12.json'
            }
        },
        {   
            id: BigInt(1), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 13n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/13.json'
            }
        },
        {   
            id: BigInt(2), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 32n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/32.json'
            }
        },
        {   
            id: BigInt(3), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 7n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/7.json'
            }
        },
        {   
            id: BigInt(4), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 47n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/47.json'
            }
        },
        {   
            id: BigInt(5), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 7n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/7.json'
            }
        },
        {   
            id: BigInt(6), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 51n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/51.json'
            }
        },
        {   
            id: BigInt(7), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 78n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/78.json'
            }
        },
        {   
            id: BigInt(8), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 108n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/108.json'
            }
        },
        {   
            id: BigInt(9), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 110n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/110.json'
            }
        },
        {   
            id: BigInt(10), 
            item: {
                $$type: 'NftItem',
                type: 0n,
                index: 6n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/6.json'
            }
        },
        {   
            id: BigInt(11), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 112n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/112.json'
            }
        },
        {   
            id: BigInt(12), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 120n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/120.json'
            }
        },
        {   
            id: BigInt(13), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 121n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/121.json'
            }
        },
        {   
            id: BigInt(14), 
            item: {
                $$type: 'NftItem',
                type: 0n,
                index: 5n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/5.json'
            }
        },
        {   
            id: BigInt(15), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 126n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/126.json'
            }
        },
        {   
            id: BigInt(16), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 132n,    data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/132.json'
            }
        },
        {   
            id: BigInt(17), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 16n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/16.json'
            }
        },
        {   
            id: BigInt(18), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 19n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/19.json'
            }
        },
        {   
            id: BigInt(19), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 20n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/20.json'
            }
        },
        {   
            id: BigInt(20), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 23n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/23.json'
            }
        },
        {   
            id: BigInt(21), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 24n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/24.json'
            }
        },
        {   
            id: BigInt(22), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 9n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/9.json'
            }
        },
        {   
            id: BigInt(23), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 13n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/13.json'
            }
        },
        {   
            id: BigInt(24), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 26n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/26.json'
            }
        },
        {   
            id: BigInt(25), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 27n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/27.json'
            }
        },
        {   
            id: BigInt(26), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 28n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/28.json'
            }
        },
        {   
            id: BigInt(27), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 32n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/32.json'
            }
        }
    ]
    return items
}

export function getLegendaryRarityItems(): Array<ItemType> {
    const items: Array<ItemType> = [
        {   
            id: BigInt(0), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 10n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/10.json'
            }
        },
        {   
            id: BigInt(1), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 11n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/11.json'
            }
        },
        {   
            id: BigInt(2), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 19n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/19.json'
            }
        },
        {   
            id: BigInt(3), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 6n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/6.json'
            }
        },
        {   
            id: BigInt(4), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 22n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/22.json'
            }
        },
        {   
            id: BigInt(5), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 25n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/25.json'
            }
        },
        {   
            id: BigInt(6), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 28n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/28.json'
            }
        },
        {   
            id: BigInt(7), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 38n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/38.json'
            }
        },
        {   
            id: BigInt(8), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 6n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/6.json'
            }
        },
        {   
            id: BigInt(9), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 42n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/42.json'
            }
        },
        {   
            id: BigInt(10), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 48n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/48.json'
            }
        },
        {   
            id: BigInt(11), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 49n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/49.json'
            }
        },
        {   
            id: BigInt(12), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 62n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/62.json'
            }
        },
        {   
            id: BigInt(13), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 67n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/67.json'
            }
        },
        {   
            id: BigInt(14), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 5n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/5.json'
            }
        },
        {   
            id: BigInt(15), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 68n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/68.json'
            }
        },
        {   
            id: BigInt(16), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 76n,   data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/76.json'
            }
        },
        {   
            id: BigInt(17), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 79n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/79.json'
            }
        },
        {   
            id: BigInt(18), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 80n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/80.json'
            }
        },
        {   
            id: BigInt(19), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 83n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/83.json'
            }
        },
        {   
            id: BigInt(20), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 84n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/84.json'
            }
        },
        {   
            id: BigInt(21), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 4n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/4.json'
            }
        },
        {   
            id: BigInt(22), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 100n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/100.json'
            }
        },
        {   
            id: BigInt(23), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 102n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/102.json'
            }
        },
        {   
            id: BigInt(24), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 103n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/103.json'
            }
        },
        {   
            id: BigInt(25), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 105n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/105.json'
            }
        },
        {   
            id: BigInt(26), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 106n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/106.json'
            }
        },
        {   
            id: BigInt(27), 
            item: {
                $$type: 'NftItem',
                type: 0n,
                index: 4n,
                data: 'https://ipfs.io/ipfs/QmVVzQ5kUJ8cArTTgj5gCZ1kp42Fo4FWUfXLM386vDBT6T/4.json'
            }
        },
        {   
            id: BigInt(28), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 115n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/115.json'
            }
        },
        {   
            id: BigInt(29), 
            item: {
                $$type: 'NftItem',
                type: 3n,
                index: 129n,
                data: 'https://ipfs.io/ipfs/QmQ9zM41VRfDWLNXQPcsYm55NyLHfoQJDdbyP2wKDrMMnV/129.json'
            }
        },
        {   
            id: BigInt(30), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 26n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/26.json'
            }
        },
        {   
            id: BigInt(31), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 31n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/31.json'
            }
        },
        {   
            id: BigInt(32), 
            item: {
                $$type: 'NftItem',
                type: 1n,
                index: 32n,
                data: 'https://ipfs.io/ipfs/QmSyjEq4hkGESu8eZDvBJA4VgZsixKzYJxSyNLYVYUTuci/32.json'
            }
        },
        {   
            id: BigInt(33), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 11n,    data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/11.json'
            }
        },
        {   
            id: BigInt(34), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 15n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/15.json'
            }
        },
        {   
            id: BigInt(35), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 16n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/16.json'
            }
        },
        {   
            id: BigInt(36), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 17n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/17.json'
            }
        },
        {   
            id: BigInt(37), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 18n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/18.json'
            }
        },
        {   
            id: BigInt(38), 
            item: {
                $$type: 'NftItem',
                type: 2n,
                index: 29n,
                data: 'https://ipfs.io/ipfs/QmfF3VLRTFJkVadJFPuykkv4m11DBHXnCo9V6PAZAGyBsE/29.json'
            }
        }
    ]
    return items
}