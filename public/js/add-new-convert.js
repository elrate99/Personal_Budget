const convertName = document.getElementById('name');
const convertDescription = document.getElementById('description');
const amount = document.getElementById('amount');
const submitBtn = document.getElementById('submit-btn');
const container = document.querySelector('.convert-container');

submitBtn.addEventListener('click', () => {
    fetch(`/api/envelopes?header=${convertName.value}&convert=${convertDescription.value}&amount=${amount.value}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(({convert}) => {
        const queryResult = document.createElement('p');
        queryResult.innerHTML = 'Good! Your convert was added!';
        container.appendChild(queryResult);
    })
})