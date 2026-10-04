import {baseUrl, fetchData} from './api.js';
import {showAvatar} from './upload.js';

const profileSection = document.querySelector('#profile-section');
const pictureSection = document.querySelector('#picture-section');
const registerSection = document.querySelector('#register-section');
const loginSection = document.querySelector('#login-section');
const profileForm = document.querySelector('#profile-form');
const usernameInput = document.querySelector('#profile-username');
const emailInput = document.querySelector('#profile-email');
const profileMessage = document.querySelector('#profile-message');
const profileStatus = document.querySelector('#profile-status');
const saveButton = profileForm.querySelector('button');

async function loadProfile() {
  const token = localStorage.getItem('token');

  if (!token) {
    return;
  }

  profileStatus.textContent = 'Loading your profile...';

  try {
    const user = await fetchData(baseUrl + '/users/token', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    usernameInput.value = user.username;
    emailInput.value = user.email;
    showAvatar(user.avatar);

    profileSection.hidden = false;
    pictureSection.hidden = false;
    registerSection.hidden = true;
    loginSection.hidden = true;
    profileStatus.textContent = '';
  } catch (error) {
    console.log(error);
    profileStatus.textContent =
      'Could not load your profile. Please try logging in again.';
  }
}

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('token');

  if (!token) {
    profileMessage.textContent = 'Please log in first.';
    return;
  }

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();

  if (!username || !email) {
    profileMessage.textContent = 'Enter your username and email.';
    return;
  }

  saveButton.disabled = true;
  profileMessage.textContent = 'Saving changes...';

  try {
    const result = await fetchData(baseUrl + '/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        username: username,
        email: email,
      }),
    });

    if (!result.data) {
      throw new Error(result.message || 'Could not update your profile.');
    }

    usernameInput.value = result.data.username;
    emailInput.value = result.data.email;
    profileMessage.textContent = 'Your profile was updated.';
  } catch (error) {
    profileMessage.textContent = error.message;
  } finally {
    saveButton.disabled = false;
  }
});

loadProfile();
