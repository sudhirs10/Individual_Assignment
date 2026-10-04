# Moonlight Eats

This is my individual assignment for the Web Application Development
course. The website helps users find student restaurants in Finland
and check their daily or weekly menus.

Website: https://users.metropolia.fi/~sudhirsh/IndividualAssignment/

## What users can do

- Choose a restaurant and view its daily or weekly menu
- Filter restaurants by city and provider
- Register, log in and log out
- Save a favourite restaurant
- Change their username and email
- Upload a profile picture

The website also works on mobile screens.

## Tools used

I used HTML, CSS and vanilla JavaScript. The JavaScript is divided
into separate files for restaurants, menus, favourites and account
features.

I also used ESLint, Prettier and EditorConfig.

I used the API which was provided.

## Running the website locally

Open the folder in VS Code and open index.html with Live Server.

To install the development tools, run:

npm install

To check the JavaScript, run:

npx eslint main.js restaurants.js menus.js favourites.js api.js auth.js profile.js upload.js

## Testing

I checked both HTML pages with the W3C HTML validator and the CSS
with the W3C CSS validator. There were no validation errors.

I tested the menus, filters, login, favourites, profile editing
and picture upload. I also checked the mobile layout.

## Issue noticed

During registration, the API returned an email authentication error.
I was still able to log in.
