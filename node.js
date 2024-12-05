document.addEventListener('DOMContentLoaded', async () => {
    storedData = await fetchData(initialSearchTerms);
    console.log("Initial data fetched and stored:", storedData); // Debug: check initial stored data
    displayFirst(Infinity, storedData);
});

const initialSearchTerms = [];
let storedData = []; // To store the fetched data

document.getElementById('search-button').addEventListener('click', async () => {
    const searchTerms = getSearchTerms();
    document.getElementById('output-container').style.setProperty('color', '#ccc');
    document.getElementById('output-container').innerHTML = 'Loading...';
    storedData = await fetchData(searchTerms); // Fetch and store data
    console.log("Data fetched and stored:", storedData); // Debug: check stored data

    // Determine if sorting is needed and call the appropriate function
    const zip = document.getElementById('zip').value;
    if (zip === "48188") {
        sortAndDisplay("CANTONDIS");
    } else if (zip === "49224") {
        sortAndDisplay("ALBIONDIS");
    } else {
        displayFirst(Infinity, storedData);
    }
});

async function sortAndDisplay(sortBy) {
    console.log("sortAndDisplay called with sortBy:", sortBy, "storedData:", storedData); // Debug: check sortBy and storedData
    if (storedData && storedData.length > 0) {
        storedData.sort((a, b) => {
            return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
        });
        console.log("Sorted data:", storedData); // Debug: check sorted data
        displaySorted(storedData);
    } else {
        document.getElementById('output-container').style.setProperty('color', '#ccc');
        document.getElementById('output-container').innerHTML = 'No data found.';
    }
}

function getSearchTerms() {
    const searchTerms = [];
    const zip = document.getElementById('zip').value;

    if (document.getElementById('programming').checked) {
        searchTerms.push({ key: 'PROGRAMMING', value: 'TRUE' });
    }
    if (document.getElementById('build').checked) {
        searchTerms.push({ key: 'BUILD', value: 'TRUE' });
    }
    if (document.getElementById('leadership').checked) {
        searchTerms.push({ key: 'LEADERSHIP', value: 'TRUE' });
    }

    console.log("Generated search terms:", searchTerms); // Debug: check generated search terms
    return searchTerms;
}

async function fetchData(searchTerms) {
    const url = 'https://sheet2api.com/v1/BilT5QMeRAKQ/first-interns';
    const query = new URLSearchParams();
    searchTerms.forEach(term => {
        query.append(term.key, term.value);
    });
    const options = { query };
    const queryUrl = url + '?' + query.toString();
    console.log("Query URL:", queryUrl); // Debug: check query URL
    try {
        const response = await fetch(queryUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            console.error('Network response was not ok:', response.statusText);
            return [];
        }
        const result = await response.json();
        console.log("Result from API:", result); // Debug: check result from API
        return result;
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

async function displayFirst(num, data) {
    console.log("displayFirst called with data:", data); // Debug: check data passed to displayFirst
    if (data && data.length > 0) {
        const firstItems = data.slice(0, num);
        displaySorted(firstItems);
    } else {
        document.getElementById('output-container').style.setProperty('color', '#ccc');
        document.getElementById('output-container').innerHTML = 'No data found.';
    }
}

function displaySorted(data) {
    console.log("Displaying sorted data:", data); // Debug: check data passed to displaySorted
    let outputHtml = '<div class="results">';
    data.forEach(item => {
        outputHtml += `
            <div id="border">
                <div id="card">
                    <div id="row1">
                        <div id="name">${item.NAME}</div>
                        <div id="team-num">#${item.TeamNumber}</div>
                    </div>
                    <div id="row2">
                        <div id="green" class="tag"> ${item.ROLE} </div>  
                        <div id="blue" class="tag"> ${item.GRADE} </div>
        `;
        if (item.BUILD == 'TRUE') {
            outputHtml += '<div id="orange" class="tag"> Build </div>';
        }
        if (item.PROGRAMMING == 'TRUE') {
            outputHtml += '<div id="pink" class="tag"> Programming </div>';
        }
        if (item.LEADERSHIP == 'TRUE') {
            outputHtml += '<div id="blue" class="tag"> Leadership </div>';
        }
        outputHtml += `
                    </div>
                    <div id="image-container">
                        <iframe src="https://drive.google.com/file/d/${item.RESUME}/preview" width="640" height="480" allow="autoplay"></iframe>
                    </div>
                </div>
            </div>
        `;
    });
    outputHtml += '</div>';
    document.getElementById('output-container').innerHTML = outputHtml;
}
