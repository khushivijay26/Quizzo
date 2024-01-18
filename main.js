const questionText = document.querySelector(".question-text");
const optionContainer = document.querySelector(".option-container");
const homeBox = document.querySelector(".home-box");
const quizBox = document.querySelector(".quiz-box");
const resultBox = document.querySelector(".result-box");

let questionCounter = 0;
let currentQuestion;
let availableQuestions = [];
let availableOptions = [];
let correctAnswers = 0;
let currentUser;
let userQuizData = [];
let currentQuestionIndex;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function setAvailableQuestions() {
    const storedQuestions = localStorage.getItem(`${currentUser.email}_quizData`);
    userQuizData = storedQuestions ? JSON.parse(storedQuestions) : [];

    if (userQuizData.length >= 4) {
        questionCounter = userQuizData.length;
        availableQuestions = [];
        quiz.forEach((question) => {
            if (!userQuizData.find((data) => data.question.q === question.q)) {
                availableQuestions.push(question);
            }
        });
    } else {
        let storedShuffledOrder = localStorage.getItem(`${currentUser.email}_shuffledOrder`);
        if (storedShuffledOrder) {
            const shuffledOrder = JSON.parse(storedShuffledOrder);
            availableQuestions = shuffledOrder.map((index) => quiz[index]).filter(
                (question) => !userQuizData.find((data) => data.question.q === question.q)
            );
        } else {
            const shuffledOrder = [...Array(quiz.length).keys()];
            shuffleArray(shuffledOrder);
            availableQuestions = shuffledOrder.map((index) => quiz[index]).filter(
                (question) => !userQuizData.find((data) => data.question.q === question.q)
            );
            localStorage.setItem(`${currentUser.email}_shuffledOrder`, JSON.stringify(shuffledOrder));
        }
    }
}

function getNewQuestion() {
    if (availableQuestions.length === 0) {
        quizOver();
        return;
    }

    currentQuestion = availableQuestions[questionCounter];
    questionText.innerHTML = currentQuestion.q;

    availableOptions = [];
    const optionLen = currentQuestion.options.length;
    for (let i = 0; i < optionLen; i++) {
        availableOptions.push(i);
    }

    optionContainer.innerHTML = '';

    for (let i = 0; i < optionLen; i++) {
        const optionIndex = i;
        const option = document.createElement("div");
        option.innerHTML = currentQuestion.options[optionIndex];
        option.id = optionIndex;
        option.className = "option";
        optionContainer.appendChild(option);
        option.setAttribute("onclick", "getResult(this)");
    }

    questionCounter++;
}

function getResult(element) {
    const optionElements = optionContainer.getElementsByClassName("option");
    for (let i = 0; i < optionElements.length; i++) {
        optionElements[i].style.backgroundColor = "";
        optionElements[i].style.color = "";
        optionElements[i].classList.remove("selected");
    }

    const id = parseInt(element.id);
    if (id === currentQuestion.answer) {
        correctAnswers++;
    }
    element.style.backgroundColor = "grey";
    element.style.color = "white";
    element.classList.add("selected");

    disableOptions();
}

function setCurrentState(states = 'login') {
    setCookie('currentState', states);
}

function getCurrentState() {
    return getCookie('currentState');
}

function setCurrentScreen() {
    const currentState = getCurrentState();
    const usernameCookie = getCookie('username');
    const emailCookie = getCookie('email');

    if (currentState === 'quiz') {
        if (usernameCookie && emailCookie) {
            const storedUserData = localStorage.getItem("users");
            let usersArray = storedUserData ? JSON.parse(storedUserData) : [];
            currentUser = usersArray.find((user) => user.email === emailCookie);

            if (currentUser) {
                const displayUsername = document.getElementById("displayUsername");
                displayUsername.textContent = currentUser.username;

                homeBox.classList.add("hide");
                quizBox.classList.remove("hide");

                const storedUserQuizData = localStorage.getItem(`${currentUser.email}_quizData`);
                userQuizData = storedUserQuizData ? JSON.parse(storedUserQuizData) : [];

                const storedQuestionCounter = localStorage.getItem(`${currentUser.email}_questionCounter`);
                questionCounter = storedQuestionCounter ? parseInt(storedQuestionCounter) : 0;

                setAvailableQuestions();
                getNewQuestion();
                enableOptions();
            }
        }
    } else if (currentState === 'result') {
        if (usernameCookie && emailCookie) {
            const storedUserData = localStorage.getItem("users");
            let usersArray = storedUserData ? JSON.parse(storedUserData) : [];
            currentUser = usersArray.find((user) => user.email === emailCookie);

            if (currentUser) {
                quizOver();
            }
        }
    }
}


setCurrentScreen();

