const API_URL = import.meta.env.VITE_API_URL || "";

if (!API_URL) {
  console.error("VITE_API_URL is not configured. Requests will fail.");
}

const secureFetch = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(options.headers || {})
      },
      credentials: "include"
    });

    clearTimeout(timeoutId);

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        `Request failed (${response.status})`
      );
    }

    return data;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("Request timeout. Please try again.");
    }

    if (!navigator.onLine) {
      throw new Error("No internet connection.");
    }

    throw new Error(error.message || "Network error occurred.");
  }
};

export const createOrder = async (data) => {
  return secureFetch("/api/v1/payment/create-order", {
    method: "POST",
    body: JSON.stringify(data)  
  });
};

export const verifyPayment = async (paymentData) => {
  return secureFetch("/api/v1/payment/verify", {
    method: "POST",
    body: JSON.stringify(paymentData)
  });
};

export const registerTeam = async (teamData) => {
  return secureFetch("/api/v1/team-registration-ax92", { 
    method: "POST",
    body: JSON.stringify(teamData)
  });
};