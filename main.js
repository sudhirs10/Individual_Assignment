import { baseUrl, fetchData } from "./api.js";

const restaurantList = document.querySelector("#restaurant-list");
const restaurantMessage = document.querySelector("#restaurant-message");
const cityFilter = document.querySelector("#city-filter");
const companyFilter = document.querySelector("#company-filter");

const restaurantName = document.querySelector("#restaurant-name");
const menuType = document.querySelector("#menu-type");
const menuContent = document.querySelector("#menu-content");
const message = document.querySelector("#message");

let restaurants = [];
let selectedRestaurant = null;
let menuRequest = 0;

const showCourses = (courses) => {
  if (courses.length === 0) {
    const text = document.createElement("p");
    text.textContent = "No menu available for this day.";
    menuContent.appendChild(text);
    return;
  }

  const list = document.createElement("ul");

  courses.forEach((course) => {
    const item = document.createElement("li");

    const name = document.createElement("h4");
    name.textContent = course.name;

    const price = document.createElement("p");
    price.textContent = "Price: " + (course.price || "Not available");

    const diets = document.createElement("p");
    diets.textContent = "Diets: " + (course.diets || "Not provided");

    item.appendChild(name);
    item.appendChild(price);
    item.appendChild(diets);

    list.appendChild(item);
  });

  menuContent.appendChild(list);
};

const getMenu = async () => {
  if (!selectedRestaurant) {
    return;
  }

  // Only display the latest menu request.
  const currentRequest = ++menuRequest;
  const type = menuType.value;

  menuContent.innerHTML = "";
  message.textContent = "Loading menu...";

  try {
    const url =
      baseUrl + "/restaurants/" + type + "/" + selectedRestaurant._id + "/en";

    const menu = await fetchData(url);

    if (currentRequest !== menuRequest) {
      return;
    }

    message.textContent = "";

    if (type === "daily") {
      showCourses(menu.courses);
    } else {
      if (menu.days.length === 0) {
        message.textContent = "No weekly menu available.";
        return;
      }

      menu.days.forEach((day) => {
        const heading = document.createElement("h3");
        heading.textContent = day.date;
        menuContent.appendChild(heading);

        showCourses(day.courses);
      });
    }
  } catch (error) {
    if (currentRequest !== menuRequest) {
      return;
    }

    console.log(error);
    menuContent.innerHTML = "";
    message.textContent = "Could not load the menu. Please try again.";
  }
};

const showRestaurants = (restaurantArray) => {
  restaurantList.innerHTML = "";

  if (restaurantArray.length === 0) {
    restaurantMessage.textContent = "No restaurants match your filters.";
    return;
  }

  restaurantMessage.textContent =
    restaurantArray.length + " restaurants found.";

  restaurantArray.forEach((restaurant) => {
    const row = document.createElement("tr");

    const name = document.createElement("td");
    name.textContent = restaurant.name;

    const city = document.createElement("td");
    city.textContent = restaurant.city;

    const company = document.createElement("td");
    company.textContent = restaurant.company;

    const selectCell = document.createElement("td");

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "View menu";

    button.addEventListener("click", () => {
      selectedRestaurant = restaurant;
      restaurantName.textContent = restaurant.name;
      getMenu();
    });

    selectCell.appendChild(button);

    row.appendChild(name);
    row.appendChild(city);
    row.appendChild(company);
    row.appendChild(selectCell);

    restaurantList.appendChild(row);
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

  cities.sort((a, b) => a.localeCompare(b, "fi"));
  companies.sort((a, b) => a.localeCompare(b, "fi"));

  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });

  companies.forEach((company) => {
    const option = document.createElement("option");
    option.value = company;
    option.textContent = company;
    companyFilter.appendChild(option);
  });
};

const filterRestaurants = () => {
  const selectedCity = cityFilter.value;
  const selectedCompany = companyFilter.value;

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const cityMatches = selectedCity === "" || restaurant.city === selectedCity;

    const companyMatches =
      selectedCompany === "" || restaurant.company === selectedCompany;

    return cityMatches && companyMatches;
  });

  showRestaurants(filteredRestaurants);
};

const getRestaurants = async () => {
  try {
    restaurantMessage.textContent = "Loading restaurants...";

    const data = await fetchData(baseUrl + "/restaurants");
    restaurants = Array.isArray(data) ? data : data.restaurants;

    restaurants.sort((a, b) => a.name.localeCompare(b.name, "fi"));

    createFilters();
    showRestaurants(restaurants);
  } catch (error) {
    console.log(error);
    restaurantMessage.textContent =
      "Could not load restaurants. Please try again.";
  }
};

cityFilter.addEventListener("change", filterRestaurants);
companyFilter.addEventListener("change", filterRestaurants);

menuType.addEventListener("change", () => {
  getMenu();
});

getRestaurants();
