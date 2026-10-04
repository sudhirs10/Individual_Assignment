import {baseUrl, fetchData} from './api.js';

const picture = document.querySelector('#profile-picture');
const uploadForm = document.querySelector('#upload-form');
const avatarInput = document.querySelector('#avatar-input');
const uploadMessage = document.querySelector('#upload-message');
const uploadButton = uploadForm.querySelector('button');

function showAvatar(filename) {
  picture.innerHTML = '';

  if (!filename) {
    const text = document.createElement('p');
    text.textContent = 'No profile picture uploaded.';
    picture.appendChild(text);
    return;
  }

  const image = document.createElement('img');
  image.src =
    'https://media2.edu.metropolia.fi/restaurant/uploads/' +
    encodeURIComponent(filename);

  image.alt = 'Your profile picture';
  image.className = 'profile-avatar';
  picture.appendChild(image);
}

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('token');
  const file = avatarInput.files[0];

  if (!token) {
    uploadMessage.textContent = 'Please log in first.';
    return;
  }

  if (!file || !file.type.startsWith('image/')) {
    uploadMessage.textContent = 'Choose an image file.';
    return;
  }

  const formData = new FormData();
  formData.append('avatar', file);

  uploadButton.disabled = true;
  uploadMessage.textContent = 'Uploading picture...';

  try {
    const result = await fetchData(baseUrl + '/users/avatar', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    });

    if (!result.data || !result.data.avatar) {
      throw new Error(result.message || 'Could not upload your picture.');
    }

    showAvatar(result.data.avatar);
    uploadForm.reset();
    uploadMessage.textContent = 'Your profile picture was uploaded.';
  } catch (error) {
    uploadMessage.textContent = error.message;
  } finally {
    uploadButton.disabled = false;
  }
});

export {showAvatar};
