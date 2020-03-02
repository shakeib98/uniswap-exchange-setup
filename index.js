const Web3 = require('web3')
const constants = require('./constant')

let contract;

const OPTIONS = {
    // defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};

const web3 = new Web3("http://localhost:8545", null, OPTIONS) // for main net

async function main() {
    let xioAddress = await deployXIO()
    console.log(xioAddress, "XIO")
    let omgAddress = await deployOMG()
    console.log(omgAddress, "OMG")
    let exchangeTemplateAddress = await deployExchange()
    console.log(exchangeTemplateAddress, "TEMPLATE")
    let factoryAddress = await deployFactory(exchangeTemplateAddress)
    console.log(factoryAddress, "FACTORY")
    let xioExchange = await deployXIOExchange(factoryAddress, xioAddress)
    console.log(xioExchange, "XIO EXCHANGE")
    let omgExchange = await deployOMGExchange(factoryAddress,omgAddress)
    console.log(omgExchange, "OMG EXCHANGE")
    await addLiquidityXIO(xioExchange)
    await addLiquidityOMG(omgExchange)
    return

}

async function deployXIO() {
    contract = new web3.eth.Contract(constants.ABI_XIO);
    let result = await deploy(contract, constants.BYTE_CODE_XIO)
    return result
}

async function deployOMG() {
    contract = new web3.eth.Contract(constants.ABI_OMG);
    let result = await deploy(contract, constants.BYTE_CODE_OMG)
    return result
}

async function deployFactory(exchangeTemplateAddress) {
    contract = new web3.eth.Contract(constants.ABI_FACTORY);
    let result = await deploy(contract, constants.BYTE_CODE_FACTORY, exchangeTemplateAddress)
    return result
}

async function deployExchange() {
    contract = new web3.eth.Contract(constants.ABI_EXCHANGE);
    let result = await deploy(contract, constants.BYTE_CODE_EXCHANGE)
    return result
}

async function deployXIOExchange(factoryAddress, xioTokenAddress) {
    contract = new web3.eth.Contract(constants.ABI_FACTORY, factoryAddress);

    var contractAddress = '';

    let count = await web3.eth.getTransactionCount('0x48cd464906937D5B9C37376556624411Cc38fb5a', "pending")


    let txObject = {
        from: '0x48cd464906937D5B9C37376556624411Cc38fb5a',
        to: factoryAddress,
        gasPrice: 1 * 1000000000,
        gasLimit: 1000000,
        gas: 3000000,  //only when connected to ganache
        chainId: 5777,
        nonce: web3.utils.toHex(count),
        data: contract.methods.createExchange(xioTokenAddress).encodeABI()
    }

    let signed = await web3.eth.accounts.signTransaction(txObject, '0x2fe4829f906297ca7bbfaf3494e13aa77605f2f056a2591ec1917bfa8c06e1fe')

    await web3.eth.sendSignedTransaction(signed.rawTransaction).then(res=>{
        console.log(res.transactionHash)
    })

    let blockNumber = await web3.eth.getBlockNumber()
    await contract.getPastEvents('NewExchange', {
        fromBlock: blockNumber,
        toBlock: blockNumber
    }).then(events => {
        contractAddress = events[0].returnValues['1']
    });
    return contractAddress
}

async function deployOMGExchange(factoryAddress, omgTokenAddress) {
    contract = new web3.eth.Contract(constants.ABI_FACTORY, factoryAddress);

    var contractAddress = '';

    let count = await web3.eth.getTransactionCount('0x48cd464906937D5B9C37376556624411Cc38fb5a', "pending")


    let txObject = {
        from: '0x48cd464906937D5B9C37376556624411Cc38fb5a',
        to: factoryAddress,
        gasPrice: 1 * 1000000000,
        gasLimit: 1000000,
        gas: 3000000,  //only when connected to ganache
        chainId: 5777,
        nonce: web3.utils.toHex(count),
        data: contract.methods.createExchange(omgTokenAddress).encodeABI()
    }

    let signed = await web3.eth.accounts.signTransaction(txObject, '0x2fe4829f906297ca7bbfaf3494e13aa77605f2f056a2591ec1917bfa8c06e1fe')

    await web3.eth.sendSignedTransaction(signed.rawTransaction).then(res=>{
        console.log(res.transactionHash)
    })

    let blockNumber = await web3.eth.getBlockNumber()
    await contract.getPastEvents('NewExchange', {
        fromBlock: blockNumber,
        toBlock: blockNumber
    }).then(events => {
        contractAddress = events[0].returnValues['1']
    });
    return contractAddress
}

async function addLiquidityXIO(xioExchangeAddress) {
    let ethAmount = await web3.utils.toWei('0.1')

    let tokenAmount = await web3.utils.toWei('50000')

    contract = new web3.eth.Contract(constants.ABI_EXCHANGE, xioExchangeAddress);

    let count = await web3.eth.getTransactionCount('0x48cd464906937D5B9C37376556624411Cc38fb5a', "pending")


    let txObject = {
        from: '0x48cd464906937D5B9C37376556624411Cc38fb5a',
        to: xioExchangeAddress,
        gasPrice: 1 * 1000000000,
        gasLimit: 1000000,
        gas: 3000000,  //only when connected to ganache
        chainId: 5777,
        nonce: web3.utils.toHex(count),
        data: contract.methods.addLiquidity(ethAmount, tokenAmount, 1839591241).encodeABI(),
        value:Number(ethAmount)
    }

    let signed = await web3.eth.accounts.signTransaction(txObject, '0x2fe4829f906297ca7bbfaf3494e13aa77605f2f056a2591ec1917bfa8c06e1fe')


    let tx = await web3.eth.sendSignedTransaction(signed.rawTransaction)
        .on('confirmation', (confirmationNumber, receipt) => {
            if(confirmationNumber === 1){
                console.log("LIQUIDITY ADDED XIO")
            }
        })
        .on('error', (error) => {
            console.log(error)
        })
        .on('transactionHash', async (hash) => {
            console.log(hash);
        });
    return
}

async function addLiquidityOMG(omgExchangeAddress) {

    let ethAmount = await web3.utils.toWei('0.1')

    let tokenAmount = await web3.utils.toWei('50000')

    contract = new web3.eth.Contract(constants.ABI_EXCHANGE, omgExchangeAddress);



    let count = await web3.eth.getTransactionCount('0x48cd464906937D5B9C37376556624411Cc38fb5a', "pending")


    let txObject = {
        from: '0x48cd464906937D5B9C37376556624411Cc38fb5a',
        to: omgExchangeAddress,
        gasPrice: 1 * 1000000000,
        gasLimit: 1000000,
        gas: 3000000,  //only when connected to ganache
        chainId: 5777,
        nonce: web3.utils.toHex(count),
        data: contract.methods.addLiquidity(ethAmount, tokenAmount, 1839591241).encodeABI(),
        value:Number(ethAmount)
    }

    let signed = await web3.eth.accounts.signTransaction(txObject, '0x2fe4829f906297ca7bbfaf3494e13aa77605f2f056a2591ec1917bfa8c06e1fe')


    let tx = await web3.eth.sendSignedTransaction(signed.rawTransaction)
        .on('confirmation', (confirmationNumber, receipt) => {
            if(confirmationNumber === 1){
                console.log('LIQUIDITY ADDED OMG')
            }
        })
        .on('error', (error) => {
            console.log(error)
        })
        .on('transactionHash', async (hash) => {
            console.log(hash);
        });
    return
}

async function deploy(contract, bytecode, params) {
    var contractAddress = '';
    let data = ''

    let count = await web3.eth.getTransactionCount('0x48cd464906937D5B9C37376556624411Cc38fb5a', "pending")

    if (params) {

        data = contract.deploy({
            data: bytecode,
            arguments: [params]
        }).encodeABI()

    } else {

        data: contract.deploy({
            data: bytecode
        }).encodeABI()

    }

    let txObject = {
        from: '0x48cd464906937D5B9C37376556624411Cc38fb5a',
        gasPrice: 1 * 1000000000,
        gasLimit: 1000000,
        gas: 3000000,  //only when connected to ganache
        chainId: 5777,
        nonce: web3.utils.toHex(count),
        data: data,
    }

    let signed = await web3.eth.accounts.signTransaction(txObject, '0x2fe4829f906297ca7bbfaf3494e13aa77605f2f056a2591ec1917bfa8c06e1fe')

    await web3.eth.sendSignedTransaction(signed.rawTransaction)
        .on('error', function (error) {
            console.log(error)
        })
        .on('transactionHash', function (transactionHash) {
            console.log(transactionHash)
        })
        .on("receipt", function (receipt) {
            contractAddress = receipt.contractAddress
        })
    return contractAddress

}

main()