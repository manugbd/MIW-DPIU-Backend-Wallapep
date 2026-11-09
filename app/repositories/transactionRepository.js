const database = require("./database")
const mysql = require("mysql")
const { promisify } = require("util")

const purchaseConflict = (message, statusCode = 409) => Object.assign(new Error(message), { statusCode });

transactionRepository = {
    getTransactionPublicBySeller: async (sellerId) => {
        let transactions = null;

        try{
            await database.connect();
            transactions = await database.query("SELECT transactions.id, transactions.productId, transactions.buyerId, transactions.sellerId, transactions.startDate, products.title" +
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
            transactions = await database.query("SELECT transactions.id, transactions.productId, transactions.buyerId, transactions.sellerId, transactions.startDate, products.title" +
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
    purchaseProduct: async (buyerId, productId, buyer, buyerPaymentId) => {
        // A dedicated connection keeps this purchase isolated from other requests.
        const connection = mysql.createConnection(database.configuration);
        const query = promisify(connection.query).bind(connection);
        const begin = promisify(connection.beginTransaction).bind(connection);
        const commit = promisify(connection.commit).bind(connection);
        const rollback = promisify(connection.rollback).bind(connection);

        let started = false;
        try {
            await begin();
            started = true;

            const products = await query("SELECT * FROM products WHERE id = ? FOR UPDATE", [productId]);
            const product = products[0];

            if (!product) throw purchaseConflict('This product no longer exists.', 404);

            if (String(product.sellerId) === String(buyerId)) throw purchaseConflict('You cannot buy your own product.');

            if (product.buyerId != null) throw purchaseConflict('This product has already been sold.');

            if (product.price == null || !Number.isFinite(Number(product.price)) || Number(product.price) < 0)
                throw purchaseConflict('This product does not have a valid price.');

            const previous = await query("SELECT id FROM transactions WHERE productId = ?", [productId]);

            if (previous.length) throw purchaseConflict('This product has already been sold.');

            const inserted = await query(
                "INSERT INTO transactions (buyerId, sellerId, buyerCountry, buyerAddress, buyerPostCode, productId, productPrice, buyerPaymentId, startDate) VALUES (?,?,?,?,?,?,?,?,?)",
                [buyerId, product.sellerId, buyer.country ?? null, buyer.address ?? null, buyer.postalCode ?? null,
                    productId, product.price, buyerPaymentId ?? null, Date.now()]
            );

            const updated = await query("UPDATE products SET buyerId = ? WHERE id = ? AND buyerId IS NULL", [buyerId, productId]);

            if (inserted.affectedRows !== 1 || updated.affectedRows !== 1)
                throw new Error('Purchase could not be saved.');
            
            await commit();
            return inserted;
        } catch (error) {
            if (started) await rollback();
            throw error;
        } finally {
            connection.end();
        }
    }
}
module.exports = transactionRepository
