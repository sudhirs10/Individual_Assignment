import {baseUrl, fetchData} from './api.js';

const list = document.querySelector('#restaurant-list');
const message = document.querySelector('#restaurant-message');
const cityFilter = document.querySelector('#city-filter');
const companyFilter = document.querySelector('#company-filter');

async function getRestaurants() {
  message.textContent = 'Loading restaurants...';

  const data = await fetchData(baseUrl + '/restaurants');
  const restaurants = Array.isArray(data) ? data : data.restaurants;

  restaurants.sort((a, b) => a.name.localeCompare(b.name, 'fi'));

  return restaurants;
}

function createFilters(restaurants) {
  const cities = [];
  const companies = [];

  restaurants.forEach((restaurant) => {
    if (restaurant.city && !cities.includes(restaurant.city)) {
      cities.push(restaurant.city);
    }

    if (restaurant.company && !companies.includes(restaurant.company)) {
      companies.push(restaurant.company);
    }
  });

  cities.sort();
  companies.sort();

  cities.forEach((city) => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });

  companies.forEach((company) => {
    const option = document.createElement('option');
    option.value = company;
    option.textContent = company;
    companyFilter.appendChild(option);
  });
}

function showRestaurants(restaurants, selectedId, favouriteId) {
  list.innerHTML = '';

  const filtered = restaurants.filter((restaurant) => {
    const cityMatches =
      cityFilter.value === '' || restaurant.city === cityFilter.value;

    const companyMatches =
      companyFilter.value === '' || restaurant.company === companyFilter.value;

    return cityMatches && companyMatches;
  });

  message.textContent = filtered.length + ' restaurants found.';

  filtered.forEach((restaurant) => {
    const item = document.createElement('li');
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'restaurant-button';
    button.dataset.id = restaurant._id;

    const name = document.createElement('span');
    name.className = 'restaurant-title';
    name.textContent = restaurant.name;

    if (restaurant._id === favouriteId) {
      name.textContent = '★ ' + restaurant.name;
    }

    const city = document.createElement('span');
    city.className = 'restaurant-city';
    city.textContent = restaurant.city;

    if (restaurant._id === selectedId) {
      button.classList.add('selected');
    }

    button.appendChild(name);
    button.appendChild(city);
    item.appendChild(button);
    list.appendChild(item);
  });
}

export {getRestaurants, createFilters, showRestaurants};
