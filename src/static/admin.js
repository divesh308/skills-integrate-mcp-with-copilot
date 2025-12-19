document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const unregisterActivitySelect = document.getElementById("unregister-activity");
  const unregisterForm = document.getElementById("unregister-form");
  const messageDiv = document.getElementById("message");
  const logoutBtn = document.getElementById("logout-btn");
  const currentUserSpan = document.getElementById("current-user");

  // Check if logged in
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "/static/login.html";
    return;
  }

  // Function to fetch current user
  async function fetchCurrentUser() {
    try {
      const response = await fetch("/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const user = await response.json();
        currentUserSpan.textContent = `Logged in as: ${user.username} (${user.role})`;
      } else {
        // Token invalid, redirect to login
        localStorage.removeItem("access_token");
        window.location.href = "/static/login.html";
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      unregisterActivitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        unregisterActivitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister form submission
  unregisterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("unregister-email").value;
    const activity = document.getElementById("unregister-activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        unregisterForm.reset();

        // Refresh activities list
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  });

  // Handle logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.href = "/static/login.html";
  });

  // Initialize app
  fetchCurrentUser();
  fetchActivities();
});