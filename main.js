import {baseUrl, fetchData} from './api.js';

const restaurantList = document.querySelector('#restaurant-list');
const restaurantMessage = document.querySelector('#restaurant-message');
const cityFilter = document.querySelector('#city-filter');
const companyFilter = document.querySelector('#company-filter');
const restaurantName = document.querySelector('#restaurant-name');
const menuControls = document.querySelector('#menu-controls');
const dailyButton = document.querySelector('#daily-button');
const weeklyButton = document.querySelector('#weekly-button');
const menuHeading = document.querySelector('#menu-heading');
const menuContent = document.querySelector('#menu-content');
const message = document.querySelector('#message');
const userInfo = document.querySelector('#user-info');
const logoutButton = document.querySelector('#logout-button');

let restaurants = [];
let selectedRestaurant = null;
let menuType = 'daily';
let menuRequest = 0;

const showCourses = (courses, container) => {
  if (courses.length === 0) {
    const text = document.createElement('p');
    text.textContent = 'No menu available for this day.';
    container.appendChild(text);
    return;
  }

  courses.forEach((course) => {
    const card = document.createElement('div');
    card.className = 'course-card';

    const name = document.createElement('h4');
    name.textContent = course.name;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = course.price || 'Price not available';

    const diets = document.createElement('p');
    diets.className = 'diets';
    diets.textContent = 'Diets: ' + (course.diets || 'Not provided');

    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(diets);
    container.appendChild(card);
  });
};

const getMenu = async () => {
  if (!selectedRestaurant) {
    return;
  }

  const currentRequest = ++menuRequest;
  const type = menuType;

  menuContent.innerHTML = '';
  menuHeading.hidden = false;
  menuHeading.textContent = type === 'daily' ? "Today's Menu" : 'Weekly Menu';
  message.textContent = 'Loading menu...';

  try {
    const url =
      baseUrl + '/restaurants/' + type + '/' + selectedRestaurant._id + '/en';

    const menu = await fetchData(url);

    if (currentRequest !== menuRequest) {
      return;
    }

    message.textContent = '';

    if (type === 'daily') {
      showCourses(menu.courses || [], menuContent);
    } else {
      const days = menu.days || [];

      if (days.length === 0) {
        message.textContent = 'No weekly menu available.';
        return;
      }

      days.forEach((day) => {
        const dayContent = document.createElement('div');
        dayContent.className = 'menu-day';

        const heading = document.createElement('h4');
        heading.className = 'day-heading';
        heading.textContent = day.date;
        dayContent.appendChild(heading);

        showCourses(day.courses || [], dayContent);
        menuContent.appendChild(dayContent);
      });
    }
  } catch (error) {
    if (currentRequest !== menuRequest) {
      return;
    }

    console.log(error);
    menuContent.innerHTML = '';
    message.textContent = 'Could not load the menu. Please try again.';
  }
};

const showRestaurants = (restaurantArray) => {
  restaurantList.innerHTML = '';

  if (restaurantArray.length === 0) {
    restaurantMessage.textContent = 'No matching restaurants.';
    return;
  }

  restaurantMessage.textContent =
    restaurantArray.length + ' restaurants found.';

  restaurantArray.forEach((restaurant) => {
    const item = document.createElement('li');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'restaurant-button';

    const name = document.createElement('span');
    name.className = 'restaurant-title';
    name.textContent = restaurant.name;

    const city = document.createElement('span');
    city.className = 'restaurant-city';
    city.textContent = restaurant.city;

    const isSelected =
      selectedRestaurant !== null && selectedRestaurant._id === restaurant._id;

    button.classList.toggle('selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));

    button.appendChild(name);
    button.appendChild(city);

    button.addEventListener('click', () => {
      selectedRestaurant = restaurant;
      restaurantName.textContent = restaurant.name;
      menuControls.hidden = false;

      filterRestaurants();
      getMenu();
    });

    item.appendChild(button);
    restaurantList.appendChild(item);
  });
};

const createFilters = () => {
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

  cities.sort((a, b) => a.localeCompare(b, 'fi'));
  companies.sort((a, b) => a.localeCompare(b, 'fi'));

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
};

const filterRestaurants = () => {
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const cityMatches =
      cityFilter.value === '' || restaurant.city === cityFilter.value;

    const companyMatches =
      companyFilter.value === '' || restaurant.company === companyFilter.value;

    return cityMatches && companyMatches;
  });

  showRestaurants(filteredRestaurants);
};

const getRestaurants = async () => {
  restaurantMessage.textContent = 'Loading restaurants...';

  try {
    const data = await fetchData(baseUrl + '/restaurants');
    restaurants = Array.isArray(data) ? data : data.restaurants;

    restaurants.sort((a, b) => a.name.localeCompare(b.name, 'fi'));

    createFilters();
    showRestaurants(restaurants);
  } catch (error) {
    console.log(error);
    restaurantMessage.textContent = 'Could not load restaurants.';
  }
};

const changeMenu = (type) => {
  menuType = type;

  const isDaily = type === 'daily';

  dailyButton.classList.toggle('active', isDaily);
  weeklyButton.classList.toggle('active', !isDaily);

  dailyButton.setAttribute('aria-pressed', String(isDaily));
  weeklyButton.setAttribute('aria-pressed', String(!isDaily));

  getMenu();
};

const showUser = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return;
  }

  try {
    const user = await fetchData(baseUrl + '/users/token', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    if (localStorage.getItem('token') !== token) {
      return;
    }

    userInfo.textContent = 'Logged in as ' + user.username;
    logoutButton.hidden = false;
  } catch (error) {
    console.log(error);

    if (localStorage.getItem('token') !== token) {
      return;
    }

    userInfo.textContent = 'Could not check your login.';
    logoutButton.hidden = false;
  }
};

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('token');
  userInfo.textContent = '';
  logoutButton.hidden = true;
});

cityFilter.addEventListener('change', filterRestaurants);
companyFilter.addEventListener('change', filterRestaurants);

dailyButton.addEventListener('click', () => {
  changeMenu('daily');
});

weeklyButton.addEventListener('click', () => {
  changeMenu('weekly');
});

getRestaurants();
showUser();
