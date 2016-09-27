# Node Public Shopify App

### A Shopify App using Node
##### Note: MongoDB required

This is a work in progress of a Public Shopify App,
while learning Node and using [shopify-node-api](https://www.npmjs.com/package/shopify-node-api)

- [x] Installing app
- [x] test charge
    - [x] accept
    - [x] decline
- [ ] Dashboard
    - [x] empty page
    - [ ] sample (undecided)
- [ ] Webhook for uninstall
    - [x] save webhook id into database to remove from Shopify
    - [ ] verify webhook POST is from Shopify
    - [x] webhook unintsall (remove) from database
- [ ] Shopify name verification

### Shopify's End - App Settings (Default)

##### App Url
`http://localhost:3000/`

##### Redirection Url
`http://localhost:3000/login`