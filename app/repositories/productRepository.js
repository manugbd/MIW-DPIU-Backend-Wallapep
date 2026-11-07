const database = require("./database")

productsRepository = {
    countProductsInCategories: async () => {
        let categories = null;

        try{
            await database.connect();
            categories = await database.query("SELECT category, COUNT(*) " +
                "AS num_products FROM products GROUP BY category")
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return categories
    },
    editProductBuyer: async (productId, buyerId) => {
        let modifiedInfo = null;
        try{
            await database.connect();
            modifiedInfo = await database.query("UPDATE products SET buyerId=? WHERE id=?",
                [buyerId, productId])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return modifiedInfo
    },
    editProduct: async (productId, title, description, price, category) => {
        let modifiedInfo = null;
        try{
            await database.connect();
            modifiedInfo = await database.query("UPDATE products SET title=?, description=?, price=?, category=? WHERE id=?",
                [title, description, price, category, productId])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return modifiedInfo
	},
    addProduct: async (sellerId, date, title, description, price, category ) => {
        let insertInfo = null;
        try{
            await database.connect();
            insertInfo = await database.query("INSERT INTO products (sellerId, date, title, description, price, category) VALUES (?,?,?,?,?,?)",
                [sellerId, date, title, description, price, category])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return insertInfo
	},
    getProductsSummary: async () => {
        let products = null;

        try{
            await database.connect();
            products = await database.query("SELECT products.id, products.title, products.description, products.price, products.category," +
                "users.email as buyerEmail, users.name as buyerName " +
                "FROM products LEFT JOIN users ON products.buyerId = users.id")
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return products
    },
    getProducts: async () => {
        let products = null;

        try{
            await database.connect();
            products = await database.query("SELECT products.*, users.email as buyerEmail, users.name as buyerName " +
                "FROM products LEFT JOIN users ON products.buyerId = users.id")
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return products
	},
    getProductsBySeller: async (userId) => {
        let products = null;

        try{
            await database.connect();
            products = await database.query("SELECT products.*, users.email as buyerEmail, users.name as buyerName " +
                "FROM products LEFT JOIN  users ON products.buyerId = users.id WHERE products.sellerId = ?",
                [userId])
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return products
	},
	getProduct: async (id) => {
        let product = null;

        try{
            await database.connect();
            let products = await database.query("SELECT products.*, users.email as buyerEmail, users.name as buyerName " +
                "FROM products LEFT JOIN  users ON products.buyerId = users.id WHERE products.id = ?",[id])
            if ( products.length > 0){
                product = products[0]
            }
            await database.disconnect();
        } catch (e){
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        } 

        return product
	},
    deleteProduct: async (id) => {
        let deleted = null;

        try {
            await database.connect();
            let queryResult = await database.query("DELETE FROM products WHERE id = ?", [id])
            if (queryResult.affectedRows == 1)
                deleted = true;
            else
                deleted = false
            await database.disconnect();
        } catch (e) {
            await database.disconnect();
            console.log(e) // ERROR IN DATABASE OR SQL
        }

        return deleted
    }
}

module.exports = productsRepository