document.addEventListener('DOMContentLoaded', () => {
    displayFirst(Infinity, initialSearchTerms);
});

const initialSearchTerms = [];

document.getElementById('search-button').addEventListener('click', () => {
    const searchTerms = getSearchTerms();
    console.log("Search terms:", searchTerms);
    document.getElementById('output-container').style.setProperty('color', '#ccc');
    document.getElementById('output-container').innerHTML = 'Loading...';
    displayFirst(Infinity, searchTerms);
});

document.getElementById('sort-canton').addEventListener('click', () => {
    console.log("Sort by Canton clicked");
    sortAndDisplay('CANTONDIS');
});

document.getElementById('sort-albion').addEventListener('click', () => {
    console.log("Sort by Albion clicked");
    sortAndDisplay('ALBIONDIS');
});

document.getElementById('sort-jackson').addEventListener('click', () => {
    console.log("Sort by Jackson clicked");
    sortAndDisplay('JACKSONDIS');
});

async function sortAndDisplay(sortBy) {
    const searchTerms = getSearchTerms();
    console.log("Sorting by:", sortBy, "with search terms:", searchTerms);
    const data = await find(searchTerms);
    console.log("Data fetched for sorting:", data);
    if (data && data.length > 0) {
        data.sort((a, b) => {
            console.log(`Comparing ${a[sortBy]} and ${b[sortBy]}`);
            return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
        });
        console.log("Sorted data:", data);
        displaySorted(data);
    } else {
        document.getElementById('output-container').style.setProperty('color', '#ccc');
        document.getElementById('output-container').innerHTML = 'No data found.';
    }
}

function getSearchTerms() {
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
    console.log("Generated search terms:", searchTerms);
    return searchTerms;
}

async function displayFirst(num, searchTerms) {
    const data = await find(searchTerms);
    console.log("Data fetched for display:", data);
    if (data && data.length > 0) {
        const firstItems = data.slice(0, num);
        displaySorted(firstItems);
    } else {
        document.getElementById('output-container').style.setProperty('color', '#ccc');
        document.getElementById('output-container').innerHTML = 'No data found.';
    }
}

async function find(searchTerms) {
    const url = 'https://sheet2api.com/v1/BilT5QMeRAKQ/first-interns';
    const query = new URLSearchParams();
    searchTerms.forEach(term => {
        query.append(term.key, term.value);
    });
    const options = { query };
    console.log("Query URL:", url + '?' + query.toString());
    const result = await readSheetData(url, options);
    console.log("Result from API:", result);
    return result;
}

async function readSheetData(url, options = {}) {
    try {
        const query = options.query ? '?' + new URLSearchParams(options.query).toString() : '';
        const response = await fetch(url + query, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        console.log("Raw response data:", result);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function displaySorted(data) {
    console.log("Displaying sorted data:", data);
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
                </div>
            </div>
        `;
    });
    outputHtml += '</div>';
    document.getElementById('output-container').innerHTML = outputHtml;
}
