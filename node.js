// Create an object to hold functions related to the API
const sheet2api = {};

// Define a function to handle form submissions
sheet2api.input = (form) => {
    // Get the API URL from the form's data attribute
    const url = form.getAttribute('data-spreadsheet-api');

    // Function to enable or disable the form's submit buttons
    const enable_form = (enabled) => {
        const elements = form.querySelectorAll('[type=submit]');
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (enabled) {
                element.removeAttribute('disabled'); // Enable button
            } else {
                element.setAttribute('disabled', 'disabled'); // Disable button
            }
        }
    };

    // Add an event listener for the form's submit event
    form.addEventListener('submit', async (e) => {
        enable_form(false); // Disable the form to prevent multiple submissions
        e.preventDefault(); // Prevent the default form submission behavior
        const formData = new FormData(form); // Get form data
        const entries = Array.from(formData); // Convert form data to an array
        const data = {};
        entries.forEach(([k, v]) => {
            data[k] = v; // Convert array to an object
        });
        form.querySelectorAll('[type=submit]');
        // Send the form data to the API using a POST request
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // Convert object to JSON
        }).then((r) => r.json());
        // Dispatch a custom event to notify that the form has been submitted
        document.dispatchEvent(new Event('form-submitted', {
            response,
        }));
        enable_form(true); // Re-enable the form
        form.reset(); // Reset the form
    });
};

// Define a function to handle displaying data from the API
sheet2api.output = async (element) => {
    // Get the API URL from the element's data attribute
    const url = element.getAttribute('data-spreadsheet-api');
    let text = element.innerHTML;
    if (element.hasAttribute('data-spreadsheet-api-initial-text') === false) {
        element.setAttribute('data-spreadsheet-api-initial-text', text);
    } else {
        text = element.getAttribute('data-spreadsheet-api-initial-text');
    }
    element.innerHTML = 'Loading...'; // Show a loading message
    let data = await fetch(url).then((r) => r.json()); // Fetch data from the API
    if (!Array.isArray(data)) {
        data = [data]; // Ensure data is an array
    }
    const replacement = data.map((object) => {
        Object.keys(object).forEach((k) => {
            object[k.trim()] = object[k]; // Trim any whitespace from keys
        });
        // Replace placeholders in the text with actual data
        return text.replace(/{{([^{}]*)}}/g, (match, key) => object[key.trim()]);
    });
    element.innerHTML = replacement.join(''); // Update the element's inner HTML with the data
};

// Define a function to initialize the sheet2api functionality
sheet2api.render = async () => {
    const elements = document.querySelectorAll('[data-spreadsheet-api]');
    const promises = [];
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.tagName === 'FORM') {
            sheet2api.input(element); // Handle forms separately
        } else {
            //promises.push(sheet2api.output(element)); // Handle other elements
        }
    }
    return Promise.all(promises); // Wait for all promises to resolve
};

// Run the render function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', sheet2api.render);

// Function to read data from the API with optional query parameters
async function readSheetData(url, options = {}) {
    try {
        // Construct the query string from options
        const query = options.query ? '?' + new URLSearchParams(options.query).toString() : '';
        const response = await fetch(url + query, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result; // Return the result
    } catch (error) {
        console.error(error);
        return null; // Return null in case of an error
    }
}

// Function to find and return values based on a query
async function find(searchTerms) {
    const url = 'https://sheet2api.com/v1/BilT5QMeRAKQ/first-interns';
    const query = new URLSearchParams();
    searchTerms.forEach(term => {
        query.append(term.key, term.value);
    });
    const options = { query };
    const result = await readSheetData(url, options);
    return result;
}

// Function to display the first 'num' items in HTML
async function displayFirst(num, searchTerms) {
    const data = await find(searchTerms);
    if (data && data.length > 0) {
        const firstItems = data.slice(0, num);
        let outputHtml = '<div class="results">';
        firstItems.forEach(item => {
            outputHtml += `
                <div class="result-item">
                    <div class="item-name"><strong>Name:</strong> ${item.NAME}</div>
                    <div class="item-programming"><strong>Programming:</strong> ${item.PROGRAMMING}</div>
                    <div class="item-build"><strong>Build:</strong> ${item.BUILD}</div>
                    <div class="item-leadership"><strong>Leadership:</strong> ${item.LEADERSHIP}</div>
                    <div class="item-role"><strong>Role:</strong> ${item.ROLE}</div>
                </div>
            `;
        });
        outputHtml += '</div>';
        document.getElementById('output-container').innerHTML = outputHtml;
    } else {
        document.getElementById('output-container').style.setProperty('color','#ccc');
        document.getElementById('output-container').innerHTML = 'No data found.';
    }
}

// Add event listener to the search button
document.getElementById('search-button').addEventListener('click', () => {
    const searchTerms = [];

    const name = document.getElementById('name').value;
    if (name) {
        searchTerms.push({ key: 'NAME', value: name });
    }

    const role = document.getElementById('role').value;
    if (role) {
        searchTerms.push({ key: 'ROLE', value: role });
    }

    if (document.getElementById('programming').checked) {
        searchTerms.push({ key: 'PROGRAMMING', value: 'TRUE' });
    }

    if (document.getElementById('build').checked) {
        searchTerms.push({ key: 'BUILD', value: 'TRUE' });
    }

    if (document.getElementById('leadership').checked) {
        searchTerms.push({ key: 'LEADERSHIP', value: 'TRUE' });
    }

    displayFirst(15, searchTerms);
});

// Initial display with default search terms
const initialSearchTerms = [];
displayFirst(15, initialSearchTerms);
