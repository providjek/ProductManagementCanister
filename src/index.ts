import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express from 'express';

const supplierStorage = StableBTreeMap<string, Supplier>(0);
const productStorage = StableBTreeMap<string, Product>(1);

/*
    Servers controllers
*/

export default Server(() => {
    const app = express();
    app.use(express.json());

    //Add a Supplier
    app.post('/suppliers', (req, res) => {
        const { name, contactInfo } = req.body;
        const id = uuidv4();
        const newSupplier = new Supplier(id, name, contactInfo);
        supplierStorage.insert(newSupplier.supplierId, newSupplier);
        res.json(newSupplier);
    });

    //Get all suppliers
    app.get('/suppliers', (req, res) => {
        res.json(supplierStorage.values());
    });

    //Get a supplier by id
    app.get('/suppliers/:id', (req, res) => {
        const supplierId = req.params.id;
        const supplier = supplierStorage.get(supplierId);

        if (!supplier) {
            res.status(404).send(`the supplier with id=${supplierId} not found`);
        } else {
            res.json(supplier);
        }
    });

    //Update a supplier
    app.put('/suppliers/:id', (req, res) => {
        const supplierId = req.params.id;
        const existingSupplier = supplierStorage.get(supplierId);
        if (!existingSupplier) {
            res.status(400).send(`Couldn't update a supplier with id=${supplierId}. Supplier not found`);
        } else {
            const updatedSupplier = { ...existingSupplier, ...req.body, updatedAt: getCurrentDate() };
            supplierStorage.insert(supplierId, updatedSupplier);
            res.json(updatedSupplier);
        }
    });

    //Delete a supplier
    app.delete('/suppliers/:id', (req, res) => {
        const supplierId = req.params.id;
        const deletedSupplier = supplierStorage.remove(supplierId);
        if (!deletedSupplier) {
            res.status(400).send(`Couldn't delete a supplier with id=${supplierId}. Supplier not found`);
        } else {
            res.status(200).send(`Supplier id=${supplierId} successfully deleted`);
        }
    });

    // Add a product
    app.post('/products', (req, res) => {
        const { name, description, price, quantity, supplierId } = req.body;
        const productId = uuidv4();
        const newProduct = new Product(productId, name, description, price, quantity, supplierId);
        productStorage.insert(newProduct.productId, newProduct);
        res.json(newProduct);
    });

    // Get all products
    app.get('/products', (req, res) => {
        res.json(productStorage.values());
    });

    // Get a product with supplier details
    app.get('/products/:id', (req, res) => {
        const productId = req.params.id;
        const product = productStorage.get(productId);

        if (!product) {
            res.status(404).send(`The product with id=${productId} not found`);
        } else {
            const supplier = supplierStorage.get(product.supplierId);
            if (!supplier) {
                res.status(404).send(`The supplier for product with id=${productId} not found`);
            } else {
                const productResponse = { ...product, supplier };
                res.json(productResponse);
            }
        }
    });

    // Update a product
    app.put('/products/:id', (req, res) => {
        const productId = req.params.id;
        const existingProduct = productStorage.get(productId);
        if (!existingProduct) {
            res.status(404).send(`The product with id=${productId} not found`);
        } else {
            const updatedProduct = { ...existingProduct, ...req.body, updatedAt: getCurrentDate() };
            productStorage.insert(productId, updatedProduct);
            res.json(updatedProduct);
        }
    });

    // Delete a product by id
    app.delete('/products/:id', (req, res) => {
        const productId = req.params.id;
        const deletedProduct = productStorage.remove(productId);
        if (!deletedProduct) {
            res.status(400).send(`Couldn't delete a product with id=${productId}. Product not found`);
        } else {
            res.status(200).send(`Product id=${productId} successfully deleted`);
        }
    });

    // Get all products for a supplier
    app.get('/products/supplier/:idSup', (req, res) => {
        const idSup = req.params.idSup;
        const productsSup = [];

        productStorage.forEach(product => {
            if (product.supplierId === idSup) {
                productsSup.push(product);
            }
        });

        if (productsSup.length === 0) {
            res.status(404).send(`No product with supplier id=${idSup}`);
        } else {
            res.json(productsSup);
        }
    });

    // Starting server...
    const PORT = process.env.PORT || 3000;
    return app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
});

/**
 * Models
 */
class Supplier {
    supplierId: string;
    name: string;
    contactInfo: string;
    constructor(supplierId: string, name: string, contactInfo: string) {
        this.supplierId = supplierId;
        this.name = name;
        this.contactInfo = contactInfo;
    }
}

class Product {
    productId: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    supplierId: string;
    updatedAt?: Date;
    constructor(productId: string, name: string, description: string, price: number, quantity: number, supplierId: string) {
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.supplierId = supplierId;
    }
}

/**
 * Utils
 */
function getCurrentDate() {
   const timestamp = new Number(ic.time());
   return new Date(timestamp.valueOf() / 1000_000);
}