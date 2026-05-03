import apiClient from "./client";

export async function signup(payload) {
  const { data } = await apiClient.post("/auth/signup", payload);
  return data;
}

export async function login(email, password) {
  const payload = new URLSearchParams();
  payload.append("username", email);
  payload.append("password", password);

  const { data } = await apiClient.post("/auth/login", payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}
