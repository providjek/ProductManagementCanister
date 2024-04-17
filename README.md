# Product and Supplier Management

This project for managing products and suppliers allows efficient management of supplier and associated product information.

## Features

### Supplier Management:

- Add a supplier
- Retrieve all suppliers
- Retrieve a supplier by ID
- Update a supplier
- Delete a supplier by ID

### Product Management:

- Add a product
- Retrieve all products
- Retrieve a product by ID with associated supplier details
- Update a product
- Delete a product by ID
- Retrieve all products of a supplier by ID

## Installation

To install the project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-project.git
   ```

2. Install dependencies:

   ```bash
   cd your-project
   npm install
   ```

3. Run the project:

   ```bash
   dfx start --host 127.0.0.1:8000 --clean --background
   dfx deploy
   ```

## Usage

Once the project is running, you can make HTTP requests to the exposed endpoints to manage suppliers and products.

## API Endpoints

- `POST /suppliers`: Add a new supplier.
- `GET /suppliers`: Retrieve all suppliers.
- `GET /suppliers/:id`: Retrieve a supplier by ID.
- `PUT /suppliers/:id`: Update a supplier by ID.
- `DELETE /suppliers/:id`: Delete a supplier by ID.
- `POST /products`: Add a new product.
- `GET /products`: Retrieve all products.
- `GET /products/:id`: Retrieve a product by ID with associated supplier details.
- `PUT /products/:id`: Update a product by ID.
- `DELETE /products/:id`: Delete a product by ID.
- `GET /products/supplier/:idSup`: Retrieve all products of a supplier by ID.

## Contacts

Djekoundakom Dingamwal Providence
providjek@gmail.com