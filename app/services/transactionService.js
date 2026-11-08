const transactionRepository = require('../repositories/transactionRepository')
const userRepository = require('../repositories/userRepository')
const creditCardRepository = require('../repositories/creditCardRepository')
const InputError = require('../errors/inputError')
const LogicError = require('../errors/logicError')

transactionService = {
    getTransactionsPublic: async (sellerId, buyerId) => {
        let errors = []

        let transactions = null;
        if ( sellerId != null){
            transactions = await transactionRepository.getTransactionPublicBySeller(sellerId);
        }
        if ( buyerId != null){
            transactions = await transactionRepository.getTransactionPublicByBuyer(buyerId);
        }


        if (transactions == null)
            errors.push(new LogicError('Error when get the transactions of user '));

        // Errors in the logic of service
        if (errors.length > 0)
            throw errors

        return transactions
    },
    getTransactions: async (userId, productId) => {
        let errors = []

        if (userId == undefined)
            errors.push(new InputError("userId", 'userId is undefined'));
        // Errors in client INPUTS
        if (errors.length > 0)
            throw errors

        let transactions = null;
        if ( productId == null) {
            transactions = await transactionRepository.getTransactions(userId);
        } else {
            transactions = await transactionRepository.getTransactionsByUserIdAndProductId(userId, productId);
        }

        if (transactions == null)
            errors.push(new LogicError('Error when get the transactions'));

        // Errors in the logic of service
        if (errors.length > 0)
            throw errors

        return transactions
    },
    postTransaction: async (buyerId, productId, buyerPaymentId) => {
        let errors = []

        if (buyerId == undefined)
            errors.push(new InputError("buyerId", 'buyerId is undefined'));
        if (!Number.isSafeInteger(Number(productId)) || Number(productId) <= 0)
            errors.push(new InputError("productId", 'Choose a valid product.'));

        // Errors in client INPUTS
        if (errors.length > 0)
            throw errors

        if ( buyerPaymentId != null ) {
            let creditCard = await creditCardRepository.getCreditCard(buyerPaymentId)
            if (creditCard == null) {
                errors.push(new LogicError('Error when get the credit card info'));
                throw errors
            }
            if (creditCard.userId != buyerId) {
                errors.push(new LogicError('Is not your credit card'));
                throw errors
            }
        }

        let userBuyer = await userRepository.getUserById(buyerId)
        if (userBuyer == null){
            errors.push(new LogicError('Error when get the buyer info'));
            throw errors
        }

        try {
            return await transactionRepository.purchaseProduct(buyerId, productId, userBuyer, buyerPaymentId);
        } catch (error) {
            const purchaseError = new LogicError(error.statusCode
                ? error.message : 'Could not complete your purchase. Please try again.');
            purchaseError.code = error.statusCode || 500;
            throw [purchaseError];
        }
    },
}
module.exports = transactionService
