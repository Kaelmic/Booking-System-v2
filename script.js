document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".booking-form");
  const successMessage = document.getElementById("success-message");

  if (!form || !successMessage) return;

  const nameInput = document.querySelector('input[name="Customer Name"]');
  const phoneInput = document.querySelector('input[name="Phone Number"]');
  const dateInput = document.getElementById("dateInput");
  const dayDisplay = document.getElementById("day-display");
  const timeInput = document.getElementById("timeInput");
  const submitBtn = form.querySelector("button");

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayFormatted = `${yyyy}-${mm}-${dd}`;

  function isPastCutoffTime() {
  const now = new Date();
  return now.getHours() >= 17.45; // 17:45PM cutoff
  }

  if (dateInput) {
    if (isPastCutoffTime()) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const dd = String(tomorrow.getDate()).padStart(2, "0");

        dateInput.min = `${yyyy}-${mm}-${dd}`;
    } else {
        dateInput.min = todayFormatted;
    }
  }

  function generateTimeSlots() {
    if (!timeInput) return;

    timeInput.innerHTML = `<option value="">Select time</option>`;

    const startHour = 9;
    const endHour = 18;
    const now = new Date();

    const selectedDateValue = dateInput.value;
    const isToday = selectedDateValue === todayFormatted;

    for (let hour = startHour; hour <= endHour; hour++) {
      ["00", "15", "30", "45"].forEach((minute) => {
        if (hour === endHour && minute !== "00") return;

        const time = `${String(hour).padStart(2, "0")}:${minute}`;

        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;

        if (isToday) {
          const slotDateTime = new Date(`${selectedDateValue}T${time}:00`);

          if (slotDateTime <= now) {
            option.disabled = true;
            option.textContent = `${time} - unavailable`;
          }
        }

        timeInput.appendChild(option);
      });
    }
  }

  generateTimeSlots();

  if (nameInput) {
    nameInput.addEventListener("input", () => {
      nameInput.value = nameInput.value.replace(/[^A-Za-z\s]/g, "");
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/[^\d+\s]/g, "");
    });
  }

  if (dateInput && dayDisplay) {
    dateInput.addEventListener("change", () => {
      if (!dateInput.value) return;

      const selectedDate = new Date(dateInput.value + "T00:00:00");

      const dayName = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const dayNumber = selectedDate.getDay();

      const closedDays = [0]; // Sunday

      if (closedDays.includes(dayNumber)) {
        dayDisplay.textContent = `Sorry, we are closed on ${dayName}. Please choose another date.`;
        dateInput.value = "";
        generateTimeSlots();
        return;
      }

      dayDisplay.textContent = `Selected day: ${dayName}`;
      generateTimeSlots();
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    const nameValid = /^[A-Za-z\s]+$/.test(name);
    const phoneValid = /^[\+0-9\s]+$/.test(phone);

    if (!nameValid) {
      alert("Name should contain letters only.");
      return;
    }

    if (!phoneValid) {
      alert("Phone number should contain only numbers.");
      return;
    }

    const data = new FormData(form);

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        form.reset();
        dayDisplay.textContent = "";
        generateTimeSlots();
        successMessage.style.display = "block";
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Request";
    }
  });
});

function scrollToBooking(serviceName) {
  const bookingSection = document.getElementById("booking");
  const serviceSelect = document.getElementById("serviceSelect");

  if (serviceSelect && serviceName) {
    serviceSelect.value = serviceName;
  }

  bookingSection.scrollIntoView({ behavior: "smooth" });
}