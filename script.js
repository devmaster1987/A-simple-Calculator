const historyElement = document.getElementById("history-value");
const outputElement = document.getElementById("output-value");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const MAX_INPUT_LENGTH = 18;

let currentInput = "0";
let firstOperand = null;
let selectedOperator = null;
let shouldResetDisplay = false;

const operatorSymbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
};

function updateDisplay() {
    const formattedValue = formatDisplayNumber(currentInput);

    outputElement.textContent = formattedValue;

    const valueLength = formattedValue.length;

    if (valueLength > 22) {
        outputElement.style.fontSize = "18px";
    } else if (valueLength > 18) {
        outputElement.style.fontSize = "21px";
    } else if (valueLength > 14) {
        outputElement.style.fontSize = "26px";
    } else if (valueLength > 10) {
        outputElement.style.fontSize = "32px";
    } else {
        outputElement.style.fontSize = "42px";
    }
}

function formatDisplayNumber(value) {
    if (value === "Error" || value === "Overflow") {
        return value;
    }

    if (value === "" || value === "-") {
        return value || "0";
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "Error";
    }

    if (
        Math.abs(numericValue) >= 1e18 ||
        (Math.abs(numericValue) > 0 && Math.abs(numericValue) < 1e-9)
    ) {
        return numericValue.toExponential(10);
    }

    const [integerPart, decimalPart] = value.split(".");

    const formattedInteger = Number(integerPart).toLocaleString("en-US");

    return decimalPart !== undefined
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger;
}

function getInputLength(value) {
    return value
        .replace("-", "")
        .replace(".", "")
        .length;
}

function appendNumber(number) {
    if (
        currentInput === "Error" ||
        currentInput === "Overflow" ||
        shouldResetDisplay
    ) {
        currentInput = number === "." ? "0." : number;
        shouldResetDisplay = false;
        updateDisplay();
        return;
    }

    if (number === ".") {
        if (currentInput.includes(".")) {
            return;
        }

        if (currentInput.length >= MAX_INPUT_LENGTH) {
            return;
        }

        currentInput += ".";
        updateDisplay();
        return;
    }

    if (getInputLength(currentInput) >= MAX_INPUT_LENGTH) {
        return;
    }

    if (currentInput === "0") {
        currentInput = number;
    } else {
        currentInput += number;
    }

    updateDisplay();
}

function chooseOperator(operator) {
    if (
        currentInput === "Error" ||
        currentInput === "Overflow"
    ) {
        clearCalculator();
        return;
    }

    const inputValue = Number(currentInput);

    if (selectedOperator && shouldResetDisplay) {
        selectedOperator = operator;
        updateHistory();
        return;
    }

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (selectedOperator) {
        const result = calculate(
            firstOperand,
            inputValue,
            selectedOperator
        );

        if (result === "Error") {
            showError();
            return;
        }

        if (!Number.isFinite(result)) {
            showOverflow();
            return;
        }

        firstOperand = result;
        currentInput = normalizeResult(result);
        updateDisplay();
    }

    selectedOperator = operator;
    shouldResetDisplay = true;
    updateHistory();
}

function calculate(firstNumber, secondNumber, operator) {
    switch (operator) {
        case "+":
            return firstNumber + secondNumber;

        case "-":
            return firstNumber - secondNumber;

        case "*":
            return firstNumber * secondNumber;

        case "/":
            if (secondNumber === 0) {
                return "Error";
            }

            return firstNumber / secondNumber;

        default:
            return secondNumber;
    }
}

function calculateResult() {
    if (
        selectedOperator === null ||
        firstOperand === null ||
        currentInput === "Error" ||
        currentInput === "Overflow"
    ) {
        return;
    }

    const secondOperand = Number(currentInput);

    const result = calculate(
        firstOperand,
        secondOperand,
        selectedOperator
    );

    if (result === "Error") {
        showError();
        return;
    }

    if (!Number.isFinite(result)) {
        showOverflow();
        return;
    }

    historyElement.textContent =
        `${formatHistoryNumber(firstOperand)} ` +
        `${operatorSymbols[selectedOperator]} ` +
        `${formatHistoryNumber(secondOperand)} =`;

    currentInput = normalizeResult(result);
    firstOperand = null;
    selectedOperator = null;
    shouldResetDisplay = true;

    updateDisplay();
}

