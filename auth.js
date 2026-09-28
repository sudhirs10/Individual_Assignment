import { baseUrl, fetchData } from "./api.js";

const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");

const registerMessage = document.querySelector("#register-message");
const loginMessage = document.querySelector("#login-message");

const registerUser = async (event) => {
  event.preventDefault();

  const button = registerForm.querySelector("button");
  button.disabled = true;
  registerMessage.textContent = "Creating account...";

  const username = document.querySelector("#register-username").value.trim();
  const email = document.querySelector("#register-email").value.trim();
  const password = document.querySelector("#register-password").value;

  const user = {
    username,
    email,
    password,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  };

  try {
    const result = await fetchData(baseUrl + "/users", options);

    if (!result.data || !result.data._id) {
      throw new Error(result.message || "Registration failed.");
    }

    registerMessage.textContent = "Account created. You can now log in.";

    if (result.data.activated === false || result.activationUrl) {
      registerMessage.textContent =
        "Account created. Activate your account before logging in.";

      if (result.activationUrl) {
        const activationText = document.createElement("p");
        activationText.textContent =
          "Open this activation address: " + result.activationUrl;

        registerMessage.appendChild(activationText);
      }
    }

    registerForm.reset();
  } catch (error) {
    registerMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
};

const loginUser = async (event) => {
  event.preventDefault();

  const button = loginForm.querySelector("button");
  button.disabled = true;
  loginMessage.textContent = "Logging in...";

  const username = document.querySelector("#login-username").value.trim();
  const password = document.querySelector("#login-password").value;

  const credentials = {
    username,
    password,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  };

  try {
    const result = await fetchData(baseUrl + "/auth/login", options);

    // The API can return a login error with status 200.
    if (!result.token) {
      throw new Error(result.message || "Login failed.");
    }

    localStorage.setItem("token", result.token);

    loginForm.reset();
    window.location.href = "index.html";
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
};

registerForm.addEventListener("submit", registerUser);
loginForm.addEventListener("submit", loginUser);
