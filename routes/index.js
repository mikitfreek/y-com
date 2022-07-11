const express = require('express');
const router = express.Router();

const fs = require('fs');

const Cart = require('../models/cart');
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

// const User = require('../models/user');
const usersFile = './data/users.json';
let users = [];
const usersRead = () => users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
usersRead();
const { check, validationResult } = require("express-validator");

// email
const nodemailer = require('nodemailer');
  
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "6559b6b003098d",
    pass: "0254a0ac2bcfc9"
  }
});

///////////////////////////////////////
// main pages
///////////////////////////////////////

router.get('/', async (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  res.render('index',
    {
      title: 'Strona główna',
      products: products
    }
  );
});

router.get('/id/:id', async (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  const productId = req.params.id;
  const product = products.filter(function (item) {
    return item.id == productId;
  });
  res.render('product', {
    title: 'Produkt',
    product: product[0]
  });
});

router.get('/cat/:cat/:id', async (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  const category = req.params.cat;
  const productId = req.params.id;
  const product = products.filter(function (item) {
    return item.id == productId && item.cat == category;
    // add category
  });
  ////////////////
  res.render('product', {
    title: 'Produkt',
    product: product[0]
  });
});

///////////////////////////////////////
// cart
///////////////////////////////////////

router.get('/cart', async (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  if (!req.session.cart) {
    return res.render('cart', {
      products: null
    });
  }
  const cart = new Cart(req.session.cart);
  res.render('cart', {
    title: 'Koszyk',
    products: cart.getItems(),
    totalPrice: cart.totalPrice
  });
});

router.get('/add/:id', async (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  const product = products.filter(function (item) {
    return item.id == productId;
  });
  cart.add(product[0], productId);
  req.session.cart = cart;

  res.redirect(req.session.returnTo || '/');
  delete req.session.returnTo;
  // res.redirect('/');
});

//todo
router.get('/remove/:id', async (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.remove(productId);
  req.session.cart = cart;

  res.redirect(req.session.returnTo || '/');
  delete req.session.returnTo;
  // res.redirect('/cart');
});

///////////////////////////////////////
// checkout
///////////////////////////////////////

router.get('/checkout', async (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  if (!req.session.userid) {
    res.redirect('/login');
  } else {
    if (!req.session.cart) {
      return res.render('cart', {
        products: null
      });
    }

    const user = users.filter(function (user) {
      return user.username == req.session.userid;
    });
    const userData = user[0]

    const cart = new Cart(req.session.cart);
    res.render('checkout', {
      title: 'Podsumowanie',
      products: cart.getItems(),
      totalPrice: cart.totalPrice,
      data: userData
    });
  }
});

router.get('/payment', async (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  if (!req.session.userid) {
    res.redirect('/login');
  } else {
    if (!req.session.cart) {
      return res.render('cart', {
        products: null
      });
    }

    const user = users.filter(function (user) {
      return user.username == req.session.userid;
    });
    const userData = user[0]

    const cart = new Cart(req.session.cart);
    res.render('checkout', {
      title: 'Podsumowanie',
      products: cart.getItems(),
      totalPrice: cart.totalPrice,
      data: userData
    });
  }
});

///////////////////////////////////////
// account
///////////////////////////////////////

router.get('/account', async (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  if (!req.session.userid) {
    res.redirect('/login');
  } else {
    // const user = new User(req.session.userid ? req.session.userid : "");
    // next();

    const user = users.filter(function (user) {
      return user.username == req.session.userid;
    });
    const userData = user[0]//JSON.parse(user)

    res.render('account', {
      title: 'Moje konto',
      // data: user.getData()
      data: userData
    });
    // console.log(userData.username)
  }
});

router.get('/login', async (req, res, next) => {
  // if (user.status != "Active") {
  //   return res.status(401).send({
  //     message: "Pending Account. Please Verify Your Email!",
  //   });
  // }
  res.render('account/login', {
    title: 'Logowanie'
  });
});

