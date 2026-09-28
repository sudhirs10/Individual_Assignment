const baseUrl = "https://media2.edu.metropolia.fi/restaurant/api/v1";

const fetchData = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed.");
  }

  return data;
};

export { baseUrl, fetchData };