function applyPercentage() {
    if (
        currentInput === "Error" ||
        currentInput === "Overflow"
    ) {
        clearCalculator();
        return;
    }

    const currentValue = Number(currentInput);

    if (
        firstOperand !== null &&
        selectedOperator !== null &&
        (selectedOperator === "+" || selectedOperator === "-")
    ) {
        currentInput = normalizeResult(
            firstOperand * (currentValue / 100)
        );
    } else {
        currentInput = normalizeResult(currentValue / 100);
    }

    updateDisplay();
}

function backspace() {
    if (
        shouldResetDisplay ||
        currentInput === "Error" ||
        currentInput === "Overflow"
    ) {
        return;
    }

    if (
        currentInput.length === 1 ||
        (currentInput.length === 2 && currentInput.startsWith("-"))
    ) {
        currentInput = "0";
    } else {
        currentInput = currentInput.slice(0, -1);
    }

    updateDisplay();
}

function clearCalculator() {
    currentInput = "0";
    firstOperand = null;
    selectedOperator = null;
    shouldResetDisplay = false;

    historyElement.textContent = "";

    updateDisplay();
}

function showError() {
    currentInput = "Error";
    firstOperand = null;
    selectedOperator = null;
    shouldResetDisplay = true;

    historyElement.textContent = "Cannot divide by zero";

    updateDisplay();
}

function showOverflow() {
    currentInput = "Overflow";
    firstOperand = null;
    selectedOperator = null;
    shouldResetDisplay = true;

    historyElement.textContent = "Result is too large";

    updateDisplay();
}

function updateHistory() {
    if (firstOperand === null || selectedOperator === null) {
        historyElement.textContent = "";
        return;
    }

    historyElement.textContent =
        `${formatHistoryNumber(firstOperand)} ` +
        `${operatorSymbols[selectedOperator]}`;
}

function formatHistoryNumber(value) {
    if (
        Math.abs(value) >= 1e12 ||
        (Math.abs(value) > 0 && Math.abs(value) < 1e-6)
    ) {
        return value.toExponential(6);
    }

    return Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 10
    });
}

function normalizeResult(value) {
    if (!Number.isFinite(value)) {
        return "Overflow";
    }

    return Number(value.toPrecision(12)).toString();
}

document
    .querySelectorAll("[data-number]")
    .forEach(function (button) {
        button.addEventListener("click", function () {
            appendNumber(button.dataset.number);
        });
    });

document
    .querySelectorAll("[data-operator]")
    .forEach(function (button) {
        button.addEventListener("click", function () {
            chooseOperator(button.dataset.operator);
        });
    });

document
    .querySelector('[data-action="clear"]')
    .addEventListener("click", clearCalculator);

document
    .querySelector('[data-action="backspace"]')
    .addEventListener("click", backspace);

document
    .querySelector('[data-action="percentage"]')
    .addEventListener("click", applyPercentage);

document
    .querySelector('[data-action="equals"]')
    .addEventListener("click", calculateResult);

document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        appendNumber(key);
        return;
    }

    if (key === ".") {
        appendNumber(".");
        return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
        event.preventDefault();
        chooseOperator(key);
        return;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
        return;
    }

    if (key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
    }

    if (key === "Escape" || key === "Delete") {
        clearCalculator();
        return;
    }

    if (key === "%") {
        applyPercentage();
    }
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem("calculator-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }

    updateThemeIcon();
}

function toggleTheme() {
    document.body.classList.toggle("dark-theme");

    const currentTheme =
        document.body.classList.contains("dark-theme")
            ? "dark"
            : "light";

    localStorage.setItem("calculator-theme", currentTheme);

    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark =
        document.body.classList.contains("dark-theme");

    themeIcon.textContent = isDark ? "☀" : "☾";

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
    );

    themeToggle.title =
        isDark ? "Switch to light theme" : "Switch to dark theme";
}

themeToggle.addEventListener("click", toggleTheme);

applySavedTheme();
updateDisplay();