import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express, { Request, Response } from 'express';



const supplierStorage = StableBTreeMap<string, Supplier>(0);
const productStorage = StableBTreeMap<string, Product>(1);


/*
    Servers controllers
*/

export default Server(() => {
   const app = express();
   app.use(express.json());
   
   //Add a Supplier
   app.post('/suppliers', (req: Request, res: Response) => {
   const { name, contactInfo } = req.body;
   const id = uuidv4();
   const newSupplier = new Supplier(id, name, contactInfo);
   supplierStorage.insert(newSupplier.supplierId, newSupplier);
   res.json(newSupplier);
   });

   //Get all suppliers
   app.get('/suppliers', (req: Request, res: Response) => {
   res.json(supplierStorage.values());
   });

   //Get a supplier by id
   app.get('/suppliers/:id', (req: Request, res: Response) => {
   const supplierId = req.params.id;
   const supplier = supplierStorage.get(supplierId);

   if ("None" in supplier) {
      res.status(404).send(`the supplier with id=${supplierId} not found`);
   } else {
      res.json(supplier.Some);
   }

   });

   //Update a supplier
   app.put('/suppliers/:id', (req: Request, res: Response) => {
   const supplierId = req.params.id;
   const existingSupplier = supplierStorage.get(supplierId);
   if ("None" in existingSupplier) {
      res.status(400).send(`couldn't update a supplier with id=${supplierId}. Supplier not found`);
   } else {
      const supplier = existingSupplier.Some;
      const updatedsupplier = { ...supplier, ...req.body, updatedAt: getCurrentDate()};
      supplierStorage.insert(supplier.supplierId, updatedsupplier);
      res.json(updatedsupplier);
   }
   });

   //Delete a supplier
   app.delete('/suppliers/:id', (req: Request, res: Response) => {
   const supplierId = req.params.id;
   const deletedSupplier = supplierStorage.remove(supplierId);
   if ("None" in deletedSupplier) {
      res.status(400).send(`couldn't delete a supplier with id=${supplierId}. Supplier not found`);
   } else {
      res.status(200).send(`Supplier id=${supplierId} successfly deleted`);
   }
   });

   
// add a product 
app.post('/products', (req: Request, res: Response) => {
   const { name, description, price, quantity, supplierId } = req.body;
   const productId = uuidv4();
   const newProduct = new Product(productId, name, description, price, quantity, supplierId);
   productStorage.insert(newProduct.productId, newProduct);
   res.json(newProduct);
 });
 
 // Get all products 
 app.get('/products', (req: Request, res: Response) => {
   res.json(productStorage.values());
 });
 
 // Get a product with supplier details
 app.get('/products/:id', (req: Request, res: Response) => {
   const productId = req.params.id;
   const product = productStorage.get(productId);
   
   if ("None" in product) {
      res.status(404).send(`the product with id=${productId} not found`);
   } else {

    if(product.Some != undefined){
     const {productId, name, price, description, quantity} = product.Some;
     const supplierId = product.Some.supplierId;
     const supplier  = supplierStorage.get(supplierId).Some;
     const productResponse:ProductResponseDTO = { productId, name, price, description, quantity, supplier}
     res.json(productResponse); 
    }else{
      res.status(404).send(`the product with id=${productId} not found`);
    }
   }
 });
 
 // Update  a product
 app.put('/products/:id', (req: Request, res: Response) => {
   const productId = req.params.id;
   const existingProduct = productStorage.get(productId);
   if ("None" in existingProduct) {
     res.status(404).send(`the product with id=${productId} not found`); 
   } else {
     const product = existingProduct.Some;
     const updatedProduct = { ...product, ...req.body, updatedAt: getCurrentDate()};
      productStorage.insert(product.productId, updatedProduct);
     res.json(updatedProduct);
   }
 });
 
 // Delete a product by id
 app.delete('/products/:id', (req: Request, res: Response) => {
   const productId = req.params.id;
   const deletedProduct = productStorage.remove(productId);
   if ("None" in deletedProduct) {
     res.status(400).send(`couldn't delete a products with id=${productId}. Product not found`);
   } else {
    res.status(200).send(`Product id=${productId} successfly deleted`);
   }
 });

 //Get all products for a supplier
 app.get('/products/supplier/:idSup', (req: Request, res: Response) => {
   const idSup = req.params.idSup;

   const supplier = supplierStorage.get(idSup);
   if ("None" in supplier) {
      res.status(404).send(`the supplier with id=${idSup} not found`);
   } else {
      const products =  productStorage.values();
      const productsSup: Product[] = [];
      products.forEach(product => {
         if(product.supplierId == idSup){
               productsSup.push(product);
         }
      });
      
      if(productsSup.length == 0){
          res.status(404).send(`No prouct with supplier id=${idSup}`);
      }else{
          res.json(productsSup);
      }
      
   }   
   
 });
 
 // Starting server...
 const PORT = 3000;
 return app.listen(PORT, () => {
   console.log(`Server started on port ${PORT}`);
 });
 

}); // to close the Server function.



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
   constructor(productId: string, name: string, description: string, price: number, quantity: number, supplierId: string) {
     this.productId = productId;
     this.name = name;
     this.description = description;
     this.price = price;
     this.quantity = quantity;
     this.supplierId = supplierId; 
   }
 }
 
 class ProductResponseDTO {
   productId: string;
   name: string;
   description: string;
   price: number;
   quantity: number;
   supplier?: Supplier; 
   constructor(productId: string, name: string, description: string, price: number, quantity: number, supplier: Supplier) {
     this.productId = productId;
     this.name = name;
     this.description = description;
     this.price = price;
     this.quantity = quantity;
     this.supplier = supplier; 
   }
 }

  /**
   * Utils
   */
function getCurrentDate() {
   const timestamp = new Number(ic.time());
   return new Date(timestamp.valueOf() / 1000_000);
}