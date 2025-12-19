document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const messageDiv = document.getElementById("message");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", result.access_token);
        messageDiv.textContent = "Login successful! Redirecting...";
        messageDiv.className = "success";
        // Fetch user to determine role
        const userResponse = await fetch("/users/me", {
          headers: {
            "Authorization": `Bearer ${result.token_type} ${result.access_token}`,
          },
        });
        if (userResponse.ok) {
          const user = await userResponse.json();
          if (user.role === "admin") {
            window.location.href = "/static/admin.html";
          } else {
            window.location.href = "/static/index.html";
          }
        } else {
          window.location.href = "/static/index.html"; // default
        }
      } else {
        messageDiv.textContent = result.detail || "Login failed";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");
    } catch (error) {
      messageDiv.textContent = "Login failed. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error logging in:", error);
    }
  });
});