function startQuiz() {
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (email.length === 0) {
        alert("Please enter a valid email address.");
        return;
    }

    const storedUserData = localStorage.getItem("users");
    let usersArray = storedUserData ? JSON.parse(storedUserData) : [];

    let existingUser = usersArray.find((user) => user.email === email);

    if (!existingUser) {
        const confirmNewUser = confirm("User not found. Do you want to register as a new user?");
        if (confirmNewUser) {
            if (!isValidUsername(username)) {
                alert("Please enter a valid username (8-10 alphanumeric characters).");
                return;
            }

            if (!isValidEmail(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            usersArray.push({ username: username, email: email, score: 0 });
            localStorage.setItem("users", JSON.stringify(usersArray));
            existingUser = { username: username, email: email, score: 0 };

            setCookie('username', username);
            setCookie('email', email);
        }
    }

    setCurrentState('quiz');

    currentUser = { username: existingUser.username, email: existingUser.email };
    const displayUsername = document.getElementById("displayUsername");
    displayUsername.textContent = existingUser.username;

    homeBox.classList.add("hide");
    quizBox.classList.remove("hide");

    setAvailableQuestions();
    getNewQuestion();
    enableOptions();
}

function disableOptions() {
    const optionElements = optionContainer.getElementsByClassName("option");
    for (let i = 0; i < optionElements.length; i++) {
        optionElements[i].style.pointerEvents = "none";
    }
}

function enableOptions() {
    const optionElements = optionContainer.getElementsByClassName("option");
    for (let i = 0; i < optionElements.length; i++) {
        optionElements[i].style.pointerEvents = "auto";
    }
}

let lastDisplayedQuestionIndex = 0;

function back() {
    if (questionCounter > 1) {
        questionCounter--;

        const previousQuestionData = userQuizData[questionCounter - 1];
        if (previousQuestionData && previousQuestionData.question) {
            loadPreviousQuestion(previousQuestionData);
        }
    } else {
        alert("This is the first question, there is no previous question.");
    }
}

function loadPreviousQuestion(questionData) {
    currentQuestion = questionData.question;
    questionText.innerHTML = currentQuestion.q;

    availableOptions = [];
    optionContainer.innerHTML = '';

    const optionLen = currentQuestion.options.length;
    for (let i = 0; i < optionLen; i++) {
        availableOptions.push(i);
        const optionIndex = i;
        const option = document.createElement("div");
        option.innerHTML = currentQuestion.options[optionIndex];
        option.id = optionIndex;
        option.className = "option";
        optionContainer.appendChild(option);

        if (optionIndex === questionData.selectedOption) {
            option.style.backgroundColor = "grey";
            option.style.color = "white";
            option.classList.add("selected");
        }
    }

    if (questionData.selectedOption !== undefined) {
        disableOptions();
    } else {
        enableOptions();
    }
}

// ... (rest of the code)


function next() {
    const selectedOption = optionContainer.querySelector(".selected");
    if (!selectedOption) {
        alert("Please select an option before proceeding!");
        return;
    }

    saveUserAnswer();
    disableOptions();

    localStorage.setItem(`${currentUser.email}_questionCounter`, questionCounter);

    const userAttempts = JSON.parse(localStorage.getItem(`${currentUser.email}_quizData`));
    const userAttemptsLength = userAttempts.length;
    if (userAttemptsLength === quiz.length) {
        quizOver();
    } else {
        getNewQuestion();
        enableOptions();
    }
}


function saveUserAnswer() {
    const selectedOption = optionContainer.querySelector(".selected");
    const selectedOptionIndex = parseInt(selectedOption.id);
    const userAnswer = {
        question: currentQuestion,
        selectedOption: selectedOptionIndex
    };

    const questionIndex = questionCounter - 1;
    if (userQuizData[questionIndex]) {
        userQuizData[questionIndex] = userAnswer;
    } else {
        userQuizData.push(userAnswer);
    }

    localStorage.setItem(`${currentUser.email}_quizData`, JSON.stringify(userQuizData));
}

function quizOver() {
    homeBox.classList.add("hide");
    quizBox.classList.add("hide");
    resultBox.classList.remove("hide");
    quizResult();
    resetInputFields();
    setCurrentState('result');
}

function quizResult() {
    const storedUserData = localStorage.getItem("users");
    let usersArray = storedUserData ? JSON.parse(storedUserData) : [];

    const currentUserIndex = usersArray.findIndex((user) => user.email === currentUser.email);
    if (currentUserIndex !== -1) {
        const userScore = userQuizData.filter((data) => data.question.answer === data.selectedOption).length;
        if (userScore > usersArray[currentUserIndex].score || usersArray[currentUserIndex].score === undefined) {
            usersArray[currentUserIndex].score = userScore;
        }
    } else {
        const userObject = {
            username: currentUser.username,
            email: currentUser.email,
            score: userQuizData.filter((data) => data.question.answer === data.selectedOption).length
        };
        usersArray.push(userObject);
    }

    usersArray = usersArray.reverse();

    const tableBody = resultBox.querySelector("#userTable tbody");
    tableBody.innerHTML = "";

    usersArray.forEach((user, index) => {
        const tableRow = document.createElement("tr");
        tableRow.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.score !== undefined ? user.score : "-"}</td>
        `;
        tableBody.appendChild(tableRow);
    });

    localStorage.setItem("users", JSON.stringify(usersArray.reverse()));
}

function resetQuiz() {
    questionCounter = 0;
    correctAnswers = 0;
    availableQuestions = [];
    userQuizData = [];
}

function goToHome() {
    resultBox.classList.add("hide");
    homeBox.classList.remove("hide");
    resetQuiz();
    resetInputFields();
    setCurrentState('login');
}

function isValidUsername(username) {
    const usernamePattern = /^[a-zA-Z0-9]{8,10}$/;
    return usernamePattern.test(username);
}

function isValidEmail(email) {
    const emailPattern = /^[a-z0-9._]+@[a-z]+\.[a-z]{2,3}$/;
    return emailPattern.test(email);
}

function checkLoggedInUser(email) {
    const storedUserData = localStorage.getItem("users");
    const usersArray = storedUserData ? JSON.parse(storedUserData) : [];
    const loggedInUser = usersArray.find((user) => user.email === email);

    return loggedInUser;
}

function resetInputFields() {
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    usernameInput.value = "";
    emailInput.value = "";
}

function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}