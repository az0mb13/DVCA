const express = require('express');
const router = express.Router();
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    id: Int
    username: String
    email: String
    role: String
    firstName: String
    lastName: String
    phone: String
    address: String
    ssn: String
    passwordHash: String
    apiToken: String
    securityQuestion: String
    securityAnswer: String
    orders: [Order]
    reviews: [Review]
  }

  type Product {
    id: Int
    name: String
    description: String
    price: Float
    category: String
    stock: Int
    reviews: [Review]
  }

  type Review {
    id: Int
    productId: Int
    userId: Int
    rating: Int
    comment: String
    user: User
  }

  type Order {
    id: Int
    userId: Int
    total: Float
    status: String
    creditCard: String
    shippingAddress: String
    items: [OrderItem]
    user: User
  }

  type OrderItem {
    id: Int
    orderId: Int
    productId: Int
    quantity: Int
    price: Float
    product: Product
  }

  type Config {
    key: String
    value: String
  }

  type Query {
    users: [User]
    user(id: Int!): User
    products: [Product]
    product(id: Int!): Product
    orders: [Order]
    order(id: Int!): Order
    configs: [Config]
    secretFlag: String
  }

  type Mutation {
    updateUserRole(userId: Int!, role: String!): User
    deleteProduct(id: Int!): Boolean
  }
`);

function createResolvers(db) {
  return {
    users: () => {
      const users = db.prepare('SELECT * FROM users').all();
      return users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        firstName: u.first_name,
        lastName: u.last_name,
        phone: u.phone,
        address: u.address,
        ssn: u.ssn,
        passwordHash: u.password_hash,
        apiToken: u.api_token,
        securityQuestion: u.security_question,
        securityAnswer: u.security_answer,
        orders: () => {
          const orders = db.prepare('SELECT * FROM orders WHERE user_id = ?').all(u.id);
          return orders.map(o => ({
            ...o,
            creditCard: o.credit_card,
            shippingAddress: o.shipping_address,
            items: () => db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id),
            user: () => u
          }));
        },
        reviews: () => db.prepare('SELECT * FROM reviews WHERE user_id = ?').all(u.id)
      }));
    },

    user: ({ id }) => {
      const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!u) return null;
      return {
        id: u.id, username: u.username, email: u.email, role: u.role,
        firstName: u.first_name, lastName: u.last_name,
        phone: u.phone, address: u.address, ssn: u.ssn,
        passwordHash: u.password_hash, apiToken: u.api_token,
        securityQuestion: u.security_question, securityAnswer: u.security_answer,
        orders: () => db.prepare('SELECT * FROM orders WHERE user_id = ?').all(u.id).map(o => ({
          ...o, creditCard: o.credit_card, shippingAddress: o.shipping_address,
          items: () => db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id),
          user: () => u
        })),
        reviews: () => db.prepare('SELECT * FROM reviews WHERE user_id = ?').all(u.id)
      };
    },

    products: () => {
      const products = db.prepare('SELECT * FROM products').all();
      return products.map(p => ({
        ...p,
        reviews: () => {
          const reviews = db.prepare('SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ?').all(p.id);
          return reviews.map(r => ({
            ...r,
            user: () => db.prepare('SELECT * FROM users WHERE id = ?').get(r.user_id)
          }));
        }
      }));
    },

    product: ({ id }) => {
      const p = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!p) return null;
      return {
        ...p,
        reviews: () => db.prepare('SELECT * FROM reviews WHERE product_id = ?').all(p.id)
      };
    },

    orders: () => {
      const orders = db.prepare('SELECT * FROM orders').all();
      return orders.map(o => ({
        ...o,
        creditCard: o.credit_card,
        shippingAddress: o.shipping_address,
        items: () => db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id),
        user: () => db.prepare('SELECT * FROM users WHERE id = ?').get(o.user_id)
      }));
    },

    order: ({ id }) => {
      const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      if (!o) return null;
      return {
        ...o,
        creditCard: o.credit_card,
        shippingAddress: o.shipping_address,
        items: () => db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id),
        user: () => db.prepare('SELECT * FROM users WHERE id = ?').get(o.user_id)
      };
    },

    configs: () => db.prepare('SELECT * FROM app_config').all(),

    secretFlag: () => 'FLAG{gr4phql_1ntr0sp3ct10n_d4t4_l34k}',

    updateUserRole: ({ userId, role }) => {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
      return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    },

    deleteProduct: ({ id }) => {
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      return true;
    }
  };
}

router.use('/', (req, res, next) => {
  const db = req.app.locals.db;

  graphqlHTTP({
    schema,
    rootValue: createResolvers(db),
    graphiql: true,
    customFormatErrorFn: (error) => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack,
      path: error.path
    })
  })(req, res, next);
});

module.exports = router;
