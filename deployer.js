
// scripts/deploy-contract.js
const { Web3 } = require('web3');
const fs = require('fs-extra');
const path = require('path');
const solc = require('solc');

async function deployContract() {
    console.log('🚀 Déploiement du contrat DrugTraceability...\n');
    
    const web3 = new Web3('http://127.0.0.1:7545');
    const accounts = await web3.eth.getAccounts();
    
    console.log(`✅ Connecté à Ganache`);
    console.log(`📋 Compte owner: ${accounts[0]}\n`);
    
    // Compiler le contrat
    const contractPath = path.resolve(__dirname, 'contracts', 'DrugTraceability.sol');
    const source = fs.readFileSync(contractPath, 'utf8');
    
    const input = {
        language: 'Solidity',
        sources: {
            'DrugTraceability.sol': { content: source }
        },
        settings: {
            outputSelection: {
                '*': { '*': ['*'] }
            }
        }
    };
    
    console.log('🔨 Compilation...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
        output.errors.forEach(err => console.error(err.formattedMessage));
    }
    
    const contract = output.contracts['DrugTraceability.sol']['DrugTraceability'];
    
    // Sauvegarder ABI et bytecode
    const buildPath = path.resolve(__dirname, '..', 'build');
    fs.ensureDirSync(buildPath);
    
    const contractData = {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object
    };
    
    fs.writeFileSync(
        path.resolve(buildPath, 'DrugTraceability.json'),
        JSON.stringify(contractData, null, 2)
    );
    
    console.log('✅ Compilation réussie');
    
    // Déployer
    console.log('\n📜 Déploiement...');
    const Contract = new web3.eth.Contract(contract.abi);
    
    const deployTx = Contract.deploy({
        data: '0x' + contract.evm.bytecode.object
    });
    
    const deployedContract = await deployTx.send({
        from: accounts[0],
        gas: 3000000
    });
    
    const address = deployedContract.options.address;
    
    console.log(`✅ Contrat déployé !`);
    console.log(`📍 Adresse: ${address}`);
    console.log(`🔗 Transaction: ${deployedContract.transactionHash}\n`);
    
    // Sauvegarder l'adresse dans un fichier .env.local
    const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`;
    fs.appendFileSync(path.resolve(__dirname, '..', '.env.local'), envContent);
    
    console.log('✅ Adresse sauvegardée dans .env.local');
    console.log('\n🎉 Prêt à utiliser la blockchain !');
}

deployContract().catch(console.error);