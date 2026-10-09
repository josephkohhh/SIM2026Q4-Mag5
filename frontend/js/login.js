// login.js
// After the login request succeeds, use the role returned by FastAPI to decide which page to open./

async function login(email, password) {
  const response = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.detail || "Login failed");
    return;
  }

  if (data.role === "admin") {
    window.location.href = "/admin.html";
  } else if (data.role === "customer") {
    window.location.href = "/customer.html";
  } else {
    alert("Your account has an unsupported role.");
  }
}
