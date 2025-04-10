// Waits until the HTML document is fully loaded before running any of the JavaScript code inside
document.addEventListener("DOMContentLoaded", function () {

    // Get a reference to the elements where users will select a category
    const categorySelect = document.getElementById("category");
    const requestBtn = document.getElementById("requestBtn");
    const questionDisplay = document.getElementById("question");
    const answerButtons = document.querySelectorAll(".answer-btn");

    // Variable to store the correct answer so it can be validated later
    let currentCorrectAnswer = null;

    // Make a GET request to the backend to fetch all available quiz categories
    fetch("/categories")
        .then(response => response.json()) // Convert the response to JSON format
        .then(data => {
            // Clear any existing options in the dropdown
            categorySelect.innerHTML = "";

            // For each category received from the backend...
            data.categories.forEach(category => {
                // Create a new <option> element
                let option = document.createElement("option");

                // Set its value and text content to the category name
                option.value = category;
                option.textContent = category;

                // Add the <option> to the <select> dropdown
                categorySelect.appendChild(option);
            });
        })
        // Log any errors that happen during the fetch process
        .catch(error => console.error("Error fetching categories:", error));

    // Add a click event listener to the "Get Question" button
    requestBtn.addEventListener("click", function () {

        // Get the currently selected category
        const selectedCategory = categorySelect.value;

        // If no category is selected, show an alert and stop the function
        if (!selectedCategory) {
            alert("Please select a category.");
            return;
        }

        // Fetch a question from the server for the selected category
        fetch(`/question/${selectedCategory}`)
            .then(response => response.json()) // Convert response to JSON
            .then(data => {

                // If there's at least one question returned from the backend
                if (data.length > 0) {

                    // Take the first question from the returned data
                    const questionData = data[0];

                    // Set the question text into the designated paragraph element
                    questionDisplay.textContent = questionData.text;

                    // Store the correct answer to be used when validating user selection
                    currentCorrectAnswer = questionData.correct_answer;

                    // Create an array of all the answer options from the question
                    let answers = [
                        questionData.option_a,
                        questionData.option_b,
                        questionData.option_c,
                        questionData.option_d
                    ];

                    // Shuffle the answers randomly so they appear in a different order each time
                    answers = answers.map(answer => ({ answer, sort: Math.random() })) // Add random sort values
                                     .sort((a, b) => a.sort - b.sort) // Sort by random value
                                     .map(obj => obj.answer); // Get just the answer text

                    // Update each answer button with the shuffled answers
                    answerButtons.forEach((button, index) => {
                        button.textContent = answers[index]; // Set button text
                        button.style.display = "inline-block"; // Make the button visible
                        button.style.backgroundColor = ""; // Reset any previous colour
                        button.disabled = false; // Re-enable buttons if they were disabled before
                    });
                } else {
                    // If no questions were returned, show a message
                    questionDisplay.textContent = "No questions found for this category.";

                    // Reset the stored correct answer
                    currentCorrectAnswer = null;
                }
            })
            // Handle any errors during the fetch
            .catch(error => console.error("Error fetching question:", error));
    });

    // Add a click listener to each answer button
    answerButtons.forEach((button) => {
        button.addEventListener("click", function () {

            // If there's no current correct answer (i.e. no question fetched), alert the user
            if (currentCorrectAnswer === null) {
                alert("Please fetch a question first!");
                return;
            }

            // If the clicked button's text matches the correct answer...
            if (button.textContent === currentCorrectAnswer) {
                button.style.backgroundColor = "green"; // Show green for correct
                alert("Correct Answer!"); // Notify the user
            } else {
                button.style.backgroundColor = "red"; // Show red for incorrect
                alert("Wrong Answer!"); // Notify the user
            }

            // Disable all answer buttons so the user can't click again
            answerButtons.forEach((btn) => {
                btn.disabled = true;
            });
        });
    });
});
