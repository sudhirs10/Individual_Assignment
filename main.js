import {baseUrl, fetchData} from './api.js';
import {getRestaurants, createFilters, showRestaurants} from './restaurants.js';
import {showMenu} from './menus.js';
import {showFavourite, saveFavourite} from './favourites.js';

const cityFilter = document.querySelector('#city-filter');
const companyFilter = document.querySelector('#company-filter');
const dailyButton = document.querySelector('#daily-button');
const weeklyButton = document.querySelector('#weekly-button');
const userInfo = document.querySelector('#user-info');
const logoutButton = document.querySelector('#logout-button');
const favouriteButton = document.querySelector('#favourite-button');
const viewFavourite = document.querySelector('#view-favourite');
const favouriteMessage = document.querySelector('#favourite-message');

let restaurants = [];
let selectedRestaurant = null;
let user = null;
let menuType = 'daily';
let saving = false;

function updatePage() {
  let favouriteId = '';

  if (user) {
    favouriteId = user.favouriteRestaurant;
  }

  let selectedId = '';

  if (selectedRestaurant) {
    selectedId = selectedRestaurant._id;
  }

  showRestaurants(restaurants, selectedId, favouriteId);
  showFavourite(restaurants, selectedRestaurant, user);

  favouriteButton.disabled = saving || selectedId === favouriteId;

  const buttons = document.querySelectorAll('.restaurant-button');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedRestaurant = restaurants.find((restaurant) => {
        return restaurant._id === button.dataset.id;
      });

      favouriteMessage.textContent = '';
      updatePage();
      showMenu(selectedRestaurant, menuType);
    });
  });
}

dailyButton.addEventListener('click', () => {
  menuType = 'daily';
  showMenu(selectedRestaurant, menuType);
});

weeklyButton.addEventListener('click', () => {
  menuType = 'weekly';
  showMenu(selectedRestaurant, menuType);
});

cityFilter.addEventListener('change', updatePage);
companyFilter.addEventListener('change', updatePage);

favouriteButton.addEventListener('click', async () => {
  if (!user || !selectedRestaurant || saving) {
    return;
  }

  const restaurant = selectedRestaurant;
  const token = localStorage.getItem('token');

  saving = true;
  updatePage();

  const saved = await saveFavourite(restaurant);

  if (saved && user && localStorage.getItem('token') === token) {
    user.favouriteRestaurant = restaurant._id;
  }

  saving = false;
  updatePage();
});

viewFavourite.addEventListener('click', () => {
  if (!user) {
    return;
  }

  selectedRestaurant = restaurants.find((restaurant) => {
    return restaurant._id === user.favouriteRestaurant;
  });

  if (selectedRestaurant) {
    cityFilter.value = '';
    companyFilter.value = '';
    favouriteMessage.textContent = '';
    updatePage();
    showMenu(selectedRestaurant, menuType);
  }
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('token');
  user = null;
  userInfo.textContent = '';
  logoutButton.hidden = true;
  favouriteMessage.textContent = '';
  updatePage();
});

async function start() {
  try {
    restaurants = await getRestaurants();
    createFilters(restaurants);
    updatePage();
  } catch (error) {
    console.log(error);
    document.querySelector('#restaurant-message').textContent =
      'Could not load restaurants.';
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return;
  }

  try {
    const account = await fetchData(baseUrl + '/users/token', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    if (localStorage.getItem('token') === token) {
      user = account;
      userInfo.textContent = 'Logged in as ' + user.username;
      logoutButton.hidden = false;
      updatePage();
    }
  } catch (error) {
    console.log(error);
    userInfo.textContent = 'Could not check your login.';
    logoutButton.hidden = false;
  }
}

start();
