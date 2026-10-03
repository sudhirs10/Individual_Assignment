import {baseUrl, fetchData} from './api.js';

const restaurantName = document.querySelector('#restaurant-name');
const controls = document.querySelector('#menu-controls');
const dailyButton = document.querySelector('#daily-button');
const weeklyButton = document.querySelector('#weekly-button');
const heading = document.querySelector('#menu-heading');
const content = document.querySelector('#menu-content');
const message = document.querySelector('#message');

let latestRequest = 0;

function showCourses(courses) {
  if (courses.length === 0) {
    const text = document.createElement('p');
    text.textContent = 'No menu available for this day.';
    content.appendChild(text);
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
    content.appendChild(card);
  });
}

async function showMenu(restaurant, type) {
  if (!restaurant) {
    return;
  }

  latestRequest++;
  const request = latestRequest;
  const daily = type === 'daily';

  restaurantName.textContent = restaurant.name;
  controls.hidden = false;
  heading.hidden = false;
  heading.textContent = daily ? "Today's Menu" : 'Weekly Menu';

  dailyButton.classList.toggle('active', daily);
  weeklyButton.classList.toggle('active', !daily);
  dailyButton.setAttribute('aria-pressed', String(daily));
  weeklyButton.setAttribute('aria-pressed', String(!daily));

  content.innerHTML = '';
  message.textContent = 'Loading menu...';

  try {
    const url = baseUrl + '/restaurants/' + type + '/' + restaurant._id + '/en';

    const menu = await fetchData(url);

    if (request !== latestRequest) {
      return;
    }

    message.textContent = '';

    if (daily) {
      showCourses(menu.courses || []);
    } else {
      const days = menu.days || [];

      if (days.length === 0) {
        message.textContent = 'No weekly menu available.';
      }

      days.forEach((day) => {
        const dayHeading = document.createElement('h4');
        dayHeading.className = 'day-heading';
        dayHeading.textContent = day.date;
        content.appendChild(dayHeading);

        showCourses(day.courses || []);
      });
    }
  } catch (error) {
    if (request === latestRequest) {
      console.log(error);
      message.textContent = 'Could not load the menu.';
    }
  }
}

export {showMenu};
