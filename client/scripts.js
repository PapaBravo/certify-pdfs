const BASE_URL = 'http://localhost:8080/api/v1';

async function sendRequest(path, data) {
    let response = await fetch(`${BASE_URL}${path}`, {
        method: data ? "POST" : "GET",
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': data ? 'application/json' : undefined
        }
    });
    let status = response.status;
    response = await response.json();
    return { status, body: response };
}

async function requestDocumentClick() {
    console.log('starting to send request');
    const data = {
        "claim": "{\"firstName\": \"First\", \"lastName\": \"Last\"}",
        "documentKey": "ticket"
    };

    await sendRequest('/sign', data);
}