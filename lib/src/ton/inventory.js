export const inventoryTon = async (address) => {
    try {
        if (address) {
            const inventory = await getInventory(address)
            console.log(inventory)
        }
    } catch (error) {
        console.log(error)
    }
}

const getInventory = async (address) => {
    const rawResponse = await fetch('/ton/inventory', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({address})
    }).catch(err => {
        console.log(err)
        return {}
    });
    return await rawResponse.json();
}