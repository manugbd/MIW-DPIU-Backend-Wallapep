const database = require("./database")

transactionRepository = {
    getTransactionPublicBySeller: async (sellerId) => {
        let transactions = null;

        try{
            await database.connect();
            transactions = await database.query("SELECT transactions.id, transactions.productId, transactions.buyerId, transactions.sellerId, products.title" +
                " FROM transactions LEFT JOIN products ON products.id = transactions.productId WHERE transactions.sellerId = ?",[sellerId])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }
        return transactions
    },
    getTransactionPublicByBuyer: async (buyerId) => {
        let transactions = null;

        try{
            await database.connect();
            transactions = await database.query("SELECT transactions.id, transactions.productId, transactions.buyerId, transactions.sellerId, products.title" +
                " FROM transactions LEFT JOIN products ON products.id = transactions.productId WHERE transactions.buyerId = ?",[buyerId])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }
        return transactions
    },
    getTransactionsByUserIdAndProductId: async (userId, productId) => {
        let transactions = null;

        try{
            await database.connect();
            transactions = await database.query("SELECT transactions.* , products.* , transactions.id as tid  FROM transactions LEFT JOIN products ON products.id = transactions.productId WHERE (transactions.buyerId = ? OR transactions.sellerId = ?) " +
                "AND productId = ?",[userId,userId,productId])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }
        return transactions
    },
    getTransactionsByProductId: async (productId) => {
        let transactions = null;

        try{
            await database.connect();
            transactions = await database.query("SELECT transactions.* , products.* , transactions.id as tid  FROM transactions LEFT JOIN products ON products.id = transactions.productId WHERE " +
                " productId = ?",[productId])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }
        return transactions
    },
    getTransactions: async (userId) => {
        let transactions = null;

        try{
            await database.connect();
            transactions = await database.query("SELECT transactions.* , products.* , transactions.id as tid  FROM transactions LEFT JOIN products ON products.id = transactions.productId WHERE transactions.buyerId = ? OR transactions.sellerId = ?",[userId,userId])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }
        return transactions
    },
    getTransaction: async (transactionId) => {
        let transaction = null;

        try{
            await database.connect();
            let transactions = await database.query("SELECT transactions.* , products.* , transactions.id as tid FROM transactions LEFT JOIN products ON products.id = transactions.productId WHERE transactions.id = ?",[transactionId])
            if ( transactions.length > 0){
                transaction = transactions[0]
            }
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }
        return transaction
    },
    addTransaction: async (buyerId, sellerId, buyerCountry, buyerAddress, buyerPostCode, productId, productPrice, buyerPaymentId) => {
        let insertInfo = null;
        try{
            await database.connect();
            insertInfo = await database.query("INSERT INTO transactions (buyerId, sellerId, buyerCountry, buyerAddress, buyerPostCode, productId, productPrice, buyerPaymentId) VALUES (?,?,?,?,?,?,?,?)",
                [buyerId, sellerId, buyerCountry, buyerAddress, buyerPostCode, productId, productPrice, buyerPaymentId])

            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return insertInfo
    }
}
module.exports = transactionRepository