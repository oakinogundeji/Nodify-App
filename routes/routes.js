/**
*Module Dependencies
*/
var
  express = require('express'),
  config = require('../config/config'),
  nodify = require('nodify-shopify');
//==============================================================================
/**
*Create Router instance
*/
var router = express.Router();
//==============================================================================
/**
*Module variables
*/
var
  persistentKeys = {},
  apiKey = config.apiKey,
 	secret = config.secret;

function authenticate(req, res) {
	var shop = req.query.shop || req.body.shop;
	if(shop != undefined && shop != null) {
	  console.log('creating a session for', shop, apiKey, secret)
		return session = nodify.createSession(shop, apiKey, secret, {
	    scope: {orders: "read", products: "read"},
	    uriForTemporaryToken: "http://"+req.headers.host+"/login/finalize/token",
	    onAskToken: function onToken (err, url) {
	    	res.redirect(url);
	    }
	  });
	}	else {
 	console.log('no shop, go login')
		return res.redirect('/login');
	}
}
//==============================================================================
/**
*Middleware
*/
//==============================================================================
/**
*Routes
*/
router.get('/', function(req, res) {
	var
    shop,
    key;

	if(req.session.shopify){
		shop = req.session.shopify.shop;
		console.log('shop stored in user session:', shop);
		key = persistentKeys[shop];
	}

  if(req.query.shop){
		shop = req.query.shop.replace(".myshopify.com",'');
		console.log('shop given by query:', shop);
		key = persistentKeys[shop];
	}

	if(shop && key) {
		session = nodify.createSession(shop, apiKey, secret, key);
		if(session.valid()) {
			console.log('session is valid for <',shop,'>')

			session.order.all({limit: 5}, function(err, orders){
				console.log('orders:',orders);
				if(err) { throw err;}

				session.product.all({limit: 5}, function(err, products){
					console.log("products:", products);
					if(err) {  throw err;}

					return res.render("index",
          {title: "Nodify App", current_shop: shop , orders: orders,
          products: products});
				});
			});
		}
	}
	else {
		console.log('session is not valid yet, we need some authentication !')
		if(shop !== undefined)
			return res.redirect('/login/authenticate?shop='+shop);
		else
			return res.status(302).redirect('/login');
	}
});

router.get('/login', function(req, res) {
	try {
		shop = res.body.shop;
	}
	catch(error) {
		shop = undefined;
	}

	if(req.session.shopify){
		return res.redirect("/");
	}
	if(shop) {
		return res.status(303).redirect("/login/authenticate");
	}
	return res.status(200).render("login", {title: "Nodify App"});
});

router.get('/login/finalize', function(req, res) {
  console.log('finalizing ...', req.query)
	params = req.query;
	req.session.shopify = params;
	params.onAskToken = function (err, url) {
		if(err) {
			res.send("Could not finalize");
			console.warn('Could not finalize login :', err)
		}
		return res.redirect(url);
	}

	session = nodify.createSession(req.query.shop, apiKey, secret, params);
	if(session.valid()){
		console.log('session is valid!')
		return res.redirect("/");
	}
	else {
		return res.send("Could not finalize");
	}
});

router.get('/login/finalize/token', function(req, res) {
	if(!req.query.code) {
    return res.redirect("/login?error=Invalid%20connection.%20Please Retry");
  }
	session.requestPermanentAccessToken(req.query.code,
    function onPermanentAccessToken(token) {
		console.log('Authenticated on shop <', req.query.shop, '/',
    session.store_name, '> with token <', token, '>');
		persistentKeys[session.store_name] = token;
		req.session.shopify = {shop: session.store_name};
		return res.redirect('/');
	});
});

router.get( '/login/authenticate', authenticate);
router.post('/login/authenticate', authenticate);

router.get('/logout', function(req, res) {
	if(req.session.shopify) {
		req.session.shopify = null;
	}
	console.log('Logged out!')
	return res.status(302).redirect('/');
});

router.get('/plans', function(req, res) {
	if(req.session.shopify) {
		token = req.session.shopify.t
		shop = req.session.shopify.shop
	}

	if(shop && token) {
		return res.render("plans", {
      title: "Nodify App Plans",
      current_shop: shop});
	}
	else {
		return res.status(302).redirect('/login');
	}
});

router.get('/faq', function(req, res) {
	if(req.session.shopify){
		token = req.session.shopify.t
		shop = req.session.shopify.shop
	}

	if(shop && token) {
		return res.render("faq", {
      title: "Nodify App FAQ",
      current_shop: shop});
	}
	else {
		return res.status(302).redirect('/login');
	}
});
//==============================================================================
/**
*Export Module
*/
module.exports = router;
//==============================================================================
