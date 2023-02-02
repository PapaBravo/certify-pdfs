const axios = require('axios');

const BASE_URL = process.env.API_URL;
const TEST_CLAIM = {
    firstName: 'First',
    lastName: 'Last'
}

test('jest works', () => {
    expect(1+1).toBe(2);
});

test('env variables are here', () => {
    expect(process.env.API_URL).toBeDefined()
});

test('sign endpoint responds', () => {
    expect(axios.post(`${BASE_URL}/sign`, {
        claim: JSON.stringify(TEST_CLAIM),
        documentKey: 'ticket'
    })).resolves.toHaveProperty('status', 200);
})