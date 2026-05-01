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

  const startHour = 9;
  const endHour = 18;
  const cutoffHour = 20;

  function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function isPastCutoffTime() {
    const now = new Date();
    return now.getHours() >= cutoffHour;
  }

  function getMinimumBookingDate() {
    const minDate = new Date();

    if (isPastCutoffTime()) {
      minDate.setDate(minDate.getDate() + 1);
    }

    return formatDate(minDate);
  }

  function setMinimumDate() {
    if (!dateInput) return;
    dateInput.min = getMinimumBookingDate();
  }

  function generateTimeSlots() {
    if (!timeInput) return;

    timeInput.innerHTML = `<option value="">Select time</option>`;

    if (!dateInput.value) return;

    const now = new Date();
    const todayFormatted = formatDate(now);
    const isToday = dateInput.value === todayFormatted;

    for (let hour = startHour; hour <= endHour; hour++) {
      ["00", "15", "30", "45"].forEach((minute) => {
        if (hour === endHour && minute !== "00") return;

        const time = `${String(hour).padStart(2, "0")}:${minute}`;
        const option = document.createElement("option");

        option.value = time;
        option.textContent = time;

        if (isToday) {
          const slotDateTime = new Date(`${dateInput.value}T${time}:00`);

          if (slotDateTime <= now) {
            option.disabled = true;
            option.textContent = `${time} - unavailable`;
          }
        }

        timeInput.appendChild(option);
      });
    }
  }

  setMinimumDate();

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
      setMinimumDate();

      if (!dateInput.value) {
        dayDisplay.textContent = "";
        generateTimeSlots();
        return;
      }

      const minBookingDate = getMinimumBookingDate();

      if (dateInput.value < minBookingDate) {
        dayDisplay.textContent = "Please choose a valid future date.";
        dateInput.value = "";
        generateTimeSlots();
        return;
      }

      const selectedDate = new Date(dateInput.value + "T00:00:00");
      const dayName = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const dayNumber = selectedDate.getDay();
      const closedDays = [0];

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

    setMinimumDate();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;

    const minBookingDate = getMinimumBookingDate();

    if (!selectedDate || selectedDate < minBookingDate) {
      alert("Please choose a valid booking date.");
      return;
    }

    if (!selectedTime) {
      alert("Please choose a valid booking time.");
      return;
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const now = new Date();

    if (selectedDateTime <= now) {
      alert("Please choose a future time.");
      generateTimeSlots();
      timeInput.value = "";
      return;
    }

    const selectedDay = new Date(selectedDate + "T00:00:00").getDay();

    if (selectedDay === 0) {
      alert("Sorry, we are closed on Sundays.");
      return;
    }

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
        timeInput.innerHTML = `<option value="">Select time</option>`;
        setMinimumDate();
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
