import {baseUrl, fetchData} from './api.js';

const area = document.querySelector('#favourite-area');
const name = document.querySelector('#favourite-name');
const viewButton = document.querySelector('#view-favourite');
const saveButton = document.querySelector('#favourite-button');
const message = document.querySelector('#favourite-message');

function showFavourite(restaurants, selected, user) {
  area.hidden = !user;
  saveButton.hidden = !user || !selected;
  viewButton.hidden = true;

  if (!user) {
    name.textContent = '';
    return;
  }

  const favourite = restaurants.find((restaurant) => {
    return restaurant._id === user.favouriteRestaurant;
  });

  name.textContent = 'No favourite restaurant selected.';

  if (favourite) {
    name.textContent = 'Your favourite: ' + favourite.name;
    viewButton.hidden = false;
  }

  saveButton.textContent = '☆ Save favourite';

  if (selected && selected._id === user.favouriteRestaurant) {
    saveButton.textContent = '★ Your favourite';
  }
}

async function saveFavourite(restaurant) {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  message.textContent = 'Saving favourite...';

  try {
    const result = await fetchData(baseUrl + '/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        favouriteRestaurant: restaurant._id,
      }),
    });

    if (localStorage.getItem('token') !== token) {
      return false;
    }

    if (!result.data) {
      throw new Error(result.message || 'Could not save favourite.');
    }

    message.textContent = restaurant.name + ' saved as your favourite.';
    return true;
  } catch (error) {
    if (localStorage.getItem('token') === token) {
      message.textContent = error.message;
    }

    return false;
  }
}

export {showFavourite, saveFavourite};
