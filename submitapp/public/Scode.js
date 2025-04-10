// Wait for the entire HTML page to load before executing the script
document.addEventListener("DOMContentLoaded", function () {

  // --- Populate the category dropdown on page load ---

  // Send a request to the server to fetch existing quiz categories
  fetch("/categories")
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
      const categorySelect = document.getElementById("category"); // Get the dropdown element

      // Loop through each category returned from the backend
      data.categories.forEach(category => {
        let option = document.createElement("option"); // Create a new option tag
        option.value = category;                       // Set its value attribute
        option.textContent = category;                 // Set visible text
        categorySelect.appendChild(option);            // Add to the dropdown
      });
    })
    .catch(err => console.error("Error fetching categories:", err)); // Handle any errors

  // --- Handle form submission when user submits a question ---

  const form = document.getElementById("questionForm"); // Reference to the form element

  // Add event listener for when the form is submitted
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the form from reloading the page

    // Get input values and remove surrounding whitespace
    const question = document.getElementById("question").value.trim();
    const answer1 = document.getElementById("answer1").value.trim();
    const answer2 = document.getElementById("answer2").value.trim();
    const answer3 = document.getElementById("answer3").value.trim();
    const answer4 = document.getElementById("answer4").value.trim();

    // Check if the user selected which answer is the correct one
    const correctRadio = document.querySelector('input[name="correctAnswer"]:checked');
    if (!correctRadio) {
      alert("Please select which answer is correct.");
      return; // Stop if no correct answer is selected
    }
    const correctIndex = parseInt(correctRadio.value, 10); // Get the index of the correct answer

    // Make sure all question and answer fields are filled
    if (!question || !answer1 || !answer2 || !answer3 || !answer4) {
      alert("Please complete all question and answer fields.");
      return;
    }

    // Get the selected category OR a newly added one
    const categorySelect = document.getElementById("category");
    const selectedCategory = categorySelect.value; // Dropdown value
    const newCategory = document.getElementById("newCategory").value.trim(); // New category field

    let category = "";
    if (newCategory) {
      category = newCategory; // Use new category if provided
    } else if (selectedCategory) {
      category = selectedCategory; // Otherwise use selected one
    } else {
      alert("Please select an existing category or add a new one.");
      return;
    }

    // Create the data object to send to the backend
    const payload = {
      question: question,
      answers: [answer1, answer2, answer3, answer4],
      correctAnswer: correctIndex,
      category: category
    };

    // Send the new question to the backend via POST request
    fetch("/submit", {
      method: "POST", // HTTP method
      headers: {
        "Content-Type": "application/json" // Let server know it's JSON
      },
      body: JSON.stringify(payload) // Convert JS object to JSON string
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok"); // Handle non-200 responses
        }
        return response.json(); // Parse response if successful
      })
      .then(data => {
        alert("Question submitted successfully!"); // Notify user
        form.reset(); // Clear all form fields
      })
      .catch(error => {
        console.error("Error submitting question:", error); // Log error
        alert("There was an error submitting your question."); // Notify user
      });
  });
});