router.get('/logout', async (req, res, next) => {
  if (req.session.userid) {
    delete req.session.userid;
  }
  res.redirect(req.session.returnTo || '/');
  delete req.session.returnTo;
});

router.post("/login", async (req, res, next) => {
    const user = users.filter(function (user) {
      return user.username == req.body.username;
    });
    const userData = user[0]//JSON.parse(user[0])
    // const userData = user.getData()
    if (userData.password == req.body.password) {
      console.log("aaa " + userData.username)
      req.session.userid = req.body.username;
      // console.log(req.session.userid)
      res.redirect(req.session.returnTo || '/');
      delete req.session.returnTo;
    } else {
      res.render('account/login', {
        title: 'Logowanie',
        message: "Nieprawidłowe dane"
      });
    }
  }
);


router.get('/signup', async (req, res, next) => {
  const info = await transporter.sendMail({
    from: '"Y-com" <noreplay@example.com>', // sender address
    to: "mailbetha@gmail.com", // list of receivers
    subject: "Y-com Potwierdzenie adresu email", // Subject line
    text: "Link", // plain text body
    html: "<b>Link html</b>", // html body
  });
  res.render('account/signup', {
    title: 'Rejestracja',
    // data: cart.getItems()
  });
  // res.redirect(req.session.returnTo || '/');
  // delete req.session.returnTo;
});

router.post("/signup",
  [
    check(
      "username",
      "Too short username"
    ).isLength({
      min: 3,
    }),
    check("email", "Wrong email format").isEmail(),
    check("password", "Too short password").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const err = validationResult(req);
    console.log(
      `Posted data: `,
      req.body,
      `,\n`,
      err.mapped()
    );

    const user = users.filter(function (user) {
      return user.username == req.body.username;
    });

    if (typeof user[0] === "undefined") {

      const userData = {
          id: users.length + 1,
          active: false,
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          fullname: req.body.fullname,
          address: req.body.address
        };

      const tmp = users;
      tmp.push(userData)
      const json = JSON.stringify(tmp, null, 2);
      fs.writeFileSync(usersFile, json, 'utf8', usersRead);

      // res.redirect(req.session.returnTo || '/');
      // res.redirect('/signup');
      // delete req.session.returnTo;

      res.render('account/mailconf', {
        title: 'Potwierdzenie adresu email',
        data: userData
      });

      

    } else {
      res.render('account/signup', {
        title: 'Rejestracja',
        message: "Nazwa użytkownika jest już zajęta"
      });
    }
  }
);

router.get('/mailconf/:id', async (req, res, next) => {
  const userId = req.params.id;

  users.find(user => user.id == userId).active = true;

  const json = JSON.stringify(users, null, 2);
  fs.writeFileSync(usersFile, json, 'utf8', usersRead);

  const user = users.filter(function (user) {
    return user.id == userId;
  });
  const userData = user[0]
  req.session.userid = userData.username;

  //JSON.parse(user)

  res.render('account', {
    title: 'Moje konto',
    data: userData,
    message: "Pomyślnie potwierdzono adres email"
  });
  // res.redirect(req.session.returnTo || '/');
  // delete req.session.returnTo;
});

module.exports = router;



// app.post("/",
//   [
//     check(
//       "username",
//       "Too short username"
//     ).isLength({
//       min: 3,
//     }),
//     check("email", "Wrong email format").isEmail(),
//     check("password", "Too short password").isLength({ min: 3 }),
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     console.log(
//       `Data you've entered - `,
//       req.body,
//       `, Errors on you face - `,
//       errors.mapped()
//     );
//     const devData = new Dev({
//       username: req.body.username,
//       email: req.body.email,
//       password: req.body.password,
//       state: req.body.state,
//     });
//     devData
//       .save()
//       .then(() => {
//         errors.mapped();
//         res.render("success");
//         // res.send(`Wallah, Bro check your console & db collection`);
//       })
//       .catch((err) => {
//         res.render("error");
//         // res.send(`Uff, we've some error for you - ${err.message}`);
//       });
//   }
// );